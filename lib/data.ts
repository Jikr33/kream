/**
 * Kream Outlet – Data Service
 * ===========================
 * Unified data layer that tries Supabase first and falls back to
 * mock data when the backend is not configured or returns errors.
 * This lets the app work fully offline for design/preview.
 */

import { supabase } from "@/supabase";
import type {
  Brand,
  Order,
  OrderItem,
  Review,
  Sneaker,
  SneakerWithDetails,
} from "@/types";
import {
  mockBrands,
  mockSneakers,
  mockReviews,
  mockOrders,
  mockOrderItems,
  getAverageRating,
  getReviewCount,
  getBrandName,
} from "@/lib/mockData";

type SneakerWithBrand = Sneaker & { brands?: { name: string } | null };

const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== "your-supabase-project-url";

// ─── Sneakers ────────────────────────────────────────────

export async function fetchSneakers(): Promise<SneakerWithDetails[]> {
  if (!isSupabaseConfigured) {
    return mockSneakers.map((s: Sneaker) => ({
      ...s,
      brandName: getBrandName(s.brand_id),
      avgRating: getAverageRating(s.id),
      reviewCount: getReviewCount(s.id),
    }));
  }
  try {
    const { data, error } = await supabase
      .from("sneakers")
      .select("*, brands(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error || !data) return fallbackSneakers();
    return (data as any[]).map((s) => ({
      ...s,
      brandName: s.brands?.name ?? getBrandName(s.brand_id),
      avgRating: getAverageRating(s.id),
      reviewCount: getReviewCount(s.id),
    }));
  } catch {
    return fallbackSneakers();
  }
}

function fallbackSneakers(): SneakerWithDetails[] {
  return mockSneakers.map((s) => ({
    ...s,
    brandName: getBrandName(s.brand_id),
    avgRating: getAverageRating(s.id),
    reviewCount: getReviewCount(s.id),
  }));
}

export async function fetchSneakerById(
  id: string,
): Promise<SneakerWithDetails | null> {
  if (!isSupabaseConfigured) {
    const s = mockSneakers.find((s) => s.id === id);
    if (!s) return null;
    return {
      ...s,
      brandName: getBrandName(s.brand_id),
      avgRating: getAverageRating(s.id),
      reviewCount: getReviewCount(s.id),
    };
  }
  try {
    const { data, error } = await supabase
      .from("sneakers")
      .select("*, brands(name)")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    const result = data as any;
    return {
      ...result,
      brandName: result.brands?.name ?? getBrandName(result.brand_id),
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
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
  },
): Promise<SneakerWithDetails[]> {
  let results = await fetchSneakers();

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.model?.toLowerCase().includes(q) ||
        s.brandName.toLowerCase().includes(q),
    );
  }

  if (filters?.brandId) {
    results = results.filter((s) => s.brand_id === filters.brandId);
  }
  if (filters?.condition) {
    results = results.filter((s) => s.condition === filters.condition);
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
    return data ?? [];
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
    return data ?? [];
  } catch {
    return mockOrders.filter((o) => o.user_id === userId);
  }
}

export async function fetchOrderById(orderId: string): Promise<{
  order: Order;
  items: (OrderItem & { sneaker: Sneaker | null })[];
} | null> {
  if (!isSupabaseConfigured) {
    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) return null;
    const items = mockOrderItems
      .filter((oi) => oi.order_id === orderId)
      .map((oi) => {
        const sneaker =
          mockSneakers.find((s) => s.id === oi.sneaker_id) ?? null;
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
      .select("*, sneakers(*)")
      .eq("order_id", orderId);

    if (itemsError || !items) return { order, items: [] };

    return {
      order,
      items: (items as any[]).map((i: any) => ({
        ...i,
        sneaker: i.sneakers,
      })),
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
    const createResult = (await supabase
      .from("orders")
      .insert({
        user_id: order.userId ?? null,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        shipping_address: order.shippingAddress,
        status: "pending",
      } as any)
      .select()
      .single()) as any;

    const newOrder = createResult.data;
    const error = createResult.error;
    if (error || !newOrder) return orderId;

    const createdOrder = newOrder as any;

    // Insert order items
    const orderItems = order.items.map((item) => ({
      order_id: createdOrder.id,
      sneaker_id: item.sneakerId,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItems as any);

    return newOrder.id;
  } catch {
    return orderId;
  }
}
