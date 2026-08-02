/**
 * Payment Service
 * 
 * Handles all payment-related operations with Wire payment gateway.
 * This service communicates with the Supabase Edge Function for payment creation,
 * which in turn communicates with Wire's API.
 * 
 * IMPORTANT: React Native should NEVER communicate directly with Wire's private API.
 * All Wire API calls must go through the Edge Function.
 */

import { supabase } from "@/supabase";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatus,
  PaymentStatusResponse,
} from "@/types";

// ============================================
// Error Types
// ============================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
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
 * Flow:
 * 1. Edge Function validates the order
 * 2. Creates PaymentIntent with Wire
 * 3. Creates Checkout Session with Wire
 * 4. Returns checkout URL to the app
 * 
 * @param orderId - The order ID to create payment for
 * @param operatorIds - Allowed payment operators (defaults to sandbox for testing)
 * @returns Checkout URL and payment details
 */
export async function createPayment(
  orderId: string,
  operatorIds: string[] = ["sandbox"]
): Promise<CreatePaymentResponse> {
  const request: CreatePaymentRequest = {
    orderId,
    operatorIds,
  };

  const { data, error } = await supabase.functions.invoke(
    "create-wire-payment",
    {
      body: request,
    }
  );

  if (error) {
    console.error("[PaymentService] createPayment error:", error);
    throw new PaymentError(
      error.message || "Failed to create payment",
      "PAYMENT_CREATE_FAILED",
      error.statusCode
    );
  }

  if (!data?.checkoutUrl || !data?.paymentIntentId) {
    throw new PaymentError(
      "Invalid response from payment service",
      "INVALID_RESPONSE"
    );
  }

  return {
    checkoutUrl: data.checkoutUrl,
    paymentIntentId: data.paymentIntentId,
    expiresAt: data.expiresAt || Date.now() + 30 * 60 * 1000, // 30 minutes default
  };
}

// ============================================
// Payment Status Check
// ============================================

/**
 * Checks the current payment status from the server.
 * 
 * This queries the database for the current order payment status,
 * which is updated by the webhook handler.
 * 
 * @param orderId - The order ID to check
 * @returns Current payment status
 */
export async function checkPaymentStatus(
  orderId: string
): Promise<PaymentStatusResponse> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("payment_status, wire_payment_intent_id")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("[PaymentService] checkPaymentStatus error:", error);
    throw new PaymentError(
      error.message || "Failed to check payment status",
      "STATUS_CHECK_FAILED"
    );
  }

  return {
    status: (order?.payment_status as PaymentStatus) || "pending_payment",
    paymentIntentId: order?.wire_payment_intent_id || "",
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
  const { error } = await supabase.functions.invoke(
    "cancel-wire-payment",
    {
      body: { orderId },
    }
  );

  if (error) {
    console.error("[PaymentService] cancelPayment error:", error);
    throw new PaymentError(
      error.message || "Failed to cancel payment",
      "PAYMENT_CANCEL_FAILED",
      error.statusCode
    );
  }
}

// ============================================
// Payment Retry
// ============================================

/**
 * Retries a failed payment by creating a new payment session.
 * 
 * @param orderId - The order ID to retry payment for
 * @returns New checkout URL
 */
export async function retryPayment(
  orderId: string
): Promise<CreatePaymentResponse> {
  // First check the current status
  const status = await checkPaymentStatus(orderId);
  
  if (status.status === "paid") {
    throw new PaymentError(
      "Payment already completed",
      "ALREADY_PAID"
    );
  }

  if (status.status === "processing") {
    throw new PaymentError(
      "Payment is currently being processed",
      "IN_PROGRESS"
    );
  }

  // Create a new payment session
  return createPayment(orderId);
}

// ============================================
// Redirect Handling
// ============================================

/**
 * Parses the return URL from Wire checkout.
 * Extracts payment status and any error information.
 * 
 * @param url - The return URL from Wire
 * @returns Parsed redirect data
 */
export function parseRedirectUrl(url: string): {
  status: "success" | "cancelled" | "failed";
  orderId?: string;
  errorCode?: string;
} {
  try {
    const parsedUrl = new URL(url);
    const status = parsedUrl.searchParams.get("status");
    const orderId = parsedUrl.searchParams.get("order_id") || undefined;
    const errorCode = parsedUrl.searchParams.get("error_code") || undefined;

    if (status === "success") {
      return { status: "success", orderId };
    } else if (status === "cancelled") {
      return { status: "cancelled", orderId, errorCode };
    } else {
      return { status: "failed", orderId, errorCode };
    }
  } catch {
    return { status: "failed" };
  }
}

// ============================================
// Success/Failure Handlers
// ============================================

/**
 * Handles successful payment redirect.
 * 
 * IMPORTANT: This is for UI purposes only.
 * Actual payment confirmation MUST come from webhook.
 * 
 * @param orderId - The order ID that was paid
 * @returns User-friendly message
 */
export async function handlePaymentSuccess(orderId: string): Promise<{
  message: string;
  status: PaymentStatus;
}> {
  // Verify with server (webhook should have updated this)
  const status = await checkPaymentStatus(orderId);
  
  if (status.status === "paid") {
    return {
      message: "Payment successful! Your order is being processed.",
      status: "paid",
    };
  }

  // Webhook might be delayed - show pending message
  if (status.status === "processing") {
    return {
      message: "Payment is being verified. You'll receive a confirmation shortly.",
      status: "processing",
    };
  }

  // Fallback - still pending
  return {
    message: "Payment received. Final confirmation may take a moment.",
    status: "pending_payment",
  };
}

/**
 * Handles failed payment redirect.
 * 
 * @param orderId - The order ID that failed
 * @param errorCode - Optional error code from Wire
 * @returns User-friendly error message
 */
export async function handlePaymentFailure(
  orderId: string,
  errorCode?: string
): Promise<{
  message: string;
  canRetry: boolean;
}> {
  return {
    message: getErrorMessage(errorCode),
    canRetry: true,
  };
}

/**
 * Handles cancelled payment redirect.
 * 
 * @param orderId - The order ID that was cancelled
 * @returns User-friendly message
 */
export async function handlePaymentCancelled(
  orderId: string
): Promise<{
  message: string;
  canRetry: boolean;
}> {
  return {
    message: "Payment was cancelled. You can try again when you're ready.",
    canRetry: true,
  };
}

// ============================================
// Helper Functions
// ============================================

function getErrorMessage(errorCode?: string): string {
  const errorMessages: Record<string, string> = {
    "insufficient_funds": "Insufficient funds. Please try a different payment method.",
    "card_declined": "Your card was declined. Please try a different payment method.",
    "expired_card": "Your card has expired. Please use a different card.",
    "invalid_card": "Invalid card details. Please check and try again.",
    "network_error": "A network error occurred. Please check your connection and try again.",
    "operator_unavailable": "Payment operator is temporarily unavailable. Please try again later.",
    "timeout": "The payment request timed out. Please try again.",
  };

  return errorMessages[errorCode || ""] || 
    "Payment failed. Please try again or use a different payment method.";
}

// ============================================
// Utility Functions
// ============================================

/**
 * Validates that a payment can be initiated for an order.
 * 
 * @param orderId - The order ID to validate
 * @returns true if payment can be initiated
 */
export async function validatePaymentEligibility(
  orderId: string
): Promise<{ eligible: boolean; reason?: string }> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("payment_status, total_amount, shipping_address")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { eligible: false, reason: "Order not found" };
  }

  if (order.payment_status === "paid") {
    return { eligible: false, reason: "Order already paid" };
  }

  if (order.payment_status === "processing") {
    return { eligible: false, reason: "Payment is being processed" };
  }

  if (order.total_amount <= 0) {
    return { eligible: false, reason: "Invalid order amount" };
  }

  if (!order.shipping_address) {
    return { eligible: false, reason: "Shipping address required" };
  }

  return { eligible: true };
}

/**
 * Formats amount in MNT (Mongolian Tugrik) for display.
 * 
 * @param amount - Amount in minor units (smallest currency unit)
 * @returns Formatted string
 */
export function formatAmount(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}
