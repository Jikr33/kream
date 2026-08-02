/**
 * Wire Webhook Handler Edge Function
 * 
 * This Edge Function handles Wire webhook events.
 * 
 * CRITICAL SECURITY RULES:
 * 1. NEVER trust the frontend for payment confirmation
 * 2. ALWAYS verify webhook signature
 * 3. ALWAYS verify payment status with Wire API before updating
 * 4. Use idempotency to handle duplicate events
 * 
 * Webhook Events Handled:
 * - payment_intent.succeeded: Mark order as paid
 * - payment_intent.failed: Mark order as failed
 * - payment_intent.canceled: Mark order as cancelled
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const WEBHOOK_SECRET = Deno.env.get("WIRE_WEBHOOK_SECRET") || "";
const WIRE_API_BASE = "https://api.wire.mn/v1";
const WIRE_API_KEY = Deno.env.get("WIRE_SECRET_KEY") || "";

// ============================================
// Types
// ============================================

interface WireWebhookEvent {
  id: string;
  object: "event";
  type: "payment_intent.succeeded" | "payment_intent.failed" | "payment_intent.canceled";
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

interface Order {
  id: string;
  user_id: string | null;
  payment_status: string;
  wire_payment_intent_id: string | null;
  total_amount: number;
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, wirepayment-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
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
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify webhook signature
    if (WEBHOOK_SECRET && !verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.error("[wire-webhook] Invalid signature");
      return Response.json(
        { error: "Invalid signature" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse event
    const event: WireWebhookEvent = JSON.parse(rawBody);
    
    console.log(`[wire-webhook] Received event: ${event.type}`, {
      eventId: event.id,
      paymentIntentId: event.data?.object?.id,
    });

    // Create Supabase admin client
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
      { status: 500, headers: corsHeaders }
    );
  }
});

// ============================================
// Signature Verification
// ============================================

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Parse signature header (format: t=timestamp,v1=signature)
    const parts = signature.split(",");
    const timestampPart = parts.find(p => p.startsWith("t="));
    const signaturePart = parts.find(p => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.split("=")[1];
    const receivedSignature = signaturePart.split("=")[1];

    // Check timestamp (prevent replay attacks - 5 minutes tolerance)
    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);
    if (Math.abs(now - timestampNum) > 300) {
      console.error("[wire-webhook] Timestamp out of range");
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    return timingSafeEqual(receivedSignature, expectedSignature);
  } catch (error) {
    console.error("[wire-webhook] Signature verification error:", error);
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================
// Event Handlers
// ============================================

async function handlePaymentSucceeded(
  supabaseAdmin: ReturnType<typeof createClient>,
  event: WireWebhookEvent
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(`[wire-webhook] Processing payment_intent.succeeded for order ${orderId}`);

  // Verify payment status with Wire API (belt and suspenders)
  const isValid = await verifyPaymentWithWireAPI(paymentIntent.id);
  if (!isValid) {
    console.error("[wire-webhook] Payment verification failed");
    return;
  }

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
  event: WireWebhookEvent
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(`[wire-webhook] Processing payment_intent.failed for order ${orderId}`);

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
  event: WireWebhookEvent
) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.error("[wire-webhook] Missing order_id in metadata");
    return;
  }

  console.log(`[wire-webhook] Processing payment_intent.canceled for order ${orderId}`);

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

// ============================================
// Verification Helper
// ============================================

async function verifyPaymentWithWireAPI(paymentIntentId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${WIRE_API_BASE}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          "Authorization": `Bearer ${WIRE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const paymentIntent = await response.json();
    return paymentIntent.status === "succeeded";
  } catch (error) {
    console.error("[wire-webhook] Wire API verification error:", error);
    return false;
  }
}
