"use client";
import { createBrowserClient } from "@supabase/ssr";

// =============================================================================
// Client de BROWSER (anon key). Usa APENAS chaves publicas.
// Nunca deve tocar a service role key.
// =============================================================================

export function criarClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
