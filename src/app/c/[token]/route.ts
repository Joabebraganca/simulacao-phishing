import { NextRequest, NextResponse } from "next/server";
import { registrarEvento } from "@/lib/tracking";

// Rota de clique no link: GET /c/[token]
// Registra o evento "clicou" e leva a pessoa para a landing de suporte.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  // No Next 16, params e assincrono.
  const { token } = await params;

  // Registra o "clicou" (silencioso — nunca bloqueia o redirect).
  await registrarEvento(token, "clicou", req.headers.get("user-agent"));

  // Redireciona (302) para a landing, carregando o token adiante em ?t=.
  const destino = new URL(
    `/suporte?t=${encodeURIComponent(token)}`,
    req.nextUrl.origin,
  );
  return NextResponse.redirect(destino, 302);
}
