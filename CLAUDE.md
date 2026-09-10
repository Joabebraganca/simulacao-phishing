# Plataforma de Simulação de Phishing — Conscientização Interna (Grupo BP)

## Contexto
Ferramenta interna do setor de TI para rodar campanhas de simulação de phishing
(pentest de conscientização), **autorizada pela diretoria**. Objetivo: medir quantas
pessoas caem, treinar na hora e reduzir o risco ao longo do tempo. Abordagem: começar
com um **piloto num setor específico**, medir, ajustar e então expandir para o grupo.
Construída internamente porque o GoPhish não atende bem (customização das landings e
dos relatórios).

## Princípio inegociável (privacidade)
O sistema mede **comportamento, não credenciais**.
- NUNCA armazenar ou trafegar senha real, login digitado ou conteúdo de formulário.
- A landing **descarta** o que for digitado e registra apenas o evento `submeteu`.
- O `token` único por destinatário já identifica QUEM caiu — não é preciso ler o formulário.
- Landing = recriação de uma página de **propriedade nossa** (intranet, portal de
  benefícios), nunca um clone asset-por-asset de serviço de terceiro.

Motivo: um banco com senhas reais dos colaboradores é um passivo grave de LGPD e de
segurança, e não agrega nenhuma métrica. Se em algum momento surgir a ideia de capturar
a senha de verdade, a resposta é não — o desenho inteiro é para não precisar disso.

## Stack
- **Next.js** (App Router) na **Vercel**
- **Supabase** (Postgres + Auth) para dados e painel
- Envio via SMTP próprio ou **n8n** (fase posterior)

## Modelo de dados (ver `supabase/migrations/0001_init.sql`)
- `campanhas` — cada campanha (setor-alvo, status, landing, remetente, assunto).
- `destinatarios` — pessoas da campanha, cada uma com `token` único.
- `eventos` — `enviado` / `abriu` / `clicou` / `submeteu` / `treinamento_visto` + timestamp.
- `metricas_por_setor` — view de agregação para o dashboard.

Nenhuma coluna guarda senha ou credencial. É proposital — não adicionar.

## Fluxo de tracking
1. **Envio**: e-mail com pixel e link, ambos carregando o `token` do destinatário.
2. **abriu**: request no pixel → registra evento.
3. **clicou**: request no link → registra evento → redireciona para a landing.
4. **submeteu**: submit na landing → registra evento (**descarta o que foi digitado**)
   → redireciona imediatamente para a página de treinamento.
5. **treinamento_visto**: opcional, ao abrir a página de conscientização.

Todas as escritas de tracking acontecem em **route handlers no servidor**, usando a
service role key do Supabase. O papel `anon` não tem insert direto nas tabelas.

## Roadmap
- [ ] **Fase 0 — Fundação**: repo, projeto Supabase, rodar a migração, variáveis de ambiente, auth do painel.
- [ ] **Fase 1 — Campanha**: CRUD de campanha, importar destinatários (CSV), gerar tokens.
- [ ] **Fase 2 — Tracking**: rotas de pixel, clique e submissão + a landing.
- [ ] **Fase 3 — Treinamento**: página de conscientização pós-clique.
- [ ] **Fase 4 — Envio**: disparo com token por destinatário (SMTP/n8n).
- [ ] **Fase 5 — Dashboard**: taxas por setor e por pessoa.
- [ ] **Fase 6 — Piloto**: rodar num setor, medir, ajustar, treinar.

## Convenções
- Comentários e nomes de domínio em português.
- Segredos apenas em variáveis de ambiente. `SUPABASE_SERVICE_ROLE_KEY` **nunca** no client.
- Nada de capturar/registrar credenciais em lugar nenhum do código.