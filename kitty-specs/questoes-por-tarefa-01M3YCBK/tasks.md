# Tasks: Questões por tarefa

> Nota ao orquestrador: mesclar a lane do WP01 aprovado na lane do WP02 antes de despachar.

## Subtask Index
| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | `topicoEstudo` no post de questão e relatório | WP01 | |
| T002 | `tp` no índice | WP01 | |
| T003 | Filtro `topico` em tipos/ordem/sessão | WP01 | [P] |
| T004 | Testes e reimportação de `static/conteudo/` | WP01 | |
| T005 | Feed com `?topico=` e título | WP02 | |
| T006 | Tarefa de Questões com contagem, atalho e fallback | WP02 | |
| T007 | e2e | WP02 | |

## WP01 — Importação e motor
**Prompt**: [tasks/WP01-importacao-motor-topico.md](tasks/WP01-importacao-motor-topico.md) · Dependências: nenhuma

- [ ] T001 `topicoEstudo` no post de questão e relatório (WP01)
- [ ] T002 `tp` no índice (WP01)
- [ ] T003 Filtro `topico` em tipos/ordem/sessão (WP01)
- [ ] T004 Testes e reimportação de `static/conteudo/` (WP01)

## WP02 — Telas
**Prompt**: [tasks/WP02-telas-topico.md](tasks/WP02-telas-topico.md) · Dependências: WP01

- [ ] T005 Feed com `?topico=` e título (WP02)
- [ ] T006 Tarefa de Questões com contagem, atalho e fallback (WP02)
- [ ] T007 e2e (WP02)
