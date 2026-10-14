# Painel Concurso

PWA de estudo para o concurso da CGU — Auditor Federal de Finanças e Controle (Edital CGU
1/2026, banca Cebraspe). Funciona offline e roda inteiro no navegador: não há backend.

## O que tem

- **Feed de estudo** (`/`) — stories por matéria no topo e posts em rolagem infinita:
  questões Certo/Errado, resumos, flashcards e lei seca, sem repetir o que já apareceu.
- **Painel** (`/painel`) — ferramentas, progresso, missão do dia e foco de estudo.
- **Ajustes** (`/painel/ajustes`) — especialidade (Ciência de Dados ou Auditoria), que decide
  o conteúdo, e aparência.
- **Salvos** (`/salvos`) — posts marcados para revisar.
- **Plano de estudos** — missão diária até a prova, gerada a partir do `ESTUDO.csv` do vault.

## Rodar

Requer Node 24+.

```sh
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # build estático em build/
npm run preview    # serve o build
```

## Testes

```sh
npm run check      # tipos (svelte-check)
npm test           # unitários (vitest)
npm run test:e2e   # ponta a ponta (playwright)
```

## Conteúdo

O conteúdo do feed não é versionado à mão: `npm run importar` lê o vault do Obsidian (só
leitura) e gera `static/conteudo/`. O vault vem de `--vault <dir>`, da variável
`PAINEL_VAULT` ou do caminho padrão em [scripts/importar/index.mjs](scripts/importar/index.mjs).
Com `ESTUDO.csv` no vault, gera também o `plano.json`.

Dados fixos do concurso, ferramentas e configuração ficam em [src/lib/dados/](src/lib/dados/)
— ver o [LEIA-ME](src/lib/dados/LEIA-ME.md) de lá, inclusive o que editar quando sair data
de prova.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/routes/` | telas (SvelteKit, adapter-static, SPA com fallback `index.html`) |
| `src/lib/feed/` | sessão, ordem, interações e estatísticas do feed |
| `src/lib/plano/` | plano de estudos: missões, dias, horas, exportação |
| `src/lib/dados/` | concurso, ferramentas, config e validação na carga |
| `src/service-worker.ts` | cache para uso offline |
| `scripts/importar/` | importação do vault para `static/conteudo/` |
| `kitty-specs/` | especificações das features (Spec Kitty) |
| `tests/e2e/` | testes Playwright |

## Deploy

- **GitHub Pages**: cada push na `main` publica via
  [.github/workflows/pages.yml](.github/workflows/pages.yml).
- **Cloudflare Workers**: `npx wrangler deploy` serve `build/` conforme
  [wrangler.jsonc](wrangler.jsonc).
