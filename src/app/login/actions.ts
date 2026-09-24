"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClientServidor } from "@/lib/supabase/server";

// =============================================================================
// Autenticacao do painel (Supabase Auth, e-mail + senha).
//
// Os usuarios (equipe de TI) sao provisionados no painel do Supabase
// (Authentication > Users). Nao ha auto-cadastro publico: este e um sistema
// interno. Ver README, secao "Fase 1".
// =============================================================================

export async function entrar(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    redirect("/login?erro=" + encodeURIComponent("Informe e-mail e senha."));
  }

  const supabase = await criarClientServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

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
