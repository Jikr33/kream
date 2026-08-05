/**
 * Payment Service
 *
 * Client-side payment service that communicates with Supabase Edge Functions.
 *
 * IMPORTANT:
 * - This service ONLY calls Edge Functions
 * - NEVER exposes Wire API keys to the client
 * - NEVER creates payments directly
 * - Payment status is determined by the webhook, not the client
 */

import { supabase } from "@/supabase";
import type { CreatePaymentResponse, PaymentStatusResponse } from "@/types";

// ============================================
// Error Types
// ============================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

// ============================================
// Payment Creation
// ============================================

/**
 * Creates a Wire payment session for the given order.
 *
 * Calls the create-wire-payment Edge Function which:
 * 1. Validates the order server-side
 * 2. Recalculates the total server-side
 * 3. Creates payment with Wire API
 * 4. Returns checkout URL
 *
 * @param orderId - The order ID to create payment for
 * @returns Checkout URL and payment details
 */
export async function createPayment(
  orderId: string,
  operatorIds: string[] = ["sandbox"],
): Promise<CreatePaymentResponse> {
  const { data, error } = await supabase.functions.invoke(
    "create-wire-payment",
    {
      body: {
        order_id: orderId,
        operator_ids: operatorIds,
      },
    },
  );

  if (error) {
    console.error("[Payment] createPayment error:", error);
    throw new PaymentError(
      error.message || "Failed to create payment",
      "PAYMENT_CREATE_FAILED",
      error.statusCode,
    );
  }

  if (!data?.checkoutUrl || !data?.paymentIntentId) {
    throw new PaymentError(
      "Invalid response from payment service",
      "INVALID_RESPONSE",
    );
  }

  return {
    checkoutUrl: data.checkoutUrl,
    paymentIntentId: data.paymentIntentId,
    expiresAt: data.expiresAt,
  };
}

// ============================================
// Payment Status Check
// ============================================

/**
 * Checks the current payment status from the database.
 *
 * IMPORTANT: This queries the database for the current order payment status,
 * which is updated by the webhook handler. The client NEVER determines
 * payment success locally.
 *
 * @param orderId - The order ID to check
 * @returns Current payment status
 */
export async function getPaymentStatus(
  orderId: string,
): Promise<PaymentStatusResponse> {
  const { data, error } = await supabase
    .from("orders")
    .select("payment_status, wire_payment_intent_id")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("[Payment] getPaymentStatus error:", error);
    throw new PaymentError(
      error.message || "Failed to check payment status",
      "STATUS_CHECK_FAILED",
    );
  }

  return {
    status: data?.payment_status || "pending",
    paymentIntentId: data?.wire_payment_intent_id || "",
  };
}

// ============================================
// Payment Cancellation
// ============================================

/**
 * Cancels a pending payment.
 *
 * @param orderId - The order ID to cancel payment for
 */
export async function cancelPayment(orderId: string): Promise<void> {
  // We don't have a separate cancel endpoint, but we can update locally
  // The webhook will handle the actual cancellation with Wire
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "cancelled",
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .in("payment_status", ["pending_payment", "processing"]);

  if (error) {
    console.error("[Payment] cancelPayment error:", error);
    throw new PaymentError(
      error.message || "Failed to cancel payment",
      "PAYMENT_CANCEL_FAILED",
    );
  }
}
