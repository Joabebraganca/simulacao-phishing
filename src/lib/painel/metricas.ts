import type { TipoEvento } from "@/lib/tipos";

// =============================================================================
// Agregacao de metricas para o dashboard (Fase 5).
//
// Espelha a semantica da view `metricas_por_setor`: conta destinatarios
// DISTINTOS que atingiram cada etapa (uma pessoa que abriu 3x conta 1). A
// agregacao roda em memoria a partir das tabelas lidas com o papel
// `authenticated` (RLS de leitura), evitando depender de grants/definer da view.
//
// Nada aqui toca credencial — so contamos comportamento por etapa.
// =============================================================================

export interface DestinatarioMin {
  id: string;
  campanha_id: string;
  setor: string | null;
}

export interface EventoMin {
  destinatario_id: string;
  tipo: TipoEvento;
}

export interface Metrica {
  total: number;
  enviados: number;
  abriram: number;
  clicaram: number;
  submeteram: number;
  treinaram: number;
}

export interface MetricaSetor extends Metrica {
  setor: string;
}

export interface Agregado {
  geral: Metrica;
  porSetor: MetricaSetor[];
}

function metricaVazia(): Metrica {
  return {
    total: 0,
    enviados: 0,
    abriram: 0,
    clicaram: 0,
    submeteram: 0,
    treinaram: 0,
  };
}

export function agregarMetricas(
  destinatarios: DestinatarioMin[],
  eventos: EventoMin[],
): Agregado {
  // destinatario_id -> conjunto de etapas atingidas.
  const etapas = new Map<string, Set<TipoEvento>>();
  for (const ev of eventos) {
    const s = etapas.get(ev.destinatario_id) ?? new Set<TipoEvento>();
    s.add(ev.tipo);
    etapas.set(ev.destinatario_id, s);
  }

  const geral = metricaVazia();
  const setores = new Map<string, Metrica>();

  for (const d of destinatarios) {
    const chave = d.setor?.trim() || "Sem setor";
    const m = setores.get(chave) ?? metricaVazia();
    const s = etapas.get(d.id) ?? new Set<TipoEvento>();

    const incrementar = (alvo: Metrica) => {
      alvo.total++;
      if (s.has("enviado")) alvo.enviados++;
      if (s.has("abriu")) alvo.abriram++;
      if (s.has("clicou")) alvo.clicaram++;
      if (s.has("submeteu")) alvo.submeteram++;
      if (s.has("treinamento_visto")) alvo.treinaram++;
    };

    incrementar(m);
    incrementar(geral);
    setores.set(chave, m);
  }

  const porSetor = [...setores.entries()]
    .map(([setor, m]) => ({ setor, ...m }))
    .sort((a, b) => b.total - a.total);

  return { geral, porSetor };
}

// Percentual inteiro de `parte` sobre `base` (0 quando base e zero).
export function pct(parte: number, base: number): number {
  if (base <= 0) return 0;
  return Math.round((parte / base) * 100);
}
