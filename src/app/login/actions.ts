"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClientServidor } from "@/lib/supabase/server";

// =============================================================================
// Autenticacao do painel (Supabase Auth).
//
// Sistema INTERNO, sem auto-cadastro: as contas da equipe de TI sao
// provisionadas (service role / dashboard). Fluxos aqui:
//   - entrar / sair            (e-mail + senha)
//   - recuperar -> redefinir   (reset de senha por CODIGO de 6 digitos)
//
// Para o CODIGO de recuperacao (em vez de link), o template "Reset password"
// no Supabase deve usar {{ .Token }}. Ver README (Fase 1).
// =============================================================================

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
