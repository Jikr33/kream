import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types";

declare const __DEV__: boolean;

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (__DEV__ && !isConfigured) {
  console.warn(
    "[Kream] Supabase not configured. Using mock data. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type FetchProductsResult = {
  allProducts: Product[] | null;
  error: Error | null;
};

export async function fetchProducts(): Promise<FetchProductsResult> {
  try {
    const { data, error } = await supabase
      .from("app_2515d5c380_products")
      .select("id,name,price,brand_id,thumb,is_available,category");
    if (error) {
      return { allProducts: null, error: error as Error };
    }
    return { allProducts: (data as Product[]) ?? null, error: null };
  } catch (e) {
    return { allProducts: null, error: e as Error };
  }
}

export type FetchDetailResult = {
  detail: Product[] | null;
  error: Error | null;
};

export async function fetchDetail(id: string): Promise<FetchDetailResult> {
  try {
    const { data, error } = await supabase
      .from("app_2515d5c380_products")
      .select("*")
      .eq("id", id);
    if (error) {
      return { detail: null, error: error as Error };
    }
    return { detail: (data as Product[]) ?? null, error: null };
  } catch (e) {
    return { detail: null, error: e as Error };
  }
}
