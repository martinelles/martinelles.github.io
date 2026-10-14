# Painel Concurso

PWA de estudo para o concurso da CGU — Auditor Federal de Finanças e Controle (Edital CGU
1/2026, banca Cebraspe). O app roda no navegador e funciona offline; um Worker do Cloudflare
guarda o progresso de quem entra com um nome, para seguir de um aparelho para outro.

## O que tem

- **Feed de estudo** (`/`) — stories por matéria no topo e posts em rolagem infinita:
  questões Certo/Errado, resumos, flashcards e lei seca, sem repetir o que já apareceu.
- **Painel** (`/painel`) — ferramentas, progresso, missão de hoje e foco de estudo.
- **Missões** — plano de 61 dias até a prova, o mesmo da página `artefatos/missoes.html`; o
  painel e o feed seguem esse plano.
- **Ajustes** (`/painel/ajustes`) — especialidade (Ciência de Dados ou Auditoria), que decide
  o conteúdo, aparência e conta.
- **Entrar** (`/entrar`) — login só por nome, sem senha: o nome é a credencial.
- **Salvos** (`/salvos`) — posts marcados para revisar.
- **Artefatos** (`/conteudo/artefatos/`) — Missões, Prioridades e Raio-X do Qconcursos,
  servidos pelo próprio painel.

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
| `src/lib/dados/` | concurso, ferramentas, config e validação na carga |
| `src/service-worker.ts` | cache para uso offline |
| `worker/` | Worker do Cloudflare: API de progresso no D1 |
| `scripts/importar/` | importação do vault para `static/conteudo/` |
| `planos/` | planos de implementação |
| `kitty-specs/` | especificações das features (Spec Kitty) |
| `tests/` | unitários (`unit/`) e Playwright (`e2e/`) |

## Deploy

- **Cloudflare Workers** (com servidor): a integração Git do Cloudflare roda
  `npx wrangler deploy`, que publica `build/` e o Worker conforme [wrangler.jsonc](wrangler.jsonc)
  e cria o D1 `cgu` no primeiro deploy.
- **GitHub Pages** (sem servidor): cada push na `main` publica o build estático via
  [.github/workflows/pages.yml](.github/workflows/pages.yml); lá não há `/api`, então o app
  funciona só no modo local, sem login.
