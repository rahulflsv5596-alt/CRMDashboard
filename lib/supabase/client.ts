import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use inside "use client" components (browser-side).
 * Reads/writes here run with the anon key, subject to your RLS policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
