import "server-only";
import { redirect } from "next/navigation";
import { criarClientServidor } from "@/lib/supabase/server";

// =============================================================================
// Guarda de sessao do painel.
//
// `exigirUsuario()` garante que ha um usuario autenticado (equipe de TI).
// Se nao houver, redireciona para /login. Use no inicio de todas as paginas
// do painel e de TODA server action que escreva dados — a service role ignora
// o RLS, entao a barreira de "so autenticado escreve" e feita aqui, no servidor.
// =============================================================================

export async function exigirUsuario() {
  const supabase = await criarClientServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  return user;
}
