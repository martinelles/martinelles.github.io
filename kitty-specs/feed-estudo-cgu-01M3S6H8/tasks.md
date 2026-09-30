# Tasks: Feed de Estudo CGU

**Missão**: `feed-estudo-cgu-01M3S6H8` · **Branch**: planejamento em `main`, merge em `main`
**Entrada**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)
**Charter**: porta `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` (2 workers) antes de cada revisão.

> **Nota ao orquestrador**: nesta versão do Spec Kitty a lane de um WP dependente **não** herda o código das lanes de que depende. Antes de despachar um WP com dependências, mesclar na lane dele as branches das lanes das dependências (já aprovadas) e rodar `npm ci`.

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | Parser CSV e frontmatter, com testes | WP01 | |
| T002 | Tabela de matérias e mapa lei → matéria | WP01 | [P] |
| T003 | Importador de questões | WP01 | [P] |
| T004 | Importador de lei seca (Art., carrossel, revogados, normas sem Art.) | WP01 | [P] |
| T005 | Importador de feed-conteudo e baralhos CSV | WP01 | [P] |
| T006 | Fatiamento, índice, relatório e CLI `npm run importar` | WP01 | |
| T007 | Pasta `feed-conteudo/` com LEIA-ME | WP02 | |
| T008 | Resumos e flashcards de TI: Ciência de Dados | WP02 | |
| T009 | Resumos e flashcards de Segurança e Governança/Contratações de TI | WP02 | [P] |
| T010 | Resumos e flashcards de LGPD, LAI e Auditoria (a partir da lei seca) | WP02 | [P] |
| T011 | Rodar a importação, conferir relatório e commitar `static/conteudo/` | WP02 | |
| T012 | Carga do conteúdo (índice + lotes sob demanda) | WP03 | | [D] |
| T013 | Ordem do dia (semente por data, intercalação por tipo) | WP03 | [D] |
| T014 | Sessão do feed (páginas, sem repetição, fim) | WP03 | | [D] |
| T015 | Interações persistidas | WP03 | [D] |
| T016 | Foco (disciplina) v2 e estatísticas | WP03 | [D] |
| T017 | Testes de unidade do motor | WP03 | | [D] |
| T018 | Ícones novos no `Icone` | WP04 | |
| T019 | `Post` e `AcoesPost` (curtir, duplo toque, salvar) | WP04 | |
| T020 | `CorpoQuestao` (C/E e múltipla escolha) | WP04 | [P] |
| T021 | `Carrossel` | WP04 | [P] |
| T022 | `CorpoLei`, `CorpoResumo`, `CorpoFlashcard` | WP04 | |
| T023 | `BarraStories`, `BarraAbas`, `FimDoFeed` | WP04 | [P] |
| T024 | Direção visual do feed (skill frontend-design) aplicada aos componentes | WP04 | |
| T025 | Layout com barra de abas | WP05 | |
| T026 | Tela do feed em `/` (stories, filtros `?materia`/`?tipo`, rolagem infinita, vistos) | WP05 | |
| T027 | Tela `/salvos` | WP05 | [P] |
| T028 | `/escolher` → `/` e remoção do código de escolha de concurso | WP05 | |
| T029 | Dados só CGU e foco fixo | WP05 | |
| T030 | Painel CGU com estatísticas e atalhos para o feed | WP05 | |
| T031 | e2e do feed e dos salvos | WP05 | |
| T032 | e2e do painel e atualização de smoke/offline/responsivo | WP05 | |
| T033 | Service worker com pré-cache em duas fases | WP06 | |
| T034 | e2e de conteúdo offline | WP06 | |
| T035 | Medições (peso, Lighthouse, fps) em `medicoes.md` | WP06 | |

## Fase 1 — Conteúdo e motor (paralelos)

### WP01 — Importação do vault
**Prompt**: [tasks/WP01-importacao-vault.md](tasks/WP01-importacao-vault.md) · **Prioridade**: P1 · **Dependências**: nenhuma · ~420 linhas

- [ ] T001 Parser CSV e frontmatter, com testes (WP01)
- [ ] T002 Tabela de matérias e mapa lei → matéria (WP01)
- [ ] T003 Importador de questões (WP01)
- [ ] T004 Importador de lei seca (Art., carrossel, revogados, normas sem Art.) (WP01)
- [ ] T005 Importador de feed-conteudo e baralhos CSV (WP01)
- [ ] T006 Fatiamento, índice, relatório e CLI `npm run importar` (WP01)

Teste independente: `npm test -- importar` com fixtures; rodar contra o vault real sem commitar a saída.

### WP03 — Motor do feed
**Prompt**: [tasks/WP03-motor-feed.md](tasks/WP03-motor-feed.md) · **Prioridade**: P1 · **Dependências**: nenhuma · ~400 linhas

- [x] T012 Carga do conteúdo (índice + lotes sob demanda) (WP03)
- [x] T013 Ordem do dia (semente por data, intercalação por tipo) (WP03)
- [x] T014 Sessão do feed (páginas, sem repetição, fim) (WP03)
- [x] T015 Interações persistidas (WP03)
- [x] T016 Foco (disciplina) v2 e estatísticas (WP03)
- [x] T017 Testes de unidade do motor (WP03)

Paralelo a WP01.

## Fase 2

### WP02 — Conteúdo gerado e primeira importação
**Prompt**: [tasks/WP02-conteudo-gerado.md](tasks/WP02-conteudo-gerado.md) · **Prioridade**: P1 · **Dependências**: WP01 · ~330 linhas

- [ ] T007 Pasta `feed-conteudo/` com LEIA-ME (WP02)
- [ ] T008 Resumos e flashcards de TI: Ciência de Dados (WP02)
- [ ] T009 Resumos e flashcards de Segurança e Governança/Contratações de TI (WP02)
- [ ] T010 Resumos e flashcards de LGPD, LAI e Auditoria (a partir da lei seca) (WP02)
- [ ] T011 Rodar a importação, conferir relatório e commitar `static/conteudo/` (WP02)

### WP04 — Componentes do feed
**Prompt**: [tasks/WP04-componentes-feed.md](tasks/WP04-componentes-feed.md) · **Prioridade**: P1 · **Dependências**: WP03 · ~450 linhas

- [ ] T018 Ícones novos no `Icone` (WP04)
- [ ] T019 `Post` e `AcoesPost` (curtir, duplo toque, salvar) (WP04)
- [ ] T020 `CorpoQuestao` (C/E e múltipla escolha) (WP04)
- [ ] T021 `Carrossel` (WP04)
- [ ] T022 `CorpoLei`, `CorpoResumo`, `CorpoFlashcard` (WP04)
- [ ] T023 `BarraStories`, `BarraAbas`, `FimDoFeed` (WP04)
- [ ] T024 Direção visual do feed (skill frontend-design) aplicada aos componentes (WP04)

WP02 ∥ WP04.

## Fase 3

### WP05 — Rotas, navegação e painel CGU
**Prompt**: [tasks/WP05-rotas-painel-cgu.md](tasks/WP05-rotas-painel-cgu.md) · **Prioridade**: P1 · **Dependências**: WP02, WP03, WP04 · ~520 linhas

- [ ] T025 Layout com barra de abas (WP05)
- [ ] T026 Tela do feed em `/` (WP05)
- [ ] T027 Tela `/salvos` (WP05)
- [ ] T028 `/escolher` → `/` e remoção do código de escolha de concurso (WP05)
- [ ] T029 Dados só CGU e foco fixo (WP05)
- [ ] T030 Painel CGU com estatísticas e atalhos para o feed (WP05)
- [ ] T031 e2e do feed e dos salvos (WP05)
- [ ] T032 e2e do painel e atualização de smoke/offline/responsivo (WP05)

## Fase 4

### WP06 — Conteúdo offline e medições
**Prompt**: [tasks/WP06-offline-medicoes.md](tasks/WP06-offline-medicoes.md) · **Prioridade**: P2 · **Dependências**: WP05 · ~250 linhas

- [ ] T033 Service worker com pré-cache em duas fases (WP06)
- [ ] T034 e2e de conteúdo offline (WP06)
- [ ] T035 Medições (peso, Lighthouse, fps) em `medicoes.md` (WP06)

## Dependências

```
WP01 ──▶ WP02 ──┐
WP03 ──▶ WP04 ──┼──▶ WP05 ──▶ WP06
WP03 ───────────┘
```

## MVP

WP01 + WP03 → WP02 + WP04 → WP05 entrega o feed navegável com conteúdo real; WP06 fecha offline e medições.
