"use client";

import { useState } from "react";
import { cores, botaoSecundario } from "@/lib/ui";
import { excluirCampanha } from "@/app/painel/actions";

// Botao de exclusao com confirmacao no navegador. Usa a server action
// `excluirCampanha`; o confirm() apenas evita o clique acidental.
export function BotaoExcluir({ id }: { id: string }) {
  return (
    <form
      action={excluirCampanha}
      onSubmit={(e) => {
        if (
          !confirm(
            "Excluir esta campanha e TODOS os seus destinatários e eventos? Esta ação não pode ser desfeita.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        style={{
          ...botaoSecundario,
          color: cores.vermelho,
          borderColor: "#E9C9C9",
          padding: "8px 14px",
          fontSize: 13,
        }}
      >
        Excluir campanha
      </button>
    </form>
  );
}

// Copia um texto (o link de tracking) para a area de transferencia.
export function BotaoCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        } catch {
          // Ambiente sem clipboard (ex.: http): ignora silenciosamente.
        }
      }}
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: copiado ? cores.verde : cores.suave,
        background: "transparent",
        border: `1px solid ${cores.borda}`,
        borderRadius: 8,
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {copiado ? "Copiado!" : "Copiar link"}
    </button>
  );
}
