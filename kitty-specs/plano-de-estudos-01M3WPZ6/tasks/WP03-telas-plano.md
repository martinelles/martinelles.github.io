---
work_package_id: WP03
title: Telas do plano e da missão
dependencies:
- WP01
- WP02
requirement_refs:
- C-002
- FR-002
- FR-003
- FR-004
- FR-005
- FR-007
- FR-008
- FR-009
- FR-011
- FR-012
- NFR-001
- NFR-003
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-plano-de-estudos-01M3WPZ6
base_commit: 8aeefb11a85f767efafdf7efd4fa52ddb25574e8
created_at: '2026-10-01T22:32:34.195656+00:00'
subtasks:
- T011
- T012
- T013
- T014
- T015
phase: Fase 2
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "32248"
history:
- timestamp: '2026-10-01T21:50:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/componentes/plano/
execution_mode: code_change
owned_files:
- src/lib/componentes/plano/**
- src/routes/painel/+page.svelte
- src/routes/+page.svelte
- src/routes/tarefa/**
- tests/e2e/plano.spec.ts
- tests/e2e/painel.spec.ts
- tests/e2e/feed.spec.ts
- tests/e2e/responsivo.spec.ts
- kitty-specs/plano-de-estudos-01M3WPZ6/medicoes.md
tags: []
---

# WP03 – Telas do plano e da missão

## Objetivo
Mostrar o plano e a missão do dia no painel, a tela de tarefa com cronômetro, a chamada da
missão no feed e a exportação — nos três temas existentes.

## Contexto
- Spec Cenários 1–4, FR-002..FR-012, NFR-001, NFR-003, NFR-004, SC-001..SC-005.
- Motor (WP02) em `src/lib/plano/*` e `plano.json` real (WP01) já mesclados na lane. **Leia a API real** antes de usar.
- Visual: tokens dos temas Aventura/Kindle/Kindle escuro (`src/app.css`, `src/lib/tema.svelte.ts`) e componentes existentes (`ProgressoEstudo`, `componentes/feed/*`) como referência de estilo; nada de cor fora dos tokens. Kindle sem animação. Carregue a skill `frontend-design` antes de estilizar e siga a direção já estabelecida (tipografia como protagonista, cor forte num ponto só).
- Carregar o registro (`carregarRegistro`) uma vez: faça no topo das páginas que o usam (o layout não é deste WP).

## Branch Strategy
Planejamento e merge em `main`. `spec-kitty agent action implement WP03 --agent <nome>`.

## Subtarefas

### T011 — Painel
- `ResumoPlano`: "X h de Y h", % concluída, `<progress max value>` com `aria-label` e texto equivalente, e os 4 números de dias com rótulos (no plano, concluídos, em aberto, restantes); estados "Plano ainda não começou"/"Plano encerrado".
- `MissaoDoDia`: título "Missão de hoje", nº de tarefas, tempo estimado total ("3 h", "2 h 15 min"), % feita, lista (disciplina, tópico, tempo, check se concluída), botão primário **"Iniciar estudos"** (vai para a 1ª pendente e inicia o cronômetro); "Missão cumprida" quando completa; "Plano cumprido — revise" quando a fila acabou. Gravar a foto do dia ao exibir.
- Botão "Exportar progresso" (download do CSV do motor).
- Inserir no topo de `/painel` sem quebrar o que existe.

### T012 — `/tarefa/[id]`
`+page.ts` valida o id (404 local se não existir no plano); página com tópico (texto do edital), disciplina, "o que fazer" (estudar + 10 questões do tópico), `Cronometro` (mm:ss/h:mm:ss, iniciar/pausar/retomar, `role="timer"` com rótulo, anúncio só nas transições), atalho "Questões e lei seca desta matéria" → `/?materia=<materia>` (oculto se `materia` nula), "Concluir tarefa" com campos opcionais questões feitas/certas (validação certas ≤ feitas), e volta para `/painel`.

### T013 — Feed
`ChamadaMissao` acima dos stories em `/`: "Missão de hoje · 1 de 4 feitas · ~2 h 15 min" + "Iniciar"/"Continuar"; some quando a missão está cumprida (troca por "Missão cumprida ✓" discreto). Não pode empurrar o primeiro post para fora da tela em 360 px.

### T014 — e2e
`plano.spec.ts` com `page.clock` fixo (2026-10-01 e dias seguintes): números zerados no início; iniciar → avançar relógio 30 min → pausar → horas estudadas 0,5 h; concluir com 10/7 → % da missão e do plano sobem; fechar e reabrir no meio (novo `page` no mesmo contexto) sem perder tempo; dia seguinte começa pela pendente; dia passado incompleto conta "em aberto"; identidade dos 4 números; exportação baixa CSV com a linha certa. Ajustar `painel.spec.ts`, `feed.spec.ts` e `responsivo.spec.ts` (nova rota `/tarefa/<id>` nas larguras) apenas no necessário.

### T015 — `medicoes.md`
Painel em visita repetida (≤ 1 s, mesmo método da missão do feed), tamanho do `plano.json` gzip, Lighthouse acessibilidade em `/painel` e `/tarefa/<id>`.

## Definition of Done
- [ ] Portas do charter passam; cenários 1–4 cobertos; três temas conferidos em 360 px (capturas no histórico).

## Guia do revisor
Fazer um "dia" inteiro com relógio fixo: iniciar, pausar, fechar, reabrir, concluir, virar o dia; conferir os números à mão.

## Activity Log

- 2026-10-01T22:32:37Z – claude:opus:implementer:implementer – shell_pid=21864 – Assigned agent via action command
- 2026-10-01T22:59:12Z – claude:opus:implementer:implementer – shell_pid=21864 – Ready for review (--force: guard flagged medicoes.md, which is in WP03 owned_files)
- 2026-10-01T23:00:25Z – claude:opus:reviewer:reviewer – shell_pid=4916 – Started review via action command
- 2026-10-01T23:05:47Z – claude:opus:reviewer:reviewer – shell_pid=4916 – Review passed: Cenarios 1-4 e bordas conferidos em 360px com relogio fixo (1 toque ate cronometro correndo, pausa/retoma, fechar/reabrir, virada do dia com tela aberta, missao cumprida, plano cumprido, antes/depois, CSV); numeros conferidos a mao (95 min=1,5 h, 0,8%, 0+1+80=81); 3 temas sem rolagem e so tokens; check/test/build/e2e 166/166 verdes. --force: guarda de kitty-specs sobre medicoes.md (owned pelo WP03). Follow-ups: aba ativa do layout em /tarefa; dia com foto vazia conta concluido; testes unitarios de formato.ts.
- 2026-10-01T23:38:39Z – claude:opus:reviewer:reviewer – shell_pid=4916 – Moved to planned
- 2026-10-01T23:58:57Z – claude:opus:implementer:implementer – shell_pid=11988 – Started implementation via action command
- 2026-10-02T00:10:58Z – claude:opus:implementer:implementer – shell_pid=11988 – Emenda D4 implementada (--force: guarda de kitty-specs sobre medicoes.md, owned pelo WP03)
- 2026-10-02T00:11:31Z – claude:opus:reviewer:reviewer – shell_pid=5992 – Started review via action command
- 2026-10-02T00:16:51Z – claude:opus:reviewer:reviewer – shell_pid=5992 – Review passed (emenda D4): missao 8 tarefas (25/20) com modo e bloco em texto; /tarefa por modo (o que fazer, atalho :Q => /?materia=<m>&tipo=questao, :L => /?materia=<m>, campos de questoes so em :Q, validacao certas<=feitas); Iniciar estudos 1 toque com cronometro correndo; virada do dia comeca pela :Q pendente (BDD-04:Q), dia 1 em aberto, 1+80=81; CSV agregado por topico (BDD-01 50 min 10/7 estudado; BDD-04 so :L sem status); banner do feed ok; 3 temas 360px sem rolagem, alvos >=44, Kindle sem animacao, so tokens; check 0 erros, test 264/264, build, e2e 179/179 (porta 4212). '10 itens C/E' fixo aceito (plano nao traz N). --force: guarda de kitty-specs sobre medicoes.md (owned pelo WP03). Pendente fora do WP03: aba Painel em /tarefa (+layout.svelte).
- 2026-10-02T01:13:14Z – claude:opus:reviewer:reviewer – shell_pid=5992 – Moved to planned
- 2026-10-02T01:13:24Z – claude:opus:implementer:implementer – shell_pid=32248 – Started implementation via action command
