import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cores, marca } from "@/lib/ui";

// Home publica da plataforma. Apresenta a ferramenta (interna, autorizada),
// reforca o principio de privacidade e explica o fluxo — sem expor nada sensivel.
export const metadata = {
  title: "Plataforma de Conscientização — EON",
  description:
    "Ferramenta interna de simulação de phishing para conscientização. Mede comportamento, nunca credenciais.",
};

const MAX = 1040;

export default function Home() {
  return (
    <div style={{ background: cores.fundo, color: cores.texto, minHeight: "100vh" }}>
      {/* Barra de topo ------------------------------------------------------- */}
      <header
        style={{
          borderBottom: `1px solid ${cores.borda}`,
          background: "rgba(238,234,227,0.85)",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: MAX,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ ...marca, fontSize: 24 }}>EON</span>
            <span style={{ fontSize: 14, color: cores.suave }}>Conscientização</span>
          </div>
          <Link
            href="/painel"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#FFFFFF",
              background: cores.preto,
              padding: "9px 18px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Entrar no painel
          </Link>
        </div>
      </header>

      {/* Hero ---------------------------------------------------------------- */}
      <section
        style={{
          maxWidth: MAX,
          margin: "0 auto",
          padding: "72px 24px 56px",
          textAlign: "center",
        }}
      >
        <Selo>
          <PontoVerde /> Segurança · Simulação interna autorizada
        </Selo>

        <h1
          style={{
            ...marca,
            fontSize: "clamp(34px, 6vw, 56px)",
            lineHeight: 1.08,
            letterSpacing: -0.5,
            margin: "24px auto 0",
            maxWidth: 760,
          }}
        >
          Simulação de phishing que{" "}
          <span style={{ fontStyle: "italic" }}>ensina</span>, não pune.
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2.2vw, 19px)",
            lineHeight: 1.6,
            color: cores.suave,
            maxWidth: 620,
            margin: "22px auto 0",
          }}
        >
          Mede quantas pessoas caem, treina na hora e reduz o risco ao longo do tempo.
          Começa com um piloto por setor — e sempre medindo{" "}
          <strong style={{ color: cores.texto }}>comportamento, nunca credenciais</strong>.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 32,
          }}
        >
          <Link href="/painel" style={botaoPrimario}>
            Entrar no painel →
          </Link>
          <Link href="#como-funciona" style={botaoVazado}>
            Ver como funciona
          </Link>
        </div>

        <p
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: cores.verde,
            background: "#E4F0E9",
            border: "1px solid #CDE6D8",
            padding: "7px 14px",
            borderRadius: 999,
            marginTop: 28,
          }}
        >
          <IconeEscudo /> Nenhuma senha é lida, trafegada ou armazenada.
        </p>
      </section>

      {/* Principio inegociavel ---------------------------------------------- */}
      <section style={{ maxWidth: MAX, margin: "0 auto", padding: "8px 24px 16px" }}>
        <div
          style={{
            background: cores.card,
            border: `1px solid ${cores.borda}`,
            borderRadius: 20,
            padding: "clamp(24px, 4vw, 40px)",
            display: "grid",
            gap: 28,
            gridTemplateColumns: "minmax(0, 1fr)",
          }}
        >
          <div>
            <TituloSecao sobrescrito="Princípio inegociável">
              Medimos comportamento, não credenciais
            </TituloSecao>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: cores.suave, margin: "12px 0 0", maxWidth: 680 }}>
              Um banco com as senhas reais dos colaboradores seria um passivo grave de
              LGPD e de segurança — e não agrega métrica nenhuma. O token único por
              pessoa já identifica quem caiu. Por isso o formulário é descartado na hora.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <Pilar titulo="Nada de senha" texto="Login e conteúdo digitado são descartados; só o evento “submeteu” é registrado." />
            <Pilar titulo="Identificação por token" texto="Cada destinatário tem um token opaco que diz quem caiu, sem ler o formulário." />
            <Pilar titulo="Landings próprias" texto="Recriação de páginas nossas (intranet, suporte) — nunca clone de terceiro." />
          </div>
        </div>
      </section>

      {/* Como funciona ------------------------------------------------------- */}
      <section
        id="como-funciona"
        style={{ maxWidth: MAX, margin: "0 auto", padding: "48px 24px 16px", scrollMarginTop: 80 }}
      >
        <TituloSecao sobrescrito="Como funciona" centralizado>
          Do envio ao treinamento, em cinco etapas
        </TituloSecao>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(188px, 1fr))",
            marginTop: 28,
          }}
        >
          <Passo n={1} titulo="Envio" texto="E-mail com pixel e link, ambos carregando o token da pessoa." />
          <Passo n={2} titulo="Abertura" texto="O pixel carrega e registra quem abriu a mensagem." />
          <Passo n={3} titulo="Clique" texto="O link registra o clique e leva à landing recriada por nós." />
          <Passo n={4} titulo="Submissão" texto="Registra o evento e descarta o que foi digitado na hora." />
          <Passo n={5} titulo="Treinamento" texto="Conscientização imediata, acolhedora e sem culpabilizar." />
        </div>
      </section>

      {/* Recursos ------------------------------------------------------------ */}
      <section style={{ maxWidth: MAX, margin: "0 auto", padding: "48px 24px 24px" }}>
        <TituloSecao sobrescrito="Recursos" centralizado>
          Feito para rodar um piloto e expandir
        </TituloSecao>
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            marginTop: 28,
          }}
        >
          <Recurso icone={<IconeAlvo />} titulo="Piloto por setor" texto="Comece pequeno num setor, meça, ajuste e então expanda para o grupo." />
          <Recurso icone={<IconeGrafico />} titulo="Métricas por setor e pessoa" texto="Funil de abertura, clique e submissão — com a taxa de risco em destaque." />
          <Recurso icone={<IconeEscudo />} titulo="Privacidade by design" texto="Conforme à LGPD: nenhuma credencial em nenhum ponto do sistema." />
          <Recurso icone={<IconeEnvelope />} titulo="Envio flexível" texto="Dispare por SMTP próprio ou via n8n, com token por destinatário." />
        </div>
      </section>

      {/* CTA final ----------------------------------------------------------- */}
      <section style={{ maxWidth: MAX, margin: "0 auto", padding: "24px 24px 64px" }}>
        <div
          style={{
            background: cores.preto,
            borderRadius: 20,
            padding: "clamp(28px, 5vw, 48px)",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          <h2 style={{ ...marca, color: "#FFFFFF", fontSize: "clamp(24px, 4vw, 34px)", margin: 0 }}>
            Pronto para a próxima campanha?
          </h2>
          <p style={{ color: "#C9C6C0", fontSize: 16, lineHeight: 1.6, margin: "12px auto 24px", maxWidth: 520 }}>
            Acesse o painel para criar campanhas, importar destinatários e acompanhar
            as taxas em tempo real.
          </p>
          <Link
            href="/painel"
            style={{
              ...botaoPrimario,
              background: "#FFFFFF",
              color: cores.preto,
            }}
          >
            Entrar no painel →
          </Link>
        </div>
      </section>

      {/* Rodape -------------------------------------------------------------- */}
      <footer style={{ borderTop: `1px solid ${cores.borda}` }}>
        <div
          style={{
            maxWidth: MAX,
            margin: "0 auto",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            fontSize: 13,
            color: cores.suave,
          }}
        >
          <span>© 2026 EON · Tecnologia e Inovação</span>
          <span>Ferramenta interna · Autorizada pela diretoria</span>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// Componentes de apresentacao (locais a esta pagina)
// =============================================================================

const botaoPrimario: CSSProperties = {
  display: "inline-block",
  padding: "13px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: "#FFFFFF",
  background: cores.preto,
  borderRadius: 12,
  textDecoration: "none",
};

const botaoVazado: CSSProperties = {
  display: "inline-block",
  padding: "13px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: cores.texto,
  background: "transparent",
  border: `1px solid ${cores.texto}`,
  borderRadius: 12,
  textDecoration: "none",
};

function Selo({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: cores.texto,
        background: cores.card,
        border: `1px solid ${cores.borda}`,
        padding: "7px 14px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

function TituloSecao({
  sobrescrito,
  children,
  centralizado,
}: {
  sobrescrito: string;
  children: ReactNode;
  centralizado?: boolean;
}) {
  return (
    <div style={{ textAlign: centralizado ? "center" : "left" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: cores.verde,
        }}
      >
        {sobrescrito}
      </div>
      <h2
        style={{
          ...marca,
          fontSize: "clamp(24px, 3.4vw, 32px)",
          margin: "8px 0 0",
          lineHeight: 1.2,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function Pilar({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div
      style={{
        background: cores.suaveFundo,
        border: `1px solid ${cores.borda}`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700 }}>{titulo}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: cores.suave, margin: "6px 0 0" }}>
        {texto}
      </p>
    </div>
  );
}

function Passo({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <div
      style={{
        background: cores.card,
        border: `1px solid ${cores.borda}`,
        borderRadius: 16,
        padding: "20px 18px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: cores.preto,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>{titulo}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: cores.suave, margin: "6px 0 0" }}>
        {texto}
      </p>
    </div>
  );
}

function Recurso({ icone, titulo, texto }: { icone: ReactNode; titulo: string; texto: string }) {
  return (
    <div
      style={{
        background: cores.card,
        border: `1px solid ${cores.borda}`,
        borderRadius: 16,
        padding: "22px 20px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: cores.suaveFundo,
          border: `1px solid ${cores.borda}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: cores.texto,
        }}
      >
        {icone}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>{titulo}</div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: cores.suave, margin: "6px 0 0" }}>
        {texto}
      </p>
    </div>
  );
}

function PontoVerde() {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: cores.verde,
        display: "inline-block",
      }}
    />
  );
}

// --- Icones (SVG inline, stroke currentColor) -------------------------------

function IconeEscudo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconeAlvo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconeGrafico() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="12" width="3" height="5" />
      <rect x="12" y="8" width="3" height="9" />
      <rect x="17" y="5" width="3" height="12" />
    </svg>
  );
}

function IconeEnvelope() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
