/**
<<<<<<< HEAD
 * Kream Outlet – Orders Service
 * ==============================
 * Order-related operations:
 * - Create order
 * - Update order
 * - Cancel order
 * - Load orders
 * - Load order by ID
 * - No payment logic
 */

import { supabase } from "@/lib/supabase";
import type {
  Order,
  OrderItem,
  CreateOrderInput,
  OrderWithItems,
} from "@/types";
import { mockOrders, mockOrderItems, mockProducts } from "@/lib/mockData";

const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== "your-supabase-project-url";

export async function createOrder(
  input: CreateOrderInput,
): Promise<string | null> {
  const orderId = `order-${Date.now()}`;

  if (!isSupabaseConfigured) {
    // Mock creation - return a fake ID
    return orderId;
  }

  try {
    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        user_id: input.user_id ?? null,
        product_id: input.product_id,
        product_name: input.product_name,
        product_image: input.product_image,
        selected_size: input.selected_size,
        selected_color: input.selected_color,
        quantity: input.quantity,
        subtotal: input.subtotal,
        shipping_fee: input.shipping_fee,
        total_amount: input.total,
        currency: input.currency,
        shipping_name: input.shipping_name,
        shipping_phone: input.shipping_phone,
        shipping_email: input.shipping_email,
        shipping_address: input.shipping_address,
        shipping_city: input.shipping_city,
        shipping_district: input.shipping_district,
        shipping_postal: input.shipping_postal,
        payment_provider: input.payment_provider,
        payment_method: input.payment_method,
        payment_status: "pending",
        order_status: "pending_payment",
        coupon_id: input.coupon_id ?? null,
        coupon_discount: input.coupon_discount ?? 0,
      })
      .select()
      .single();

    if (error || !newOrder) return orderId;

    // Create order item
    await supabase.from("order_items").insert({
      order_id: orderId,
      sneaker_id: input.product_id,
      quantity: input.quantity,
      price: input.subtotal,
    });

    return orderId;
  } catch (error) {
    console.error("[Orders] Failed to create order:", error);
    return orderId;
  }
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Order>,
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return !error;
  } catch (error) {
    console.error("[Orders] Failed to update order:", error);
    return false;
  }
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  return updateOrder(orderId, {
    order_status: "cancelled",
    payment_status: "cancelled",
  });
}

export async function fetchUserOrders(userId?: string): Promise<Order[]> {
  if (!isSupabaseConfigured || !userId) {
    // Return mock orders for user-1 (demo) or all if no user
    return userId ? mockOrders.filter((o) => o.user_id === userId) : mockOrders;
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return mockOrders.filter((o) => o.user_id === userId);
    return (data as Order[]) ?? [];
  } catch {
    return mockOrders.filter((o) => o.user_id === userId);
  }
}

export async function fetchOrderById(
  orderId: string,
): Promise<OrderWithItems | null> {
  if (!isSupabaseConfigured) {
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) return null;

    const items = mockOrderItems
      .filter((oi) => oi.order_id === orderId)
      .map((oi) => {
        const sneaker =
          mockProducts.find((s) => s.id === oi.sneaker_id) ?? null;
        return { ...oi, product: sneaker };
      });

    return { ...order, items };
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return null;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, products(*)")
      .eq("order_id", orderId);

    if (itemsError || !items) {
      return { ...(order as Order), items: [] };
    }

    return {
      ...(order as Order),
      items: (
        items as Array<
          OrderItem & { products: (typeof mockProducts)[0] | null }
        >
      ).map((i) => ({
        ...i,
        product: i.products,
      })),
    };
  } catch {
    return null;
  }
}

export async function updateShipping(
  orderId: string,
  shippingData: {
    shipping_name: string;
    shipping_phone: string;
    shipping_email: string;
    shipping_address: string;
    shipping_city: string;
    shipping_district: string;
    shipping_postal: string;
  },
): Promise<boolean> {
  return updateOrder(orderId, {
    ...shippingData,
    updated_at: new Date().toISOString(),
  });
=======
 * Orders Service
 * 
 * Handles all order-related operations.
 * This service is responsible for:
 * - Creating orders before payment
 * - Updating order status
 * - Loading orders
 * - Managing shipping information
 * 
 * NOTE: This service does NOT handle payment provider specifics.
 * Payment logic is handled by the payment service.
 */

import { supabase } from "@/supabase";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  AddressData,
  ProductSnapshot,
  ShippingSnapshot,
} from "@/types";

// ============================================
// Error Types
// ============================================

export class OrderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "OrderError";
  }
}

// ============================================
// Order Creation
// ============================================

export type CreateOrderInput = {
  userId: string | null;
  product: {
    id: string;
    brandId: string;
    name: string;
    price: number;
    size: string;
    color: string;
    quantity: number;
    imageUrl: string | null;
  };
  shipping: {
    method: "standard" | "express";
  };
  address: AddressData;
  platformFeeRate?: number; // Default: 0.03 (3%)
};

export type CreateOrderResponse = {
  order: Order;
};

/**
 * Creates a new order with pending_payment status.
 * 
 * This should be called BEFORE initiating payment.
 * The order is created with:
 * - Product snapshot (price frozen at creation time)
 * - Shipping snapshot
 * - Shipping address
 * - Payment status: pending_payment
 * - Order status: pending_payment
 * 
 * @param input - Order creation data
 * @returns Created order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Calculate pricing
  const subtotal = input.product.price * input.product.quantity;
  const platformFeeRate = input.platformFeeRate ?? 0.03;
  const platformFee = Math.round(subtotal * platformFeeRate);
  const shippingFee = input.shipping.method === "standard" ? 3500 : 8500;
  const totalAmount = subtotal + platformFee + shippingFee;

  // Create product snapshot
  const productSnapshot: ProductSnapshot = {
    productId: input.product.id,
    brandId: input.product.brandId,
    name: input.product.name,
    price: input.product.price,
    size: input.product.size,
    color: input.product.color,
    quantity: input.product.quantity,
    imageUrl: input.product.imageUrl,
  };

  // Create shipping snapshot
  const shippingSnapshot: ShippingSnapshot = {
    method: input.shipping.method,
    fee: shippingFee,
    estimatedDays: input.shipping.method === "standard" ? "5-10 business days" : "2-4 business days",
  };

  const orderData = {
    user_id: input.userId,
    product_snapshot: productSnapshot,
    shipping_snapshot: shippingSnapshot,
    subtotal,
    platform_fee: platformFee,
    shipping_fee: shippingFee,
    total_amount: totalAmount,
    payment_status: "pending_payment" as PaymentStatus,
    order_status: "pending_payment" as OrderStatus,
    payment_method: null,
    payment_provider: null as "wire" | null,
    wire_payment_intent_id: null,
    wire_checkout_url: null,
    shipping_address: input.address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error("[OrdersService] createOrder error:", error);
    throw new OrderError(
      error.message || "Failed to create order",
      "ORDER_CREATE_FAILED"
    );
  }

  return data as Order;
}

// ============================================
// Order Updates
// ============================================

/**
 * Updates the shipping address for an order.
 * Only allowed for orders with pending_payment status.
 * 
 * @param orderId - Order ID
 * @param address - New shipping address
 */
export async function updateShippingAddress(
  orderId: string,
  address: AddressData
): Promise<void> {
  // Verify order can be updated
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new OrderError("Order not found", "ORDER_NOT_FOUND");
  }

  if (order.payment_status !== "pending_payment") {
    throw new OrderError(
      "Cannot update address after payment has been initiated",
      "ORDER_LOCKED"
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({
      shipping_address: address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[OrdersService] updateShippingAddress error:", error);
    throw new OrderError(
      error.message || "Failed to update shipping address",
      "UPDATE_FAILED"
    );
  }
}

/**
 * Updates the shipping method for an order.
 * Recalculates shipping fee if changed.
 * Only allowed for orders with pending_payment status.
 * 
 * @param orderId - Order ID
 * @param method - New shipping method
 */
export async function updateShippingMethod(
  orderId: string,
  method: "standard" | "express"
): Promise<void> {
  // Verify order can be updated
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("payment_status, shipping_snapshot, subtotal, platform_fee")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new OrderError("Order not found", "ORDER_NOT_FOUND");
  }

  if (order.payment_status !== "pending_payment") {
    throw new OrderError(
      "Cannot update shipping after payment has been initiated",
      "ORDER_LOCKED"
    );
  }

  // Calculate new shipping fee
  const newShippingFee = method === "standard" ? 3500 : 8500;
  const newTotal = order.subtotal + order.platform_fee + newShippingFee;

  const newShippingSnapshot: ShippingSnapshot = {
    method,
    fee: newShippingFee,
    estimatedDays: method === "standard" ? "5-10 business days" : "2-4 business days",
  };

  const { error } = await supabase
    .from("orders")
    .update({
      shipping_snapshot: newShippingSnapshot,
      shipping_fee: newShippingFee,
      total_amount: newTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[OrdersService] updateShippingMethod error:", error);
    throw new OrderError(
      error.message || "Failed to update shipping method",
      "UPDATE_FAILED"
    );
  }
}

/**
 * Links payment information to an order.
 * Called after creating a payment session.
 * 
 * @param orderId - Order ID
 * @param paymentIntentId - Wire PaymentIntent ID
 * @param checkoutUrl - Wire Checkout URL
 * @param paymentMethod - Selected payment method
 */
export async function linkPaymentToOrder(
  orderId: string,
  paymentIntentId: string,
  checkoutUrl: string,
  paymentMethod: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_method: paymentMethod,
      payment_provider: "wire",
      wire_payment_intent_id: paymentIntentId,
      wire_checkout_url: checkoutUrl,
      payment_status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[OrdersService] linkPaymentToOrder error:", error);
    throw new OrderError(
      error.message || "Failed to link payment to order",
      "LINK_FAILED"
    );
  }
}

// ============================================
// Order Status Updates (Server-only via Webhook)
// ============================================

/**
 * Marks an order as paid.
 * This should ONLY be called by the webhook handler.
 * 
 * @param orderId - Order ID
 * @param paymentIntentId - Wire PaymentIntent ID for verification
 */
export async function markOrderAsPaid(
  orderId: string,
  paymentIntentId: string
): Promise<void> {
  // Verify the payment intent matches
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("wire_payment_intent_id, payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new OrderError("Order not found", "ORDER_NOT_FOUND");
  }

  if (order.wire_payment_intent_id !== paymentIntentId) {
    throw new OrderError(
      "Payment intent mismatch",
      "PAYMENT_INTENT_MISMATCH"
    );
  }

  if (order.payment_status === "paid") {
    // Idempotent - already marked as paid
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid" as PaymentStatus,
      order_status: "processing" as OrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("wire_payment_intent_id", paymentIntentId);

  if (error) {
    console.error("[OrdersService] markOrderAsPaid error:", error);
    throw new OrderError(
      error.message || "Failed to mark order as paid",
      "UPDATE_FAILED"
    );
  }
}

/**
 * Marks an order as failed.
 * This should ONLY be called by the webhook handler.
 * 
 * @param orderId - Order ID
 * @param paymentIntentId - Wire PaymentIntent ID for verification
 * @param reason - Optional failure reason
 */
export async function markOrderAsFailed(
  orderId: string,
  paymentIntentId: string,
  reason?: string
): Promise<void> {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("wire_payment_intent_id, payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new OrderError("Order not found", "ORDER_NOT_FOUND");
  }

  if (order.payment_status === "paid") {
    // Cannot fail an already paid order
    throw new OrderError(
      "Cannot fail an already paid order",
      "INVALID_STATE"
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "failed" as PaymentStatus,
      order_status: "cancelled" as OrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("wire_payment_intent_id", paymentIntentId);

  if (error) {
    console.error("[OrdersService] markOrderAsFailed error:", error);
    throw new OrderError(
      error.message || "Failed to mark order as failed",
      "UPDATE_FAILED"
    );
  }
}

/**
 * Marks an order as cancelled.
 * 
 * @param orderId - Order ID
 * @param paymentIntentId - Optional Wire PaymentIntent ID
 */
export async function markOrderAsCancelled(
  orderId: string,
  paymentIntentId?: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "cancelled" as PaymentStatus,
      order_status: "cancelled" as OrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (paymentIntentId) {
    await supabase
      .from("orders")
      .update({ wire_payment_intent_id: paymentIntentId })
      .eq("id", orderId);
  }

  if (error) {
    console.error("[OrdersService] markOrderAsCancelled error:", error);
    throw new OrderError(
      error.message || "Failed to cancel order",
      "UPDATE_FAILED"
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
 * @returns Order data
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
 * @param userId - User ID
 * @param limit - Maximum number of orders to return
 * @returns Array of orders
 */
export async function loadUserOrders(
  userId: string,
  limit: number = 50
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[OrdersService] loadUserOrders error:", error);
    return [];
  }

  return (data || []) as Order[];
}

/**
 * Loads all orders (for admin purposes).
 * 
 * @param limit - Maximum number of orders to return
 * @param offset - Offset for pagination
 * @returns Array of orders
 */
export async function loadAllOrders(
  limit: number = 50,
  offset: number = 0
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[OrdersService] loadAllOrders error:", error);
    return [];
  }

  return (data || []) as Order[];
}

// ============================================
// Order Validation
// ============================================

/**
 * Validates that an order belongs to a user.
 * 
 * @param orderId - Order ID
 * @param userId - User ID
 * @returns true if the order belongs to the user
 */
export async function validateOrderOwnership(
  orderId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}

/**
 * Validates order pricing hasn't been tampered with.
 * Compares current product price with order snapshot.
 * 
 * @param orderId - Order ID
 * @param currentPrice - Current product price
 * @returns true if prices match
 */
export async function validateOrderPricing(
  orderId: string,
  currentPrice: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select("product_snapshot, total_amount, subtotal, platform_fee, shipping_fee")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return false;
  }

  const order = data as unknown as Order;
  const expectedSubtotal = currentPrice * order.product_snapshot.quantity;
  
  return order.product_snapshot.price === currentPrice && 
         order.subtotal === expectedSubtotal;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Formats order status for display.
 * 
 * @param status - Order status
 * @returns Human-readable status
 */
export function formatOrderStatus(status: OrderStatus): string {
  const statusLabels: Record<OrderStatus, string> = {
    pending_payment: "Awaiting Payment",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return statusLabels[status] || status;
}

/**
 * Formats payment status for display.
 * 
 * @param status - Payment status
 * @returns Human-readable status
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  const statusLabels: Record<PaymentStatus, string> = {
    pending_payment: "Awaiting Payment",
    processing: "Processing",
    paid: "Paid",
    cancelled: "Cancelled",
    failed: "Payment Failed",
  };
  return statusLabels[status] || status;
}

/**
 * Gets the color for a payment status badge.
 * 
 * @param status - Payment status
 * @returns Hex color code
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending_payment: "#F59E0B", // Amber
    processing: "#3B82F6", // Blue
    paid: "#10B981", // Green
    cancelled: "#6B7280", // Gray
    failed: "#EF4444", // Red
  };
  return colors[status] || "#6B7280";
}

/**
 * Gets the color for an order status badge.
 * 
 * @param status - Order status
 * @returns Hex color code
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending_payment: "#F59E0B", // Amber
    processing: "#3B82F6", // Blue
    shipped: "#8B5CF6", // Purple
    delivered: "#10B981", // Green
    cancelled: "#6B7280", // Gray
  };
  return colors[status] || "#6B7280";
>>>>>>> 9c858a5ddf16a8758fbeeb35e6d0cfde112c95a4
}
