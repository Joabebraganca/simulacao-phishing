import type { CSSProperties } from "react";

// Landing de "Suporte" (recriacao de pagina de propriedade NOSSA).
// Sempre renderizada no ato para ler o ?t= sem cache.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suporte — EON",
};

// -----------------------------------------------------------------------------
// PRIVACIDADE POR DESIGN: todos os campos abaixo sao COSMETICOS e propositalmente
// NAO tem atributo `name`. Assim o navegador nao envia nada deles no POST — o
// unico campo transmitido e o <input hidden name="token">. Nao ha, em lugar
// nenhum, captura de senha/login/conteudo. Quem cai e identificado pelo token.
// -----------------------------------------------------------------------------

const cor = {
  fundo: "#EEEAE3",
  card: "#FFFFFF",
  texto: "#1A1A1A",
  suave: "#6B6B6B",
  borda: "#E2DED7",
  campo: "#FBFAF8",
  preto: "#111111",
};

const rotulo: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: cor.texto,
  marginBottom: 6,
};

const campo: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  fontSize: 14,
  color: cor.texto,
  background: cor.campo,
  border: `1px solid ${cor.borda}`,
  borderRadius: 10,
  outline: "none",
  fontFamily: "inherit",
};

export default function SuportePage({
  searchParams,
}: {
  searchParams: { t?: string };
}) {
  // O token vem do link /c/[token] -> /suporte?t=TOKEN. So ele viaja no POST.
  const token = searchParams?.t ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: cor.fundo,
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
          maxWidth: 560,
          background: cor.card,
          borderRadius: 16, // rounded-2xl
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)", // shadow-sm
          padding: "40px 40px 32px",
          boxSizing: "border-box",
        }}
      >
        {/* Cabecalho: logo serifado "EON" + "Suporte" + subtitulo */}
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: 1,
              color: cor.texto,
              lineHeight: 1,
            }}
          >
            EON
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: cor.texto,
              marginTop: 8,
            }}
          >
            Suporte
          </div>
          <p
            style={{
              fontSize: 14,
              color: cor.suave,
              margin: "10px auto 0",
              maxWidth: 400,
              lineHeight: 1.5,
            }}
          >
            Abra seu chamado para o time de TI, assim que possível entraremos em
            contato!
          </p>
        </header>

        <form method="POST" action="/api/submeter" style={{ display: "grid", gap: 16 }}>
          {/* UNICO campo que viaja: o token opaco (identifica o destinatario). */}
          <input type="hidden" name="token" value={token} />

          <div>
            <label style={rotulo}>Nome completo</label>
            <input type="text" style={campo} placeholder="Seu nome" autoComplete="off" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={rotulo}>Setor/Departamento</label>
              <input type="text" style={campo} placeholder="Ex.: Financeiro" autoComplete="off" />
            </div>
            <div>
              <label style={rotulo}>Gestor responsável</label>
              <input type="text" style={campo} placeholder="Nome do gestor" autoComplete="off" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={rotulo}>Tipo de problema</label>
              <select style={campo} defaultValue="">
                <option value="" disabled>
                  Selecione…
                </option>
                <option>Acesso e senha</option>
                <option>E-mail / Outlook</option>
                <option>Rede / Internet</option>
                <option>Equipamento / Hardware</option>
                <option>Sistema interno</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label style={rotulo}>Prioridade</label>
              <select style={campo} defaultValue="">
                <option value="" disabled>
                  Selecione…
                </option>
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label style={rotulo}>Assunto</label>
            <input type="text" style={campo} placeholder="Resumo do chamado" autoComplete="off" />
          </div>

          <div>
            <label style={rotulo}>Descrição detalhada</label>
            <textarea
              rows={4}
              style={{ ...campo, resize: "vertical", minHeight: 96 }}
              placeholder="Descreva o que está acontecendo…"
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px 16px",
              fontSize: 15,
              fontWeight: 600,
              color: "#FFFFFF",
              background: cor.preto,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              marginTop: 4,
              fontFamily: "inherit",
            }}
          >
            Abrir chamado
          </button>
        </form>

        <footer
          style={{
            textAlign: "center",
            fontSize: 12,
            color: cor.suave,
            marginTop: 28,
          }}
        >
          © 2026 EON · Tecnologia e Inovação
        </footer>
      </div>
    </main>
  );
}
