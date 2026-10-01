---
work_package_id: WP04
title: Telas e painel no novo visual
dependencies:
- WP01
requirement_refs:
- C-004
- C-005
- FR-004
- FR-006
- FR-008
- NFR-006
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-identidade-visual-aventura-kindle-01M3T7H9
base_commit: 206a7c080882d9e44c9b93486f9ac21b7a875a28
created_at: '2026-09-30T23:37:59.708131+00:00'
subtasks:
- T019
- T020
- T021
- T022
- T023
- T024
phase: Fase 2 - Aplicação
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "2184"
history:
- timestamp: '2026-09-30T22:57:03Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/
execution_mode: code_change
owned_files:
- src/routes/+page.svelte
- src/routes/salvos/**
- src/routes/ferramenta/**
- src/lib/componentes/CabecalhoPainel.svelte
- src/lib/componentes/FocoEstudo.svelte
- src/lib/componentes/ProgressoEstudo.svelte
- src/lib/componentes/GradeFerramentas.svelte
tags: []
---

# WP04 – Telas e painel no novo visual

## Objetivo

As rotas e os componentes do painel entram no mesmo sistema do WP03. No feed e em `/salvos`, os posts
passam de uma lista colada, com bordas compartilhadas, a **cartões espaçados** (o post já é cartão, pelo
WP03), sem nenhum `overflow: hidden` que corte a sombra dura. O esqueleto de carregamento deixa de
pulsar em loop. No painel, o cabeçalho é **o** elemento de cor forte da tela no Aventura, e nos Kindle
vira uma página sóbria.

**Só visual** (C-005): não mude lógica, textos, rotas nem ARIA. Os e2e existentes (`feed.spec.ts`,
`salvos.spec.ts`, `painel.spec.ts`, `smoke.spec.ts`, `responsivo.spec.ts`) passam **sem edição**.

## Contexto

- Spec: FR-004, FR-006, FR-008; NFR-006; C-004, C-005.
- Tokens do WP01 (mescle a lane dele antes): `--linha-peso`, `--sombra`, `--cor-divisor`, `--raio`, `--fonte-titulo`, `--textura`.
- As **mesmas regras 1 a 7** do WP03 valem aqui ([WP03](WP03-componentes-feed-visual.md), seção "Regras que valem para todas as subtarefas"): contorno, divisor, sombra só em cartão de primeiro nível e botão primário, raio por hierarquia, fontes por papel, condicional de tema só com `:global([data-tema^='kindle'])` e zero cor fixa.
- **Botão primário do sistema** (definido no WP03, T016, e repetido aqui para ser igual em todo o app): `border-radius: calc(var(--raio) / 2); border: var(--linha-peso) solid var(--cor-borda); background: var(--cor-primaria); color: var(--cor-primaria-texto); box-shadow: var(--sombra);`, sem pílula de `999px`.
- Estado atual em `db7ef10`:
  - `src/routes/+page.svelte` (feed): `.posts` com `border-top: 1px`, e a partir de 592 px `border: 1px`, `border-radius` e **`overflow: hidden`**, que cortaria a sombra do cartão; `.esqueleto` e `.bolinha` com `animation: pulso 1.2s … infinite alternate` (linha 258); botão de erro em pílula.
  - `src/routes/salvos/+page.svelte`: a mesma estrutura de `.posts` e botões em pílula.
  - `CabecalhoPainel.svelte`: fundo `--cor-primaria`, `box-shadow: var(--sombra)`; `h1` "Seu Painel de Estudos" em **caixa-alta com `letter-spacing: 0.06em`**, pequeno, acima do nome do concurso (é o padrão "eyebrow" da lista C-004); link "Ver edital" em pílula.
  - `FocoEstudo.svelte`, `ProgressoEstudo.svelte` e `GradeFerramentas.svelte`: cartões com `1px solid var(--cor-borda)`; a grade tem `box-shadow` e `transition: border-color`.
  - `ferramenta/[id]/+page.svelte` e `+error.svelte`: caixa com `1px` e botão "voltar" em pílula.

## Branch Strategy

Planejamento em `main` e merge em `main`. Depende do WP01: mescle a lane do WP01 na desta antes de
começar. A worktree vem da lane calculada em `lanes.json`. Comando:
`spec-kitty agent action implement WP04 --agent <nome>`.

## Subtarefas

### T019 — Tela do feed (`src/routes/+page.svelte`)

1. `.posts`: vira uma pilha de cartões espaçados.
   ```css
   .posts {
   	display: grid;
   	gap: calc(var(--espaco) * 1.25);
   	margin: 0;
   	/* Espaço para a sombra dura (4px) não encostar na borda da tela nem ser cortada. */
   	padding: 0 4px 4px 0;
   }
   ```
   Apague o `border-top` e o bloco `@media (min-width: 592px)` com `border`, `border-radius` e `overflow: hidden`. O post já é cartão (WP03). A margem negativa (`margin: 0 calc(-1 * var(--espaco))`, "ponta a ponta no celular") também sai: com contorno, o cartão precisa de respiro lateral.
2. `.feed`: o `margin-top` negativo continua, se ainda fizer sentido com os stories. Confira visualmente a 360 px.
3. **Esqueleto**:
   - `.esqueleto` imita o cartão: `border: var(--linha-peso) solid var(--cor-divisor); border-radius: var(--raio); background: var(--cor-superficie);`, sem sombra (ainda não é conteúdo).
   - Remova `animation: pulso … infinite` e o `@keyframes pulso`. O esqueleto fica estático: movimento contínuo que não responde a ação sai no Aventura (FR-008, plan §6).
   - `.linha`, `.bloco` e `.bolinha`: `background: var(--cor-divisor)`, que no Kindle vira o cinza do realce.
4. `.erro button`: botão primário do sistema.
5. `.filtro-tipo a`: continua como link, sublinhado e em `--cor-primaria`. Não vira botão.

**Validação**: a 360 px e a 1440 px, a sombra dura do post aparece inteira à direita e embaixo, sem corte, e não há rolagem horizontal (NFR-006).

### T020 — Tela `/salvos` [P]

1. `.posts`: igual ao T019.1.
2. `.vazio a` e `.erro button`: botão primário do sistema.
3. `.vazio p`: tem `max-width: 32ch`; mantenha.

### T021 — `CabecalhoPainel` [P]

1. **Hierarquia sem mudar o texto**: o `h1` "Seu Painel de Estudos" deixa de ser o rótulo pequeno em caixa-alta e vira o título da tela:
   ```css
   h1 {
   	margin: 0;
   	font-family: var(--fonte-titulo);
   	font-size: 1.75rem;
   	font-weight: 700;
   	line-height: 1.15;
   }
   ```
   Tire o `text-transform: uppercase` e o `letter-spacing` (C-004). `.concurso` passa a ser o subtítulo: `font-size: 1.0625rem; font-weight: 700; margin: 8px 0 2px`.
2. **Aventura**: o cabeçalho continua com fundo `--cor-primaria` (violeta) e texto `--cor-primaria-texto`. É o único bloco de cor forte do painel (a nota do vault pede "a cor forte num lugar só"). Acrescente o contorno e a sombra do sistema: `border: var(--linha-peso) solid var(--cor-borda); box-shadow: var(--sombra);`.
3. **Kindle**: um bloco preto ou cinza-claro cheio destoa do "livro". Acrescente:
   ```css
   /* Kindle: o cabeçalho é página, não bloco de cor. */
   :global([data-tema^='kindle']) .cabecalho {
   	background: var(--cor-superficie);
   	color: var(--cor-texto);
   }
   ```
   Confira que o `.edital:focus-visible { outline-color: var(--cor-primaria-texto) }` continua visível nos Kindle. Se não estiver, acrescente, no mesmo bloco condicional, `outline-color: var(--cor-primaria)`.
4. `.edital` (pílula com `1px solid currentColor`): `border: var(--linha-peso) solid currentColor; border-radius: calc(var(--raio) / 2);`.

### T022 — `FocoEstudo`, `ProgressoEstudo`, `GradeFerramentas` [P]

**`FocoEstudo.svelte`**:
1. A seção (`1px solid var(--cor-borda)`, `--raio`): regra 1 (contorno), **sem** sombra. Só o cabeçalho do painel tem destaque; o resto é quieto.
2. `h2`: `font-family: var(--fonte-titulo)`.
3. `.fixo` (tracejado, `10px`): `border-radius: calc(var(--raio) / 2)`; o tracejado fica (indica "não editável").
4. `select`: `border: var(--linha-peso) solid var(--cor-borda); border-radius: calc(var(--raio) / 2); background: var(--cor-superficie);`.

**`ProgressoEstudo.svelte`**:
1. A seção: regra 1, sem sombra.
2. `.numeros div` (caixinhas de número, com `10px` e fundo `--cor-fundo`): `border-radius: calc(var(--raio) / 2); border: 1px solid var(--cor-divisor);`.
3. `.materias li` (`border-bottom`): regra 2 (divisor).
4. Os títulos `h2` e `h3`, se houver: `var(--fonte-titulo)`.

**`GradeFerramentas.svelte`**:
1. `.cartao`: regra 1, `box-shadow: var(--sombra)` (atalho clicável é cartão de primeiro nível) e `border-radius: var(--raio)`.
2. `transition: border-color` e `.cartao:hover { border-color: var(--cor-primaria) }` → no hover, o efeito de "levantar" do sistema: `transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--cor-texto);`, **só** no Aventura, com `:global([data-tema='aventura']) .cartao:hover`. Tire o `transition`: o deslocamento é instantâneo e casa com a sombra dura. Nos Kindle, o hover só sublinha o título (`.cartao:hover .titulo { text-decoration: underline }`).

### T023 — `/ferramenta/[id]` e página de erro [P]

1. Caixa central (`1px`, `--raio`): regra 1, sem sombra.
2. `h1`: `font-family: var(--fonte-titulo)`.
3. Botão "voltar" (pílula): botão primário do sistema.
4. O mesmo em `+error.svelte`.

### T024 — Varredura C-004 nas telas

Faça a mesma tabela do WP03 (T018) para os arquivos deste WP e anote o resultado no handoff. Pontos já
conhecidos: o `h1` em caixa-alta do cabeçalho (T021) e a meta "banca Cebraspe · CGU" com ponto do meio
em `CabecalhoPainel`, que **fica**, porque é dado e mudar o texto viola C-005. Registre que foi avaliado.

Confira também: `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" <arquivos do WP>` volta vazio.

## Definition of Done

- [ ] T019 a T024 feitos; `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` passando, com os e2e existentes **sem edição**.
- [ ] Nenhum `overflow: hidden` em contêiner de cartões com sombra.
- [ ] Nenhuma `animation` com `infinite` em `src/routes/` (`grep -rn "infinite" src/routes` volta vazio).
- [ ] Capturas de `/` (incluindo o esqueleto: DevTools › Network › Slow 3G), `/salvos` vazio, `/painel` e `/ferramenta/<id>` nos 3 temas, anexadas.
- [ ] Nenhum arquivo fora de `owned_files` alterado; `git add` por caminho (DIRECTIVE_033). O `src/routes/painel/+page.svelte` é do WP02, então não mexa nele.

## Riscos

| Risco | Mitigação |
|---|---|
| Os posts sem margem negativa perdem largura útil no celular | O contorno exige respiro. Confira que o texto de leitura ainda tem pelo menos 36 caracteres por linha a 360 px |
| O `painel.spec.ts` procura o `h1` pelo papel ou pelo nome | O texto e o nível não mudam, só o estilo |
| O hover com `transform` desloca o foco visível | O outline acompanha o elemento; confira com o teclado |

## Orientação ao revisor

- Com a sombra do Aventura, olhe as bordas direita e inferior dos cartões a 360 px: nada cortado.
- Kindle: o cabeçalho do painel não pode ser um bloco escuro cheio.
- Confira que só o cabeçalho do painel tem cor forte no Aventura, e que o resto usa superfície e contorno.

## Activity Log

- 2026-09-30T23:38:02Z – claude:opus:implementer:implementer – shell_pid=2184 – Assigned agent via action command
- 2026-10-01T00:27:54Z – claude:opus:implementer:implementer – shell_pid=2184 – Ready for review; e2e 63/63 run by orchestrator (CI=1, clean port) on 3659d2b
