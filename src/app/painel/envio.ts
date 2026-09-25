"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/painel/sessao";
import { criarClientAdmin } from "@/lib/supabase/admin";
import { obterTransporte, type Transporte } from "@/lib/email/transporte";
import { montarEmailHtml, montarEmailTexto } from "@/lib/email/modelo";
import type { Campanha } from "@/lib/tipos";

// =============================================================================
// Disparo dos e-mails da campanha (Fase 4).
//
// Como toda escrita do painel, comeca por exigirUsuario(). O envio:
//   1. resolve os destinatarios ainda SEM evento "enviado" (nao duplica);
//   2. monta, por pessoa, o e-mail com pixel e link carregando o token;
//   3. envia pelo transporte configurado (SMTP ou n8n);
//   4. registra "enviado" em lote para os que sairam com sucesso;
//   5. move a campanha para "em_andamento".
//
// Nada de credencial de colaborador em nenhum ponto — so nome/e-mail e o token.
// =============================================================================

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export async function dispararCampanha(formData: FormData): Promise<void> {
  await exigirUsuario();

  const campanhaId = String(formData.get("campanha_id") ?? "");
  if (!campanhaId) redirect("/painel");
  const voltar = `/painel/campanhas/${campanhaId}`;

  const base = baseUrl();
  if (!base) {
    redirect(
      `${voltar}?erro=` +
        encodeURIComponent(
          "Configure NEXT_PUBLIC_APP_URL para os links/pixel saírem com o domínio completo.",
        ),
    );
  }

  const admin = criarClientAdmin();

  const { data: campanha } = await admin
    .from("campanhas")
    .select("*")
    .eq("id", campanhaId)
    .maybeSingle<Campanha>();
  if (!campanha) redirect("/painel");

  const { data: destinatarios } = await admin
    .from("destinatarios")
    .select("id, nome, email, token")
    .eq("campanha_id", campanhaId);

  const lista = destinatarios ?? [];
  if (lista.length === 0) {
    redirect(`${voltar}?erro=` + encodeURIComponent("Não há destinatários nesta campanha."));
  }

  // Quem ja recebeu (evento "enviado") fica de fora — permite reenviar apenas
  // aos pendentes sem duplicar disparos.
  const ids = lista.map((d) => d.id);
  const { data: jaEnviados } = await admin
    .from("eventos")
    .select("destinatario_id")
    .eq("tipo", "enviado")
    .in("destinatario_id", ids);

  const enviadosSet = new Set((jaEnviados ?? []).map((e) => e.destinatario_id));
  const pendentes = lista.filter((d) => !enviadosSet.has(d.id));

  if (pendentes.length === 0) {
    redirect(
      `${voltar}?erro=` +
        encodeURIComponent("Todos os destinatários já receberam o e-mail."),
    );
  }

  let transporte: Transporte;
  try {
    transporte = obterTransporte();
  } catch (e) {
    redirect(`${voltar}?erro=` + encodeURIComponent((e as Error).message));
  }

  const sucesso: string[] = [];
  let falhas = 0;

  for (const d of pendentes) {
    const linkClique = `${base}/c/${d.token}`;
    const pixelUrl = `${base}/api/abrir?t=${d.token}`;
    try {
      await transporte.enviar({
        de: campanha.remetente,
        para: d.email,
        assunto: campanha.assunto,
        html: montarEmailHtml({ nome: d.nome, linkClique, pixelUrl }),
        texto: montarEmailTexto({ nome: d.nome, linkClique }),
      });
      sucesso.push(d.id);
    } catch {
      // Falha em um destinatario nao derruba o lote inteiro.
      falhas++;
    }
  }

  if (sucesso.length > 0) {
    await admin
      .from("eventos")
      .insert(sucesso.map((id) => ({ destinatario_id: id, tipo: "enviado" as const })));

    if (campanha.status !== "em_andamento") {
      await admin
        .from("campanhas")
        .update({ status: "em_andamento", atualizada_em: new Date().toISOString() })
        .eq("id", campanhaId);
    }
  }

  revalidatePath(voltar);
  redirect(`${voltar}?enviados=${sucesso.length}&falhas=${falhas}`);
}

// Envio de um unico e-mail de teste (preview) para um endereco informado.
// Usa um token de teste inexistente: o tracking o ignora em silencio, entao o
// preview nao contamina as metricas da campanha.
export async function enviarTeste(formData: FormData): Promise<void> {
  await exigirUsuario();

  const campanhaId = String(formData.get("campanha_id") ?? "");
  const para = String(formData.get("email_teste") ?? "").trim();
  const voltar = `/painel/campanhas/${campanhaId}`;

  if (!campanhaId) redirect("/painel");
  if (!para || !para.includes("@")) {
    redirect(`${voltar}?erro=` + encodeURIComponent("Informe um e-mail de teste válido."));
  }

  const admin = criarClientAdmin();
  const { data: campanha } = await admin
    .from("campanhas")
    .select("remetente, assunto")
    .eq("id", campanhaId)
    .maybeSingle<Pick<Campanha, "remetente" | "assunto">>();
  if (!campanha) redirect("/painel");

  const base = baseUrl();
  const tokenTeste = "teste-preview"; // inexistente no banco -> nao registra nada
  const linkClique = base ? `${base}/c/${tokenTeste}` : `/c/${tokenTeste}`;
  const pixelUrl = base ? `${base}/api/abrir?t=${tokenTeste}` : `/api/abrir?t=${tokenTeste}`;

  try {
    const transporte = obterTransporte();
    await transporte.enviar({
      de: campanha.remetente,
      para,
      assunto: `[TESTE] ${campanha.assunto}`,
      html: montarEmailHtml({ nome: "Teste", linkClique, pixelUrl }),
      texto: montarEmailTexto({ nome: "Teste", linkClique }),
    });
  } catch (e) {
    redirect(
      `${voltar}?erro=` +
        encodeURIComponent("Falha no envio de teste: " + (e as Error).message),
    );
  }

  redirect(`${voltar}?teste=${encodeURIComponent(para)}`);
}
