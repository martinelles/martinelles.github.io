# Implementation Plan: Plano de Estudos

**Branch**: `main` (planejamento e merge) | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)
**Base de código**: `main` em `296008b` (feed + identidade visual mesclados)

## Summary

1. **Importação**: um módulo novo do importador lê `ESTUDO.csv` (e um arquivo de parâmetros
   opcional no vault) e escreve `static/conteudo/plano.json` com a fila de tarefas e a janela do plano.
2. **Motor do plano** (`src/lib/plano/`): funções puras para missão do dia, contagem de dias,
   horas e porcentagem; registro de estudo persistido com cronômetro que sobrevive a fechar o app;
   exportação em CSV.
3. **Telas**: seção "Plano" e "Missão do dia" no painel, tela de tarefa com cronômetro
   (`/tarefa/[id]`), chamada curta da missão no topo do feed, botão de exportar.

## Planning answers (registro)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Onde mora o progresso | No app, exportável (D1) |
| 2 | Janela | 01/10–20/12/2026, 3 h/dia (D2) |
| 3 | Stack/visual | A do charter; temas Aventura/Kindle/Kindle escuro já existentes |

## Technical Context

**Language/Version**: TypeScript 5.9, Svelte 5.57, Node 24 (importador `.mjs`)
**Primary Dependencies**: as do projeto; nenhuma nova
**Storage**: `static/conteudo/plano.json` (gerado e commitado); `localStorage` `painel-concurso:plano:v1` (registros) — ver [contracts/registro.md](contracts/registro.md)
**Testing**: Vitest (importador do plano, motor), Playwright (cenários 1–4, relógio fixo com `page.clock`)
**Target Platform**: o PWA atual (GitHub Pages)
**Project Type**: single
**Performance Goals**: NFR-001 painel ≤ 1 s em visita repetida; NFR-005 `plano.json` ≤ 50 KB gz
**Constraints**: C-001..C-004; cronômetro por timestamps (não por `setInterval` acumulado)
**Scale/Scope**: ~236 tarefas, 81 dias, 4 tarefas/dia

## Charter Check

Charter `.kittify/charter/charter.md`. Stack e dependências: atende (nada novo). Portas
check/test/build/e2e: atende. Sem servidor/rastreamento: atende. Conteúdo do vault só leitura,
exceto `feed-conteudo/`: atende — o arquivo de parâmetros opcional `feed-conteudo/plano.md` é a
única escrita, e ela é feita pela dona (o WP só documenta o formato e cria o arquivo com os
valores de D2). `localStorage` em `try/catch`: atende. Sem violação.

## Design

### `plano.json`

Ver [contracts/plano.schema.json](contracts/plano.schema.json) e [data-model.md](data-model.md).
Parâmetros: `feed-conteudo/plano.md` (frontmatter `inicio`, `fim`, `horas_por_dia`,
`minutos_por_tarefa`); sem o arquivo, padrão de D2 (2026-10-01, 2026-12-20, 3, 45).
Fila: linhas do `ESTUDO.csv` com `status` ≠ `dominado` e `obs` sem prefixo `CORTADO`, ordenadas
por `prioridade` desc (coluna derivada já calculada pelo gerador dela; empate pelo `id`).
`materia` da tarefa: tabela `DISCIPLINA_PARA_MATERIA` (13 disciplinas do `ESTUDO.csv` → ids de
matéria do feed; "Bancos de Dados" → `ti-ciencia-de-dados`, "Controladoria-Geral da União…" →
`cgu-correicao-integridade-e-leniencia`, etc.); disciplina sem mapa ⇒ `null` e aviso.

### Motor (`src/lib/plano/`)

- `tipos.ts`, `carregar.ts` (busca `/conteudo/plano.json` via o mesmo padrão do repositório).
- `missao.ts` (puro): `missaoDoDia(plano, registros, dia)` = tarefas da foto do dia, se existir; senão, as próximas pendentes da fila que somam ≤ `horasPorDia`·60 min (mínimo 1).
- `dias.ts` (puro): `contarDias(plano, fotos, registros, hoje)` → `{ noPlano, concluidos, emAberto, restantes }` com a identidade concluídos + em aberto + restantes = no plano; antes do início ⇒ tudo restante; depois do fim ⇒ restantes 0.
- `horas.ts` (puro): horas totais = dias × horas/dia; horas estudadas = soma dos intervalos (registros) + trecho corrente.
- `registro.svelte.ts`: estado persistido — registros por tarefa (`intervalos[]`, `rodandoDesde`, `concluidaEm`, `questoes`, `certas`, `dia`) e **fotos** de missão por dia (`{ [dia]: ids[] }`, gravada na primeira vez que a missão do dia é calculada). Cronômetro: `iniciar`, `pausar`, `retomar`, `concluir`; tempo = soma(intervalos) + (agora − rodandoDesde).
- `exportar.ts` (puro): CSV `id,ultima_sessao,minutos,questoes_feitas,questoes_certas,status_sugerido` (uma linha por tarefa concluída; `status_sugerido = estudado`), separador vírgula, UTF-8 com BOM.

### Telas

- `src/lib/componentes/plano/`: `ResumoPlano` (horas, %, barra `<progress>` com rótulo, 4 números de dias), `MissaoDoDia` (lista, nº tarefas, tempo estimado, % feita, botão "Iniciar estudos"), `Cronometro`, `ChamadaMissao` (versão curta para o feed).
- `/painel`: insere `ResumoPlano` + `MissaoDoDia` no topo; botão "Exportar progresso".
- `/tarefa/[id]`: tópico, disciplina, o que fazer, cronômetro (iniciar/pausar/retomar), atalho "Questões e lei seca desta matéria" → `/?materia=…`, "Concluir tarefa" com campos opcionais de questões feitas/certas; volta à missão.
- `/` (feed): `ChamadaMissao` acima dos stories ("Missão de hoje: 3 de 4 tarefas · Iniciar").
- Visual: tokens dos três temas existentes; sem cores novas fora dos tokens.

## Project Structure

```
scripts/importar/plano.mjs (+ chamada em index.mjs)        # WP01
tests/unit/importar/plano.test.ts (+ fixtures)             # WP01
static/conteudo/plano.json                                 # WP01 (gerado)
src/lib/plano/*                                            # WP02
tests/unit/plano/*                                         # WP02
src/lib/componentes/plano/*                                # WP03
src/routes/painel/+page.svelte, src/routes/+page.svelte    # WP03
src/routes/tarefa/**                                       # WP03
tests/e2e/plano.spec.ts, tests/e2e/painel.spec.ts          # WP03
```

## Rastreabilidade

| Requisito | Onde | Verificação |
|---|---|---|
| FR-001, NFR-005, C-004 | `plano.mjs` | unit + tamanho |
| FR-002..FR-006, C-003 | `missao.ts`, `dias.ts`, `horas.ts` | unit (relógio fixo, identidade dos dias) |
| FR-007, FR-010, NFR-002 | `registro.svelte.ts`, `Cronometro` | unit (timestamps) + e2e (fechar e reabrir) |
| FR-008, FR-009, FR-012 | `/tarefa/[id]`, feed | e2e |
| FR-011 | `exportar.ts` | unit + e2e (download) |
| NFR-003, NFR-004 | componentes | e2e responsivo + leitor (roles/labels) |

## Complexity Tracking

Sem violações.
