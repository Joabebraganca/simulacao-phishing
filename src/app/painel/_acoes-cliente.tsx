"use client";

import { useState } from "react";
import { cores, botao, botaoSecundario } from "@/lib/ui";
import { excluirCampanha } from "@/app/painel/actions";
import { dispararCampanha } from "@/app/painel/envio";

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

// Dispara a campanha para os destinatarios pendentes, com confirmacao — envia
// e-mails de verdade, entao pede uma confirmacao explicita antes.
export function BotaoDisparar({
  campanhaId,
  pendentes,
}: {
  campanhaId: string;
  pendentes: number;
}) {
  const semPendentes = pendentes === 0;
  return (
    <form
      action={dispararCampanha}
      onSubmit={(e) => {
        if (
          !confirm(
            `Enviar o e-mail da simulação para ${pendentes} destinatário(s) pendente(s)? Esta ação dispara e-mails reais.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="campanha_id" value={campanhaId} />
      <button
        type="submit"
        disabled={semPendentes}
        style={{
          ...botao,
          opacity: semPendentes ? 0.5 : 1,
          cursor: semPendentes ? "not-allowed" : "pointer",
        }}
      >
        {semPendentes
          ? "Nada pendente para enviar"
          : `Disparar para ${pendentes} pendente(s)`}
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
