"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClientServidor } from "@/lib/supabase/server";

// =============================================================================
// Autenticacao do painel (Supabase Auth).
//
// Fluxos:
//   - entrar / sair            (e-mail + senha)
//   - cadastrar -> verificar   (sign up + confirmacao por CODIGO de 6 digitos)
//   - recuperar -> redefinir   (reset de senha por CODIGO de 6 digitos)
//
// Sistema INTERNO: o auto-cadastro e travado ao dominio corporativo
// (DOMINIO_PERMITIDO). Sem isso, qualquer um que achasse a URL poderia criar
// conta e acessar o painel (que dispara e-mails e mostra quem caiu).
//
// Para o CODIGO (em vez de link), os templates de e-mail no Supabase devem usar
// {{ .Token }} em "Confirm signup" e "Reset password". Ver README (Fase 1).
// =============================================================================

function dominioPermitido(): string | null {
  const d = process.env.DOMINIO_PERMITIDO?.trim().toLowerCase();
  return d ? d : null;
}

function emailNoDominio(email: string): boolean {
  const d = dominioPermitido();
  if (!d) return true; // sem restricao configurada
  return email.toLowerCase().endsWith("@" + d);
}

// ---------------------------------------------------------------------------
// Entrar / sair
// ---------------------------------------------------------------------------

export async function entrar(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    redirect("/login?erro=" + encodeURIComponent("Informe e-mail e senha."));
  }

  const supabase = await criarClientServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    // Mensagem generica de proposito: nao revela se o e-mail existe.
    redirect("/login?erro=" + encodeURIComponent("E-mail ou senha inválidos."));
  }

  revalidatePath("/painel", "layout");
  redirect("/painel");
}

export async function sair(): Promise<void> {
  const supabase = await criarClientServidor();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Cadastro (sign up) -> verificacao por codigo
// ---------------------------------------------------------------------------

export async function cadastrar(formData: FormData): Promise<void> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const senha2 = String(formData.get("senha2") ?? "");

  const comEmail = email ? "&email=" + encodeURIComponent(email) : "";
  const erro = (m: string): never =>
    redirect("/cadastro?erro=" + encodeURIComponent(m) + comEmail);

  if (!email || !senha) erro("Preencha e-mail e senha.");
  if (!email.includes("@")) erro("Informe um e-mail válido.");
  if (!emailNoDominio(email)) {
    erro(`Use seu e-mail corporativo @${dominioPermitido()}.`);
  }
  if (senha.length < 8) erro("A senha deve ter ao menos 8 caracteres.");
  if (senha !== senha2) erro("As senhas não coincidem.");

  const supabase = await criarClientServidor();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });
  if (error) erro(error.message);

  redirect("/cadastro?etapa=verificar&email=" + encodeURIComponent(email));
}

export async function verificarCadastro(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") ?? "").trim();
  const voltar = "/cadastro?etapa=verificar&email=" + encodeURIComponent(email);

  if (!email || !codigo) {
    redirect(voltar + "&erro=" + encodeURIComponent("Informe o código recebido."));
  }

  const supabase = await criarClientServidor();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: codigo,
    type: "signup",
  });
  if (error) {
    redirect(voltar + "&erro=" + encodeURIComponent("Código inválido ou expirado."));
  }

  revalidatePath("/painel", "layout");
  redirect("/painel");
}

export async function reenviarCadastro(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const voltar = "/cadastro?etapa=verificar&email=" + encodeURIComponent(email);
  if (!email) redirect("/cadastro");

  const supabase = await criarClientServidor();
  await supabase.auth.resend({ type: "signup", email });
  redirect(voltar + "&sucesso=" + encodeURIComponent("Enviamos um novo código."));
}

// ---------------------------------------------------------------------------
// Recuperacao de senha -> redefinicao por codigo
// ---------------------------------------------------------------------------

export async function solicitarRecuperacao(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/recuperar?erro=" + encodeURIComponent("Informe um e-mail válido."));
  }

  const supabase = await criarClientServidor();
  // Dispara o e-mail de recuperacao. Com {{ .Token }} no template, vira codigo.
  await supabase.auth.resetPasswordForEmail(email);

  // Segue para a etapa de redefinir sem revelar se o e-mail existe.
  redirect(
    "/recuperar?etapa=redefinir&email=" +
      encodeURIComponent(email) +
      "&sucesso=" +
      encodeURIComponent("Se o e-mail existir, enviamos um código de 6 dígitos."),
  );
}

export async function redefinirSenha(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const senha2 = String(formData.get("senha2") ?? "");

  const voltar = "/recuperar?etapa=redefinir&email=" + encodeURIComponent(email);
  const erro = (m: string): never => redirect(voltar + "&erro=" + encodeURIComponent(m));

  if (!email || !codigo) erro("Informe o código recebido.");
  if (senha.length < 8) erro("A nova senha deve ter ao menos 8 caracteres.");
  if (senha !== senha2) erro("As senhas não coincidem.");

  const supabase = await criarClientServidor();

  // 1) Valida o codigo de recuperacao (cria a sessao).
  const { error: errOtp } = await supabase.auth.verifyOtp({
    email,
    token: codigo,
    type: "recovery",
  });
  if (errOtp) erro("Código inválido ou expirado.");

  // 2) Define a nova senha para a sessao recem-criada.
  const { error: errUpd } = await supabase.auth.updateUser({ password: senha });
  if (errUpd) erro(errUpd.message);

  revalidatePath("/painel", "layout");
  redirect("/painel");
}
