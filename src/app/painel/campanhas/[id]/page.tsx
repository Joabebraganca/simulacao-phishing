import Link from "next/link";
import { notFound } from "next/navigation";
import { cores, rotulo, campo, botao, botaoSecundario, cartao } from "@/lib/ui";
import { criarClientServidor } from "@/lib/supabase/server";
import type { Campanha, Destinatario, TipoEvento } from "@/lib/tipos";
import { importarDestinatarios } from "@/app/painel/actions";
import { enviarTeste } from "@/app/painel/envio";
import { nomeTransporte } from "@/lib/email/transporte";
import { BadgeStatus, Etapa } from "@/app/painel/_componentes";
import { BotaoExcluir, BotaoCopiar, BotaoDisparar } from "@/app/painel/_acoes-cliente";

export const metadata = { title: "Campanha — Painel" };

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export default async function CampanhaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    ok?: string;
    dup?: string;
    erro?: string;
    enviados?: string;
    falhas?: string;
    teste?: string;
  }>;
}) {
  const { id } = await params;
  const { ok, dup, erro, enviados, falhas, teste } = await searchParams;

  const supabase = await criarClientServidor();

  const { data: campanha } = await supabase
    .from("campanhas")
    .select("*")
    .eq("id", id)
    .maybeSingle<Campanha>();

  if (!campanha) notFound();

  const { data: destinatariosData } = await supabase
    .from("destinatarios")
    .select("id, nome, email, setor, token, criado_em")
    .eq("campanha_id", id)
    .order("criado_em", { ascending: true });

  const destinatarios = (destinatariosData ?? []) as Destinatario[];

  // Eventos de todos os destinatarios desta campanha, para marcar as etapas.
  const etapasPorDest = new Map<string, Set<TipoEvento>>();
  if (destinatarios.length > 0) {
    const ids = destinatarios.map((d) => d.id);
    const { data: eventos } = await supabase
      .from("eventos")
      .select("destinatario_id, tipo")
      .in("destinatario_id", ids);

    for (const ev of (eventos ?? []) as {
      destinatario_id: string;
      tipo: TipoEvento;
    }[]) {
      const set = etapasPorDest.get(ev.destinatario_id) ?? new Set<TipoEvento>();
      set.add(ev.tipo);
      etapasPorDest.set(ev.destinatario_id, set);
    }
  }

  const base = baseUrl();

  const enviadosCount = destinatarios.filter((d) =>
    etapasPorDest.get(d.id)?.has("enviado"),
  ).length;
  const pendentesCount = destinatarios.length - enviadosCount;

  return (
    <div>
      {/* Cabecalho da campanha ------------------------------------------------ */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/painel" style={{ fontSize: 13, color: cores.suave, textDecoration: "none" }}>
          ← Campanhas
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 8,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: cores.texto, margin: 0 }}>
                {campanha.nome}
              </h1>
              <BadgeStatus status={campanha.status} />
            </div>
            <p style={{ fontSize: 14, color: cores.suave, margin: "6px 0 0" }}>
              Setor-alvo: <strong style={{ color: cores.texto }}>{campanha.setor_alvo}</strong>{" "}
              · Landing: /{campanha.landing_slug} · De: {campanha.remetente}
            </p>
            <p style={{ fontSize: 13, color: cores.suave, margin: "2px 0 0" }}>
              Assunto: “{campanha.assunto}”
            </p>
          </div>
          <BotaoExcluir id={campanha.id} />
        </div>
      </div>

      {/* Avisos de resultado da importacao ----------------------------------- */}
      {ok !== undefined ? (
        <Aviso
          tom="ok"
          texto={`${ok} destinatário(s) importado(s).${
            dup && Number(dup) > 0 ? ` ${dup} já existiam e foram ignorados.` : ""
          }`}
        />
      ) : null}
      {enviados !== undefined ? (
        <Aviso
          tom={Number(falhas) > 0 ? "erro" : "ok"}
          texto={`${enviados} e-mail(s) enviado(s).${
            falhas && Number(falhas) > 0 ? ` ${falhas} falharam.` : ""
          }`}
        />
      ) : null}
      {teste ? <Aviso tom="ok" texto={`E-mail de teste enviado para ${teste}.`} /> : null}
      {erro ? <Aviso tom="erro" texto={erro} /> : null}

      {/* Importar destinatarios ---------------------------------------------- */}
      <section style={{ ...cartao, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: cores.texto, margin: "0 0 4px" }}>
          Importar destinatários
        </h2>
        <p style={{ fontSize: 13, color: cores.suave, margin: "0 0 16px", lineHeight: 1.5 }}>
          CSV com as colunas <code style={codeInline}>nome, email, setor</code> (vírgula ou
          ponto-e-vírgula). Só o e-mail é obrigatório. Cada destinatário recebe um{" "}
          <strong>token único</strong> gerado pelo banco. Não guardamos nada além de
          nome/e-mail/setor.
        </p>

        <form
          action={importarDestinatarios}
          style={{ display: "grid", gap: 14 }}
          encType="multipart/form-data"
        >
          <input type="hidden" name="campanha_id" value={campanha.id} />

          <div>
            <label style={rotulo} htmlFor="arquivo">
              Arquivo .csv
            </label>
            <input id="arquivo" name="arquivo" type="file" accept=".csv,text/csv" style={campo} />
          </div>

          <div style={{ fontSize: 12, color: cores.suave, textAlign: "center" }}>— ou cole abaixo —</div>

          <div>
            <label style={rotulo} htmlFor="csv">
              Colar CSV
            </label>
            <textarea
              id="csv"
              name="csv"
              rows={4}
              style={{ ...campo, resize: "vertical", minHeight: 90, fontFamily: "monospace", fontSize: 13 }}
              placeholder={"nome,email,setor\nMaria Silva,maria@eonbr.com,Financeiro"}
            />
          </div>

          <div>
            <button type="submit" style={botao}>
              Importar
            </button>
          </div>
        </form>
      </section>

      {/* Envio --------------------------------------------------------------- */}
      <section style={{ ...cartao, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: cores.texto, margin: 0 }}>
            Envio
          </h2>
          <span style={{ fontSize: 13, color: cores.suave }}>
            {enviadosCount} enviado(s) · {pendentesCount} pendente(s) · transporte:{" "}
            {nomeTransporte()}
          </span>
        </div>
        <p style={{ fontSize: 13, color: cores.suave, margin: "6px 0 16px", lineHeight: 1.5 }}>
          Cada e-mail carrega o pixel de abertura e o link de clique com o token do
          destinatário. Quem já recebeu não é reenviado. Nada de credenciais.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <BotaoDisparar campanhaId={campanha.id} pendentes={pendentesCount} />

          <form
            action={enviarTeste}
            style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
          >
            <input type="hidden" name="campanha_id" value={campanha.id} />
            <input
              name="email_teste"
              type="email"
              required
              placeholder="e-mail para teste"
              style={{ ...campo, width: 220 }}
            />
            <button type="submit" style={botaoSecundario}>
              Enviar teste
            </button>
          </form>
        </div>
      </section>

      {/* Lista de destinatarios ---------------------------------------------- */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: cores.texto, margin: 0 }}>
            Destinatários
          </h2>
          <span style={{ fontSize: 13, color: cores.suave }}>
            {destinatarios.length} no total
          </span>
        </div>

        {destinatarios.length === 0 ? (
          <div
            style={{
              background: cores.card,
              border: `1px dashed ${cores.borda}`,
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
              color: cores.suave,
              fontSize: 14,
            }}
          >
            Nenhum destinatário ainda. Importe um CSV acima para começar.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {destinatarios.map((d) => {
              const etapas = etapasPorDest.get(d.id) ?? new Set<TipoEvento>();
              const linkClique = base ? `${base}/c/${d.token}` : `/c/${d.token}`;
              return (
                <div
                  key={d.id}
                  style={{
                    background: cores.card,
                    border: `1px solid ${cores.borda}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cores.texto }}>
                        {d.nome ?? "—"}
                      </div>
                      <div style={{ fontSize: 13, color: cores.suave }}>
                        {d.email}
                        {d.setor ? ` · ${d.setor}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Etapa ativa={etapas.has("enviado")} texto="Enviado" />
                      <Etapa ativa={etapas.has("abriu")} texto="Abriu" />
                      <Etapa ativa={etapas.has("clicou")} texto="Clicou" />
                      <Etapa ativa={etapas.has("submeteu")} texto="Submeteu" />
                      <Etapa ativa={etapas.has("treinamento_visto")} texto="Treinou" />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderTop: `1px solid ${cores.borda}`,
                      paddingTop: 10,
                    }}
                  >
                    <code
                      style={{
                        ...codeInline,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={linkClique}
                    >
                      {linkClique}
                    </code>
                    <BotaoCopiar texto={linkClique} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!base ? (
          <p style={{ fontSize: 12, color: cores.suave, marginTop: 12 }}>
            Dica: defina <code style={codeInline}>NEXT_PUBLIC_APP_URL</code> no ambiente para os
            links saírem com o domínio completo (usados no disparo da Fase 4).
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Aviso({ tom, texto }: { tom: "ok" | "erro"; texto: string }) {
  const estilo =
    tom === "ok"
      ? { bg: "#DBEFE2", bd: "#BFE3CC", fg: "#1F5C3A" }
      : { bg: "#FBEBEB", bd: "#E9C9C9", fg: cores.vermelho };
  return (
    <div
      style={{
        background: estilo.bg,
        border: `1px solid ${estilo.bd}`,
        color: estilo.fg,
        fontSize: 13,
        padding: "10px 12px",
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      {texto}
    </div>
  );
}

const codeInline = {
  fontFamily: "monospace",
  fontSize: 12.5,
  background: cores.suaveFundo,
  border: `1px solid ${cores.borda}`,
  borderRadius: 6,
  padding: "2px 6px",
  color: cores.texto,
};
