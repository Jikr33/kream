/**
 * Supabase Client
 * 
 * This file ONLY contains the Supabase client initialization.
 * 
 * IMPORTANT: This client is for React Native only.
 * Do NOT add business logic, payment logic, or order logic here.
 * Use the services in /services for those operations.
 */

import { createClient } from "@supabase/supabase-js";
import { __DEV__ } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

if (__DEV__ && !isConfigured) {
  console.warn(
    "[Kream] Supabase not configured. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

/**
 * Supabase client for React Native.
 * Uses the anon key which has Row Level Security policies applied.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
