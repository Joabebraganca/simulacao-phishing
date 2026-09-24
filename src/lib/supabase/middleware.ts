import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// =============================================================================
// Refresh de sessao no middleware (padrao @supabase/ssr no App Router).
//
// Roda apenas nas rotas do painel e no /login (ver o matcher em middleware.ts).
// Mantem o cookie de sessao vivo e faz o "gate":
//   - sem sessao tentando entrar no /painel  -> manda pro /login
//   - com sessao ja logada indo pro /login    -> manda pro /painel
//
// As rotas publicas de tracking (pixel/clique/submit/landing/treinamento) NAO
// passam por aqui — sao anonimas por natureza.
// =============================================================================

export async function atualizarSessao(request: NextRequest): Promise<NextResponse> {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          resposta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: nao rodar codigo entre criar o client e o getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;

  if (!user && caminho.startsWith("/painel")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && caminho === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    return NextResponse.redirect(url);
  }

  return resposta;
}
