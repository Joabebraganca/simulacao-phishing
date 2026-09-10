import { NextRequest, NextResponse } from "next/server";
import { registrarEvento } from "@/lib/tracking";

// Rota de submissao da landing: POST /api/submeter
//
// PRINCIPIO INEGOCIAVEL: nao lemos, nao logamos, nao gravamos NADA do que a
// pessoa digitou. Extraimos SOMENTE o token do corpo, registramos o evento
// "submeteu" e descartamos o resto imediatamente. O `formData` sai de escopo
// sem nunca ser inspecionado alem do campo `token`.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  let token: string | null = null;

  try {
    const form = await req.formData();
    // Le APENAS o token. Nenhum outro campo e acessado, iterado ou logado.
    const valor = form.get("token");
    token = typeof valor === "string" ? valor : null;
  } catch {
    // Corpo malformado: segue mesmo assim, sem vazar nada.
  }

  // Registra o "submeteu" (o conteudo do formulario ja foi descartado).
  await registrarEvento(token, "submeteu", req.headers.get("user-agent"));

  // Redireciona para a pagina de conscientizacao. 303 => o navegador faz GET.
  return NextResponse.redirect(new URL("/treinamento", req.nextUrl.origin), 303);
}
