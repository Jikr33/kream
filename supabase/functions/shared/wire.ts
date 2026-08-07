/**
 * Wire API Configuration and Types
 *
 * This module contains shared Wire payment gateway configuration
 * and types used across Edge Functions.
 */

// ============================================
// Configuration
// ============================================
import { fetch } from "undici";
export const WIRE_API_BASE = "https://api.wirepayment.mn";
export const WIRE_CHECKOUT_URL = "https://pay.wire.mn/c";

// ============================================
// Types
// ============================================

export interface WirePaymentIntent {
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

export interface WireCheckoutSession {
  id: string;
  object: "checkout_session";
  payment_intent: string;
  url: string;
  status: string;
  created: number;
  expires_at: number;
}

export interface WireWebhookEvent {
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
// API Functions
// ============================================

export async function createWirePaymentIntent(params: {
  amount: number;
  description: string;
  allowedOperators: string[];
  idempotencyKey: string;
  metadata: Record<string, string>;
  apiKey: string;
}): Promise<WirePaymentIntent> {
  const response = await fetch(`${WIRE_API_BASE}/payment_intents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: "MNT",
      description: params.description,
      allowed_operators: params.allowedOperators,
      automatic_operator: true,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create payment intent");
  }

  return response.json();
}

export async function createWireCheckoutSession(params: {
  paymentIntentId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  apiKey: string;
}): Promise<WireCheckoutSession> {
  const response = await fetch(
    `${WIRE_API_BASE}/payment_intents/${params.paymentIntentId}/checkout_sessions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify({
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message || "Failed to create checkout session",
    );
  }

  return response.json();
}

export async function verifyPaymentWithWireAPI(
  paymentIntentId: string,
  apiKey: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${WIRE_API_BASE}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return false;
    }

    const paymentIntent = await response.json();
    return paymentIntent.status === "succeeded";
  } catch (error) {
    console.error("[Wire API] Verification error:", error);
    return false;
  }
}
