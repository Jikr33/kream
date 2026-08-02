/**
 * Kream Outlet – Products Service
 * ================================
 * Product-related operations:
 * - Load products
 * - Load product by ID
 * - Search and filter
 * - No payment logic
 */

import { supabase } from "@/lib/supabase";
import type { Product, ProductWithDetails } from "@/types";
import {
  mockProducts,
  mockReviews,
  getAverageRating,
  getReviewCount,
  getBrandName,
} from "@/lib/mockData";

const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.EXPO_PUBLIC_SUPABASE_URL !== "your-supabase-project-url";

export async function fetchProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) {
    return fallbackProducts();
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error || !data) return fallbackProducts();

    return (data as Product[]).map((p) => ({
      ...p,
      brandName: getBrandName(p.brand_id),
      avgRating: getAverageRating(p.id),
      reviewCount: getReviewCount(p.id),
    }));
  } catch {
    return fallbackProducts();
  }
}

export async function fetchProductById(
  id: string,
): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured) {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) return null;

    return {
      ...product,
      brandName: getBrandName(product.brand_id),
      avgRating: getAverageRating(product.id),
      reviewCount: getReviewCount(product.id),
    };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const product = data as Product;
    return {
      ...product,
      brandName: getBrandName(product.brand_id),
      avgRating: getAverageRating(product.id),
      reviewCount: getReviewCount(product.id),
    };
  } catch {
    return null;
  }
}

export async function searchProducts(
  query: string,
  filters?: {
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
  },
): Promise<ProductWithDetails[]> {
  let results = await fetchProducts();

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q),
    );
  }

  if (filters?.brandId) {
    results = results.filter((p) => p.brand_id === filters.brandId);
  }

  if (filters?.category) {
    results = results.filter((p) => p.category === filters.category);
  }

  if (filters?.minPrice !== undefined) {
    results = results.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= filters.maxPrice!);
  }

  return results;
}

export async function fetchReviews(
  productId: string,
): Promise<Product["id"][]> {
  if (!isSupabaseConfigured) {
    return mockReviews
      .filter((r) => r.sneaker_id === productId)
      .map((r) => r.id);
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id")
      .eq("sneaker_id", productId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data as { id: string }[]).map((r) => r.id);
  } catch {
    return [];
  }
}

function fallbackProducts(): ProductWithDetails[] {
  return mockProducts.map((p) => ({
    ...p,
    brandName: getBrandName(p.brand_id),
    avgRating: getAverageRating(p.id),
    reviewCount: getReviewCount(p.id),
  }));
}
