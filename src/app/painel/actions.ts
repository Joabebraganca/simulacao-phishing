"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/painel/sessao";
import { criarClientAdmin } from "@/lib/supabase/admin";
import { parseCsvDestinatarios } from "@/lib/csv";

// =============================================================================
// Escritas do painel (Fase 1).
//
// Toda action comeca por `exigirUsuario()`: como a service role ignora o RLS,
// a checagem de sessao aqui e o que impede escrita anonima. So depois de
// confirmar o usuario logado usamos o client admin para gravar.
//
// Nenhuma destas operacoes toca senha/credencial — apenas dados de campanha e
// a lista de quem sera alvo (nome/e-mail/setor). O token de cada destinatario
// e gerado pelo DEFAULT do banco (gen_random_bytes), nao aqui.
// =============================================================================

export async function criarCampanha(formData: FormData): Promise<void> {
  await exigirUsuario();

  const nome = String(formData.get("nome") ?? "").trim();
  const setor_alvo = String(formData.get("setor_alvo") ?? "").trim();
  const landing_slug = String(formData.get("landing_slug") ?? "suporte").trim();
  const remetente = String(formData.get("remetente") ?? "").trim();
  const assunto = String(formData.get("assunto") ?? "").trim();

  const faltando = !nome || !setor_alvo || !remetente || !assunto;
  if (faltando) {
    redirect(
      "/painel/campanhas/nova?erro=" +
        encodeURIComponent("Preencha nome, setor-alvo, remetente e assunto."),
    );
  }

  const admin = criarClientAdmin();
  const { data, error } = await admin
    .from("campanhas")
    .insert({ nome, setor_alvo, landing_slug, remetente, assunto })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/painel/campanhas/nova?erro=" +
        encodeURIComponent(error?.message ?? "Falha ao criar a campanha."),
    );
  }

  revalidatePath("/painel");
  redirect(`/painel/campanhas/${data.id}`);
}

export async function excluirCampanha(formData: FormData): Promise<void> {
  await exigirUsuario();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/painel");

  const admin = criarClientAdmin();
  // ON DELETE CASCADE remove destinatarios e eventos junto.
  await admin.from("campanhas").delete().eq("id", id);

  revalidatePath("/painel");
  redirect("/painel");
}

export async function importarDestinatarios(formData: FormData): Promise<void> {
  await exigirUsuario();

  const campanhaId = String(formData.get("campanha_id") ?? "");
  if (!campanhaId) redirect("/painel");

  const voltar = `/painel/campanhas/${campanhaId}`;

  // Aceita arquivo .csv OU texto colado. O arquivo tem prioridade.
  let conteudo = String(formData.get("csv") ?? "");
  const arquivo = formData.get("arquivo");
  if (arquivo instanceof File && arquivo.size > 0) {
    conteudo = await arquivo.text();
  }

  const linhas = parseCsvDestinatarios(conteudo);
  if (linhas.length === 0) {
    redirect(
      `${voltar}?erro=` +
        encodeURIComponent(
          "Nenhum e-mail válido encontrado. Use colunas nome, email, setor.",
        ),
    );
  }

  const registros = linhas.map((l) => ({
    campanha_id: campanhaId,
    nome: l.nome,
    email: l.email,
    setor: l.setor,
    // token: NAO enviado — o DEFAULT do banco gera um por linha.
  }));

  const admin = criarClientAdmin();
  // ignoreDuplicates: e-mails que ja existem na campanha (unique campanha+email)
  // sao silenciosamente pulados. O .select() retorna apenas os inseridos.
  const { data, error } = await admin
    .from("destinatarios")
    .upsert(registros, {
      onConflict: "campanha_id,email",
      ignoreDuplicates: true,
    })
    .select("id");

  if (error) {
    redirect(`${voltar}?erro=` + encodeURIComponent(error.message));
  }

  const inseridos = data?.length ?? 0;
  const pulados = linhas.length - inseridos;

  revalidatePath(voltar);
  redirect(`${voltar}?ok=${inseridos}&dup=${pulados}`);
}
