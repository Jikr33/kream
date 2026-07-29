import { createClient } from "@supabase/supabase-js";
import { __DEV__ } from "react-native";
import type { Database } from "@/types";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

if (__DEV__ && !isConfigured) {
  console.warn(
    "[Kream] Supabase not configured. Using mock data. " +
    "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = isConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient<Database>("https://placeholder.supabase.co", "placeholder");

export async function fetchProducts() {
  const { data, error } = await supabase.from("sneakers").select("*");
  return { allProducts: data, error };
}
