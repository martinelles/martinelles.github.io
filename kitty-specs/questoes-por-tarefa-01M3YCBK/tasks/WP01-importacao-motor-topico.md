---
work_package_id: WP01
title: Importação e motor do filtro por tópico
dependencies: []
requirement_refs:
- C-001
- C-002
- FR-001
- FR-002
- NFR-001
- NFR-002
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts were generated on main; completed changes must merge back into main.
subtasks:
- T001
- T002
- T003
- T004
phase: Fase 1
history:
- timestamp: '2026-10-02T12:00:00Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: scripts/importar/
execution_mode: code_change
owned_files:
- scripts/importar/questoes.mjs
- scripts/importar/index.mjs
- static/conteudo/**
- src/lib/feed/tipos.ts
- src/lib/feed/ordem.ts
- src/lib/feed/sessao.svelte.ts
- tests/unit/importar/questoes.test.ts
- tests/unit/importar/ponta-a-ponta.test.ts
- tests/unit/importar/fixtures/vault/**
- tests/unit/feed/ordem.test.ts
- tests/unit/feed/sessao.test.ts
- tests/unit/feed/fixtures/**
tags: []
---

# WP01 – Importação e motor do filtro por tópico

Siga `spec.md` e `plan.md` desta missão. Catálogo e `ESTUDO.csv` no vault (`…/00. vault/Estudo/cgu`) são só leitura.

- **T001** `questoes.mjs`: `topicoEstudo` quando `topico_estudo` casa `^[A-Z]+-\d+$`; vazio/`sem-topico` ⇒ sem campo. Relatório: nº de questões com tópico e nº de tópicos distintos.
- **T002** `index.mjs`: entradas de questão com tópico ganham `tp`; nada mais muda no índice; saída determinística.
- **T003** `tipos.ts` (`EntradaIndice.tp?`, `PostQuestao.topicoEstudo?`, `Filtro.topico?`), `ordem.ts` (filtro e semente com tópico), `sessao.svelte.ts` (`chaveFiltro` com tópico).
- **T004** Testes (importador: id válido, vazio, `sem-topico`, `tp` no índice; motor: filtro por tópico, combinação com tipo, sem repetição, tópico inexistente ⇒ vazio). Rodar `npm run importar` no vault real, conferir NFR-001 (aumento do `indice.json` ≤ 10 KB gzip) e NFR-002 (para 5 tópicos: contagem no índice = linhas válidas com gabarito no catálogo), colar números no histórico, commitar `static/conteudo/`.

DoD: portas do charter verdes; só arquivos do WP.
