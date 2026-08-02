/**
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
}
