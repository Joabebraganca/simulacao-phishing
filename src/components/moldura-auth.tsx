import type { ReactNode } from "react";
import Link from "next/link";
import { cores, marca } from "@/lib/ui";

// Moldura compartilhada das telas de autenticacao (login, cadastro, recuperar).
// Cartao centralizado, cabecalho com a marca EON, alertas de erro/sucesso e um
// rodape opcional para os links de navegacao entre as telas.
export function MolduraAuth({
  subtitulo,
  erro,
  sucesso,
  children,
  rodape,
}: {
  subtitulo: string;
  erro?: string;
  sucesso?: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
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
          maxWidth: 420,
          background: cores.card,
          borderRadius: 16,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          padding: "40px 36px 32px",
          boxSizing: "border-box",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ ...marca, fontSize: 40 }}>EON</div>
          </Link>
          <div style={{ fontSize: 15, color: cores.suave, marginTop: 8 }}>{subtitulo}</div>
        </header>

        {erro ? <Alerta tom="erro" texto={erro} /> : null}
        {sucesso ? <Alerta tom="ok" texto={sucesso} /> : null}

        {children}

        {rodape ? (
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: cores.suave }}>
            {rodape}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Alerta({ tom, texto }: { tom: "erro" | "ok"; texto: string }) {
  const c =
    tom === "ok"
      ? { bg: "#DBEFE2", bd: "#BFE3CC", fg: "#1F5C3A" }
      : { bg: "#FBEBEB", bd: "#E9C9C9", fg: cores.vermelho };
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.bd}`,
        color: c.fg,
        fontSize: 13,
        padding: "10px 12px",
        borderRadius: 10,
        marginBottom: 16,
        lineHeight: 1.45,
      }}
    >
      {texto}
    </div>
  );
}

// Link de navegacao entre telas de auth, com o mesmo tom em todas.
export function LinkAuth({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ color: cores.texto, fontWeight: 600, textDecoration: "none" }}>
      {children}
    </Link>
  );
}
