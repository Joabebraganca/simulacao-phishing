import Link from "next/link";
import { cores, campo, botaoSecundario } from "@/lib/ui";
import { criarClientServidor } from "@/lib/supabase/server";
import {
  agregarMetricas,
  pct,
  type DestinatarioMin,
  type EventoMin,
} from "@/lib/painel/metricas";

// Dashboard de taxas por setor e por pessoa (Fase 5). Leitura com o papel
// authenticated (RLS); a agregacao roda em memoria. Filtro opcional por campanha
// via ?campanha=<id>.
export const metadata = { title: "Dashboard — Painel" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ campanha?: string }>;
}) {
  const { campanha } = await searchParams;
  const supabase = await criarClientServidor();

  const [{ data: campanhas }, { data: dests }, { data: eventos }] = await Promise.all([
    supabase.from("campanhas").select("id, nome").order("criada_em", { ascending: false }),
    supabase.from("destinatarios").select("id, campanha_id, setor"),
    supabase.from("eventos").select("destinatario_id, tipo"),
  ]);

  const listaCampanhas = (campanhas ?? []) as { id: string; nome: string }[];
  let destinatarios = (dests ?? []) as DestinatarioMin[];
  const campanhaValida = campanha && listaCampanhas.some((c) => c.id === campanha);
  if (campanhaValida) {
    destinatarios = destinatarios.filter((d) => d.campanha_id === campanha);
  }

  const { geral, porSetor } = agregarMetricas(destinatarios, (eventos ?? []) as EventoMin[]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: cores.texto, margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: cores.suave, margin: "4px 0 0" }}>
            Taxas de comportamento por etapa e por setor. Contagem de pessoas
            distintas — nunca credenciais.
          </p>
        </div>

        {/* Filtro por campanha (GET simples). */}
        <form method="get" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            name="campanha"
            defaultValue={campanhaValida ? campanha : ""}
            style={{ ...campo, width: 220 }}
          >
            <option value="">Todas as campanhas</option>
            {listaCampanhas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <button type="submit" style={botaoSecundario}>
            Aplicar
          </button>
        </form>
      </div>

      {destinatarios.length === 0 ? (
        <div
          style={{
            background: cores.card,
            border: `1px dashed ${cores.borda}`,
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            color: cores.suave,
          }}
        >
          <p style={{ margin: 0, fontSize: 15 }}>
            Sem destinatários {campanhaValida ? "nesta campanha" : "ainda"}. As taxas
            aparecem aqui assim que houver envio e eventos.
          </p>
          <Link
            href="/painel"
            style={{ color: cores.texto, fontSize: 14, marginTop: 12, display: "inline-block" }}
          >
            → Ir para as campanhas
          </Link>
        </div>
      ) : (
        <>
          {/* Funil geral ----------------------------------------------------- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <Tile rotulo="Destinatários" valor={geral.total} />
            <Tile rotulo="Enviados" valor={geral.enviados} taxa={pct(geral.enviados, geral.total)} sobre="do total" />
            <Tile rotulo="Abriram" valor={geral.abriram} taxa={pct(geral.abriram, geral.enviados)} sobre="dos enviados" />
            <Tile rotulo="Clicaram" valor={geral.clicaram} taxa={pct(geral.clicaram, geral.enviados)} sobre="dos enviados" />
            <Tile
              rotulo="Submeteram"
              valor={geral.submeteram}
              taxa={pct(geral.submeteram, geral.enviados)}
              sobre="dos enviados"
              risco
            />
            <Tile rotulo="Treinaram" valor={geral.treinaram} taxa={pct(geral.treinaram, geral.clicaram)} sobre="dos que clicaram" />
          </div>

          {/* Por setor ------------------------------------------------------- */}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: cores.texto, margin: "0 0 12px" }}>
            Por setor
          </h2>
          <div
            style={{
              background: cores.card,
              border: `1px solid ${cores.borda}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 640 }}>
                <thead>
                  <tr style={{ background: cores.suaveFundo }}>
                    <th style={th}>Setor</th>
                    <th style={thNum}>Pessoas</th>
                    <th style={thNum}>Enviados</th>
                    <th style={thNum}>Abriram</th>
                    <th style={thNum}>Clicaram</th>
                    <th style={thNum}>Submeteram</th>
                    <th style={thNum}>Treinaram</th>
                  </tr>
                </thead>
                <tbody>
                  {porSetor.map((s) => (
                    <tr key={s.setor} style={{ borderTop: `1px solid ${cores.borda}` }}>
                      <td style={{ ...td, fontWeight: 600 }}>{s.setor}</td>
                      <td style={tdNum}>{s.total}</td>
                      <td style={tdNum}>{celula(s.enviados, s.total)}</td>
                      <td style={tdNum}>{celula(s.abriram, s.enviados)}</td>
                      <td style={tdNum}>{celula(s.clicaram, s.enviados)}</td>
                      <td style={{ ...tdNum, color: cores.vermelho, fontWeight: 600 }}>
                        {celula(s.submeteram, s.enviados)}
                      </td>
                      <td style={tdNum}>{celula(s.treinaram, s.clicaram)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ fontSize: 12, color: cores.suave, marginTop: 12, lineHeight: 1.5 }}>
            “Submeteram” é a métrica de risco: quem chegou a enviar o formulário da
            landing (o conteúdo é descartado — só o evento conta). “Treinaram” é
            relativo a quem clicou.
          </p>
        </>
      )}
    </div>
  );
}

// --- pequenos helpers de apresentacao ---------------------------------------

function Tile({
  rotulo,
  valor,
  taxa,
  sobre,
  risco,
}: {
  rotulo: string;
  valor: number;
  taxa?: number;
  sobre?: string;
  risco?: boolean;
}) {
  return (
    <div
      style={{
        background: cores.card,
        border: `1px solid ${risco ? "#E9C9C9" : cores.borda}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: cores.suave, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {rotulo}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: risco ? cores.vermelho : cores.texto, marginTop: 4 }}>
        {valor}
        {taxa !== undefined ? (
          <span style={{ fontSize: 15, fontWeight: 600, color: cores.suave, marginLeft: 6 }}>
            {taxa}%
          </span>
        ) : null}
      </div>
      {sobre ? (
        <div style={{ fontSize: 11, color: cores.suave, marginTop: 2 }}>{sobre}</div>
      ) : null}
    </div>
  );
}

function celula(parte: number, base: number): string {
  return `${parte} (${pct(parte, base)}%)`;
}

const th = {
  textAlign: "left" as const,
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 600,
  color: cores.suave,
  textTransform: "uppercase" as const,
  letterSpacing: 0.3,
};
const thNum = { ...th, textAlign: "right" as const };
const td = { padding: "12px 16px", verticalAlign: "middle" as const };
const tdNum = { ...td, textAlign: "right" as const, color: cores.texto };
