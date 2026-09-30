---
work_package_id: WP04
title: Componentes do feed
dependencies:
- WP03
requirement_refs:
- C-003
- C-006
- FR-003
- FR-005
- FR-006
- FR-007
- FR-008
- FR-009
- FR-012
- NFR-002
- NFR-003
- NFR-006
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-feed-estudo-cgu-01M3S6H8
base_commit: d9885b75ba62702a7c11296c8bfc2d12104bf8ff
created_at: '2026-09-30T13:55:25.338705+00:00'
subtasks:
- T018
- T019
- T020
- T021
- T022
- T023
- T024
phase: Fase 2
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "11108"
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/componentes/feed/
execution_mode: code_change
owned_files:
- src/lib/componentes/feed/**
- src/lib/componentes/Icone.svelte
- src/lib/dados/tipos.ts
- src/app.css
tags: []
---

# WP04 – Componentes do feed

## Objetivo

Os componentes visuais do feed, prontos e acessíveis, recebendo dados por props e chamando o
motor do WP03 só por callbacks (sem ler storage direto). Direção visual própria — um feed de
estudo com cara de app social, **sem** a marca, gradiente, ícones ou layout proprietário do
Instagram (C-003).

## Contexto

- Spec: Cenários 1–4, FR-003, FR-005, FR-006, FR-007, FR-008, FR-009, FR-012; NFR-002, NFR-003, NFR-006, NFR-007.
- `plan.md` "Componentes novos"; `research.md` R6, R9; tipos em `src/lib/feed/tipos.ts` (WP03, já na lane).
- Existentes: `src/app.css` (tokens claro/escuro), `Icone.svelte` (tipo `NomeIcone` e lista `ICONES` em `src/lib/dados/tipos.ts`).
- Svelte 5 runes; CSS puro com tokens; `prefers-reduced-motion` respeitado.

## Branch Strategy

Planejamento em `main`; merge em `main`. A lane precisa do código do WP03 (o orquestrador mescla).
`spec-kitty agent action implement WP04 --agent <nome>`.

## Subtarefas

### T018 — Ícones
Acrescentar a `ICONES` (em `src/lib/dados/tipos.ts`) e desenhar em `Icone.svelte`: `coracao`, `coracao-cheio`, `marcador`, `marcador-cheio`, `casa`, `grade` (painel), `seta-esquerda`, `seta-direita`, `virar`, `check`, `x`, `lei`, `lampada` (resumo), `interrogacao` (questão). Traçados Lucide (ISC) ou próprios; nada do Instagram.

### T019 — `Post.svelte` e `AcoesPost.svelte`
- `Post` props: `post: Post`, `materia: Materia`, `curtido`, `salvo`, `resposta`, `onCurtir`, `onSalvar`, `onResponder(r)`, `onVisto()`.
- Cabeçalho: avatar circular da matéria (iniciais da `abrev` sobre cor derivada do id), nome da matéria, rótulo do tipo ("Questão · CGU 2022 · AFFC TI · Q. 47", "Lei seca · LAI", "Resumo", "Flashcard") e, se `conferido === false`, selo "gerado — a revisar".
- Corpo por tipo (T020–T022). Rodapé: `AcoesPost` com coração (`aria-pressed`), marcador (`aria-pressed`) e, em resumo/flashcard, a fonte.
- Duplo toque para curtir conforme R9 (não em questão ainda não respondida), com coração animado central (sem animação se `prefers-reduced-motion`).
- `onVisto`: `IntersectionObserver` com 50% visível por ≥ 1 s, chamado uma vez.
- `content-visibility: auto; contain-intrinsic-size: auto 480px` no artigo (NFR-002). `<article aria-labelledby>`.

### T020 — `CorpoQuestao.svelte`
- `textoBase` em bloco recolhível se > 400 caracteres ("Ler texto-base").
- `ce`: botões grandes "Certo" / "Errado"; `me`: lista de alternativas como botões. Após responder: desabilita, marca escolhida e correta (cor **e** ícone ✓/✗, não só cor), mostra "Você acertou"/"Você errou — gabarito: E". Retorno visual imediato (NFR-003). Já respondida ao montar ⇒ estado final direto.
- `aria-live="polite"` no resultado.

### T021 — `Carrossel.svelte`
- Props: `telas: Snippet[]` ou `itens` + snippet de render; `rotulo`.
- Faixa com `scroll-snap-type: x mandatory`, cada tela 100% da largura; botões ‹ › (ocultos no primeiro/último), pontos, contador "2/4". Sincronizar índice por `scrollend`/IntersectionObserver. Teclado ←/→ com foco no carrossel. `aria-roledescription="carrossel"`, telas `role="group" aria-roledescription="tela" aria-label="2 de 4"`.
- Gesto horizontal não pode prender a rolagem vertical do feed (`touch-action: pan-x pan-y`, sem `preventDefault` global).

### T022 — `CorpoLei`, `CorpoResumo`, `CorpoFlashcard`
- Lei: título da norma, artigo em destaque, linhas preservadas (incisos/§ com recuo), revogados riscados com a nota; > 1 tela ⇒ `Carrossel`.
- Resumo: `Carrossel` com título na 1ª tela e fonte na última.
- Flashcard: `<button aria-pressed>` que vira (frente "Pergunta" / verso "Resposta"), animação 3D só sem `prefers-reduced-motion`; texto dos dois lados acessível (o oculto com `aria-hidden`).

### T023 — `BarraStories`, `BarraAbas`, `FimDoFeed`
- Stories: rolagem horizontal; "Tudo" + círculos por matéria (props já ordenadas pelo motor); anel colorido/cinza (`vista`); selecionado com `aria-current="true"`; cada círculo é `<a href="/?materia=id">` (navegação real, funciona sem JS e no voltar do navegador).
- Abas: fixa no rodapé, 3 links (Feed `/`, Salvos `/salvos`, Painel `/painel`) com ícone + texto, `aria-current="page"`, respeita `env(safe-area-inset-bottom)`.
- `FimDoFeed`: "Você viu tudo desta matéria" + link para "Tudo" (ou "Você viu tudo por hoje" no filtro Tudo).

### T024 — Direção visual (skill `frontend-design`)
Carregar a skill `frontend-design` e definir, **antes** de estilizar, uma direção própria para um feed de estudo (tipografia do sistema, hierarquia, ritmo vertical, cor por matéria, estados de acerto/erro, tema escuro). Acrescentar os tokens novos em `src/app.css` (contraste ≥ 4,5:1 nos dois temas — anotar os pares no histórico). Registrar a direção em 5–10 linhas no histórico do WP.

**Verificação visual**: rota de rascunho local **não commitada** com um post de cada tipo, em 360 px, claro e escuro.

## Definition of Done

- [ ] `npm run check` sem erro nem aviso a11y; `npm test`, `npm run build` e e2e existentes passam.
- [ ] Todos os estados de cada corpo verificados na rota de rascunho (apagada antes do commit).
- [ ] Nenhuma lógica de storage nos componentes; nenhum ativo do Instagram.

## Riscos

- Duplo toque vs. toque simples em telas de toque: testar no emulador mobile do Playwright.
- `scroll-snap` + `content-visibility` podem conflitar em alguns navegadores: se o carrossel medir 0, tirar `content-visibility` do contêiner do carrossel.

## Guia do revisor

Operar cada componente só com teclado e com leitor de tela (nomes e estados), em 360 px; conferir contraste dos tokens novos.

## Activity Log

- 2026-09-30T13:55:28Z – claude:opus:implementer:implementer – shell_pid=10720 – Assigned agent via action command
- 2026-09-30T14:09:22Z – claude:opus:implementer:implementer – shell_pid=10720 – T024 direção visual: post como 'ficha de estudo' encostada na coluna, sem cartão com sombra nem gradiente; lombada de 4px à esquerda na cor da matéria (a mesma do avatar e do anel do story) é o único gesto forte. Duas famílias do sistema: sans (system-ui) para interface e metadados; serifada do sistema (--fonte-texto: Iowan/Palatino/Georgia) para o que se lê — enunciado, lei, resumo, flashcard — com cara de prova e de diário oficial. Momento de destaque: número do artigo em serifada 2rem na cor --cor-lei. Acerto/erro: fundo tingido + borda + ícone check/x + frase, nunca só cor. Curtida em magenta (#c0265a/#f472b6), não o vermelho do Instagram; anel de story sólido (sem gradiente), visto = anel cinza fino. Cor por matéria: 8 tokens --materia-0..7 por hash do id. Tema escuro: mesmas funções, matérias em tons claros com texto #0b1220. Pares (claro/escuro): acerto/acerto-fundo 5,76/9,96; erro/erro-fundo 6,19/8,56; aviso/aviso-fundo 6,68/10,24; curtida/superfície 5,73/6,55; lei/superfície 10,36/11,30; texto sobre --materia-N >= 4,99/>= 7,52; visto/fundo (não texto, >=3:1) 3,47/4,00.
- 2026-09-30T14:09:32Z – claude:opus:implementer:implementer – shell_pid=10720 – Ready for review
- 2026-09-30T14:10:22Z – claude:opus:reviewer:reviewer – shell_pid=11108 – Started review via action command
- 2026-09-30T14:15:51Z – claude:opus:reviewer:reviewer – shell_pid=11108 – Review passed: T018-T024 met; check 0/0, 97 unit, build, 46 e2e green; scratch-route Pixel 7 @360px verified double-tap rules, carousel arrows/keys/swipe/counter, flashcard aria swap, revogados rendering, no overflow; revogados semantics match WP01 montarTelas (global index over non-empty lines). Non-blocking: accept resposta null (motor returns Resposta|null), duplo toque depends on motor round-trip.
- 2026-09-30T22:46:26Z – claude:opus:reviewer:reviewer – shell_pid=11108 – merged in de25b4a | Done override: Squash merge de25b4a em main (código idêntico ao branch da missão); registro pós-merge interrompido por arquivos residuais no Windows
