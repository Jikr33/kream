/**
 * Kream Outlet – Data Service
 * ===========================
 * Unified data layer that tries Supabase first and falls back to
 * mock data when the backend is not configured or returns errors.
 * This lets the app work fully offline for design/preview.
 */

import { supabase } from "@/supabase";
import type {
  Order,
  OrderItem,
  Product,
  ProductWithDetails,
  Review,
} from "@/types";
import {
  mockProducts,
  mockReviews,
  mockOrders,
  mockOrderItems,
  getAverageRating,
  getReviewCount,
  getBrandName,
} from "@/lib/mockData";

const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== "your-supabase-project-url";

// ─── Sneakers ────────────────────────────────────────────

export async function fetchSneakers(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) {
    return fallbackSneakers();
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    if (error || !data) return fallbackSneakers();
    return (data as Product[]).map((p) => ({
      ...p,
      brandName: getBrandName(p.brand_id),
      avgRating: getAverageRating(p.id),
      reviewCount: getReviewCount(p.id),
    }));
  } catch {
    return fallbackSneakers();
  }
}

function fallbackSneakers(): ProductWithDetails[] {
  return mockProducts.map((p) => ({
    ...p,
    brandName: getBrandName(p.brand_id),
    avgRating: getAverageRating(p.id),
    reviewCount: getReviewCount(p.id),
  }));
}

export async function fetchSneakerById(
  id: string,
): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured) {
    const p = mockProducts.find((p) => p.id === id);
    if (!p) return null;
    return {
      ...p,
      brandName: getBrandName(p.brand_id),
      avgRating: getAverageRating(p.id),
      reviewCount: getReviewCount(p.id),
    };
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    const result = data as Product;
    return {
      ...result,
      brandName: getBrandName(result.brand_id),
      avgRating: getAverageRating(result.id),
      reviewCount: getReviewCount(result.id),
    };
  } catch {
    return null;
  }
}

export async function searchSneakers(
  query: string,
  filters?: {
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
  },
): Promise<ProductWithDetails[]> {
  let results = await fetchSneakers();

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.brandName.toLowerCase().includes(q),
    );
  }

  if (filters?.brandId) {
    results = results.filter((s) => s.brand_id === filters.brandId);
  }
  if (filters?.minPrice !== undefined) {
    results = results.filter((s) => s.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    results = results.filter((s) => s.price <= filters.maxPrice!);
  }

  return results;
}

// ─── Reviews ─────────────────────────────────────────────

export async function fetchReviews(sneakerId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return mockReviews.filter((r) => r.sneaker_id === sneakerId);
  }
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("sneaker_id", sneakerId)
      .order("created_at", { ascending: false });
    if (error) return mockReviews.filter((r) => r.sneaker_id === sneakerId);
    return (data as Review[]) ?? [];
  } catch {
    return mockReviews.filter((r) => r.sneaker_id === sneakerId);
  }
}

// ─── Orders ──────────────────────────────────────────────

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

export async function fetchOrderById(orderId: string): Promise<{
  order: Order;
  items: (OrderItem & { sneaker: Product | null })[];
} | null> {
  if (!isSupabaseConfigured) {
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) return null;
    const items = mockOrderItems
      .filter((oi) => oi.order_id === orderId)
      .map((oi) => {
        const sneaker =
          mockProducts.find((s) => s.id === oi.sneaker_id) ?? null;
        return { ...oi, sneaker };
      });
    return { order, items };
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

    if (itemsError || !items) return { order: order as Order, items: [] };

    return {
      order: order as Order,
      items: (items as Array<OrderItem & { products: Product | null }>).map(
        (i) => ({
          ...i,
          sneaker: i.products,
        }),
      ),
    };
  } catch {
    return null;
  }
}

export async function createOrder(order: {
  userId?: string | null;
  totalAmount: number;
  paymentMethod?: string;
  shippingAddress?: string;
  items: { sneakerId: string; quantity: number; price: number }[];
}): Promise<string | null> {
  const orderId = `order-${Date.now()}`;

  if (!isSupabaseConfigured) {
    // Mock creation – just return a fake ID
    return orderId;
  }

  try {
    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert({
        user_id: order.userId ?? null,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        shipping_address: order.shippingAddress,
        status: "pending",
      })
      .select()
      .single();

    if (error || !newOrder) return orderId;

    const createdOrder = newOrder as Order;

    // Insert order items
    const orderItems = order.items.map((item) => ({
      order_id: createdOrder.id,
      sneaker_id: item.sneakerId,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    return createdOrder.id;
  } catch {
    return orderId;
  }
}
