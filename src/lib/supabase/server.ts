import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// =============================================================================
// Client de SERVIDOR com sessao do usuario (anon key + cookies).
//
// Usado nas paginas/route handlers do PAINEL para saber quem esta logado e
// ler dados respeitando o RLS (papel `authenticated`). NAO ignora RLS.
// Para escrita de tracking, use o client admin (admin.ts).
// =============================================================================

export async function criarClientServidor() {
  // No Next 16, cookies() e assincrono.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` chamado de um Server Component — pode ser ignorado
            // quando ha middleware cuidando do refresh de sessao.
          }
        },
      },
    },
  );
}
