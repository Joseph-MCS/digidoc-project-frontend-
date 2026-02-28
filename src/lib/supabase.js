import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials missing. Copy .env.example → .env and fill in your project values."
  );
}

let _supabase;
try {
  _supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder"
  );
} catch (err) {
  console.error("Failed to initialise Supabase client:", err);
  // Create a minimal stub so the app still renders
  _supabase = createClient(
    "https://placeholder.supabase.co",
    "placeholder"
  );
}

export const supabase = _supabase;
