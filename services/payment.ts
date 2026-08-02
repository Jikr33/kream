/**
 * Kream Outlet – Payment Service
 * ===============================
 * Payment-related operations:
 * - Create payment session
 * - Invoke Edge Function
 * - Verify payment
 * - Cancel payment
 * - Retry payment
 * - Get payment status
 * - No UI code
 */

import { supabase } from "@/lib/supabase";
import type { PaymentResult, Order } from "@/types";

const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== "your-supabase-project-url";

export async function createPaymentSession(
  orderId: string,
  customerEmail: string,
  customerName: string,
  amount: number,
): Promise<PaymentResult> {
  if (!isSupabaseConfigured) {
    // Mock response
    return {
      success: true,
      orderId,
      paymentId: `mock-payment-${Date.now()}`,
      checkoutUrl: "https://wire.com/checkout/mock",
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "create-wire-payment",
      {
        body: {
          order_id: orderId,
          amount,
          currency: "MNT",
          customer_email: customerEmail,
          customer_name: customerName,
          success_url: "kream://payment/success",
          cancel_url: "kream://payment/cancel",
        },
      },
    );

    if (error) {
      console.error("[Payment] Wire payment error:", error);
      return {
        success: false,
        orderId,
        error: error.message || "Failed to create payment session",
      };
    }

    return {
      success: true,
      orderId,
      paymentId: data.payment_id,
      checkoutUrl: data.checkout_url,
    };
  } catch (error) {
    console.error("[Payment] Wire payment exception:", error);
    return {
      success: false,
      orderId,
      error: "Network error. Please try again.",
    };
  }
}

export async function getPaymentStatus(orderId: string): Promise<Order | null> {
  // Import here to avoid circular dependency
  const { fetchOrderById } = await import("@/services/orders");
  return fetchOrderById(orderId);
}

export async function cancelPayment(orderId: string): Promise<boolean> {
  // Update order status to cancelled
  const { updateOrder } = await import("@/services/orders");
  return updateOrder(orderId, {
    order_status: "cancelled",
    payment_status: "cancelled",
  });
}

export async function retryPayment(
  orderId: string,
  customerEmail: string,
  customerName: string,
  amount: number,
): Promise<PaymentResult> {
  // Ensure order is in pending_payment status
  const { updateOrder } = await import("@/services/orders");
  await updateOrder(orderId, {
    order_status: "pending_payment",
    payment_status: "pending",
  });

  // Create new payment session
  return createPaymentSession(orderId, customerEmail, customerName, amount);
}
