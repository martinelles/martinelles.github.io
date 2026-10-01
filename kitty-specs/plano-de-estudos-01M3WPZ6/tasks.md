# Tasks: Plano de Estudos

**Missão**: `plano-de-estudos-01M3WPZ6` · planejamento e merge em `main`
**Charter**: porta `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` antes da revisão.

> **Nota ao orquestrador**: a lane de um WP dependente não herda o código das dependências; mesclar as lanes aprovadas na lane do WP antes de despachar e rodar `npm ci`.

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | `plano.mjs`: ler `ESTUDO.csv`, filtrar, ordenar, mapear disciplina → matéria | WP01 | | [D] |
| T002 | Parâmetros de `feed-conteudo/plano.md` com padrão D2 | WP01 | [D] |
| T003 | Ligar no `index.mjs`, relatório e determinismo | WP01 | | [D] |
| T004 | Testes do importador do plano | WP01 | | [D] |
| T005 | Gerar e commitar `static/conteudo/plano.json`; criar `feed-conteudo/plano.md` | WP01 | | [D] |
| T006 | Tipos e carga do plano | WP02 | | [D] |
| T007 | `missao.ts`, `dias.ts`, `horas.ts` | WP02 | [D] |
| T008 | `registro.svelte.ts` com cronômetro por timestamps e fotos | WP02 | | [D] |
| T009 | `exportar.ts` | WP02 | [D] |
| T010 | Testes do motor | WP02 | | [D] |
| T011 | `ResumoPlano` e `MissaoDoDia` no painel + exportar | WP03 | | [D] |
| T012 | Tela `/tarefa/[id]` com `Cronometro` e conclusão | WP03 | | [D] |
| T013 | `ChamadaMissao` no feed | WP03 | [D] |
| T014 | e2e `plano.spec.ts` (cenários 1–4) e ajustes de painel/feed/responsivo | WP03 | | [D] |
| T015 | Medições curtas em `medicoes.md` | WP03 | | [D] |

## WP01 — Importação do plano
**Prompt**: [tasks/WP01-importacao-plano.md](tasks/WP01-importacao-plano.md) · P1 · Dependências: nenhuma

- [x] T001 `plano.mjs`: ler `ESTUDO.csv`, filtrar, ordenar, mapear disciplina → matéria (WP01)
- [x] T002 Parâmetros de `feed-conteudo/plano.md` com padrão D2 (WP01)
- [x] T003 Ligar no `index.mjs`, relatório e determinismo (WP01)
- [x] T004 Testes do importador do plano (WP01)
- [x] T005 Gerar e commitar `static/conteudo/plano.json`; criar `feed-conteudo/plano.md` (WP01)

## WP02 — Motor do plano
**Prompt**: [tasks/WP02-motor-plano.md](tasks/WP02-motor-plano.md) · P1 · Dependências: nenhuma

- [x] T006 Tipos e carga do plano (WP02)
- [x] T007 `missao.ts`, `dias.ts`, `horas.ts` (WP02)
- [x] T008 `registro.svelte.ts` com cronômetro por timestamps e fotos (WP02)
- [x] T009 `exportar.ts` (WP02)
- [x] T010 Testes do motor (WP02)

## WP03 — Telas do plano e da missão
**Prompt**: [tasks/WP03-telas-plano.md](tasks/WP03-telas-plano.md) · P1 · Dependências: WP01, WP02

- [x] T011 `ResumoPlano` e `MissaoDoDia` no painel + exportar (WP03)
- [x] T012 Tela `/tarefa/[id]` com `Cronometro` e conclusão (WP03)
- [x] T013 `ChamadaMissao` no feed (WP03)
- [x] T014 e2e `plano.spec.ts` (cenários 1–4) e ajustes de painel/feed/responsivo (WP03)
- [x] T015 Medições curtas em `medicoes.md` (WP03)

## Dependências

```
WP01 ─┐
WP02 ─┴─▶ WP03
```

## Emenda D4 (2026-10-02) — tarefas Leitura/Questões e bloco

Os três WPs voltam para `planned` com pedido de mudança (não é defeito: é mudança de escopo aprovada pela dona antes do merge).

- [ ] T016 WP01: gerar `:L`/`:Q` por tópico, `topicoId`, `modo`, `bloco` (tabela por disciplina), `minutos_leitura`/`minutos_questoes` em `feed-conteudo/plano.md` (padrão 25/20); reimportar (WP01)
- [ ] T017 WP02: tipos, missão (4 tópicos = 8 tarefas em 3 h), registro só aceita questões em `:Q`, exportação agregada por tópico (FR-015) (WP02)
- [ ] T018 WP03: mostrar modo e bloco, atalho por modo (FR-014), conclusão com questões só em `:Q`, e2e atualizados (WP03)
