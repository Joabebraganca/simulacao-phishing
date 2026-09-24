import type { ReactNode } from "react";
import Link from "next/link";
import { cores, marca, botaoSecundario } from "@/lib/ui";
import { exigirUsuario } from "@/lib/painel/sessao";
import { sair } from "@/app/login/actions";

// Shell do painel. Server Component: `exigirUsuario()` protege TODAS as paginas
// filhas no servidor (alem do middleware). Mostra o usuario logado e o logout.
export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await exigirUsuario();

  return (
    <div style={{ minHeight: "100vh", background: cores.fundo }}>
      <header
        style={{
          background: cores.card,
          borderBottom: `1px solid ${cores.borda}`,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link
            href="/painel"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <span style={{ ...marca, fontSize: 24 }}>EON</span>
            <span style={{ fontSize: 14, color: cores.suave }}>
              Conscientização
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 13, color: cores.suave }}>
              {usuario.email}
            </span>
            <form action={sair}>
              <button
                type="submit"
                style={{ ...botaoSecundario, padding: "7px 14px", fontSize: 13 }}
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
