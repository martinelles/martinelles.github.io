# Painel Concurso

PWA de estudo para o concurso da CGU — Auditor Federal de Finanças e Controle (Edital CGU
1/2026, banca Cebraspe). O app roda no navegador e funciona offline; um Worker do Cloudflare
guarda o progresso de quem entra com um nome, para seguir de um aparelho para outro.

## O que tem

- **Feed de estudo** (`/`) — stories por disciplina do edital no topo (B1–B4, C1–C5 e a P3 do
  cargo escolhido, como nos guias e nas Missões; ver
  [scripts/importar/disciplinas.mjs](scripts/importar/disciplinas.mjs)) e posts em rolagem infinita:
  questões Certo/Errado, resumos, flashcards e lei seca, sem repetir o que já apareceu. Como
  no Instagram, puxar a tela para baixo no topo (ou tocar na aba Feed já no topo) atualiza: a
  ordem é sorteada de novo e o filtro recomeça. Recarregar a página faz o mesmo; fora disso a
  ordem fica (voltar a um filtro e voltar do popup de login não reembaralham). Intercala
  questão 3 : lei 2 : resumo 1 : flashcard 2 — ver [src/lib/feed/rodada.ts](src/lib/feed/rodada.ts)
  e [src/lib/feed/ordem.ts](src/lib/feed/ordem.ts).
- **Painel** (`/painel`) — ferramentas, progresso, missão de hoje e foco de estudo.
- **Missões** — plano de 61 dias até a prova, o mesmo da página das Missões; o painel e o
  feed seguem esse plano. Subitem com mapa mental no vault ganha o atalho "Mapa mental ↗",
  que abre a rota `/mapa/<slug>` com visor de arraste e zoom (offline).
- **Ajustes** (`/painel/ajustes`) — especialidade (Ciência de Dados, Auditoria ou Infraestrutura, esta com a P3 vinda do guia de conteúdo programático), que decide
  o conteúdo, aparência e conta.
- **Entrar** (`/entrar`, ou o popup) — login só por nome, sem senha: o nome é a credencial.
- **Salvos** (`/salvos`) — posts marcados para revisar.
- **Artefatos** (`/artefato/missoes`, `/artefato/prioridades`, `/artefato/raiox`) — Missões,
  Prioridades e Raio-X do Qconcursos dentro do app, com a barra de abas. A rota mostra num
  iframe a página do vault, servida em `/conteudo/artefatos/<nome>.html` (mesma origem, então
  mesmo armazenamento e mesmo login); os links entre elas trocam a rota em vez de abrir aba nova.
  Aberta direto pelo `.html`, a página fica sem o menu.

## Conta e servidor

Sem login, tudo fica no `localStorage`, como antes. Com login, o progresso (interações do
feed, preferências, tema e marcações das Missões) sincroniza com o servidor, chave por chave,
e vale a gravação mais nova.

O servidor é o Worker em [worker/](worker/), que atende só `/api/*` e grava no D1 (banco
`cgu`); o resto sai do build estático.

```
GET /api/progresso/:usuario         → { [chave]: { valor, atualizadoEm } }
PUT /api/progresso/:usuario/:chave  { valor, atualizadoEm } → { gravado, atual }
```

Responder, curtir ou salvar no feed sem login abre um popup para entrar, porque a interação só
no aparelho se perderia no primeiro login de uma conta que já tem progresso no servidor. Ao
entrar, a carga nova volta à mesma tela e aplica a interação depois da sincronização (curtir e
salvar guardam o estado pedido, não o alternar). "Agora não" faz a interação só no aparelho e
não pergunta de novo na aba. Marcar missão no painel usa o mesmo popup, mas exige login: "Agora
não" não marca. Fica em [src/lib/feed/pedidoLogin.svelte.ts](src/lib/feed/pedidoLogin.svelte.ts).
A página das Missões tem o popup próprio dela, com a mesma regra.

A tabela é criada na primeira requisição; não há migração a aplicar. As regras do nome e das
chaves que sobem ficam em [src/lib/conta/regras.ts](src/lib/conta/regras.ts), divididas entre
o app e o Worker. Decisões em
[planos/2026-10-13-login-por-nome-backend-cloudflare.md](planos/2026-10-13-login-por-nome-backend-cloudflare.md).

## Rodar

Requer Node 24+.

```sh
npm install
npm run dev        # app sem a API (login indisponível)
npm run build      # build estático em build/
npm run preview    # serve o build
npx wrangler dev   # app (build/) + Worker + D1 local; rodar depois do build
```

## Testes

```sh
npm run check      # tipos (svelte-check)
npm test           # unitários (vitest), incluindo a API do Worker com banco em memória
npm run test:e2e   # ponta a ponta (playwright)
```

## Conteúdo

O conteúdo não é versionado à mão: `npm run importar` lê o vault do Obsidian (só leitura) e
gera `static/conteudo/` — posts do feed, o plano das Missões (`missoes-<cargo>.json`, a partir
de `artifacts/missoes/plano-<cargo>.json`) e os artefatos. O vault vem de `--vault <dir>`, da
variável `PAINEL_VAULT` ou do caminho padrão em
[scripts/importar/index.mjs](scripts/importar/index.mjs).

Dados fixos do concurso, ferramentas e configuração ficam em [src/lib/dados/](src/lib/dados/)
— ver o [LEIA-ME](src/lib/dados/LEIA-ME.md) de lá, inclusive o que editar quando sair data
de prova.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/routes/` | telas (SvelteKit, adapter-static, SPA com fallback `index.html`) |
| `src/lib/feed/` | sessão, ordem, interações e estatísticas do feed |
| `src/lib/missoes/` | plano das Missões: carga, cálculos e marcações |
| `src/lib/conta/` | login por nome e armazenamento sincronizado |
| `src/lib/artefatos/` | rotas `/artefato/<nome>` ↔ páginas do vault |
| `src/lib/dados/` | concurso, ferramentas, config e validação na carga |
| `src/service-worker.ts` | cache para uso offline |
| `worker/` | Worker do Cloudflare: API de progresso no D1 |
| `scripts/importar/` | importação do vault para `static/conteudo/` |
| `planos/` | planos de implementação |
| `kitty-specs/` | especificações das features (Spec Kitty) |
| `tests/` | unitários (`unit/`) e Playwright (`e2e/`) |

## Deploy

Só no Cloudflare Workers, em `cgu.solarpunk.workers.dev`: a cada push na `main`, a integração
Git do Cloudflare roda `npx wrangler deploy`, que publica `build/` e o Worker conforme
[wrangler.jsonc](wrangler.jsonc) e cria o D1 `cgu` no primeiro deploy. O GitHub Pages saiu em
2026-10-17. Endereço sem `/api` (o `npm run dev`, por exemplo) ainda abre o app, mas só no modo
local, sem login.

O GitHub Actions roda os testes em todo push para a `main` e em todo PR
([test.yml](.github/workflows/test.yml)): tipos, unitários e build, sem e2e. O
[deploy.yml](.github/workflows/deploy.yml) é a porta que publica só com testes verdes, no lugar
da integração do Cloudflare — mas fica desligado (o job pula) enquanto o repositório não tiver
os segredos `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. Para ativá-lo: criar os dois
segredos (token do tipo "Edit Cloudflare Workers", em Settings → Secrets and variables →
Actions) e desconectar a integração Git no Cloudflare (Workers → cgu → Settings → Builds →
Disconnect) — senão publicam os dois.
