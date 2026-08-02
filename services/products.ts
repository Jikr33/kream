/**
<<<<<<< HEAD
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
=======
 * Products Service
 * 
 * Handles all product-related database operations.
 * This service is responsible for:
 * - Fetching products
 * - Fetching product details
 * - Fetching product variants (sizes, colors)
 */

import { supabase } from "@/supabase";
import type { Product } from "@/types";

// ============================================
// Error Types
// ============================================

export class ProductError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ProductError";
  }
}

// ============================================
// Product Queries
// ============================================

/**
 * Fetches all available products.
 * 
 * @returns Array of products and any error
 */
export async function fetchProducts(): Promise<{
  allProducts: Product[];
  error: ProductError | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,brand_id,thumb,is_available,category");

  if (error) {
    console.error("[ProductsService] fetchProducts error:", error);
    return {
      allProducts: [],
      error: new ProductError(
        error.message || "Failed to fetch products",
        "FETCH_FAILED"
      ),
    };
  }

  return {
    allProducts: (data || []) as Product[],
    error: null,
  };
}

/**
 * Fetches a single product by ID.
 * 
 * @param id - Product ID
 * @returns Product details and any error
 */
export async function fetchProductDetail(id: string): Promise<{
  product: Product | null;
  error: ProductError | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[ProductsService] fetchProductDetail error:", error);
    return {
      product: null,
      error: new ProductError(
        error.message || "Failed to fetch product",
        "FETCH_FAILED"
      ),
    };
  }

  return {
    product: data as Product,
    error: null,
  };
}

/**
 * Fetches product variants (sizes and colors).
 * 
 * @param id - Product ID
 * @returns Product variants and any error
 */
export async function fetchProductVariants(id: string): Promise<{
  variants: { available_sizes: number[] | null; available_colors: string[] | null } | null;
  error: ProductError | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("available_sizes,available_colors")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[ProductsService] fetchProductVariants error:", error);
    return {
      variants: null,
      error: new ProductError(
        error.message || "Failed to fetch variants",
        "FETCH_FAILED"
      ),
    };
  }

  return {
    variants: data,
    error: null,
  };
}

/**
 * Fetches products by brand.
 * 
 * @param brandId - Brand ID
 * @returns Array of products and any error
 */
export async function fetchProductsByBrand(brandId: string): Promise<{
  products: Product[];
  error: ProductError | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,brand_id,thumb,is_available,category")
    .eq("brand_id", brandId);

  if (error) {
    console.error("[ProductsService] fetchProductsByBrand error:", error);
    return {
      products: [],
      error: new ProductError(
        error.message || "Failed to fetch products",
        "FETCH_FAILED"
      ),
    };
  }

  return {
    products: (data || []) as Product[],
    error: null,
  };
}

/**
 * Searches products by name.
 * 
 * @param query - Search query
 * @returns Array of matching products and any error
 */
export async function searchProducts(query: string): Promise<{
  products: Product[];
  error: ProductError | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,brand_id,thumb,is_available,category")
    .ilike("name", `%${query}%`);

  if (error) {
    console.error("[ProductsService] searchProducts error:", error);
    return {
      products: [],
      error: new ProductError(
        error.message || "Failed to search products",
        "SEARCH_FAILED"
      ),
    };
  }

  return {
    products: (data || []) as Product[],
    error: null,
  };
}

/**
 * Checks product availability.
 * 
 * @param productId - Product ID
 * @param quantity - Desired quantity
 * @returns Whether the product is available
 */
export async function checkProductAvailability(
  productId: string,
  quantity: number = 1
): Promise<boolean> {
  const { data, error } = await supabase
    .from("products")
    .select("is_available")
    .eq("id", productId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_available === true;
}

/**
 * Validates that product price hasn't changed since order creation.
 * 
 * @param productId - Product ID
 * @param originalPrice - Price when order was created
 * @returns Whether the price is valid
 */
export async function validateProductPrice(
  productId: string,
  originalPrice: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("products")
    .select("price")
    .eq("id", productId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.price === originalPrice;
>>>>>>> 9c858a5ddf16a8758fbeeb35e6d0cfde112c95a4
}
