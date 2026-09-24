# Plataforma de Simulação de Phishing — Conscientização (4p Capital )

Ferramenta interna de TI para rodar campanhas de **simulação de phishing**
(conscientização), autorizada pela diretoria. Objetivo: medir quantas pessoas
caem, treinar na hora e reduzir o risco ao longo do tempo.

## Princípio inegociável (privacidade)

O sistema mede **comportamento, não credenciais**.

- **Nunca** armazena nem trafega senha real, login digitado ou conteúdo de formulário.
- A landing **descarta** o que for digitado e registra apenas o evento `submeteu`.
- O `token` único por destinatário já identifica quem caiu — não é preciso ler o formulário.
- Landing = recriação de página **de propriedade nossa** (intranet, portal de
  benefícios), nunca clone de serviço de terceiro.

## Stack

- **Next.js** (App Router) + TypeScript — deploy na **Vercel**
- **Supabase** (Postgres + Auth) — dados e painel
- Envio via SMTP próprio ou **n8n** (fase posterior)

## Fase 0 — Fundação (passo a passo)

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto Supabase

1. Crie um projeto em https://supabase.com.
2. Em **Project Settings > API**, copie: `URL`, `anon key` e `service_role key`.

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do Supabase. **A `service_role key` fica só
aqui, no servidor — nunca com prefixo `NEXT_PUBLIC_` e nunca no client.**

### 4. Rodar a migração

Opção A — SQL Editor do Supabase: cole o conteúdo de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e execute.

Opção B — Supabase CLI (se instalado):

```bash
supabase db push
```

### 5. Auth do painel

O painel usa Supabase Auth (papel `authenticated`) apenas para **leitura**. Crie
os usuários da equipe de TI em **Authentication > Users** no Supabase. A escrita
de tracking não depende de login — acontece via `service_role` nos route handlers.

### 6. Rodar em desenvolvimento

```bash
npm run dev
```

Abra http://localhost:3000.

## Modelo de dados

Ver [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

| Tabela              | Papel                                                        |
| ------------------- | ------------------------------------------------------------ |
| `campanhas`         | cada campanha (setor-alvo, status, landing, remetente, assunto) |
| `destinatarios`     | pessoas da campanha, cada uma com `token` único              |
| `eventos`           | `enviado`/`abriu`/`clicou`/`submeteu`/`treinamento_visto` + timestamp |
| `metricas_por_setor`| view de agregação para o dashboard                           |

**Nenhuma coluna guarda senha ou credencial. É proposital — não adicionar.**

### Segurança de acesso (RLS)

- RLS habilitado em todas as tabelas.
- Papel `authenticated` (equipe de TI): **apenas leitura** no painel.
- Papel `anon`: **sem policy alguma** — não escreve nem lê direto.
- Escrita de tracking: exclusiva da **service role**, nos route handlers do servidor.

## Fase 1 — Painel de campanhas

O painel interno vive em `/painel` e exige login (Supabase Auth). Não há
auto-cadastro: os usuários da equipe de TI são provisionados manualmente.

### 1. Criar o usuário de TI no Supabase

No painel do Supabase: **Authentication > Users > Add user** → informe e-mail e
senha (marque "Auto Confirm User"). Repita para cada pessoa do time. Opcional:
em **Authentication > Providers > Email**, desligue "Enable sign-ups" para
impedir cadastros externos.

### 2. Entrar

Rode `npm run dev`, acesse `http://localhost:3000/painel` e faça login. O
middleware (`src/proxy.ts`) protege tudo sob `/painel`; as rotas públicas de
tracking (pixel/clique/submit/landing/treinamento) ficam fora do gate.

### 3. Criar campanha e importar destinatários

- **Nova campanha**: nome, setor-alvo, landing, remetente e assunto.
- **Importar CSV** (na tela da campanha): colunas `nome, email, setor` — vírgula
  ou ponto-e-vírgula, com ou sem cabeçalho. Só o e-mail é obrigatório; e-mails
  repetidos na mesma campanha são ignorados. O `token` de cada destinatário é
  gerado pelo **DEFAULT do banco**, nunca no código.
- Cada destinatário exibe seu **link de clique** (`/c/<token>`) pronto para o
  disparo da Fase 4, e as etapas atingidas (abriu/clicou/submeteu/treinou).

> As escritas do painel passam pela **service role** em Server Actions, sempre
> atrás de `exigirUsuario()` — a service role ignora o RLS, então a checagem de
> sessão no servidor é o que impede escrita anônima. Nenhuma dessas operações
> toca senha ou credencial.

## Roadmap

- [x] **Fase 0 — Fundação**: repo, migração, variáveis de ambiente, clients Supabase.
- [x] **Fase 1 — Campanha**: login do painel, CRUD de campanha, importar destinatários (CSV), gerar tokens.
- [x] **Fase 2 — Tracking**: rotas de pixel, clique e submissão + a landing.
- [x] **Fase 3 — Treinamento**: página de conscientização pós-clique.
- [ ] **Fase 4 — Envio**: disparo com token por destinatário (SMTP/n8n).
- [ ] **Fase 5 — Dashboard**: taxas por setor e por pessoa.
- [ ] **Fase 6 — Piloto**: rodar num setor, medir, ajustar, treinar.

## Convenções

- Comentários e nomes de domínio em **português**.
- Segredos apenas em variáveis de ambiente. `SUPABASE_SERVICE_ROLE_KEY` **nunca** no client.
- **Nada de capturar/registrar credenciais em lugar nenhum do código.**
