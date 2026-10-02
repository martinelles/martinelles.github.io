---
work_package_id: WP02
title: Telas do filtro por tópico
dependencies:
- WP01
requirement_refs:
- FR-002
- FR-003
- FR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-questoes-por-tarefa-01M3YCBK
base_commit: 53c31a762ff8c30712dd0e534b407ebd18ee8f17
created_at: '2026-10-02T13:38:33.918693+00:00'
subtasks:
- T005
- T006
- T007
phase: Fase 2
shell_pid: "21072"
agent: "claude:opus:implementer:implementer"
history:
- timestamp: '2026-10-02T12:00:00Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/tarefa/
execution_mode: code_change
owned_files:
- src/routes/+page.svelte
- src/routes/tarefa/**
- tests/e2e/feed-topico.spec.ts
tags: []
---

# WP02 – Telas do filtro por tópico

Siga `spec.md` e `plan.md`. Leia a API real de `src/lib/feed/*` (WP01 mesclado).

- **T005** Feed: ler `?topico=`; título "Questões de <id>" com a quantidade (contada no índice); tópico inexistente ⇒ fim imediato com link para "Tudo"; resto do feed intacto (stories, abas, chamada da missão).
- **T006** `/tarefa/[id]` de Questões: "N questões deste tópico" e atalho `/?topico=<id>&tipo=questao`; zero ⇒ "Nenhuma questão do catálogo ligada a este tópico ainda" e atalho da matéria (comportamento atual). Leitura: inalterada.
- **T007** `tests/e2e/feed-topico.spec.ts`: tópico com questões (contagem = do índice; rolar até o fim sem repetir, todos os posts são questões com `topicoEstudo` igual); tópico sem questões (aviso + atalho da matéria); id inexistente na URL; 360 px sem rolagem horizontal; nos três temas.

DoD: portas do charter verdes; só arquivos do WP.

## Activity Log

- 2026-10-02T13:38:36Z – claude:opus:implementer:implementer – shell_pid=21072 – Assigned agent via action command
