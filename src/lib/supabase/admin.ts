import "server-only";
import { createClient } from "@supabase/supabase-js";

// =============================================================================
// Client ADMIN (service role) — SOMENTE no servidor.
//
// A service role key ignora o RLS. Este modulo importa "server-only": se
// alguem tentar importa-lo em codigo client, o build QUEBRA de proposito.
//
// Use este client apenas nos route handlers de tracking (pixel/clique/submit)
// e em operacoes administrativas do painel que precisem escrever.
// =============================================================================

export function criarClientAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente do servidor.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
