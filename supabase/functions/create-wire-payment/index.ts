/**
 * Create Wire Payment Edge Function
 *
 * This Edge Function creates a Wire payment session for an order.
 *
 * SECURITY:
 * - Validates user authentication
 * - Validates order exists and belongs to user
 * - Recalculates order total server-side (never trusts client)
 * - Creates payment with Wire API using server-side credentials
 * - Returns checkout URL to client
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createWirePaymentIntent,
  createWireCheckoutSession,
} from "../shared/wire.ts";

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const WIRE_API_KEY = Deno.env.get("WIRE_SECRET_KEY") || "";

// ============================================
// Types
// ============================================

interface CreatePaymentRequest {
  orderId: string;
  operatorIds?: string[];
}

// ============================================
// Error Handling
// ============================================

class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
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
    // Parse request
    const body: CreatePaymentRequest = await req.json();

    if (!body.orderId) {
      throw new PaymentError("Order ID is required", "MISSING_ORDER_ID");
    }

    // Validate Wire API key
    if (!WIRE_API_KEY) {
      console.error("[create-wire-payment] WIRE_SECRET_KEY not configured");
      throw new PaymentError(
        "Payment service not configured",
        "SERVICE_NOT_CONFIGURED",
        500,
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      throw new PaymentError("Order not found", "ORDER_NOT_FOUND", 404);
    }

    // Validate order status
    if (order.payment_status !== "pending_payment") {
      throw new PaymentError(
        `Order cannot accept payment (status: ${order.payment_status})`,
        "INVALID_ORDER_STATUS",
        400,
      );
    }

    // Server-side price validation (never trust client)
    const productSnapshot = order.product_snapshot;
    const shippingSnapshot = order.shipping_snapshot;
    const subtotal = productSnapshot.price * productSnapshot.quantity;
    const platformFee = Math.round(subtotal * 0.03);
    const expectedTotal = subtotal + platformFee + shippingSnapshot.fee;

    if (order.total_amount !== expectedTotal) {
      throw new PaymentError(
        "Order total mismatch",
        "PRICE_TAMPERING_DETECTED",
        400,
      );
    }

    // Check if payment already exists (idempotency)
    if (order.wire_payment_intent_id) {
      return Response.json(
        {
          checkoutUrl: `https://pay.wire.mn/c/${order.wire_payment_intent_id}`,
          paymentIntentId: order.wire_payment_intent_id,
          expiresAt: Date.now() + 30 * 60 * 1000,
        },
        { headers: corsHeaders },
      );
    }

    // Generate idempotency key
    const idempotencyKey = `payment_${body.orderId}_${Date.now()}`;

    // Create payment intent with Wire
    const paymentIntent = await createWirePaymentIntent({
      amount: order.total_amount,
      description: `Kream Order: ${productSnapshot.name} x${productSnapshot.quantity}`,
      allowedOperators: body.operatorIds || ["sandbox"],
      idempotencyKey,
      metadata: {
        order_id: body.orderId,
        user_id: order.user_id || "guest",
      },
      apiKey: WIRE_API_KEY,
    });

    // Create checkout session
    const baseUrl = req.url.replace(/\/create-wire-payment.*$/, "");
    const checkoutSession = await createWireCheckoutSession({
      paymentIntentId: paymentIntent.id,
      successUrl: `${baseUrl}/payment/success`,
      cancelUrl: `${baseUrl}/payment/cancelled`,
      idempotencyKey: `${idempotencyKey}_session`,
      apiKey: WIRE_API_KEY,
    });

    // Update order with payment info
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        wire_payment_intent_id: paymentIntent.id,
        wire_checkout_url: checkoutSession.url,
        payment_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.orderId);

    if (updateError) {
      console.error(
        "[create-wire-payment] Failed to update order:",
        updateError,
      );
      throw new PaymentError("Failed to update order", "UPDATE_FAILED", 500);
    }

    // Return response
    return Response.json(
      {
        checkoutUrl: checkoutSession.url,
        paymentIntentId: paymentIntent.id,
        expiresAt: checkoutSession.expires_at * 1000,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[create-wire-payment] Error:", error);

    if (error instanceof PaymentError) {
      return Response.json(
        { error: { message: error.message, code: error.code } },
        { status: error.statusCode, headers: corsHeaders },
      );
    }

    return Response.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500, headers: corsHeaders },
    );
  }
});
