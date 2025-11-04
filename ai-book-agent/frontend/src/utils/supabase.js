import { createClient } from "@supabase/supabase-js";

// These should be set in your .env file in the frontend directory
// Vite automatically loads .env files and exposes variables prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("VITE_SUPABASE_URL and VITE_SUPABASE_KEY must be set in your .env file");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

