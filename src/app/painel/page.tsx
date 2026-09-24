import Link from "next/link";
import { cores, botao } from "@/lib/ui";
import { criarClientServidor } from "@/lib/supabase/server";
import type { Campanha } from "@/lib/tipos";
import { BadgeStatus } from "./_componentes";

// Lista de campanhas. Leitura pelo client de servidor (RLS: papel authenticated
// tem SELECT). O layout do painel ja garantiu o usuario logado.
export const metadata = { title: "Campanhas — Painel" };

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function PainelHome() {
  const supabase = await criarClientServidor();
  const { data: campanhas } = await supabase
    .from("campanhas")
    .select("id, nome, setor_alvo, status, criada_em")
    .order("criada_em", { ascending: false });

  const lista = (campanhas ?? []) as Pick<
    Campanha,
    "id" | "nome" | "setor_alvo" | "status" | "criada_em"
  >[];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: cores.texto, margin: 0 }}>
            Campanhas
          </h1>
          <p style={{ fontSize: 14, color: cores.suave, margin: "4px 0 0" }}>
            Simulações de phishing por setor. O sistema mede comportamento, nunca
            credenciais.
          </p>
        </div>
        <Link href="/painel/campanhas/nova" style={botao}>
          Nova campanha
        </Link>
      </div>

      {lista.length === 0 ? (
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
          <p style={{ margin: "0 0 16px", fontSize: 15 }}>
            Nenhuma campanha ainda. Comece criando a primeira do piloto.
          </p>
          <Link href="/painel/campanhas/nova" style={botao}>
            Criar campanha
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: cores.card,
            border: `1px solid ${cores.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: cores.suaveFundo }}>
                <th style={thEstilo}>Campanha</th>
                <th style={thEstilo}>Setor-alvo</th>
                <th style={thEstilo}>Status</th>
                <th style={thEstilo}>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} style={{ borderTop: `1px solid ${cores.borda}` }}>
                  <td style={tdEstilo}>
                    <Link
                      href={`/painel/campanhas/${c.id}`}
                      style={{ color: cores.texto, fontWeight: 600, textDecoration: "none" }}
                    >
                      {c.nome}
                    </Link>
                  </td>
                  <td style={{ ...tdEstilo, color: cores.suave }}>{c.setor_alvo}</td>
                  <td style={tdEstilo}>
                    <BadgeStatus status={c.status} />
                  </td>
                  <td style={{ ...tdEstilo, color: cores.suave }}>
                    {formatarData(c.criada_em)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thEstilo = {
  textAlign: "left" as const,
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 600,
  color: cores.suave,
  textTransform: "uppercase" as const,
  letterSpacing: 0.3,
};

const tdEstilo = { padding: "14px 16px", verticalAlign: "middle" as const };
