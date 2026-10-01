---
work_package_id: WP02
title: Motor do plano
dependencies: []
requirement_refs:
- C-003
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-007
- FR-009
- FR-010
- FR-011
- NFR-002
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts were generated on main; completed changes must merge back into main.
subtasks:
- T006
- T007
- T008
- T009
- T010
phase: Fase 1
assignee: ''
agent: ''
history:
- timestamp: '2026-10-01T21:50:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/plano/
execution_mode: code_change
owned_files:
- src/lib/plano/**
- tests/unit/plano/**
tags: []
---

# WP02 – Motor do plano

## Objetivo
Toda a lógica do plano sem tela: tipos, carga, missão do dia, contagem de dias, horas,
registro com cronômetro persistido e exportação CSV.

## Contexto
- Spec (Definições, Cenários 1–4, bordas), FR-002..FR-007, FR-009..FR-011, NFR-002, C-003.
- `data-model.md` (Registro, Derivados, Transições), `contracts/registro.md` (interface **exata**), `contracts/plano.schema.json`, `research.md` R2–R4.
- Padrões existentes a imitar: `src/lib/feed/interacoes.svelte.ts` (persistência em `try/catch`, `persistindo`), `src/lib/feed/conteudo.ts` (busca em `/conteudo/`), `src/lib/datas.ts` (`hojeLocal`). Não edite esses arquivos.

## Branch Strategy
Planejamento e merge em `main`; paralelo ao WP01. `spec-kitty agent action implement WP02 --agent <nome>`.

## Subtarefas

### T006 — `tipos.ts`, `carregar.ts`
Tipos do schema; `carregarPlano(buscar = fetchJson)` com cache e erro claro.

### T007 — `missao.ts`, `dias.ts`, `horas.ts` (puros; recebem `dia`/`agora`)
- `missaoDoDia(plano, dados, dia)`: foto do dia se existir; senão próximas pendentes (sem `concluidaEm`) somando ≤ `horasPorDia*60` (mín. 1); fila vazia ⇒ `[]`.
- `percentualMissao`, `percentualPlano`.
- `contarDias(plano, dados, hoje)` → `{ noPlano, concluidos, emAberto, restantes }` pela regra do data-model; antes do início: tudo restante; depois do fim: restantes 0; identidade sempre válida (teste por propriedade em várias datas).
- `horasTotais(plano)`, `minutosEstudados(registro, agora)`, `horasEstudadas(dados, agora)`.

### T008 — `registro.svelte.ts`
Interface exata de `contracts/registro.md`, chave `painel-concurso:plano:v1`. Um só cronômetro rodando; `iniciar` pausa o anterior; tempo por timestamps; `concluir` fecha intervalo aberto; `certas ≤ questoes` validado; `gravarFoto` idempotente; escrita só em transições.

### T009 — `exportar.ts`
`exportarCsv(plano, dados)` e `nomeArquivoExportacao(dia)` conforme o contrato (BOM, vírgula, aspas quando preciso).

### T010 — Testes (`tests/unit/plano/`)
Missão com rolagem de pendência (dia 1 incompleto ⇒ dia 2 começa pela pendente); foto estável depois de concluir tarefa extra; dias com identidade em 20 datas aleatórias; bordas (antes/depois da janela, fila vazia); cronômetro: iniciar → "fechar" (recarregar estado do storage) → reabrir com tempo correto (NFR-002, erro ≤ 1 s/h); iniciar outra pausa a primeira; storage que lança; CSV byte a byte.

## Definition of Done
- [ ] Portas do charter passam; nada fora de `src/lib/plano/**` e `tests/unit/plano/**`.

## Guia do revisor
Tentar quebrar a identidade dos dias e o cronômetro (virada de dia, duas tarefas, storage falhando).
