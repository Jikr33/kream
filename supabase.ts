import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://cksxnfghcqgvodzqlnzx.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "sb_secret_EODhAKG1PVNOqxA-k-Vbvw_lWciciFs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchProducts() {
  const { data: allProducts, error } = await supabase
    .from("app_2515d5c380_products")
    .select("*");

  console.log("Fetched products:", allProducts, "Error:", error);

  return { allProducts, error };
}
