# Implementation Plan: Feed de Estudo CGU

**Branch**: `main` (planejamento e merge) | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)
**Input**: `kitty-specs/feed-estudo-cgu-01M3S6H8/spec.md` · **Base de código**: `main` em `0442f98`

## Summary

Três frentes:
1. **Importação** — um script Node, rodado à mão, lê o vault (catálogo de questões, leis
   secas, baralhos e a nova pasta `feed-conteudo/`) e gera o conteúdo do feed em JSON dentro de
   `static/conteudo/`, fatiado em lotes e commitado. O app nunca lê o vault.
2. **Conteúdo gerado** — resumos e flashcards escritos por agente em
   `Estudo/cgu/feed-conteudo/`, no formato de [contracts/feed-conteudo.md](contracts/feed-conteudo.md),
   com `conferido: false`.
3. **App** — o feed vira a tela inicial (stories, quatro tipos de post, curtir, salvar,
   carrossel, flashcard), com aba Salvos e painel refeito só para a CGU. A escolha de concurso e
   o código que só servia a ela saem.

## Planning answers (registro)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Stack | A do charter: SvelteKit 2 estático SPA, Svelte 5, CSS puro, service worker nativo |
| 2 | Onde ficam resumos/flashcards gerados | Vault, `Estudo/cgu/feed-conteudo/` (D7 da spec, 2026-09-30) |
| 3 | Foco | Fixo AFFC — TI — Ciência de Dados (D6) |

## Technical Context

**Language/Version**: TypeScript 5.9, Svelte 5.57, Node 24 (script de importação em `.mjs`)
**Primary Dependencies**: as do projeto; **nenhuma nova de runtime**. A importação usa só a biblioteca padrão do Node (CSV e frontmatter com parser próprio e testado) — ver R2
**Storage**: conteúdo em `static/conteudo/*.json` (gerado, commitado); interações em `localStorage` (`painel-concurso:interacoes:v1`) e foco em `painel-concurso:preferencias:v2`
**Testing**: Vitest (importação, motor do feed, interações); Playwright contra o build (cenários 1–5, offline, 360 px); medições em `medicoes.md`
**Target Platform**: celular primeiro; navegadores evergreen
**Project Type**: single
**Performance Goals**: NFR-001..NFR-005 — shell ≤ 300 KB gz; lote de posts ≤ 150 KB gz; toque ≤ 100 ms; rolagem ≥ 55 fps em 50 posts
**Constraints**: offline completo após 1ª visita (FR-017); sem CDN/fonte externa; nada da marca Instagram/Acertei (C-003)
**Scale/Scope**: ~1.930 questões, ~2.000 artigos/trechos de lei, 1ª leva de ~40 resumos e ~350 flashcards (incluindo os 140 dos baralhos existentes)

## Charter Check

Charter `.kittify/charter/charter.md` (emendado em 2026-09-30, commit `0ee332a`).

| Regra | Situação |
|---|---|
| Stack SvelteKit/Svelte 5/CSS puro/SW nativo; nenhuma dependência de runtime sem justificativa | Atende; a importação roda fora do app e também não adiciona dependência |
| Porta `check`/`test`/`build`/`test:e2e` | Atende; WPs de tela rodam e2e (2 workers, `playwright.config.ts`) |
| Metas de desempenho do charter (300 KB, 2,5 s / 1 s) | Atende; o conteúdo fica fora da carga inicial (R3) |
| Sem servidor, sem rastreamento, sem CDN | Atende |
| Sem marca/ativos de terceiros; formato de feed é inspiração | Atende (C-003); ícones próprios no `Icone.svelte` |
| Conteúdo gerado por IA com fonte e selo | Atende (FR-007, contrato `feed-conteudo.md`) |
| Fontes do vault só leitura, exceto `feed-conteudo/` | Atende (C-005); a importação abre os arquivos só para leitura |
| `localStorage` sempre em `try/catch` | Atende (`interacoes.svelte.ts`, contrato `interacoes.md`) |

Reavaliado após a Fase 1: sem violação.

## Design

### Rotas

| Rota | Antes | Depois | Requisitos |
|---|---|---|---|
| `/` | redirecionava | **Feed** (`?materia=`, `?tipo=`) | FR-002, FR-003, FR-009..FR-011, FR-015 |
| `/salvos` | — | lista de salvos | FR-012 |
| `/painel` | painel multi-concurso | painel CGU | FR-014, FR-015 |
| `/ferramenta/[id]` | "em breve" | mantém para os atalhos sem feed | FR-015 |
| `/escolher` | tela de escolha | `+page.ts` com `redirect(307, '/')` | FR-001 |

Layout raiz ganha a **barra de abas inferior** (Feed / Salvos / Painel) — o `+layout.svelte` passa a ser tocado nesta missão.

### Importação (`scripts/importar/`)

```
scripts/importar/
├── index.mjs            # CLI: node scripts/importar --vault <dir> [--saida static/conteudo]
├── csv.mjs              # parser CSV RFC 4180 (aspas, quebras de linha em campo)
├── questoes.mjs         # questoes.csv -> posts 'questao'
├── lei-seca.mjs         # leis-secas/*.md -> posts 'lei' (Art. e §/incisos; normas sem Art. por seção ##)
├── feed-conteudo.mjs    # feed-conteudo/**/*.md -> posts 'resumo' e 'flashcard'
├── baralhos.mjs         # flashcards/*.csv (Anki, sem cabeçalho) -> posts 'flashcard'
├── materias.mjs         # tabela de matérias, abreviações, ordem e mapa lei -> matéria
└── fatiar.mjs           # agrupa por matéria em lotes <= 150 KB gz; escreve indice.json
```
- Vault padrão: `process.env.PAINEL_VAULT` ou o caminho conhecido `…/00. vault/Estudo/cgu`; sem vault acessível, o script falha com mensagem clara e não apaga a saída anterior.
- Saída determinística (mesma entrada ⇒ mesmos bytes), para o diff do git mostrar só mudança real.
- Relatório no fim: contagens por tipo e matéria, descartes com motivo (anulada, sem gabarito, artigo revogado), avisos de parse.
- Script npm: `"importar": "node scripts/importar/index.mjs"` (vai no `package.json`).

### Motor do feed (`src/lib/feed/`)

- `conteudo.ts` — carrega `indice.json` (leve: id, tipo, matéria, lote) e busca lotes sob demanda com cache em memória.
- `ordem.ts` — ordem do dia: embaralhamento com semente = data local (`hojeLocal()` já existe) e intercalação por tipo (questão, lei, resumo/flashcard, …); função pura `ordemDoDia(indice, filtro, dia)`.
- `sessao.svelte.ts` — cursor por filtro, páginas de 10, conjunto de ids já mostrados na sessão (FR-010), fim de conteúdo.
- `interacoes.svelte.ts` — respostas, curtidas, salvos, vistos por dia; persistido ([contracts/interacoes.md](contracts/interacoes.md)).
- `estatisticas.ts` — respondidas, acertos, taxa, salvos (FR-014, SC-007), puras sobre as interações.

### Componentes novos (`src/lib/componentes/feed/`)

`BarraStories`, `Post` (cabeçalho + corpo por tipo + ações), `CorpoQuestao`, `CorpoLei`,
`CorpoResumo`, `CorpoFlashcard`, `Carrossel`, `AcoesPost`, `BarraAbas`, `FimDoFeed`.
Carrossel com `scroll-snap` horizontal (gesto nativo) + botões e pontos; teclado ←/→ quando
focado; `aria-roledescription="carrossel"`, telas com `aria-label="2 de 4"`.
Flashcard como `<button aria-pressed>` que alterna frente/verso.
Duplo toque para curtir via `dblclick` + `pointerup` com janela de 300 ms, sem bloquear o toque simples das respostas.
Posts com `content-visibility: auto` e `contain-intrinsic-size` para rolagem leve (NFR-002).

Direção visual: usar a skill `frontend-design` no WP de componentes do feed — identidade própria
(sem gradiente/ícones do Instagram), tokens de `app.css`, tema escuro.

### Limpeza (código que só servia à escolha de concurso)

Sai: `src/routes/escolher/+page.svelte` (vira redirect), `src/lib/busca.ts`, `src/lib/secoes.ts`,
`CampoBusca`, `CartaoConcurso`, `SecaoRecolhivel`, `EstadoVazio`, testes correspondentes,
`tests/e2e/escolher.spec.ts`. `concursos.json` fica com **um** concurso (CGU) e o validador passa
a exigir exatamente um; `preferencias` vira v2 só com `disciplina` (cargo fixo), descartando a v1.
`smoke.spec.ts` e `responsivo.spec.ts`/`offline.spec.ts` são atualizados para as rotas novas (e o
título de página volta a ser por rota — pendência da missão anterior).

### Service worker

`files` do `$service-worker` já inclui `static/**`, então `static/conteudo/*.json` entra no
pré-cache e o feed inteiro fica offline após a instalação (FR-017). Como o pré-cache agora tem
alguns MB, a instalação deixa de falhar em bloco: shell primeiro (`addAll`), conteúdo em seguida
com tolerância a falha por arquivo e nova tentativa na próxima ativação (R4).

## Project Structure

### Documentation (this feature)

```
kitty-specs/feed-estudo-cgu-01M3S6H8/
├── plan.md  research.md  data-model.md  quickstart.md
├── contracts/ (conteudo-importado.schema.json, feed-conteudo.md, interacoes.md)
└── tasks.md   # /spec-kitty.tasks
```

### Source Code (repository root)

```
scripts/importar/*.mjs                         # novo
static/conteudo/{indice.json, materias.json, lote-*.json}   # gerado e commitado
src/lib/feed/{conteudo,ordem,estatisticas}.ts, {sessao,interacoes}.svelte.ts   # novo
src/lib/componentes/feed/*.svelte              # novo
src/lib/componentes/{CabecalhoPainel,FocoEstudo,GradeFerramentas}.svelte        # alterado
src/lib/dados/*                                # reduzido a CGU
src/lib/preferencias.svelte.ts                 # v2
src/routes/+layout.svelte                      # barra de abas
src/routes/+page.svelte                        # feed
src/routes/salvos/+page.svelte                 # novo
src/routes/escolher/+page.ts                   # redirect
src/routes/painel/+page.svelte                 # alterado
src/service-worker.ts                          # pré-cache em duas fases
tests/unit/importar/*.test.ts, tests/unit/feed/*.test.ts
tests/e2e/{feed,salvos,painel,offline,responsivo,smoke}.spec.ts
```
Fora do repositório (escrito pelo WP de geração): `…/Estudo/cgu/feed-conteudo/{resumos,flashcards}/*.md`.

**Structure Decision**: projeto único; importação em `scripts/` porque roda no computador da dona e não no app.

## Rastreabilidade

| Requisito | Onde | Verificação |
|---|---|---|
| FR-001 | limpeza, `escolher/+page.ts` | e2e `/escolher` → `/` |
| FR-002, FR-003 | `+page.svelte`, `Post`, `BarraAbas` | e2e feed |
| FR-004, NFR-008 | `questoes.mjs` | unit (descartes, gabarito = catálogo, etiqueta) |
| FR-005 | `CorpoQuestao`, `interacoes` | e2e responder C/E e ME |
| FR-006 | `lei-seca.mjs`, `CorpoLei`, `Carrossel` | unit (parse de Art./§/incisos, revogados) + e2e |
| FR-007, C-004 | `feed-conteudo.mjs`, `CorpoResumo`, `CorpoFlashcard`, WP de geração | unit (selo, fonte obrigatória) + e2e selo |
| FR-008 | `Carrossel` | e2e deslizar/setas/pontos/teclado |
| FR-009 | `BarraStories`, `ordem.ts` | unit + e2e filtro e anel visto |
| FR-010, FR-011, SC-002 | `sessao`, `ordem.ts` | unit (sem repetição em N páginas; mesma ordem no dia; muda no dia seguinte) |
| FR-012, FR-013, SC-004 | `interacoes`, `/salvos` | unit + e2e recarregar |
| FR-014, FR-015, SC-007 | painel, `estatisticas.ts` | unit + e2e |
| FR-016, SC-003 | `scripts/importar` | unit + contagem do relatório = índice |
| FR-017, SC-005 | `service-worker.ts` | e2e offline |
| NFR-001..007 | todo o app | `medicoes.md` + `responsivo.spec.ts` |

## Complexity Tracking

Sem violações a justificar.
