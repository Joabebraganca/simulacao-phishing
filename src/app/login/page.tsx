import { rotulo, campo, botao } from "@/lib/ui";
import { MolduraAuth, LinkAuth } from "@/components/moldura-auth";
import { entrar } from "./actions";

export const metadata = { title: "Entrar — Painel de Conscientização" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { erro, sucesso } = await searchParams;

  return (
    <MolduraAuth
      subtitulo="Painel de Conscientização"
      erro={erro}
      sucesso={sucesso}
      rodape={<LinkAuth href="/recuperar">Esqueci minha senha</LinkAuth>}
    >
      <form action={entrar} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={rotulo} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            style={campo}
            placeholder="voce@eonbr.com"
          />
        </div>
        <div>
          <label style={rotulo} htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            style={campo}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" style={{ ...botao, width: "100%", marginTop: 4 }}>
          Entrar
        </button>
      </form>
    </MolduraAuth>
  );
}
