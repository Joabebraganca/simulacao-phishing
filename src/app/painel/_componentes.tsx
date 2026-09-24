import type { CSSProperties } from "react";
import { cores } from "@/lib/ui";
import type { StatusCampanha } from "@/lib/tipos";

// Pequenos componentes visuais compartilhados pelas paginas do painel.

const CORES_STATUS: Record<StatusCampanha, { fg: string; bg: string; texto: string }> = {
  rascunho: { fg: "#6B6B6B", bg: "#EFEDE8", texto: "Rascunho" },
  agendada: { fg: "#7A5B00", bg: "#FBF2D9", texto: "Agendada" },
  em_andamento: { fg: "#1F5C3A", bg: "#DBEFE2", texto: "Em andamento" },
  concluida: { fg: "#3A4B7A", bg: "#DEE4F5", texto: "Concluída" },
  cancelada: { fg: "#8A8A8A", bg: "#ECECEC", texto: "Cancelada" },
};

export function BadgeStatus({ status }: { status: StatusCampanha }) {
  const c = CORES_STATUS[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        color: c.fg,
        background: c.bg,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {c.texto}
    </span>
  );
}

// Marcador de etapa atingida por um destinatario (abriu/clicou/submeteu...).
export function Etapa({ ativa, texto }: { ativa: boolean; texto: string }) {
  const estilo: CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 6,
    color: ativa ? cores.verde : "#B9B4AC",
    background: ativa ? "#DBEFE2" : "transparent",
    border: `1px solid ${ativa ? "#BFE3CC" : cores.borda}`,
  };
  return <span style={estilo}>{texto}</span>;
}
