---
work_package_id: WP03
title: Motor do feed
dependencies: []
requirement_refs:
- FR-009
- FR-010
- FR-011
- FR-012
- FR-013
- FR-014
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-feed-estudo-cgu-01M3S6H8
base_commit: d9885b75ba62702a7c11296c8bfc2d12104bf8ff
created_at: '2026-09-30T13:43:17.540961+00:00'
subtasks:
- T012
- T013
- T014
- T015
- T016
- T017
phase: Fase 1 - Conteúdo e motor
assignee: ''
agent: ''
shell_pid: '14016'
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/feed/
execution_mode: code_change
owned_files:
- src/lib/feed/**
- tests/unit/feed/**
tags: []
---

# WP03 – Motor do feed

## Objetivo

Toda a lógica do feed sem tela: tipos dos posts, carga do conteúdo, ordem do dia, sessão sem
repetição, interações persistidas, foco e estatísticas. Funções puras onde der; estado em
`.svelte.ts` com runes.

## Contexto

- Spec: FR-009, FR-010, FR-011, FR-012, FR-013, FR-014 (estatísticas), SC-002, SC-004, SC-007; casos de borda "armazenamento indisponível", "filtro sem nada novo".
- `data-model.md` (tipos, Índice, Interações, Foco), `contracts/interacoes.md` (chaves e interface **exatas**), `contracts/conteudo-importado.schema.json`, `research.md` R3, R5, R8.
- Já existe `src/lib/datas.ts` com `hojeLocal()` — usar.
- Conteúdo real ainda não existe na lane (vem do WP02): testes com fixtures em `tests/unit/feed/fixtures/`.

## Branch Strategy

Planejamento em `main`; merge em `main`; paralelo ao WP01.
`spec-kitty agent action implement WP03 --agent <nome>`.

## Subtarefas

### T012 — `src/lib/feed/tipos.ts` e `conteudo.ts`
- Tipos TS espelhando o schema: `Post = PostQuestao | PostLei | PostResumo | PostFlashcard`, `Materia`, `Indice`, `EntradaIndice { id; t: 'q'|'l'|'r'|'f'; m; l }`.
- `criarRepositorio(buscar: (url) => Promise<unknown> = fetchJson)` com `indice()`, `materias()` (cacheados) e `posts(ids)` que agrupa por lote, busca cada lote uma vez (promessa compartilhada; lotes concorrentes não duplicam fetch) e devolve na ordem pedida. Base de URL `/conteudo/`.
- Erro de rede em lote: rejeita só os posts daquele lote; a sessão (T014) mostra aviso e tenta de novo na próxima página.

### T013 — `ordem.ts`
- `mulberry32(seed)`, `hashTexto(s)` (FNV-1a 32 bits), `embaralhar(lista, rng)` (Fisher–Yates, não muta a entrada).
- `ordemDoDia(indice, filtro: { materia?: string; tipo?: TipoPost }, dia: string): string[]`: filtra, embaralha cada fila de tipo com semente `hashTexto(dia + '|' + materia + '|' + tipo)`, intercala na proporção q3 : l2 : r1 : f2 (quando uma fila acaba, as outras continuam). Resultado é permutação dos ids filtrados.

### T014 — `sessao.svelte.ts`
- `criarSessao(repo, filtro, dia)` com estado `$state`: `posts` carregados, `carregando`, `fim`, `erro`. `proximaPagina()` pega os próximos 10 ids da ordem que **não** estão em `mostrados`, carrega via repo, anexa. Trocar filtro = nova sessão; o conjunto `mostrados` é por filtro e vive enquanto a aba estiver aberta (Map em módulo).
- `fim` quando a ordem esgota; nunca reinicia a ordem (FR-010).

### T015 — `interacoes.svelte.ts`
- Implementar **exatamente** a interface de `contracts/interacoes.md` (chave `painel-concurso:interacoes:v1`), com `try/catch` em toda leitura/escrita, poda de `vistos` para 7 dias, primeira resposta vale, `persistindo=false` quando o storage falha.
- `responder(id, r, gabarito)`: `ok = r === gabarito`.

### T016 — `foco.svelte.ts` e `estatisticas.ts`
- Foco v2 (`painel-concurso:preferencias:v2`): `foco.disciplina` (padrão `'ti-ciencia-de-dados'`), `escolherDisciplina(id)`, `carregarFoco(arm?)`. v1 é ignorada.
- `estatisticas(interacoes, indice?)`: `{ respondidas, acertos, taxa: number | null, salvos, porMateria: Record<materia, {respondidas, acertos}> }` — puro, calculado a cada chamada.
- `ordenarStories(materias, foco)`: "Tudo" é da tela; aqui só ordena: disciplina de foco primeiro, depois `ordem`; matérias com `total === 0` fora.
- `materiaVistaHoje(materia, indice, vistosHoje)`: true se todos os posts da matéria estão em `vistosHoje` (anel cinza).

### T017 — Testes
- `ordem`: mesma entrada/dia ⇒ mesma saída; dia diferente ⇒ ordem diferente; é permutação; proporção respeitada no início; filtro por matéria/tipo.
- `sessao`: com repo falso de 95 posts, 10 páginas ⇒ 95 ids únicos e `fim`; trocar filtro e voltar não repete; erro de lote não trava.
- `repositorio`: lote buscado uma vez com chamadas concorrentes.
- `interacoes`: contrato byte a byte; storage que lança; JSON corrompido; poda de 7 dias; primeira resposta vale.
- `estatisticas`/`foco`/`ordenarStories`/`materiaVistaHoje`.
- **SC-002** simulado: 3.000 ids, rolar até o fim ⇒ zero repetição.

## Definition of Done

- [ ] Portas do charter passam; nenhum arquivo fora de `src/lib/feed/**` e `tests/unit/feed/**`.
- [ ] Nenhuma função lê relógio sem receber `dia`, exceto quem chama `hojeLocal()` na borda.

## Guia do revisor

Conferir o contrato de interações campo a campo; tentar produzir repetição na sessão (troca de filtro, erro de rede, páginas concorrentes).
