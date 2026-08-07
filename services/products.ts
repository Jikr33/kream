/**
 * Products Service
 *
 * Handles all product-related database operations.
 * This service is responsible for:
 * - Fetching products
 * - Fetching product details
 * - Searching products
 * - No payment logic
 */

import { supabase } from "@/supabase";
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

// ============================================
// Product Queries
// ============================================

/**
 * Fetches all available products.
 *
 * @returns Array of products with details
 */
export async function fetchProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) {
    console.log("[Products Service] Supabase not configured. Using mock data.");
    return fallbackProducts();
  }

  try {
    const { data, error } = await supabase
      .from("app_2515d5c380_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return fallbackProducts();

    return data as ProductWithDetails[];
  } catch {
    return fallbackProducts();
  }
}

/**
 * Fetches a single product by ID.
 *
 * @param id - Product ID
 * @returns Product with details or null
 */
export async function fetchProductById(
  id: string,
): Promise<ProductWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("app_2515d5c380_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const product = data as ProductWithDetails;
    return product;
  } catch {
    return null;
  }
}

/**
 * Searches products by name and filters.
 *
 * @param query - Search query
 * @param filters - Optional filters
 * @returns Array of matching products
 */
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

/**
 * Fetches reviews for a product.
 *
 * @param productId - Product ID
 * @returns Array of review IDs
 */
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

// ============================================
// Helper Functions
// ============================================

function fallbackProducts(): ProductWithDetails[] {
  return mockProducts.map((p) => ({
    ...p,
    brandName: getBrandName(p.brand_id),
    avgRating: getAverageRating(p.id),
    reviewCount: getReviewCount(p.id),
  }));
}
