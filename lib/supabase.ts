import { createClient } from "@supabase/supabase-js";

import { Database } from "./database.types";

// Read with static `process.env.EXPO_PUBLIC_*` access so Expo inlines the values at build time.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
            "Copy .env.example to .env and fill in your Supabase project's values.",
    );
}

/**
 * Supabase client typed with the generated `Database` schema (`npm run gen:types`), so table
 * names, columns and row shapes are checked at compile time.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
