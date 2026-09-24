import { cores, rotulo, campo, botao, marca } from "@/lib/ui";
import { entrar } from "./actions";

// Login do painel interno. Server Component: renderiza o form e uma eventual
// mensagem de erro vinda de ?erro= (setada pela server action `entrar`).
export const metadata = {
  title: "Entrar — Painel de Conscientização",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: cores.fundo,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: cores.card,
          borderRadius: 16,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          padding: "40px 36px 32px",
          boxSizing: "border-box",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ ...marca, fontSize: 40 }}>EON</div>
          <div
            style={{
              fontSize: 15,
              color: cores.suave,
              marginTop: 8,
            }}
          >
            Painel de Conscientização
          </div>
        </header>

        {erro ? (
          <div
            style={{
              background: "#FBEBEB",
              border: `1px solid #E9C9C9`,
              color: cores.vermelho,
              fontSize: 13,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {erro}
          </div>
        ) : null}

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

        <p
          style={{
            fontSize: 12,
            color: cores.suave,
            textAlign: "center",
            lineHeight: 1.5,
            marginTop: 20,
          }}
        >
          Acesso restrito à equipe de TI. Usuários são provisionados no Supabase.
        </p>
      </div>
    </main>
  );
}
