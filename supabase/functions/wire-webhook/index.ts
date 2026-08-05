/**
 * Wire Webhook Handler Edge Function
 *
 * This Edge Function handles Wire webhook events.
 *
 * SECURITY:
 * - ALWAYS verifies webhook signature
 * - NEVER trusts the frontend for payment confirmation
 * - ALWAYS updates payment status in database
 * - Returns 200 immediately (idempotent)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifySignature } from "../shared/verify.ts";

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const WEBHOOK_SECRET = Deno.env.get("WIRE_WEBHOOK_SECRET") || "";
const WIRE_API_KEY = Deno.env.get("WIRE_SECRET_KEY") || "";

// ============================================
// Types
// ============================================

interface WireWebhookEvent {
  id: string;
  object: "event";
  type:
    | "payment_intent.succeeded"
    | "payment_intent.failed"
    | "payment_intent.canceled";
  created: number;
  data: {
    object: {
      id: string;
      object: string;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string>;
    };
  };
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, wirepayment-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature
    const signature = req.headers.get("wirepayment-signature");
    if (!signature) {
      console.error("[wire-webhook] Missing signature header");
      return Response.json(
        { error: "Missing signature" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Verify webhook signature
    if (
      WEBHOOK_SECRET &&
      !(await verifySignature(rawBody, signature, WEBHOOK_SECRET))
    ) {
      console.error("[wire-webhook] Invalid signature");
      return Response.json(
        { error: "Invalid signature" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Parse event
    const event: WireWebhookEvent = JSON.parse(rawBody);

    console.log(`[wire-webhook] Received event: ${event.type}`, {
      eventId: event.id,
      paymentIntentId: event.data?.object?.id,
    });

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Process event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(supabaseAdmin, event);
        break;
      case "payment_intent.failed":
        await handlePaymentFailed(supabaseAdmin, event);
        break;
      case "payment_intent.canceled":
        await handlePaymentCancelled(supabaseAdmin, event);
        break;
      default:
        console.log(`[wire-webhook] Unhandled event type: ${event.type}`);
    }

    // Return 200 immediately (best practice)
    return Response.json({ received: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("[wire-webhook] Error processing webhook:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
});

// ============================================
// Event Handlers
// ============================================

async function handlePaymentSucceeded(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: WireWebhookEvent,
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(
    `[wire-webhook] Processing payment_intent.succeeded for order ${orderId}`,
  );

  // Update order status (idempotent)
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      order_status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("wire_payment_intent_id", paymentIntent.id)
    .eq("payment_status", "processing"); // Only update if currently processing

  if (error) {
    console.error("[wire-webhook] Failed to update order:", error);
  } else {
    console.log(`[wire-webhook] Order ${orderId} marked as paid`);
  }
}

async function handlePaymentFailed(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: WireWebhookEvent,
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(
    `[wire-webhook] Processing payment_intent.failed for order ${orderId}`,
  );

  // Update order status (idempotent)
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "failed",
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("wire_payment_intent_id", paymentIntent.id)
    .in("payment_status", ["processing", "pending_payment"]);

  if (error) {
    console.error("[wire-webhook] Failed to update order:", error);
  } else {
    console.log(`[wire-webhook] Order ${orderId} marked as failed`);
  }
}

async function handlePaymentCancelled(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: WireWebhookEvent,
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(
    `[wire-webhook] Processing payment_intent.canceled for order ${orderId}`,
  );

  // Update order status (idempotent)
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "cancelled",
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("wire_payment_intent_id", paymentIntent.id)
    .eq("payment_status", "processing");

  if (error) {
    console.error("[wire-webhook] Failed to update order:", error);
  } else {
    console.log(`[wire-webhook] Order ${orderId} marked as cancelled`);
  }
}
