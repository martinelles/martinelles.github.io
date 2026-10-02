# Tasks: Questões por tarefa

> Nota ao orquestrador: mesclar a lane do WP01 aprovado na lane do WP02 antes de despachar.

## Subtask Index
| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | `topicoEstudo` no post de questão e relatório | WP01 | | [D] |
| T002 | `tp` no índice | WP01 | | [D] |
| T003 | Filtro `topico` em tipos/ordem/sessão | WP01 | [D] |
| T004 | Testes e reimportação de `static/conteudo/` | WP01 | | [D] |
| T005 | Feed com `?topico=` e título | WP02 | | [D] |
| T006 | Tarefa de Questões com contagem, atalho e fallback | WP02 | | [D] |
| T007 | e2e | WP02 | | [D] |

## WP01 — Importação e motor
**Prompt**: [tasks/WP01-importacao-motor-topico.md](tasks/WP01-importacao-motor-topico.md) · Dependências: nenhuma

- [x] T001 `topicoEstudo` no post de questão e relatório (WP01)
- [x] T002 `tp` no índice (WP01)
- [x] T003 Filtro `topico` em tipos/ordem/sessão (WP01)
- [x] T004 Testes e reimportação de `static/conteudo/` (WP01)

## WP02 — Telas
**Prompt**: [tasks/WP02-telas-topico.md](tasks/WP02-telas-topico.md) · Dependências: WP01

- [x] T005 Feed com `?topico=` e título (WP02)
- [x] T006 Tarefa de Questões com contagem, atalho e fallback (WP02)
- [x] T007 e2e (WP02)
