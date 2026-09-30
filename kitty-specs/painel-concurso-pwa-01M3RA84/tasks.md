# Tasks: Painel de Concurso PWA

**Missão**: `painel-concurso-pwa-01M3RA84` · **Branch**: planejamento em `main`, merge em `main`
**Entrada**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [research.md](research.md), [contracts/](contracts/), [quickstart.md](quickstart.md)
**Charter**: `.kittify/charter/charter.md` — porta obrigatória antes da revisão: `npm run check`, `npm test`, `npm run build` (e `npm run test:e2e` em WP que toca tela).

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | Criar `package.json`, dependências e scripts | WP01 | | [D] |
| T002 | Configurar SvelteKit estático SPA, Vite e TypeScript | WP01 | | [D] |
| T003 | `app.html` com manifest/theme-color e `app.css` com tokens claro/escuro | WP01 | [D] |
| T004 | Layout raiz (`+layout.ts`, `+layout.svelte`) | WP01 | | [D] |
| T005 | Vitest e Playwright configurados com testes de fumaça | WP01 | | [D] |
| T006 | Tipos do domínio em `src/lib/dados/tipos.ts` | WP02 | | [D] |
| T007 | `concursos.json` com ≥ 12 concursos nas 4 seções | WP02 | [D] |
| T008 | `ferramentas.json` (12) e `config.json` | WP02 | [D] |
| T009 | `validar.ts` e `index.ts` (carga validada) | WP02 | | [D] |
| T010 | `tests/unit/dados.test.ts` | WP02 | | [D] |
| T011 | `busca.ts` (normalizar, índice, filtrar) | WP03 | [D] |
| T012 | `secoes.ts` (situação efetiva, agrupamento) | WP03 | [D] |
| T013 | `datas.ts` (dias para a prova) | WP03 | [D] |
| T014 | `preferencias.svelte.ts` (estado persistido) | WP03 | | [D] |
| T015 | Testes de unidade de busca, seções, datas e preferências | WP03 | | [D] |
| T016 | `Icone.svelte` com SVGs próprios | WP04 | | [D] |
| T017 | `CampoBusca.svelte` | WP04 | [D] |
| T018 | `CartaoConcurso.svelte` | WP04 | [D] |
| T019 | `SecaoRecolhivel.svelte` | WP04 | [D] |
| T020 | `EstadoVazio.svelte` | WP04 | [D] |
| T021 | Rota raiz `/` com redirecionamento | WP05 | | [D] |
| T022 | Tela `/escolher`: cabeçalho, busca e seções | WP05 | | [D] |
| T023 | "Ver mais/Ver menos", abrir/fechar e abertura automática na busca | WP05 | | [D] |
| T024 | Seleção do concurso e estado vazio ligados | WP05 | | [D] |
| T025 | `tests/e2e/escolher.spec.ts` | WP05 | | [D] |
| T026 | `CabecalhoPainel.svelte` | WP06 | [D] |
| T027 | `FocoEstudo.svelte` | WP06 | [D] |
| T028 | `GradeFerramentas.svelte` | WP06 | [D] |
| T029 | Tela `/painel` | WP06 | | [D] |
| T030 | Tela `/ferramenta/[id]` ("em breve") | WP06 | | [D] |
| T031 | `tests/e2e/painel.spec.ts` | WP06 | | [D] |
| T032 | Ícones do app e `manifest.webmanifest` | WP07 | [P] |
| T033 | `src/service-worker.ts` | WP07 | |
| T034 | `tests/e2e/offline.spec.ts` | WP07 | |
| T035 | `tests/e2e/responsivo.spec.ts` | WP07 | [P] |
| T036 | Medição de peso e Lighthouse registrada em `kitty-specs/.../medicoes.md` | WP07 | |

## Fase 1 — Fundação

### WP01 — Esqueleto do projeto SvelteKit
**Prompt**: [tasks/WP01-esqueleto-sveltekit.md](tasks/WP01-esqueleto-sveltekit.md) · **Prioridade**: P1 · **Dependências**: nenhuma · **Tamanho estimado**: ~330 linhas

Objetivo: projeto instalável com `npm install`, as quatro portas do charter rodando e o visual base (tokens, tema escuro) pronto.
Teste independente: `npm run check && npm test && npm run build && npm run test:e2e` passam com os testes de fumaça.

- [x] T001 Criar `package.json`, dependências e scripts (WP01)
- [x] T002 Configurar SvelteKit estático SPA, Vite e TypeScript (WP01)
- [x] T003 `app.html` com manifest/theme-color e `app.css` com tokens claro/escuro (WP01)
- [x] T004 Layout raiz (`+layout.ts`, `+layout.svelte`) (WP01)
- [x] T005 Vitest e Playwright configurados com testes de fumaça (WP01)

Riscos: versões novas (Svelte 5.57, Kit 2.70, Vite 8) — seguir `npx sv create` como referência. Nenhuma fonte ou CDN externa (charter).

### WP02 — Dados de exemplo e validação
**Prompt**: [tasks/WP02-dados-exemplo.md](tasks/WP02-dados-exemplo.md) · **Prioridade**: P1 · **Dependências**: WP01 · **Tamanho estimado**: ~320 linhas

Objetivo: `src/lib/dados/` com tipos, JSONs e validador; acrescentar concurso exige mexer só no JSON (SC-005).
Teste independente: `npm test -- dados`.

- [x] T006 Tipos do domínio em `src/lib/dados/tipos.ts` (WP02)
- [x] T007 `concursos.json` com ≥ 12 concursos nas 4 seções (WP02)
- [x] T008 `ferramentas.json` (12) e `config.json` (WP02)
- [x] T009 `validar.ts` e `index.ts` (carga validada) (WP02)
- [x] T010 `tests/unit/dados.test.ts` (WP02)

Riscos: dado inventado apresentado como oficial — marcar no JSON que são exemplos; nenhum dado copiado do Acertei (C-002).

## Fase 2 — Lógica e componentes (paralelos entre si)

### WP03 — Lógica de domínio e preferências
**Prompt**: [tasks/WP03-logica-dominio.md](tasks/WP03-logica-dominio.md) · **Prioridade**: P1 · **Dependências**: WP02 · **Tamanho estimado**: ~380 linhas

Objetivo: funções puras de busca, seções e datas, e o estado de preferências persistido.
Teste independente: `npm test` (inclui busca em 500 itens ≤ 100 ms).

- [x] T011 `busca.ts` (normalizar, índice, filtrar) (WP03)
- [x] T012 `secoes.ts` (situação efetiva, agrupamento) (WP03)
- [x] T013 `datas.ts` (dias para a prova) (WP03)
- [x] T014 `preferencias.svelte.ts` (estado persistido) (WP03)
- [x] T015 Testes de unidade de busca, seções, datas e preferências (WP03)

Paralelo: T011, T012, T013 são arquivos independentes.

### WP04 — Componentes da tela de escolha
**Prompt**: [tasks/WP04-componentes-escolha.md](tasks/WP04-componentes-escolha.md) · **Prioridade**: P1 · **Dependências**: WP02 · **Tamanho estimado**: ~340 linhas

Objetivo: `Icone`, `CampoBusca`, `CartaoConcurso`, `SecaoRecolhivel`, `EstadoVazio` prontos, sem lógica de negócio (recebem props).
Teste independente: `npm run check` e `npm run build` sem aviso de acessibilidade do Svelte.

- [x] T016 `Icone.svelte` com SVGs próprios (WP04)
- [x] T017 `CampoBusca.svelte` (WP04)
- [x] T018 `CartaoConcurso.svelte` (WP04)
- [x] T019 `SecaoRecolhivel.svelte` (WP04)
- [x] T020 `EstadoVazio.svelte` (WP04)

Paralelo com WP03 inteiro.

## Fase 3 — Telas (paralelas entre si)

### WP05 — Tela de escolha de concurso
**Prompt**: [tasks/WP05-tela-escolher.md](tasks/WP05-tela-escolher.md) · **Prioridade**: P1 (MVP) · **Dependências**: WP03, WP04 · **Tamanho estimado**: ~360 linhas

Objetivo: Cenário 1 da spec completo e rota raiz decidindo entre escolher e painel.
Teste independente: `npm run test:e2e -- escolher`.

- [x] T021 Rota raiz `/` com redirecionamento (WP05)
- [x] T022 Tela `/escolher`: cabeçalho, busca e seções (WP05)
- [x] T023 "Ver mais/Ver menos", abrir/fechar e abertura automática na busca (WP05)
- [x] T024 Seleção do concurso e estado vazio ligados (WP05)
- [x] T025 `tests/e2e/escolher.spec.ts` (WP05)

### WP06 — Painel de Estudos e tela "em breve"
**Prompt**: [tasks/WP06-painel-estudos.md](tasks/WP06-painel-estudos.md) · **Prioridade**: P1 · **Dependências**: WP03, WP04 · **Tamanho estimado**: ~420 linhas

Objetivo: Cenário 2 da spec completo.
Teste independente: `npm run test:e2e -- painel` (percorre as 12 ferramentas — SC-002).

- [x] T026 `CabecalhoPainel.svelte` (WP06)
- [x] T027 `FocoEstudo.svelte` (WP06)
- [x] T028 `GradeFerramentas.svelte` (WP06)
- [x] T029 Tela `/painel` (WP06)
- [x] T030 Tela `/ferramenta/[id]` ("em breve") (WP06)
- [x] T031 `tests/e2e/painel.spec.ts` (WP06)

Paralelo com WP05.

## Fase 4 — PWA e conferência

### WP07 — Instalável, offline e medições
**Prompt**: [tasks/WP07-pwa-offline.md](tasks/WP07-pwa-offline.md) · **Prioridade**: P2 · **Dependências**: WP05, WP06 · **Tamanho estimado**: ~360 linhas

Objetivo: Cenário 3 da spec, NFR de layout e medições de peso/Lighthouse registradas.
Teste independente: `npm run test:e2e` inteiro, com `offline.spec.ts` e `responsivo.spec.ts`.

- [ ] T032 Ícones do app e `manifest.webmanifest` (WP07)
- [ ] T033 `src/service-worker.ts` (WP07)
- [ ] T034 `tests/e2e/offline.spec.ts` (WP07)
- [ ] T035 `tests/e2e/responsivo.spec.ts` (WP07)
- [ ] T036 Medição de peso e Lighthouse registrada em `kitty-specs/.../medicoes.md` (WP07)

## Dependências

```
WP01 → WP02 → WP03 ─┬─→ WP05 ─┬─→ WP07
              └→ WP04 ┴─→ WP06 ─┘
```

WP03 ∥ WP04; WP05 ∥ WP06.

## MVP

WP01 → WP02 → WP03 → WP04 → WP05 já entrega a escolha de concurso navegável; WP06 fecha as duas telas; WP07 torna instalável e offline.
