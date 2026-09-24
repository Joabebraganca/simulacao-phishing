import type { NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/middleware";

// Proxy do Next 16 (antigo "middleware"): refresh de sessao + gate de acesso.
// Escopo restrito ao painel e ao login; as rotas publicas de tracking ficam de
// fora (nao dependem de sessao).
export default async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  matcher: ["/painel/:path*", "/login"],
};
