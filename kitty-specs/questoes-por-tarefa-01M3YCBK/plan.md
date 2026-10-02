# Implementation Plan: Questões por tarefa

**Branch**: `main` (planejamento e merge) | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

## Summary
A importação leva `topico_estudo` para o post de questão (`topicoEstudo`) e para o índice (`tp`
na entrada de questão); o motor do feed ganha o filtro `topico`; a tarefa de Questões aponta para
`/?topico=<id>&tipo=questao` quando há questões ligadas.

## Technical Context
Stack do charter; sem dependência nova. Charter Check: atende (catálogo só leitura; portas
check/test/build/e2e; sem servidor). Sem violação.

## Design
- `scripts/importar/questoes.mjs`: `topicoEstudo` = `topico_estudo` se casar `^[A-Z]+-\d+$`; vazio e `sem-topico` ⇒ ausente. Relatório: questões com tópico e nº de tópicos.
- `scripts/importar/index.mjs`: entrada do índice de questão com tópico ganha `tp` (as demais não mudam); `contracts/conteudo-importado` do feed ganha `topicoEstudo` opcional em questão.
- `src/lib/feed/tipos.ts`: `EntradaIndice.tp?`, `PostQuestao.topicoEstudo?`, `Filtro.topico?`.
- `src/lib/feed/ordem.ts`: filtro `topico` (entrada sem `tp` não passa); semente inclui o tópico.
- `src/lib/feed/sessao.svelte.ts`: `chaveFiltro` inclui o tópico.
- `src/routes/+page.svelte`: lê `?topico=`; título "Questões de <id>" + quantidade; stories seguem visíveis.
- `src/routes/tarefa/[id]/+page.svelte`: na tarefa de Questões, contar no índice `t === 'q' && tp === topicoId`; > 0 ⇒ atalho `/?topico=<id>&tipo=questao` com "N questões deste tópico"; 0 ⇒ aviso e atalho da matéria.

## Project Structure
WP01: importador + motor + reimportação. WP02: telas + e2e.

## Rastreabilidade
FR-001/NFR-001/NFR-002/C-001 → WP01 (unit + contagem real). FR-002 → WP01 (unit) + WP02 (e2e). FR-003/FR-004 → WP02 (e2e).
