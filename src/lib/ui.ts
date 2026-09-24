import type { CSSProperties } from "react";

// =============================================================================
// Vocabulario visual do painel — mesma paleta "off-white + serifa" das landings
// (suporte/treinamento), para o painel interno ter a mesma cara do produto.
// Sao apenas constantes/objetos de estilo: podem ser importados por Server
// Components sem "use client".
// =============================================================================

export const cores = {
  fundo: "#EEEAE3",
  card: "#FFFFFF",
  texto: "#1A1A1A",
  suave: "#6B6B6B",
  borda: "#E2DED7",
  campo: "#FBFAF8",
  preto: "#111111",
  verde: "#1F7A4D",
  vermelho: "#B23A3A",
  suaveFundo: "#F4F1EB",
};

export const rotulo: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: cores.texto,
  marginBottom: 6,
};

export const campo: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  fontSize: 14,
  color: cores.texto,
  background: cores.campo,
  border: `1px solid ${cores.borda}`,
  borderRadius: 10,
  outline: "none",
  fontFamily: "inherit",
};

export const botao: CSSProperties = {
  display: "inline-block",
  padding: "11px 18px",
  fontSize: 14,
  fontWeight: 600,
  color: "#FFFFFF",
  background: cores.preto,
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "inherit",
  textDecoration: "none",
};

export const botaoSecundario: CSSProperties = {
  ...botao,
  color: cores.texto,
  background: cores.card,
  border: `1px solid ${cores.borda}`,
};

export const cartao: CSSProperties = {
  background: cores.card,
  border: `1px solid ${cores.borda}`,
  borderRadius: 16,
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  padding: 24,
  boxSizing: "border-box",
};

// Serifa da marca "EON", reutilizada no cabecalho do painel.
export const marca: CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontWeight: 700,
  color: cores.texto,
  lineHeight: 1,
};
