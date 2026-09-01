import { createClient } from "@supabase/supabase-js";

const restUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_APIKEY;

// Fjerner /rest/v1, fordi Supabase Auth skal bruge projektets grund-URL
const supabaseProjectUrl = restUrl.replace(/\/rest\/v1\/?$/, "");

export const supabase = createClient(supabaseProjectUrl, supabaseKey);
