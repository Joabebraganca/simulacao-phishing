// =============================================================================
// Tipos do dominio — espelham o esquema em supabase/migrations/0001_init.sql.
// Nenhum tipo aqui carrega senha/credencial. Por design.
// =============================================================================

export type StatusCampanha =
  | "rascunho"
  | "agendada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export type TipoEvento =
  | "enviado"
  | "abriu"
  | "clicou"
  | "submeteu"
  | "treinamento_visto";

export interface Campanha {
  id: string;
  nome: string;
  setor_alvo: string;
  status: StatusCampanha;
  landing_slug: string;
  remetente: string;
  assunto: string;
  criada_em: string;
  atualizada_em: string;
}

export interface Destinatario {
  id: string;
  campanha_id: string;
  nome: string | null;
  email: string;
  setor: string | null;
  token: string;
  criado_em: string;
}

export interface Evento {
  id: string;
  destinatario_id: string;
  tipo: TipoEvento;
  user_agent: string | null;
  ocorreu_em: string;
}

export interface MetricaPorSetor {
  campanha_id: string;
  campanha: string;
  setor: string | null;
  total_destinatarios: number;
  enviados: number;
  abriram: number;
  clicaram: number;
  submeteram: number;
  treinaram: number;
}
