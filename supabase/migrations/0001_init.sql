-- =============================================================================
-- 0001_init.sql — Esquema inicial da plataforma de simulacao de phishing.
--
-- PRINCIPIO INEGOCIAVEL: o sistema mede COMPORTAMENTO, nao CREDENCIAIS.
-- Nenhuma coluna guarda senha, login digitado ou conteudo de formulario.
-- Isso e proposital. Nao adicionar tais colunas em migracoes futuras.
--
-- O acesso de escrita ao tracking acontece SOMENTE via service role key
-- (route handlers no servidor). O papel `anon` nao tem insert nas tabelas.
-- =============================================================================

-- Extensao para gerar UUIDs.
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------

-- Ciclo de vida de uma campanha.
create type public.status_campanha as enum (
  'rascunho',    -- em preparacao, ainda nao disparada
  'agendada',    -- pronta, aguardando envio
  'em_andamento',-- e-mails enviados, coletando eventos
  'concluida',   -- encerrada
  'cancelada'
);

-- Tipos de evento rastreados por destinatario.
create type public.tipo_evento as enum (
  'enviado',           -- e-mail disparado
  'abriu',             -- pixel carregado
  'clicou',            -- link clicado -> vai para a landing
  'submeteu',          -- submit na landing (conteudo DESCARTADO, so o evento)
  'treinamento_visto'  -- abriu a pagina de conscientizacao
);

-- -----------------------------------------------------------------------------
-- Tabela: campanhas
-- -----------------------------------------------------------------------------
create table public.campanhas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  setor_alvo    text not null,                       -- setor do piloto/expansao
  status        public.status_campanha not null default 'rascunho',
  landing_slug  text not null,                        -- qual landing usar (pagina NOSSA)
  remetente     text not null,                        -- e-mail "De:" da simulacao
  assunto       text not null,                        -- assunto do e-mail
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);

comment on table public.campanhas is
  'Cada campanha de simulacao. landing_slug referencia uma pagina de propriedade nossa.';

-- -----------------------------------------------------------------------------
-- Tabela: destinatarios
-- -----------------------------------------------------------------------------
create table public.destinatarios (
  id          uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.campanhas(id) on delete cascade,
  nome        text,
  email       text not null,
  setor       text,
  -- token unico e opaco: identifica QUEM caiu sem precisar ler o formulario.
  token       text not null default encode(gen_random_bytes(16), 'hex'),
  criado_em   timestamptz not null default now(),
  -- um mesmo e-mail nao se repete dentro da mesma campanha
  unique (campanha_id, email),
  -- token unico globalmente (vai na URL de pixel/link)
  unique (token)
);

comment on column public.destinatarios.token is
  'Token opaco por destinatario. Vai no pixel e no link. Identifica quem caiu.';

create index idx_destinatarios_campanha on public.destinatarios(campanha_id);

-- -----------------------------------------------------------------------------
-- Tabela: eventos
-- -----------------------------------------------------------------------------
create table public.eventos (
  id              uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references public.destinatarios(id) on delete cascade,
  tipo            public.tipo_evento not null,
  -- metadados NAO sensiveis (ex.: user-agent para diferenciar bot de humano).
  -- NUNCA guardar aqui senha, login ou conteudo de formulario.
  user_agent      text,
  ocorreu_em      timestamptz not null default now()
);

comment on table public.eventos is
  'Trilha de eventos comportamentais por destinatario. Sem credenciais, por design.';

create index idx_eventos_destinatario on public.eventos(destinatario_id);
create index idx_eventos_tipo on public.eventos(tipo);

-- -----------------------------------------------------------------------------
-- View: metricas_por_setor (agregacao para o dashboard)
-- -----------------------------------------------------------------------------
create view public.metricas_por_setor as
select
  c.id                                  as campanha_id,
  c.nome                                as campanha,
  d.setor                               as setor,
  count(distinct d.id)                  as total_destinatarios,
  count(distinct d.id) filter (
    where ev.tipo = 'enviado')          as enviados,
  count(distinct d.id) filter (
    where ev.tipo = 'abriu')            as abriram,
  count(distinct d.id) filter (
    where ev.tipo = 'clicou')           as clicaram,
  count(distinct d.id) filter (
    where ev.tipo = 'submeteu')         as submeteram,
  count(distinct d.id) filter (
    where ev.tipo = 'treinamento_visto') as treinaram
from public.campanhas c
join public.destinatarios d on d.campanha_id = c.id
left join public.eventos ev on ev.destinatario_id = d.id
group by c.id, c.nome, d.setor;

comment on view public.metricas_por_setor is
  'Agregacao de taxas (aberto/clicado/submetido/treinado) por setor e campanha.';

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Habilita RLS em todas as tabelas. Sem policies de insert/update para `anon`
-- ou `authenticated`, o acesso de escrita fica restrito a service role
-- (que ignora RLS) usada apenas nos route handlers do servidor.
alter table public.campanhas     enable row level security;
alter table public.destinatarios enable row level security;
alter table public.eventos       enable row level security;

-- Leitura no painel: usuarios autenticados (equipe de TI) podem LER.
-- (Escrita continua exclusiva da service role no servidor.)
create policy "painel_le_campanhas"
  on public.campanhas for select
  to authenticated using (true);

create policy "painel_le_destinatarios"
  on public.destinatarios for select
  to authenticated using (true);

create policy "painel_le_eventos"
  on public.eventos for select
  to authenticated using (true);

-- Observacao: NAO criamos policy alguma para o papel `anon`.
-- O tracking publico (pixel/clique/submit) escreve via service role no servidor.
