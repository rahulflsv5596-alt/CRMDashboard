import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use inside "use client" components (browser-side).
 * Reads/writes here run with the anon key, subject to your RLS policies.
 */
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
