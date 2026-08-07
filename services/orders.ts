/**
 * Orders Service
 *
 * Minimal service exposing only 4 core functions:
 * - createOrder()
 * - updateOrder()
 * - loadOrder()
 * - loadUserOrders()
 *
 * Server-side price calculation via Edge Function.
 * No UI logic, no platform fees, no shipping snapshots.
 */

import { supabase } from "@/supabase";
import type { Order, OrderStatus, CreateOrderInput } from "@/types/order";

// ============================================
// Error Types
// ============================================

export class OrderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

// ============================================
// Order Creation
// ============================================

/**
 * Creates a new order with pending status.
 *
 * IMPORTANT: Pricing should be calculated server-side by Edge Function.
 * This function accepts pre-calculated prices from the Edge Function.
 *
 * @param input - Order creation data with calculated prices
 * @returns Created order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await supabase.functions.invoke("create-order", {
    body: {
      productId: input.productId,
      selectedSize: input.selectedSize,
      selectedColor: input.selectedColor,
      quantity: input.quantity,
      shippingMethod: input.shippingMethod,
      shippingAddress: input.shippingAddress,
    },
  });

  if (response.error || !response.data?.success) {
    const errorMessage =
      response.error?.message ||
      response.data?.error?.message ||
      "Failed to create order";
    const errorCode = response.data?.error?.code || "ORDER_CREATE_FAILED";
    throw new OrderError(
      errorMessage,
      errorCode,
      response.data?.error?.statusCode || 400,
    );
  }

  // Return the order data from the Edge Function
  // We need to fetch the full order from the database to return a complete Order object
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", response.data.order.id)
    .single();

  if (fetchError || !order) {
    console.error("[OrdersService] Failed to fetch created order:", fetchError);
    throw new OrderError(
      "Order created but could not be fetched",
      "ORDER_FETCH_FAILED",
      500,
    );
  }

  return order as Order;
}

// ============================================
// Order Updates
// ============================================

/**
 * Updates an order.
 *
 * @param orderId - Order ID
 * @param updates - Partial order data to update
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Omit<Order, "id" | "created_at">>,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[OrdersService] updateOrder error:", error);
    throw new OrderError(
      error.message || "Failed to update order",
      "UPDATE_FAILED",
    );
  }
}

// ============================================
// Order Loading
// ============================================

/**
 * Loads a single order by ID.
 *
 * @param orderId - Order ID
 * @returns Order data or null if not found
 */
export async function loadOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("[OrdersService] loadOrder error:", error);
    return null;
  }

  return data as Order;
}

/**
 * Loads all orders for a user.
 *
 * @param userId - User ID (null for guest orders)
 * @param limit - Maximum number of orders to return
 * @returns Array of orders
 */
export async function loadUserOrders(
  userId: string | null,
  limit: number = 50,
): Promise<Order[]> {
  const query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[OrdersService] loadUserOrders error:", error);
    return [];
  }

  return (data || []) as Order[];
}
