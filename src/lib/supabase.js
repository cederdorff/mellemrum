import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_APIKEY;

if (!rawUrl) {
  throw new Error("VITE_SUPABASE_URL mangler i din .env-fil");
}

if (!supabaseKey) {
  throw new Error("VITE_SUPABASE_APIKEY mangler i din .env-fil");
}

// Hvis din URL indeholder /rest/v1, fjernes det,
// fordi createClient kun skal bruge selve projekt-URL'en.
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");

export const supabase = createClient(supabaseUrl, supabaseKey);
