import { createClient } from "@supabase/supabase-js";
import { __DEV__ } from "react-native";
import type { Database, Product } from "@/types";
// import { localStorage } from "@/lib/localStorage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

if (__DEV__ && !isConfigured) {
  console.warn(
    "[Kream] Supabase not configured. Using mock data. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("app_2515d5c380_products")
    .select("id,name,price,brand_id,thumb,is_available,category");
  console.log("Fetched products:", data, "Error:", error);
  return { allProducts: data as Product[], error };
}

export async function fetchDetail(id: string) {
  const { data, error } = await supabase
    .from("app_2515d5c380_products")
    .select("*")
    .eq("id", id);
  console.log("Fetched product detail:", data, "Error:", error);
  return { detail: data, error };
}
export async function fetchColorSize(id: string) {
  const { data, error } = await supabase
    .from("app_2515d5c380_products")
    .select("available_sizes,available_colors")
    .eq("id", id);
  return { colorsSizes: data, error };
}
