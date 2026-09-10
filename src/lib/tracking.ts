import "server-only";
import { criarClientAdmin } from "@/lib/supabase/admin";
import type { TipoEvento } from "@/lib/tipos";

// =============================================================================
// Registro de eventos de tracking — SOMENTE no servidor (service role).
//
// PRINCIPIO INEGOCIAVEL: registramos COMPORTAMENTO, nunca CREDENCIAIS.
// A funcao recebe o `token` opaco do destinatario (que ja identifica QUEM
// caiu) e o tipo de evento. Nunca recebe — nem quer — o conteudo do formulario.
//
// Silencioso por design: qualquer falha (token inexistente, erro de rede) e
// engolida. As rotas publicas (pixel/clique/submit) NUNCA devem quebrar de
// forma visivel por causa do tracking.
// =============================================================================

export async function registrarEvento(
  token: string | null | undefined,
  tipo: TipoEvento,
  userAgent?: string | null,
): Promise<void> {
  if (!token) return;

  try {
    const supabase = criarClientAdmin();

    // Resolve o token -> destinatario. O token e opaco: identifica a pessoa
    // sem precisarmos ler absolutamente nada do que ela digitou.
    const { data: destinatario } = await supabase
      .from("destinatarios")
      .select("id")
      .eq("token", token)
      .maybeSingle();

    // Token desconhecido: nao ha o que registrar. Sai em silencio.
    if (!destinatario) return;

    await supabase.from("eventos").insert({
      destinatario_id: destinatario.id,
      tipo,
      // Metadado NAO sensivel. Nunca gravamos IP — so o user-agent, e apenas
      // para diferenciar humano de bot/scanner de e-mail.
      user_agent: userAgent ?? null,
    });
  } catch {
    // Engole qualquer erro: o tracking e best-effort e jamais atrapalha o
    // fluxo da pessoa (o pixel sempre carrega, o clique sempre redireciona).
  }
}
