---
work_package_id: WP04
title: Componentes da tela de escolha
dependencies:
- WP02
requirement_refs:
- C-002
- FR-004
- FR-005
- FR-006
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
subtasks:
- T016
- T017
- T018
- T019
- T020
phase: Fase 2 - Lógica e componentes
assignee: ''
agent: ''
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/componentes/
execution_mode: code_change
owned_files:
- src/lib/componentes/Icone.svelte
- src/lib/componentes/CampoBusca.svelte
- src/lib/componentes/CartaoConcurso.svelte
- src/lib/componentes/SecaoRecolhivel.svelte
- src/lib/componentes/EstadoVazio.svelte
tags: []
---

# WP04 – Componentes da tela de escolha

## Objetivo

Cinco componentes de apresentação, sem regra de negócio e sem ler preferências: recebem
props e emitem callbacks. O `Icone` também serve ao WP06.

## Contexto

- FR-004 (Ver mais / recolher), FR-005 (conteúdo do cartão), FR-006 (estado vazio), NFR-004 (360 px), NFR-005 (contraste), C-002 (nada de ícone, cor ou fonte do Acertei).
- Tokens de `src/app.css` (WP01): `--cor-*`, `--raio`, `--espaco`, `--sombra`. Use só tokens, nunca cor literal.
- Tipos de `$lib/dados` (WP02): `Concurso`, `NomeIcone`, `ICONES`.
- Svelte 5: `$props()`, callbacks como props (`onescolher`), `{#snippet}`/`{@render}` para conteúdo. Sem `createEventDispatcher`.

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`; paralelo ao WP03.
Comando: `spec-kitty agent action implement WP04 --agent <nome>`.

## Subtarefas

### T016 — `Icone.svelte`

- Props: `nome: NomeIcone`, `tamanho = 24`, `rotulo?: string`.
- Um `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` com os `<path>` do nome.
- Desenhe os 24 nomes de `ICONES`. Pode usar traçados do Lucide (licença ISC — cite em comentário no topo: `// Traçados adaptados de Lucide (ISC), https://lucide.dev`). Não use Ionicons nem imagens do Acertei.
- Acessibilidade: sem `rotulo` → `aria-hidden="true"`; com `rotulo` → `role="img"` e `aria-label`.
- Um `Record<NomeIcone, string>` com os `d` garante em tempo de tipo que nenhum nome ficou sem desenho.

### T017 — `CampoBusca.svelte`

- Props: `valor = $bindable('')`, `rotulo = 'Buscar concurso'`, `placeholder = 'Busque por concurso, órgão, banca ou cargo'`.
- `<label>` visualmente oculto (classe `.sr-only` local) ligado ao `<input type="search" inputmode="search" autocomplete="off" enterkeyhint="search">`.
- Ícone `busca` à esquerda; botão "Limpar" (`aria-label="Limpar busca"`) aparece só com texto e devolve o foco ao input.
- Altura mínima 48 px (alvo de toque).

### T018 — `CartaoConcurso.svelte`

- Props: `concurso: Concurso`, `etiqueta: string` (a tela passa "Aberto", "Previsto" ou "Encerrado", derivado da situação efetiva — o componente não calcula), `onescolher: (id: string) => void`.
- O cartão inteiro é um `<button type="button">` (um único alvo de toque, leitor de tela lê tudo como um botão). Conteúdo:
  - círculo com `Icone` do concurso na cor `var(--cor-{concurso.cor})` com fundo em `color-mix(in srgb, var(--cor-{cor}) 14%, transparent)`;
  - **nome** (negrito), linha "banca · cargo principal" (`cargos[0].nome`) em `--cor-texto-suave`;
  - à direita: etiqueta (pílula) e salário (se houver);
  - chevron.
- Mapear `cor` para classe (`.cor-azul` …) em vez de estilo inline dinâmico.
- Texto longo quebra linha; nada de `white-space: nowrap` que cause rolagem horizontal em 360 px.
- `aria-label` completo: `"{nome}, banca {banca}, {etiqueta}"`.

### T019 — `SecaoRecolhivel.svelte`

- Props: `titulo: string`, `contagem: number`, `aberta = $bindable(false)`, `children: Snippet`.
- Cabeçalho é `<button aria-expanded={aberta} aria-controls={id}>` com título, contagem entre parênteses e ícone `seta-baixo`/`seta-cima`. Conteúdo em `<div id={id} hidden={!aberta}>`. `id` via `$props.id()` (Svelte 5.20+).
- Transição de altura opcional com `svelte/transition` `slide`, que já respeita `prefers-reduced-motion` pelo CSS global.
- `contagem === 0` → renderiza nada (seção vazia some; a tela decide o estado vazio global).

### T020 — `EstadoVazio.svelte`

- Props: `termo: string`, `whatsapp: string | null`, `onestudarPorDisciplina: () => void`.
- Texto (FR-006, rótulos curtos da interface de referência, sem texto longo copiado):
  - título: `Poxa, não encontramos "{termo}"`
  - linha: `A gente adiciona para você!`
  - linha: `Enquanto isso, escolha um caminho:`
  - botão primário "Estudar por Disciplina" → `onestudarPorDisciplina()`;
  - link "Pedir no WhatsApp" (`<a href={whatsappComTexto} target="_blank" rel="noopener">`, ícone `whatsapp`) **só se** `whatsapp` não for `null`; anexar `?text=` com `encodeURIComponent('Quero o concurso: ' + termo)`.
- `role="status"` no contêiner para leitores de tela anunciarem o resultado vazio.

## Verificação sem tela

Até o WP05 existir não há rota que use estes componentes. Para conferir visualmente, crie
**localmente** uma rota de rascunho (ex.: `src/routes/rascunho/+page.svelte`) e **não a
commite** — está fora de `owned_files`. A porta do WP é `npm run check` (zero erros e zero
avisos `a11y_*` do compilador) e `npm run build`.

## Definition of Done

- [ ] `npm run check` sem erro nem aviso de acessibilidade; `npm test` e `npm run build` passam.
- [ ] Os 24 ícones desenhados; atribuição do Lucide no comentário, se usado.
- [ ] Nenhuma cor literal fora de `app.css`; nenhum `nowrap` que force rolagem.
- [ ] Nenhum arquivo fora de `owned_files` commitado.

## Riscos

- `color-mix` não existe em navegadores muito antigos; aceitável (evergreen, plano).
- `$props.id()` exige Svelte ≥ 5.20; o WP01 instala 5.57.

## Guia do revisor

Ler cada componente procurando regra de negócio escondida (não pode haver); conferir `aria-expanded`, `aria-label` do cartão, alvo de toque ≥ 44 px, e que o WhatsApp some com `null`.
