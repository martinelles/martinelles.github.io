---
work_package_id: WP01
title: Tela de Ajustes e painel enxuto
dependencies: []
requirement_refs:
- C-001
- C-002
- C-003
- C-004
- FR-001
- FR-002
- FR-003
- FR-004
- FR-005
- FR-006
- FR-008
- NFR-002
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-aparencia-tela-propria-01M3YHGF
base_commit: 9cc244288a5b3e5f4e5fb679e72361b8de2baa2a
created_at: '2026-10-02T15:02:20.617640+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
phase: Fase 1 - Tela e cabeçalho
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "4092"
history:
- timestamp: '2026-10-02T14:59:07Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/painel/
execution_mode: code_change
owned_files:
- src/routes/painel/+page.svelte
- src/routes/painel/ajustes/**
- src/lib/componentes/CabecalhoPainel.svelte
- src/lib/componentes/Icone.svelte
- src/lib/dados/tipos.ts
- tests/e2e/tema.spec.ts
- tests/e2e/painel.spec.ts
- tests/e2e/responsivo.spec.ts
tags: []
---

# WP01 – Tela de Ajustes e painel enxuto

## Objetivo

Tirar do painel os blocos **Foco de Estudo** (`FocoEstudo`) e **Aparência** (`SeletorTema`) e reuni-los
na tela nova `/painel/ajustes`, aberta por um link com ícone no canto do cabeçalho do painel. O painel
passa a mostrar o foco atual só em texto. Os e2e que hoje procuram esses blocos em `/painel` passam a
procurá-los na tela nova, **sem perder nenhum caso** (SC-004).

**Composição apenas** (C-001): `FocoEstudo.svelte`, `SeletorTema.svelte`, `foco.svelte.ts` e
`tema.svelte.ts` não mudam.

## Contexto

- Spec: FR-001 a FR-008, NFR-001 a NFR-004, C-001 a C-004.
- **Contrato** (papéis e textos que os testes usam): [contracts/tela-ajustes.md](../contracts/tela-ajustes.md).
- Decisões: [plan.md](../plan.md), "Decisões de arquitetura" 1 a 6, e [research.md](../research.md) R1 a R4.
- Estado em `main` `5e16a61`:
  - `src/routes/painel/+page.svelte` monta `CabecalhoPainel`, `AvisoRegistro`, `MissaoDoDia`, `ResumoPlano` (missão do plano), `FocoEstudo` (com a constante `CARGO = 'AFFC — TI — Ciência de Dados'`), `ProgressoEstudo`, `SeletorTema` e `GradeFerramentas`, além do `<svelte:head>` com o título.
  - `CabecalhoPainel.svelte` recebe `{ concurso, prazo }`; tem `h1` "Seu Painel de Estudos", a linha do concurso com o cargo (`concurso.cargos[0]?.nome`), a banca e os indicadores. No Aventura o fundo é `--cor-primaria`, e nos Kindle é a superfície (`:global([data-tema^='kindle'])`).
  - `+layout.svelte` marca a aba Painel para caminhos que começam com `/painel`, o que já cobre `/painel/ajustes`.
  - `ICONES` em `src/lib/dados/tipos.ts` e os traços `TRACADOS` em `src/lib/componentes/Icone.svelte` (adaptados do Lucide, ISC, um único `d` por ícone; `Record<NomeIcone, string>` acusa ícone sem desenho).
  - Padrão de "Voltar ao painel" em `src/routes/ferramenta/[id]/+page.svelte`: `<a class="voltar" href="/painel"><Icone nome="voltar" tamanho={20} /> Voltar ao painel</a>`.
- Identidade visual (C-002): tokens dos 3 temas (`--linha-peso`, `--cor-borda`, `--raio`, `--fonte-titulo`), zero cor fixa e sem `transition`; lista anti-"cara de IA" em `kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/tasks/WP03-componentes-feed-visual.md`, seção "Regras que valem para todas as subtarefas".
- **Outras missões**: a do plano de estudos também edita `painel/+page.svelte`. Faça merge da `main` antes de começar e de novo antes de pedir revisão. A `main` costuma ter arquivos sem commit de outras sessões (por exemplo `static/conteudo/*`): `git add` só por caminho (DIRECTIVE_033).

## Branch Strategy

Planejamento em `main` e merge em `main`. Sem dependências; a worktree vem da lane calculada em
`lanes.json`. Comando: `spec-kitty agent action implement WP01 --agent <nome>`.

## Subtarefas

### T001 — Ícone `ajustes` [P]

1. Em `src/lib/dados/tipos.ts`, acrescente `'ajustes'` a `ICONES`, num bloco com o comentário `// Ajustes`.
2. Em `src/lib/componentes/Icone.svelte`, acrescente `ajustes` a `TRACADOS`, com o traço do Lucide `sliders-horizontal` (ISC) convertido para um único `d`: as linhas horizontais e as hastes verticais curtas viram segmentos `M…h…`/`M…v…` numa só string. Referência do original: linhas `x1=21 x2=14 y=4`, `x1=10 x2=3 y=4`, `x1=21 x2=12 y=12`, `x1=8 x2=3 y=12`, `x1=21 x2=16 y=20`, `x1=12 x2=3 y=20`, e hastes `x=14 y1=2 y2=6`, `x=8 y1=10 y2=14`, `x=16 y1=18 y2=22`.
   Resultado esperado (confira desenhando a 24 px): `'M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4'`.
3. **Validação**: `npm run check` passa (o `Record` exige o traço).

### T002 — Rota `/painel/ajustes`

Crie `src/routes/painel/ajustes/+page.svelte`:

```svelte
<script lang="ts">
	// Ajustes (FR-003 a FR-005): Foco de Estudo e Aparência, fora da primeira página do painel.
	import { getContext } from 'svelte';
	import FocoEstudo from '$lib/componentes/FocoEstudo.svelte';
	import Icone from '$lib/componentes/Icone.svelte';
	import SeletorTema from '$lib/componentes/SeletorTema.svelte';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { foco } from '$lib/feed/foco.svelte';
	import type { Materia } from '$lib/feed/tipos';

	/** Cargo fixo (D6 da missão do feed): não há seletor. */
	const CARGO = 'AFFC — TI — Ciência de Dados';

	const repo = getContext<Repositorio>('repositorio');
	let materias = $state.raw<Materia[] | null>(null);
	repo.materias().then((m) => (materias = m), () => {});
</script>

<svelte:head>
	<title>Ajustes · Painel de Concurso</title>
</svelte:head>

<div class="ajustes">
	<header class="topo">
		<a class="voltar" href="/painel"><Icone nome="voltar" tamanho={20} /> Voltar ao painel</a>
		<h1>Ajustes</h1>
	</header>
	<FocoEstudo cargo={CARGO} {materias} disciplina={foco.disciplina}
		onescolherDisciplina={(id) => foco.escolherDisciplina(id)} />
	<SeletorTema />
</div>
```

- **Ordem no documento** (contrato): `h1` "Ajustes", o link "Voltar ao painel", a seção Foco de Estudo e o grupo Aparência. Se, visualmente, o "Voltar" ficar acima do título, mantenha no DOM a ordem do contrato (h1 primeiro) e use `order` no CSS, ou ponha o `h1` antes no markup. O teste do WP02 confere a ordem pelo DOM.
- Estilos: `.ajustes` com `display: flex; flex-direction: column; gap: calc(var(--espaco) * 1.25)` (o mesmo do painel). `h1` em `var(--fonte-titulo)`, `1.75rem`, peso 700, igual ao `h1` do cabeçalho do painel. `.voltar` com o mesmo estilo do `/ferramenta/[id]` (copie as regras), alvo ≥ 44 px.
- `CARGO` mora aqui agora; tire do painel no T004.
- Sem `+page.ts`: a rota é estática (o `prerender`/SPA do projeto cuida dela).

**Validação**: `npm run dev` e abrir `/painel/ajustes`: foco e tema funcionam como antes; a aba Painel aparece marcada.

### T003 — `CabecalhoPainel`: link "Ajustes" e foco atual

1. Props: `{ concurso, prazo, foco }` com `foco?: string`, que é o **nome** da matéria de foco já resolvido; quem resolve o nome é o painel (T004).
2. **Link no canto** (FR-002, NFR-002):
   ```svelte
   <a class="ajustes" href="/painel/ajustes" aria-label="Ajustes" title="Ajustes">
   	<Icone nome="ajustes" tamanho={22} />
   </a>
   ```
   - Posição: canto superior direito do cabeçalho. `.cabecalho { position: relative }` e `.ajustes { position: absolute; top: …; right: … }`, **ou** uma linha `display: flex` com o `h1` à esquerda e o link à direita. Prefira o flex: não sobrepõe o título a 360 px.
   - Caixa de 44 × 44 px, `display: grid; place-items: center`, `border: var(--linha-peso) solid currentColor`, `border-radius: calc(var(--raio) / 2)`, cor herdada (`currentColor`), sem `transition`. No Aventura o ícone fica claro sobre o violeta; nos Kindle, tinta sobre superfície. `:focus-visible` visível nos 3 temas: siga o `.edital`, que já tem o ajuste dos Kindle.
3. **Linha do foco** (FR-006): logo abaixo da linha da banca, `{#if foco}<p class="foco">Foco: {foco}</p>{/if}`, com o mesmo estilo da `.banca`. O cargo continua na linha do concurso, como já está.
4. Não mude o texto nem o nível do `h1` (os e2e o procuram por `heading level 1 'Seu Painel de Estudos'`).

### T004 — `/painel` sem os blocos

Em `src/routes/painel/+page.svelte`:
1. Remova `<FocoEstudo …/>` e `<SeletorTema />` e os imports deles. Remova também a constante `CARGO`, que agora mora na rota de Ajustes.
2. Calcule o nome do foco: `const nomeFoco = $derived(materias?.find((m) => m.id === foco.disciplina)?.nome ?? rotuloDoId(foco.disciplina))`, em que `rotuloDoId` formata o `id` enquanto as matérias carregam. Escreva essa função local e simples, sem criar módulo novo: `ti-ciencia-de-dados` vira `Ti ciencia de dados`, o que basta como estado provisório. Se já existir um utilitário para isso em `src/lib`, use-o.
3. Passe ao cabeçalho: `<CabecalhoPainel concurso={concursoCgu} {prazo} foco={nomeFoco} />`.
4. Atualize o comentário do topo do arquivo: o foco é mostrado em texto, e os ajustes ficam em `/painel/ajustes`.
5. **Não** mexa nos blocos do plano (`AvisoRegistro`, `MissaoDoDia`, `ResumoPlano`), que são de outra missão (C-003).

### T005 — Migrar os e2e existentes

Os testes que dependiam dos blocos no painel passam a abrir a tela nova. **Não remova casos**: mude só onde abrem e o que esperam encontrar.

1. `tests/e2e/tema.spec.ts`:
   - `abrirPainel(page)` (linha ~47) vira `abrirAjustes(page)`, com `goto('/painel/ajustes')` e a mesma espera pelo `group` "Aparência". Renomeie também os usos.
   - O teste da posição do feed (linhas ~155–170) navega pela aba "Painel" e espera o grupo Aparência. Depois de chegar em `/painel`, clique no link "Ajustes" (`getByRole('link', { name: 'Ajustes' })`) e espere `toHaveURL('/painel/ajustes')`. A comparação com o comportamento-base continua igual.
   - A tabela de telas do teste de cores (linhas ~305–320, entrada `/painel`) troca a espera pelo grupo Aparência pela espera do `h1` e do link "Ajustes", e ganha uma entrada nova `/painel/ajustes` que espera o grupo Aparência. Assim as cores continuam conferidas nas duas telas.
2. `tests/e2e/painel.spec.ts`, teste "foco: cargo fixo, disciplina…" (linhas ~38–56): `goto('/painel/ajustes')` no início e depois do `reload`. Depois do `selectOption`, acrescente a verificação de que, em `/painel`, o cabeçalho mostra `Foco: Direito Constitucional`. O resto (localStorage, story depois de "Tudo") continua igual. **Atenção**: `getByText('AFFC — TI — Ciência de Dados', { exact: true })` precisa achar **um** elemento em `/painel/ajustes`, o `.fixo` do FocoEstudo. Na tela de Ajustes não há cabeçalho do painel, então não há duplicata.
3. `tests/e2e/responsivo.spec.ts`, lista `TELAS` (linhas ~66–72): a entrada `/painel` passa a esperar o `h1` e o link "Ajustes" (sem "Disciplina"). Acrescente a entrada `/painel/ajustes`, que espera `getByLabel('Disciplina')` habilitado e o grupo Aparência. Ela herda os testes de largura, temas, zoom e alvo de toque.
4. Rode o e2e completo e confirme que **todos** os testes antigos continuam presentes. Compare a contagem antes e depois: só pode aumentar.

## Definition of Done

- [ ] T001 a T005 feitos; `npm run check`, `npm test`, `npm run build` e `CI=1 npm run test:e2e` passando, com a porta 4173 conferida livre antes, e sem servidor deixado no ar.
- [ ] Contagem de e2e igual ou maior que a da `main` antes do WP, informada no handoff.
- [ ] `grep -n "FocoEstudo\|SeletorTema" src/routes/painel/+page.svelte` volta vazio.
- [ ] `grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|transition" src/routes/painel/ajustes/+page.svelte src/lib/componentes/CabecalhoPainel.svelte` volta vazio.
- [ ] Merge da `main` feito antes de pedir revisão; nenhum arquivo fora de `owned_files` alterado.
- [ ] Capturas de `/painel` e `/painel/ajustes` a 360 px nos 3 temas (em porta que não seja a 4173), anexadas ao handoff.

## Riscos

| Risco | Mitigação |
|---|---|
| Conflito com a missão do plano em `painel/+page.svelte` | Diff só de remoções e de uma prop nova; merge da `main` antes e depois |
| Link no canto apertando o `h1` a 360 px | Layout em flex com quebra de linha; responsivo a 360 px nos 3 temas |
| Teste perde cobertura na migração | Contagem antes e depois no handoff; nenhum `test(` removido |

## Orientação ao revisor

- Confira o diff dos e2e: só mudaram os destinos e as esperas, e nenhum caso sumiu.
- Abra `/painel` a 360 px no Kindle escuro: o link "Ajustes" fica visível, com foco de teclado visível.
- Confira que `FocoEstudo`, `SeletorTema`, `foco.svelte.ts` e `tema.svelte.ts` não aparecem no diff (C-001).

## Activity Log

- 2026-10-02T15:02:23Z – claude:opus:implementer:implementer – shell_pid=24608 – Assigned agent via action command
- 2026-10-02T15:09:20Z – claude:opus:implementer:implementer – shell_pid=24608 – Ready for review; e2e 208 (191 antes) on 072aefc
- 2026-10-02T15:09:35Z – claude:opus:reviewer:reviewer – shell_pid=4092 – Started review via action command
