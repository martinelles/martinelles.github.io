---
work_package_id: WP02
title: Testes de aceite dos Ajustes
dependencies:
- WP01
requirement_refs:
- FR-007
- NFR-001
- NFR-003
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-aparencia-tela-propria-01M3YHGF
base_commit: 9cc244288a5b3e5f4e5fb679e72361b8de2baa2a
created_at: '2026-10-02T15:16:34.858802+00:00'
subtasks:
- T006
- T007
- T008
phase: Fase 2 - Aceite
assignee: ''
agent: ''
shell_pid: '35756'
history:
- timestamp: '2026-10-02T14:59:07Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: tests/e2e/
execution_mode: code_change
owned_files:
- tests/e2e/ajustes.spec.ts
- tests/e2e/offline.spec.ts
tags: []
---

# WP02 – Testes de aceite dos Ajustes

## Objetivo

Automatizar os cenários 1 a 4 da spec em Playwright contra o build: o painel sem os blocos, o link
"Ajustes", a tela nova, a volta, a aba atual, as 2 interações até mudar o tema ou o foco, o efeito do
foco no painel e no feed, e o link direto offline.

Este WP **não corrige** código. Se um teste revelar defeito do WP01, registre no handoff (o teste, o
esperado e o obtido) e devolva ao orquestrador, sem enfraquecer o teste.

## Contexto

- Spec: Cenários 1 a 4, casos de borda; FR-001 a FR-008; NFR-001, NFR-002; SC-001 a SC-003.
- **Contrato**: [contracts/tela-ajustes.md](../contracts/tela-ajustes.md). Use só os papéis e os textos de lá.
- Modelos de teste no repositório: `tests/e2e/painel.spec.ts` (helper `abas(page)`, chave `CHAVE_FOCO`, story depois de "Tudo"), `tests/e2e/tema.spec.ts` (chave do tema, `radio(page, nome)`) e `tests/e2e/offline.spec.ts` (fluxo online, depois `context.setOffline(true)`).
- Relógio fixo, como nos outros specs: `page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'))`, se o painel depender da data (o plano de estudos depende).

## Branch Strategy

Planejamento em `main` e merge em `main`. Depende do WP01: a lane do WP01 precisa estar mesclada na
desta, com `npm ci` (nota ao orquestrador em `tasks.md`). Comando:
`spec-kitty agent action implement WP02 --agent <nome>`.

## Subtarefas

### T006 — `tests/e2e/ajustes.spec.ts`: navegação

| Teste | Passos | Esperado | Requisito |
|---|---|---|---|
| painel sem os blocos | `goto('/painel')` | `group` "Aparência" com contagem 0; `getByLabel('Disciplina')` com contagem 0; texto `Foco: TI: Ciência de Dados` visível | FR-001, FR-006, SC-001 |
| link no cabeçalho | em `/painel`, `getByRole('link', { name: 'Ajustes' })` | visível; `href="/painel/ajustes"`; `boundingBox` com largura e altura ≥ 44 | FR-002, NFR-002 |
| abre a tela | clicar no link | `toHaveURL('/painel/ajustes')`; `heading` nível 1 "Ajustes"; a ordem no DOM é h1, depois o link "Voltar ao painel", depois o `heading` "Foco de Estudo", depois o `group` "Aparência" (compare `compareDocumentPosition` ou os índices num `locator('h1, a, h2, fieldset')`) | FR-003 |
| voltar pelo link | clicar em "Voltar ao painel" | `toHaveURL('/painel')` | FR-003, Cenário 2.2 |
| voltar do navegador | de `/painel` clicar em Ajustes, depois `page.goBack()` | `toHaveURL('/painel')` | Cenário 4.3 |
| aba atual | em `/painel/ajustes` | `a.aba[aria-current="page"]` com `href` `/painel` | FR-008 |
| teclado | em `/painel`, focar o link (Tab até ele, ou `focus()`) e apertar Enter | vai para `/painel/ajustes` | NFR-003 (teclado) |
| 2 interações para o tema | em `/painel`: clicar em "Ajustes" e depois no rádio "Kindle" | `html[data-tema="kindle"]` e a chave do tema = `{"tema":"kindle"}`; contar exatamente 2 cliques no teste | NFR-001, SC-002 |
| link direto | `goto('/painel/ajustes')` numa página nova | h1 "Ajustes" e grupo Aparência visíveis | FR-007 |

### T007 — `ajustes.spec.ts`: o foco e os efeitos dele

| Teste | Passos | Esperado | Requisito |
|---|---|---|---|
| 2 interações para o foco | `/painel`, depois clicar em "Ajustes" e escolher "Direito Constitucional" no campo Disciplina | chave do foco `{"disciplina":"direito-constitucional"}` | NFR-001 |
| texto do painel acompanha | depois disso, voltar por "Voltar ao painel" | o cabeçalho mostra `Foco: Direito Constitucional` | FR-006, Cenário 3.1 |
| stories acompanham | ir ao Feed pela barra de abas | o 2º link da `navigation` "Matérias" (depois de "Tudo") tem o nome de Direito Constitucional (mesma asserção de `painel.spec.ts`) | Cenário 3.1 |
| carregando | atrase as respostas de `/conteudo/materias.json` (`page.route` com `await new Promise(r => setTimeout(r, 1500))`) e abra `/painel` | o cabeçalho já mostra uma linha `Foco:` (provisória) sem erro e, quando carrega, `Foco: TI: Ciência de Dados` | caso de borda |

### T008 — `offline.spec.ts`: Ajustes offline [P]

No teste offline existente, depois do bloco do `/painel`:
1. Ainda online (antes do `setOffline`), visite `/painel/ajustes` uma vez, para a rota contar como visitada. Se o pré-cache do service worker já cobre a casca, isso nem é necessário; deixe a visita assim mesmo, porque é inofensiva.
2. Offline: `goto('/painel/ajustes')`, e o `heading` "Ajustes" e o grupo Aparência aparecem; marcar "Kindle" troca `data-tema`.
3. Offline, navegação interna: de `/painel`, clicar em "Ajustes" chega à tela.

Não altere as asserções existentes do arquivo; só acrescente.

## Definition of Done

- [ ] T006 a T008 feitos; `npm run check`, `npm test`, `npm run build` e `CI=1 npm run test:e2e` passando **inteiros**, com a porta 4173 conferida livre antes, e sem servidor deixado no ar.
- [ ] Cada linha das tabelas do T006 e do T007 tem um teste com o requisito no nome.
- [ ] Nenhum arquivo fora de `owned_files` alterado; `git add` por caminho (DIRECTIVE_033).

## Riscos

| Risco | Mitigação |
|---|---|
| O plano de estudos muda o que aparece no painel conforme a data | Relógio fixo |
| Ordem no DOM conferida de forma frágil | Usar `compareDocumentPosition` entre os 4 elementos do contrato, não índices globais |

## Orientação ao revisor

- Quebre de propósito: troque o `href` do link para `/painel` no código local e confirme que T006 falha com mensagem legível. Desfaça depois.
- Confira que nenhuma asserção do `offline.spec.ts` antigo mudou.
