---
work_package_id: WP06
title: Conteúdo offline e medições
dependencies:
- WP05
requirement_refs:
- FR-017
- NFR-001
- NFR-002
- NFR-004
- NFR-005
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-feed-estudo-cgu-01M3S6H8
base_commit: d9885b75ba62702a7c11296c8bfc2d12104bf8ff
created_at: '2026-09-30T15:22:08.242600+00:00'
subtasks:
- T033
- T034
- T035
phase: Fase 4
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "27644"
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/service-worker.ts
execution_mode: code_change
owned_files:
- src/service-worker.ts
- tests/e2e/offline-conteudo.spec.ts
- kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md
tags: []
---

# WP06 – Conteúdo offline e medições

## Objetivo

Garantir o feed inteiro offline após a primeira visita (FR-017, SC-005) sem arriscar a
instalação do service worker, e medir as NFRs com números reais.

## Contexto

- `research.md` R4; SW atual em `src/service-worker.ts` (missão anterior: pré-cache do shell sob `/` com caminhos absolutizados para o `vite preview`, navegação network-first, ativos cache-first, sem interceptar outras origens). **Manter** esse comportamento.
- `$service-worker` `files` agora inclui `static/conteudo/*.json` (alguns MB).
- `kitty-specs/painel-concurso-pwa-01M3RA84/medicoes.md` como modelo de medição.
- A lane precisa do código de WP05 (o orquestrador mescla).

## Branch Strategy

Planejamento em `main`; merge em `main`.
`spec-kitty agent action implement WP06 --agent <nome>`.

## Subtarefas

### T033 — Pré-cache em duas fases
- `install`: `addAll` do shell = `build` + `files` **exceto** `/conteudo/` + `/`; depois `skipWaiting`.
- Em seguida (sem `waitUntil` bloqueando a instalação além do shell): para cada arquivo de `/conteudo/`, `cache.add` individual com `catch` por arquivo; faltantes são tentados de novo no `activate` e a cada `message` `'completar-conteudo'` que a página envia ao abrir (enviar do próprio SW via `clients.matchAll` no `activate` também serve — escolher um e documentar).
- `fetch` de `/conteudo/*`: cache-first; se faltar no cache, rede e grava.
- Nome do cache continua versionado; `activate` apaga versões antigas **depois** de o novo shell estar completo.

### T034 — `tests/e2e/offline-conteudo.spec.ts`
1. Abrir `/`, esperar SW controlar, recarregar, esperar até todos os `lote-*.json` do índice estarem no Cache Storage (`page.evaluate` com `caches.open` + `keys()`, timeout generoso).
2. Offline: `/?materia=<três matérias diferentes>`, rolar 3 páginas em cada, abrir `/salvos` com um salvo, responder uma questão — tudo funciona (SC-005).
3. Simular falha de um lote na instalação (rota do Playwright devolvendo 500 para um arquivo) ⇒ SW instala mesmo assim e o lote é obtido depois.

### T035 — `medicoes.md`
Com data, comando e versão:
- Shell (NFR-004): soma gzip de `build/_app/immutable/**` + `index.html` ≤ 300 KB.
- Lotes (NFR-005): maior lote gzip ≤ 150 KB; total do conteúdo gzip.
- Lighthouse mobile em `/` (NFR-001, NFR-006): desempenho, acessibilidade, boas práticas; LCP da 1ª visita; visita repetida via script Playwright com o mesmo throttling (a missão anterior mostrou que o Lighthouse não mede SW).
- Rolagem (NFR-002): Playwright + CDP `Tracing`/`Performance` com CPU 4× rolando 50 posts; fps médio e p5; ≥ 55.
- Toque (NFR-003): tempo entre clique e mudança de estado em responder/curtir/virar (`performance.now` no teste) ≤ 100 ms.
- Instalação: checagem CDP de instalabilidade (critério equivalente à antiga auditoria PWA, premissa da spec); instalação manual Android "não conferido" se não feita.
- Meta não atingida: número real + causa provável; não mexer em limite.

## Definition of Done

- [ ] Portas do charter verdes; SC-005 coberto por teste; `medicoes.md` com números reais.

## Guia do revisor

Refazer a medição de peso; rodar o offline-conteudo duas vezes; conferir que o SW ainda não intercepta outras origens.

## Activity Log

- 2026-09-30T15:22:10Z – claude:opus:implementer:implementer – shell_pid=14180 – Assigned agent via action command
- 2026-09-30T16:02:41Z – claude:opus:implementer:implementer – shell_pid=14180 – Ready for review. --force: guard flagged kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md (owned file of WP06, deliverable of T035) and conteudo-gerado.md (WP02's approved deliverable, present via merge in lane history); both are legit. NFR-001 first visit not met (LCP 5.0-6.0 s vs 2.5 s; cause is first-page lot fan-out, see medicoes.md obs. 1).
- 2026-09-30T16:03:26Z – claude:opus:reviewer:reviewer – shell_pid=27644 – Started review via action command
- 2026-09-30T16:07:13Z – claude:opus:reviewer:reviewer – shell_pid=27644 – Review passed: two-phase SW correct (shell-only addAll in waitUntil, per-file content fill outside, retry on activate/navigation only for missing files, cache-first /conteudo/ with dedupe, no cross-origin interception, offline fallback intact); offline-conteudo 2/2 twice, full e2e 63/63, check/test/build green; sizes and Lighthouse reproduced (shell 65.4 KB gz, max lot 143,973 B, LCP 6.05 s, CLS 0.137). NFR-001 first visit NOT met at mission level (cause: first 'Tudo' page pulls 9 whole lots, WP03/WP05 design) - owner decision. Follow-ups: non-hashed lot names + page-path HTTP-cache copy persisted in version cache can mix old/new lots after a content deploy; activate drops old full-content cache before new content is filled (offline gap after update). --force: kitty-specs guard (medicoes.md owned by WP06; conteudo-gerado.md from WP02 in lane history).
