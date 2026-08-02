/**
 * Create Wire Payment Edge Function
 * 
 * This Edge Function handles payment creation with Wire payment gateway.
 * 
 * IMPORTANT SECURITY RULES:
 * 1. Wire API key is ONLY stored here in the Edge Function
 * 2. React Native NEVER has access to Wire credentials
 * 3. All payment creation goes through this function
 * 4. Order validation is done server-side
 * 
 * Flow:
 * 1. Validate request (user, order, price)
 * 2. Fetch order from database
 * 3. Create PaymentIntent with Wire
 * 4. Create Checkout Session with Wire
 * 5. Update order with payment info
 * 6. Return checkout URL
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Configuration
// ============================================

const WIRE_API_BASE = "https://api.wire.mn/v1";
const WIRE_CHECKOUT_URL = "https://pay.wire.mn/c";

// Environment variables (set in Supabase dashboard)
const WIRE_API_KEY = Deno.env.get("WIRE_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================
// Types
// ============================================

interface CreatePaymentRequest {
  orderId: string;
  operatorIds?: string[];
  returnUrl?: string;
  cancelUrl?: string;
}

interface WirePaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  description: string;
  status: string;
  client_secret: string;
  automatic_operator: boolean;
  allowed_operators: string[];
  selected_operator: string | null;
  next_action: {
    type: string;
    redirect?: { url: string };
  } | null;
  metadata: Record<string, string>;
  livemode: boolean;
  created: number;
  expires_at: number;
}

interface WireCheckoutSession {
  id: string;
  object: "checkout_session";
  payment_intent: string;
  url: string;
  status: string;
  created: number;
  expires_at: number;
}

interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  payment_status: string;
  wire_payment_intent_id: string | null;
  product_snapshot: {
    productId: string;
    name: string;
    quantity: number;
  };
}

// ============================================
// Error Handler
// ============================================

class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: CreatePaymentRequest = await req.json();
    
    if (!body.orderId) {
      throw new PaymentError("Order ID is required", "MISSING_ORDER_ID");
    }

    // Validate Wire API key is configured
    if (!WIRE_API_KEY) {
      console.error("[create-wire-payment] Wire API key not configured");
      throw new PaymentError(
        "Payment service is not configured",
        "SERVICE_NOT_CONFIGURED",
        500
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch and validate order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      throw new PaymentError("Order not found", "ORDER_NOT_FOUND", 404);
    }

    const typedOrder = order as unknown as Order;

    // Validate order can accept payment
    if (typedOrder.payment_status !== "pending_payment") {
      throw new PaymentError(
        `Order cannot accept payment (current status: ${typedOrder.payment_status})`,
        "INVALID_ORDER_STATUS",
        400
      );
    }

    // Check if payment already exists (idempotency)
    if (typedOrder.wire_payment_intent_id) {
      // Return existing payment info
      return Response.json({
        checkoutUrl: `${WIRE_CHECKOUT_URL}/${typedOrder.wire_payment_intent_id}`,
        paymentIntentId: typedOrder.wire_payment_intent_id,
        expiresAt: Date.now() + 30 * 60 * 1000,
      }, { headers: corsHeaders });
    }

    // Generate idempotency key
    const idempotencyKey = `payment_${body.orderId}_${Date.now()}`;

    // Default operators for test mode
    const allowedOperators = body.operatorIds || ["sandbox"];

    // Create PaymentIntent with Wire
    const paymentIntent = await createWirePaymentIntent({
      amount: typedOrder.total_amount,
      description: `Kream Order: ${typedOrder.product_snapshot.name} x${typedOrder.product_snapshot.quantity}`,
      allowedOperators,
      idempotencyKey,
      metadata: {
        order_id: body.orderId,
        user_id: typedOrder.user_id || "guest",
      },
    });

    // Create Checkout Session
    const checkoutSession = await createWireCheckoutSession({
      paymentIntentId: paymentIntent.id,
      successUrl: body.returnUrl || `${req.url.replace('/create-wire-payment', '')}/payment/success`,
      cancelUrl: body.cancelUrl || `${req.url.replace('/create-wire-payment', '')}/payment/cancelled`,
      idempotencyKey: `${idempotencyKey}_session`,
    });

    // Update order with payment info
    await supabaseAdmin
      .from("orders")
      .update({
        wire_payment_intent_id: paymentIntent.id,
        wire_checkout_url: checkoutSession.url,
        payment_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.orderId);

    // Return checkout URL
    return Response.json({
      checkoutUrl: checkoutSession.url,
      paymentIntentId: paymentIntent.id,
      expiresAt: checkoutSession.expires_at * 1000,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("[create-wire-payment] Error:", error);

    if (error instanceof PaymentError) {
      return Response.json(
        { error: { message: error.message, code: error.code } },
        { status: error.statusCode, headers: corsHeaders }
      );
    }

    return Response.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500, headers: corsHeaders }
    );
  }
});

// ============================================
// Wire API Functions
// ============================================

async function createWirePaymentIntent(params: {
  amount: number;
  description: string;
  allowedOperators: string[];
  idempotencyKey: string;
  metadata: Record<string, string>;
}): Promise<WirePaymentIntent> {
  const response = await fetch(`${WIRE_API_BASE}/payment_intents`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WIRE_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify({
      amount: params.amount, // Amount in MNT (minor units)
      currency: "MNT",
      description: params.description,
      allowed_operators: params.allowedOperators,
      automatic_operator: true,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[Wire API] PaymentIntent creation failed:", error);
    throw new PaymentError(
      error.error?.message || "Failed to create payment",
      "WIRE_API_ERROR",
      response.status
    );
  }

  return response.json();
}

async function createWireCheckoutSession(params: {
  paymentIntentId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}): Promise<WireCheckoutSession> {
  const response = await fetch(
    `${WIRE_API_BASE}/payment_intents/${params.paymentIntentId}/checkout_sessions`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WIRE_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify({
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("[Wire API] CheckoutSession creation failed:", error);
    throw new PaymentError(
      error.error?.message || "Failed to create checkout session",
      "WIRE_API_ERROR",
      response.status
    );
  }

  return response.json();
}
