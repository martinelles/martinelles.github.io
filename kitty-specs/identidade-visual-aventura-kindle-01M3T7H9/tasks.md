# Tasks: Identidade Visual Aventura e Kindle

**Missão**: `identidade-visual-aventura-kindle-01M3T7H9` · **Branch**: planejamento em `main`, merge em `main`
**Entrada**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/tema.md](contracts/tema.md), [quickstart.md](quickstart.md)
**Charter**: antes de cada revisão, passar por `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` (2 workers). Todo WP desta missão mexe em tela ou CSS, então todos rodam o e2e.
**Referência visual**: nota do vault `Recursos/Design/Paleta — Doodles (Hora de Aventura).md` e skill `frontend-design`.

> **Nota ao orquestrador**: nesta versão do Spec Kitty, a lane de um WP dependente **não** herda o código das lanes de que ele depende. Antes de despachar um WP com dependências, mescle na lane dele as branches das lanes das dependências já aprovadas e rode `npm ci`.

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | Script de corte de fontes e os `.woff2` em `static/fontes/` | WP01 | | [D] |
| T002 | `@font-face` e tokens comuns (fontes, medida de leitura) | WP01 | | [D] |
| T003 | Blocos de tokens por `[data-tema]`; saem o `@media dark` e os tokens mortos | WP01 | | [D] |
| T004 | Textura de papel (`--textura` e `body::before`) e `@media print` | WP01 | [D] |
| T005 | Regra de movimento dos temas Kindle | WP01 | [D] |
| T006 | Script inline de tema, `theme-color`, preload e manifesto | WP01 | | [D] |
| T007 | `contraste.test.ts` lendo `app.css` | WP01 | | [D] |
| T008 | Store `tema.svelte.ts` | WP02 | | [D] |
| T009 | `tema.test.ts` | WP02 | | [D] |
| T010 | `carregarTema()` no layout raiz | WP02 | | [D] |
| T011 | `SeletorTema.svelte` com prévia | WP02 | | [D] |
| T012 | Seletor no painel | WP02 | | [D] |
| T013 | `Post` e `AcoesPost`: cartão com contorno e sombra dura | WP03 | |
| T014 | `CorpoQuestao`: opções e estados de acerto e erro nos 3 temas | WP03 | [P] |
| T015 | `CorpoLei`, `CorpoResumo`, `CorpoFlashcard`: coluna de leitura e contorno | WP03 | [P] |
| T016 | `Carrossel`, `BarraStories`, `FimDoFeed` | WP03 | [P] |
| T017 | `BarraAbas` | WP03 | [P] |
| T018 | Varredura C-004 nos componentes do feed | WP03 | |
| T019 | Tela do feed (`/`): lista de cartões e esqueleto sem loop | WP04 | |
| T020 | Tela `/salvos` | WP04 | [P] |
| T021 | `CabecalhoPainel` sem rótulo em caixa-alta, com título na fonte do tema | WP04 | [P] |
| T022 | `FocoEstudo`, `ProgressoEstudo`, `GradeFerramentas` | WP04 | [P] |
| T023 | `/ferramenta/[id]` e página de erro | WP04 | [P] |
| T024 | Varredura C-004 nas telas | WP04 | |
| T025 | e2e: tema padrão, troca, persistência, posição de rolagem, sem clarão | WP05 | |
| T026 | e2e: sem cor fora dos tokens; Kindle sem movimento e em escala de cinza | WP05 | |
| T027 | e2e: responsivo nos 3 temas, a 360 px e com zoom de 200% | WP05 | [P] |
| T028 | e2e: offline com fontes e textura | WP05 | [P] |
| T029 | Medições (NFR-002 a NFR-005) e capturas para SC-005 em `medicoes.md` | WP05 | |
| T030 | Emenda do charter (tema escuro) | WP05 | |

## Fase 1 — Fundação

### WP01 — Tokens, fontes e tema antes da pintura
**Prompt**: [tasks/WP01-fundacao-tokens-fontes.md](tasks/WP01-fundacao-tokens-fontes.md) · **Prioridade**: P1 (MVP) · **Dependências**: nenhuma · ~430 linhas

Objetivo: `app.css` com os 3 temas completos do contrato, fontes empacotadas, textura de papel, regra de movimento, e `app.html` aplicando o tema antes da primeira pintura. Teste independente: `document.documentElement.dataset.tema = 'kindle'` no console repinta o app todo; `contraste.test.ts` passa.

- [x] T001 Script de corte de fontes e os `.woff2` em `static/fontes/` (WP01)
- [x] T002 `@font-face` e tokens comuns (fontes, medida de leitura) (WP01)
- [x] T003 Blocos de tokens por `[data-tema]`; saem o `@media dark` e os tokens mortos (WP01)
- [x] T004 Textura de papel (`--textura` e `body::before`) e `@media print` (WP01)
- [x] T005 Regra de movimento dos temas Kindle (WP01)
- [x] T006 Script inline de tema, `theme-color`, preload e manifesto (WP01)
- [x] T007 `contraste.test.ts` lendo `app.css` (WP01)

Sequência: T001, T002, T003, então T004 e T005 em paralelo, e depois T006 e T007. Riscos: textura pesando na rolagem (research D4); variável de fonte mal instanciada. Paralelo: nenhum WP roda antes deste.

## Fase 2 — Aplicação (paralelos entre si, todos dependem do WP01)

### WP02 — Store de tema e seletor
**Prompt**: [tasks/WP02-store-seletor-tema.md](tasks/WP02-store-seletor-tema.md) · **Prioridade**: P1 · **Dependências**: WP01 · ~380 linhas

Objetivo: a pessoa escolhe entre Aventura, Kindle, Kindle escuro e Seguir o aparelho no painel; a escolha persiste e o modo "sistema" acompanha o aparelho ao vivo. Teste independente: `tema.test.ts` e a troca manual no `/painel`.

- [x] T008 Store `tema.svelte.ts` (WP02)
- [x] T009 `tema.test.ts` (WP02)
- [x] T010 `carregarTema()` no layout raiz (WP02)
- [x] T011 `SeletorTema.svelte` com prévia (WP02)
- [x] T012 Seletor no painel (WP02)

### WP03 — Componentes do feed no novo visual
**Prompt**: [tasks/WP03-componentes-feed-visual.md](tasks/WP03-componentes-feed-visual.md) · **Prioridade**: P1 · **Dependências**: WP01 · ~460 linhas

Objetivo: os componentes em `src/lib/componentes/feed/` usam contorno por `--linha-peso`, sombra dura, divisor fino, coluna de leitura e fonte de título, sem nenhuma cor fixa. Teste independente: o feed em `/` nos 3 temas (trocando `data-tema` no console) fica igual às capturas de referência do quickstart.

- [ ] T013 `Post` e `AcoesPost`: cartão com contorno e sombra dura (WP03)
- [ ] T014 `CorpoQuestao`: opções e estados de acerto e erro nos 3 temas (WP03)
- [ ] T015 `CorpoLei`, `CorpoResumo`, `CorpoFlashcard`: coluna de leitura e contorno (WP03)
- [ ] T016 `Carrossel`, `BarraStories`, `FimDoFeed` (WP03)
- [ ] T017 `BarraAbas` (WP03)
- [ ] T018 Varredura C-004 nos componentes do feed (WP03)

### WP04 — Telas e painel no novo visual
**Prompt**: [tasks/WP04-telas-painel-visual.md](tasks/WP04-telas-painel-visual.md) · **Prioridade**: P2 · **Dependências**: WP01 · ~400 linhas

Objetivo: as rotas e os componentes do painel seguem o mesmo sistema (cartões espaçados no feed, nenhum `overflow: hidden` cortando sombra, e sem animação infinita). Teste independente: `/`, `/salvos`, `/painel` e `/ferramenta/x` nos 3 temas.

- [ ] T019 Tela do feed (`/`): lista de cartões e esqueleto sem loop (WP04)
- [ ] T020 Tela `/salvos` (WP04)
- [ ] T021 `CabecalhoPainel` sem rótulo em caixa-alta, com título na fonte do tema (WP04)
- [ ] T022 `FocoEstudo`, `ProgressoEstudo`, `GradeFerramentas` (WP04)
- [ ] T023 `/ferramenta/[id]` e página de erro (WP04)
- [ ] T024 Varredura C-004 nas telas (WP04)

## Fase 3 — Aceite

### WP05 — Testes de aceite, medições e charter
**Prompt**: [tasks/WP05-aceite-medicoes.md](tasks/WP05-aceite-medicoes.md) · **Prioridade**: P1 · **Dependências**: WP02, WP03, WP04 · ~420 linhas

Objetivo: os cenários 1 a 5 da spec automatizados, as NFR medidas e registradas, as capturas para a dona aprovar (SC-005) e a emenda do charter pronta.

- [ ] T025 e2e: tema padrão, troca, persistência, posição de rolagem, sem clarão (WP05)
- [ ] T026 e2e: sem cor fora dos tokens; Kindle sem movimento e em escala de cinza (WP05)
- [ ] T027 e2e: responsivo nos 3 temas, a 360 px e com zoom de 200% (WP05)
- [ ] T028 e2e: offline com fontes e textura (WP05)
- [ ] T029 Medições (NFR-002 a NFR-005) e capturas para SC-005 em `medicoes.md` (WP05)
- [ ] T030 Emenda do charter (tema escuro) (WP05)

## Dependências e paralelismo

```
WP01 ──┬── WP02 ──┐
       ├── WP03 ──┼── WP05
       └── WP04 ──┘
```

WP02, WP03 e WP04 têm arquivos disjuntos e rodam em paralelo depois do WP01. O **MVP** é o WP01: sozinho, ele já troca a cara do app inteiro para o Aventura, e para o Kindle escuro nos aparelhos em modo escuro.

## Posse de arquivos

| WP | Arquivos |
|---|---|
| WP01 | `src/app.css`, `src/app.html`, `static/manifest.webmanifest`, `static/fontes/**`, `static/papel/**`, `scripts/fontes/**`, `tests/unit/contraste.test.ts`, `.gitignore` |
| WP02 | `src/lib/tema.svelte.ts`, `src/lib/componentes/SeletorTema.svelte`, `src/routes/+layout.svelte`, `src/routes/painel/+page.svelte`, `tests/unit/tema.test.ts` |
| WP03 | `src/lib/componentes/feed/**` |
| WP04 | `src/routes/+page.svelte`, `src/routes/salvos/**`, `src/routes/ferramenta/**`, `src/lib/componentes/CabecalhoPainel.svelte`, `src/lib/componentes/FocoEstudo.svelte`, `src/lib/componentes/ProgressoEstudo.svelte`, `src/lib/componentes/GradeFerramentas.svelte` |
| WP05 | `tests/e2e/tema.spec.ts`, `tests/e2e/responsivo.spec.ts`, `tests/e2e/offline-conteudo.spec.ts`, `kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/medicoes.md`, `.kittify/charter/**` |
