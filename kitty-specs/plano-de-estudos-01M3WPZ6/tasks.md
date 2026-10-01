# Tasks: Plano de Estudos

**Missão**: `plano-de-estudos-01M3WPZ6` · planejamento e merge em `main`
**Charter**: porta `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` antes da revisão.

> **Nota ao orquestrador**: a lane de um WP dependente não herda o código das dependências; mesclar as lanes aprovadas na lane do WP antes de despachar e rodar `npm ci`.

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | `plano.mjs`: ler `ESTUDO.csv`, filtrar, ordenar, mapear disciplina → matéria | WP01 | |
| T002 | Parâmetros de `feed-conteudo/plano.md` com padrão D2 | WP01 | [P] |
| T003 | Ligar no `index.mjs`, relatório e determinismo | WP01 | |
| T004 | Testes do importador do plano | WP01 | |
| T005 | Gerar e commitar `static/conteudo/plano.json`; criar `feed-conteudo/plano.md` | WP01 | |
| T006 | Tipos e carga do plano | WP02 | |
| T007 | `missao.ts`, `dias.ts`, `horas.ts` | WP02 | [P] |
| T008 | `registro.svelte.ts` com cronômetro por timestamps e fotos | WP02 | |
| T009 | `exportar.ts` | WP02 | [P] |
| T010 | Testes do motor | WP02 | |
| T011 | `ResumoPlano` e `MissaoDoDia` no painel + exportar | WP03 | |
| T012 | Tela `/tarefa/[id]` com `Cronometro` e conclusão | WP03 | |
| T013 | `ChamadaMissao` no feed | WP03 | [P] |
| T014 | e2e `plano.spec.ts` (cenários 1–4) e ajustes de painel/feed/responsivo | WP03 | |
| T015 | Medições curtas em `medicoes.md` | WP03 | |

## WP01 — Importação do plano
**Prompt**: [tasks/WP01-importacao-plano.md](tasks/WP01-importacao-plano.md) · P1 · Dependências: nenhuma

- [ ] T001 `plano.mjs`: ler `ESTUDO.csv`, filtrar, ordenar, mapear disciplina → matéria (WP01)
- [ ] T002 Parâmetros de `feed-conteudo/plano.md` com padrão D2 (WP01)
- [ ] T003 Ligar no `index.mjs`, relatório e determinismo (WP01)
- [ ] T004 Testes do importador do plano (WP01)
- [ ] T005 Gerar e commitar `static/conteudo/plano.json`; criar `feed-conteudo/plano.md` (WP01)

## WP02 — Motor do plano
**Prompt**: [tasks/WP02-motor-plano.md](tasks/WP02-motor-plano.md) · P1 · Dependências: nenhuma

- [ ] T006 Tipos e carga do plano (WP02)
- [ ] T007 `missao.ts`, `dias.ts`, `horas.ts` (WP02)
- [ ] T008 `registro.svelte.ts` com cronômetro por timestamps e fotos (WP02)
- [ ] T009 `exportar.ts` (WP02)
- [ ] T010 Testes do motor (WP02)

## WP03 — Telas do plano e da missão
**Prompt**: [tasks/WP03-telas-plano.md](tasks/WP03-telas-plano.md) · P1 · Dependências: WP01, WP02

- [ ] T011 `ResumoPlano` e `MissaoDoDia` no painel + exportar (WP03)
- [ ] T012 Tela `/tarefa/[id]` com `Cronometro` e conclusão (WP03)
- [ ] T013 `ChamadaMissao` no feed (WP03)
- [ ] T014 e2e `plano.spec.ts` (cenários 1–4) e ajustes de painel/feed/responsivo (WP03)
- [ ] T015 Medições curtas em `medicoes.md` (WP03)

## Dependências

```
WP01 ─┐
WP02 ─┴─▶ WP03
```
