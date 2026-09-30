---
work_package_id: WP06
title: Painel de Estudos e tela em breve
dependencies:
- WP03
- WP04
requirement_refs:
- FR-008
- FR-009
- FR-010
- FR-011
- FR-012
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T05:48:14.885541+00:00'
subtasks:
- T026
- T027
- T028
- T029
- T030
- T031
phase: Fase 3 - Telas
assignee: ''
agent: ''
shell_pid: '25884'
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/painel/
execution_mode: code_change
owned_files:
- src/lib/componentes/CabecalhoPainel.svelte
- src/lib/componentes/FocoEstudo.svelte
- src/lib/componentes/GradeFerramentas.svelte
- src/routes/painel/**
- src/routes/ferramenta/**
- tests/e2e/painel.spec.ts
tags: []
---

# WP06 – Painel de Estudos e tela "em breve"

## Objetivo

Entregar o Cenário 2 da spec (aceites 1 a 5): painel do concurso escolhido, foco de estudo
persistido, grade das 12 ferramentas e a tela "em breve" de cada uma.

## Contexto

- Spec: Cenário 2, FR-008..FR-012, SC-002; bordas "sem data de prova", "prova realizada", "cargo único", "concurso que sumiu".
- Lógica (WP03): `diasParaProva`, `formatarData`, `hojeLocal`, `preferencias`, `carregar`.
- Dados (WP02): `buscarConcurso`, `buscarFerramenta`, `dados.ferramentas`.
- `Icone` (WP04). Tokens de `app.css` (WP01).
- Não editar `src/routes/+layout.svelte` (WP01) nem componentes do WP04.

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`; paralelo ao WP05.
Comando: `spec-kitty agent action implement WP06 --agent <nome>`.

## Subtarefas

### T026 — `CabecalhoPainel.svelte`

- Props: `concurso: Concurso`, `prazo: Prazo`, `ontrocar: () => void`.
- Conteúdo:
  - rótulo pequeno "Seu Painel de Estudos" (é o `<h1>` da página — FR-008);
  - nome do concurso em destaque (`<p class="concurso">`), linha "banca {banca} · {orgao}";
  - três indicadores em linha (quebram em coluna abaixo de 360 px): **vagas** (`Icone pessoas`, "{n} vagas" ou "Vagas a definir"), **prova** (`Icone relogio`, `prazo.texto`; com `tipo: 'dias'`, mostrar também a data formatada em texto menor), **edital** (botão/link `Icone edital` "Ver edital", `target="_blank" rel="noopener"`, só se `concurso.edital` existir);
  - botão "Trocar concurso" (`Icone trocar`) → `ontrocar()` (FR-012).
- Fundo em `--cor-primaria` com texto `--cor-primaria-texto` (contraste já garantido no WP01).

### T027 — `FocoEstudo.svelte`

- Props: `concurso: Concurso`, `cargoId: string | null`, `disciplina: string | null`, `onescolherCargo(id)`, `onescolherDisciplina(nome)`.
- `<h2>Foco de Estudo</h2>` e dois `<select>` nativos com `<label>` visível: "Cargo" e "Disciplina".
- Cargo: opção placeholder desabilitada "Selecione um cargo" quando `cargoId` é `null`. Com **um único cargo**, o select aparece já preenchido e desabilitado (borda da spec; a preferência já vem preenchida pelo WP03).
- Disciplina: desabilitada até haver cargo; opções = `cargos.find(c => c.id === cargoId).disciplinas`; placeholder "Selecione uma disciplina" (valor vazio, `disabled`), exibido quando `disciplina` é `null` — que é o estado logo após trocar de cargo. `escolherDisciplina` só é chamado com disciplina válida.
- `<select>` nativo é deliberado: acessível, funciona com leitor de tela e no celular abre o seletor do sistema.

### T028 — `GradeFerramentas.svelte`

- Props: `ferramentas: Ferramenta[]`.
- Três blocos com `<h2>`: "📚 Material Teórico" (`grupo: teorico`), "🎯 Prática & Revisão" (`pratica`), e os atalhos (`atalho`) como dois cartões largos logo abaixo do cabeçalho (ou no fim — escolha o que fica melhor em 360 px e registre no histórico). Os emojis ficam em `<span aria-hidden="true">`.
- Cada item é um `<a href="/ferramenta/{id}">` com `Icone`, título (negrito) e subtítulo — link, não botão, porque navega (FR-010, FR-011).
- Grade CSS: `grid-template-columns: repeat(2, minmax(0, 1fr))`; a partir de 720 px, `repeat(4, …)`. `minmax(0, 1fr)` impede que título longo estoure a coluna (NFR-004).

### T029 — `src/routes/painel/+page.svelte`

```ts
carregar();
const concurso = $derived(buscarConcurso(preferencias.concursoId));
$effect(() => { if (!concurso) goto('/escolher', { replaceState: true }); }); // borda "sumiu" e acesso direto sem escolha
const prazo = $derived(concurso ? diasParaProva(concurso.dataProva, hojeLocal()) : null);
```
- Renderiza `CabecalhoPainel`, `FocoEstudo`, `GradeFerramentas` quando `concurso` existe.
- `ontrocar={() => goto('/escolher')}` — a preferência **não** é apagada (data-model, transição "trocar concurso").
- `<svelte:head><title>{concurso.nome} · Painel de Concurso</title>`.

### T030 — `src/routes/ferramenta/[id]/+page.svelte` (+ `+page.ts`)

- `+page.ts`: `load({ params })` busca `buscarFerramenta(params.id)`; inexistente → `error(404, 'Ferramenta não encontrada')` de `@sveltejs/kit`.
- Página: `Icone` grande da ferramenta, `<h1>{titulo}</h1>`, texto "Em breve por aqui." e "Esta ferramenta ainda está em construção.", botão/link "Voltar ao painel" (`href="/painel"`) com `Icone voltar` (FR-011). Se não houver concurso escolhido, o link leva a `/escolher` com o texto "Escolher concurso".
- Crie também `src/routes/ferramenta/[id]/+error.svelte` simples com link para o painel (fica dentro de `src/routes/ferramenta/**`, sua posse).

### T031 — `tests/e2e/painel.spec.ts`

Setup comum: `addInitScript` grava `{"concursoId":"cgu-affc-ti","cargoId":null,"disciplina":null}`; `page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'))`.
1. `/painel` mostra "Seu Painel de Estudos", nome do CGU, "Cebraspe", vagas, "Faltam N dias" coerente com `dataProva` do JSON e o botão "Ver edital" (se o JSON tiver edital; caso contrário, afirme a ausência).
2. Escolher cargo "Auditor — Tecnologia da Informação" → select de disciplina habilitado com "Ciência de Dados"; escolher → recarregar a página → cargo e disciplina continuam selecionados (FR-009).
3. Trocar de cargo → disciplina volta ao placeholder.
4. Os títulos "Material Teórico" e "Prática & Revisão" existem; há exatamente 12 links para `/ferramenta/…`.
5. **SC-002**: para cada um dos 12 links: clicar → `h1` com o título da ferramenta e "Em breve" → clicar "Voltar ao painel" → de volta em `/painel`.
6. "Trocar concurso" → `/escolher`, e o `localStorage` ainda contém `cgu-affc-ti`.
7. Concurso de **cargo único** (pegue o id no JSON) → select de cargo preenchido e desabilitado.
8. Concurso **sem `dataProva`** → "Data a definir"; concurso com prova passada → "Prova realizada".
9. `/painel` sem preferência → redireciona para `/escolher`; `/ferramenta/nao-existe` → mensagem de não encontrada com link.

## Definition of Done

- [ ] Portas do charter passam, incluindo `npm run test:e2e`.
- [ ] Aceites 1–5 do Cenário 2 e SC-002 cobertos.
- [ ] Em 360 px, nenhum título da grade estoura a coluna.
- [ ] Nenhum arquivo fora de `owned_files` alterado.

## Riscos

- `$effect` com `goto` pode disparar duas vezes no mesmo tick; `goto` para a mesma URL é inofensivo, mas guarde um sinalizador se o teste 9 ficar instável.
- `error()` em `+page.ts` com `ssr = false` funciona no cliente; confira que o `+error.svelte` local é usado.

## Guia do revisor

Percorrer o Cenário 2 no preview, em 360 px e em 1440 px; recarregar no meio para ver a persistência; conferir que "Trocar concurso" não apaga a preferência.
