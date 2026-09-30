---
work_package_id: WP03
title: Componentes do feed no novo visual
dependencies:
- WP01
requirement_refs:
- C-004
- C-005
- FR-004
- FR-006
- FR-007
- FR-008
- FR-009
- NFR-004
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-identidade-visual-aventura-kindle-01M3T7H9
base_commit: 206a7c080882d9e44c9b93486f9ac21b7a875a28
created_at: '2026-09-30T23:37:48.863951+00:00'
subtasks:
- T013
- T014
- T015
- T016
- T017
- T018
phase: Fase 2 - Aplicação
assignee: ''
agent: ''
shell_pid: '23776'
history:
- timestamp: '2026-09-30T22:57:03Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/componentes/feed/
execution_mode: code_change
owned_files:
- src/lib/componentes/feed/**
tags: []
---

# WP03 – Componentes do feed no novo visual

## Objetivo

Levar os componentes de `src/lib/componentes/feed/` para o sistema novo: **contorno** com `--linha-peso`,
**sombra dura** com `--sombra`, **divisor fino** com `--cor-divisor`, **coluna de leitura** com `--medida`,
**título** com `--fonte-titulo`, e **nenhuma cor fixa**. No Aventura, o post vira um cartão com contorno
escuro grosso e sombra deslocada (Cenário 3.1); nos Kindle, uma página de livro: linha fina, sem sombra
e sem movimento (Cenário 4).

**Só visual** (C-005): não mude props, eventos, lógica, textos nem atributos ARIA. Os e2e existentes
(`feed.spec.ts`, `salvos.spec.ts`) precisam passar **sem edição**.

## Contexto

- Spec: Cenários 3 e 4; FR-004, FR-006, FR-007, FR-008, FR-009; NFR-004; C-004, C-005.
- Tokens: contrato [§5](../contracts/tema.md) e valores no [data-model.md](../data-model.md). Do WP01 (mescle a lane dele antes): `--linha-peso`, `--sombra`, `--cor-divisor`, `--raio`, `--medida`, `--fonte-titulo`, `--fonte-texto` (Literata) e a regra que zera movimento em `[data-tema^='kindle']`.
- Estado atual, levantado em `db7ef10`:
  - `Post.svelte`: `border-left: 4px solid var(--cor-materia)` e `border-bottom: 1px solid var(--cor-borda)`; na linha 239, `filter: drop-shadow(0 2px 8px rgb(0 0 0 / 25%))` no coração grande, **a única cor fixa do app**; `content-visibility: auto`.
  - `CorpoQuestao.svelte`: opções com `1.5px solid var(--cor-borda)`, `border-radius: 12px` e `transition`; estados `.correta` e `.errada` só com cor de borda e fundo, mas **ícone e texto já existem** (linhas 78–97).
  - `CorpoFlashcard.svelte`: giro 3D com `transition`; bloco `prefers-reduced-motion` que troca de face sem 3D.
  - `CorpoResumo.svelte` e `CorpoLei.svelte`: `--fonte-texto` já aplicada; sem `max-width` de leitura.
  - `BarraStories.svelte`: anel `3px solid var(--cor-materia)`; selecionado já marcado por sublinhado grosso, além da cor.
  - `Carrossel.svelte`: pontos com `transition: width` (o ativo é mais largo, uma forma e não só cor).
  - `AcoesPost.svelte`: `animation: pulso` ao curtir; curtido e salvo trocam ícone cheio e vazio.
  - `BarraAbas.svelte`: `border-top: 1px`; aba atual em negrito e sublinhada.
  - `FimDoFeed.svelte`: botão em pílula (`999px`).
- Referência de direção: skill `frontend-design` (seções "Design principles" e a lista de padrões genéricos) e a nota do vault (seção "A vibe de Hora de Aventura"). Resumo: uma coisa marcante por tela; o resto quieto.

## Branch Strategy

Planejamento em `main` e merge em `main`. Depende do WP01: mescle a lane do WP01 na desta antes de
começar (nota ao orquestrador em `tasks.md`). A worktree vem da lane calculada em `lanes.json`.
Comando: `spec-kitty agent action implement WP03 --agent <nome>`.

## Regras que valem para todas as subtarefas

1. **Contorno de componente** (cartão, post, opção, botão com borda, story "Tudo", lado de flashcard e tela de resumo): `border: var(--linha-peso) solid var(--cor-borda)`.
2. **Divisor interno** (linha entre seções dentro de um componente, `border-top` de rodapé): `1px solid var(--cor-divisor)`.
3. **Sombra**: só em cartão de primeiro nível (o post) e em botão primário: `box-shadow: var(--sombra)`. No Kindle ela vale `none`, então não precisa de condicional.
4. **Raio**: cartão usa `var(--raio)`; peças internas usam `calc(var(--raio) / 2)`; círculos (avatar, anel, ação) continuam `50%`. Isso dá raio variado por hierarquia (research D7, C-004).
5. **Fontes**: título de componente (nome da matéria no post, número do artigo, título do resumo, cabeçalho do fim do feed) usa `var(--fonte-titulo)`; texto de leitura usa `var(--fonte-texto)`; interface (rótulos, botões, ações) continua em `var(--fonte)`.
6. **Condicional por tema**, só quando um token não resolve, e sempre com `:global([data-tema^='kindle']) .classe { … }`. Justifique com um comentário de uma linha. Casos previstos: anel do story (T016) e erro tracejado (T014).
7. **Zero** hex, `rgb(`, `hsl(` ou nome de cor nos `<style>`. Confira no fim com `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(" src/lib/componentes/feed`, que deve voltar vazio.

## Subtarefas

### T013 — `Post` e `AcoesPost`: cartão

**`Post.svelte`**:
1. `.post` vira cartão: `border: var(--linha-peso) solid var(--cor-borda); border-radius: var(--raio); box-shadow: var(--sombra); background: var(--cor-superficie);`.
2. A marca da matéria: troque o `border-left: 4px` por uma **faixa interna** no topo do cartão (`.post::before` com `height: 6px; background: var(--cor-materia)`, e cantos superiores com o mesmo raio do cartão via `overflow: clip` no `.post`). Motivo: a borda esquerda colorida brigaria com o contorno grosso. `overflow: clip` **não** corta `box-shadow`, que é pintada fora da caixa; mas confira que o coração grande (`.coracao-grande`) não é cortado. Se for, use `border-top` colorido de 6px em vez do pseudo-elemento.
3. O espaçamento **entre** posts é da tela (`src/routes/+page.svelte`, WP04). Aqui, só a caixa.
4. `.materia` (nome da matéria): `font-family: var(--fonte-titulo)`. No Aventura, a Grandstander a 1rem já dá a personalidade. Não aumente o peso: a face é 700.
5. `.avatar`: tire o `letter-spacing: 0.02em` (iniciais já são curtas).
6. `.selo` ("gerado — a revisar"): `border: 1px solid var(--cor-aviso)` além do fundo, para ser distinguível no Kindle, onde o fundo de aviso é o mesmo cinza do realce (FR-009).
7. `.coracao-grande :global(svg)`: troque o `drop-shadow(… rgb(0 0 0 / 25%))` por `drop-shadow(2px 2px 0 var(--cor-texto))`. É a sombra dura do sistema aplicada ao ícone, e some com o filtro inteiro nos Kindle, onde a animação já não roda.
8. **Não** remova `content-visibility: auto` nem `contain-intrinsic-size` (NFR-004). Reajuste o `contain-intrinsic-size` se a altura média do cartão mudar em mais de 10%.

**`AcoesPost.svelte`**:
1. `.acao` fica como está (círculo sem borda). `.fonte` continua suave.
2. O `animation: pulso` do coração já responde a uma ação (curtir), então pode ficar no Aventura; nos Kindle, a regra global zera. Nada a fazer além de conferir.
3. `.acao:active :global(svg) { transform: scale(0.88) }` é um estado, não uma transição; fica.

### T014 — `CorpoQuestao`: opções e estados [P]

1. `.opcao`: contorno pela regra 1 e `border-radius: calc(var(--raio) / 2)`. Remova o `transition`: a troca de cor ao responder fica instantânea em todos os temas, porque uma transição de 0,1 s não comunica nada que o ícone e o texto já não comuniquem.
2. `.opcao:not(:disabled):hover`: em vez de só mudar a cor da borda, use `box-shadow: var(--sombra)` com `transform: translate(-1px, -1px)` no Aventura, o efeito de "levantar" do cartão. Nos Kindle, `--sombra` é `none` e o transform desloca 1px sem animação; para não deslocar, ponha a regra de `transform` dentro de `:global([data-tema='aventura']) …`.
3. `.letra`: `border: 1.5px solid currentColor` → `border: var(--linha-peso) solid currentColor`.
4. **Erro no Kindle** (data-model, último parágrafo): acerto e erro têm a mesma cor de texto no Kindle, e a diferença vem do ícone, do texto e do fundo. Acrescente:
   ```css
   /* Kindle: erro e acerto têm a mesma tinta; o tracejado diferencia pela forma (FR-009). */
   :global([data-tema^='kindle']) .opcao.errada {
   	border-style: dashed;
   }
   ```
5. `.texto` (enunciado): `max-width: var(--medida)`.
6. Borda esquerda do texto-base (linha 124, `3px solid var(--cor-borda)`): vire `var(--linha-peso) solid var(--cor-divisor)`. É uma marca de citação, não um contorno.

**Validação**: responda uma C/E e uma de múltipla escolha, uma certa e uma errada, nos 3 temas. Nos Kindle, só dá para saber qual é qual pelo ícone, pelo texto e pelo tracejado, o que é o esperado.

### T015 — `CorpoLei`, `CorpoResumo`, `CorpoFlashcard`: leitura [P]

**`CorpoLei.svelte`**:
1. `.texto`: `max-width: var(--medida)`.
2. `.artigo` (número do artigo, "Art. 7º"): `font-family: var(--fonte-titulo)`. Tire o `letter-spacing: -0.01em`, que a Grandstander não pede. Cor continua `--cor-lei`.
3. `.nota`: continua em `--fonte`.

**`CorpoResumo.svelte`**:
1. A tela do resumo (bloco com `border: 1px solid var(--cor-borda)` e `border-radius: 10px`): regra 1 e `border-radius: calc(var(--raio) / 2)`.
2. `.titulo`: `font-family: var(--fonte-titulo)`.
3. `.texto`: `max-width: var(--medida)`.
4. `.fonte` (rodapé com `border-top`): regra 2.

**`CorpoFlashcard.svelte`**:
1. `.lado`: regra 1 com `border-radius: calc(var(--raio) / 2)`. O `.verso` continua tracejado (é a forma que diferencia os lados), com `border-color: var(--cor-texto-suave)`.
2. `.cartao` com `border-radius: 14px` → `calc(var(--raio) / 2)`.
3. **Kindle sem 3D**: a regra global zera a transição, mas o `rotateY(180deg)` continua e a face some por `backface-visibility`. Funciona, mas o 3D sem animação pode renderizar serrilhado. Replique o bloco do `prefers-reduced-motion` também para os Kindle:
   ```css
   /* Kindle: troca de lado direta, sem 3D (tinta eletrônica). Mesmo tratamento de reduzir movimento. */
   :global([data-tema^='kindle']) .giro,
   :global([data-tema^='kindle']) .virado .giro { transform: none; }
   :global([data-tema^='kindle']) .verso { transform: none; visibility: hidden; }
   :global([data-tema^='kindle']) .virado .verso { visibility: visible; }
   :global([data-tema^='kindle']) .virado .frente { visibility: hidden; }
   ```
4. `.texto`: `max-width: var(--medida)`.

**Validação**: num post de lei com artigo longo, a 1440 px de largura, a linha não passa de cerca de 64 caracteres (FR-007). Conte numa linha qualquer.

### T016 — `Carrossel`, `BarraStories`, `FimDoFeed` [P]

**`Carrossel.svelte`**:
1. Botões de seta (círculo com `1px solid var(--cor-borda)`): regra 1.
2. Pontos: o ativo continua mais largo (forma). `background` do ponto inativo: `var(--cor-divisor)`; do ativo: `var(--cor-texto)`.
3. O `transition: width … , background-color …` fica: é resposta a ação (deslizar), e nos Kindle a regra global zera.
4. Borda do slide (`border-radius: 10px`): `calc(var(--raio) / 2)`.

**`BarraStories.svelte`**:
1. **Anel no Kindle**: as 8 cores de matéria viram o mesmo cinza claro nos Kindle (research D6), e um anel cinza-claro sobre o papel fica quase invisível. Acrescente:
   ```css
   /* Kindle: matérias têm o mesmo cinza; o anel usa a tinta para continuar visível. */
   :global([data-tema^='kindle']) .anel { border-color: var(--cor-texto); }
   :global([data-tema^='kindle']) .story.vista .anel { border-color: var(--cor-visto); border-style: dashed; }
   ```
   No Kindle, a story vista fica tracejada, porque a diferença não pode vir só da cor (FR-009).
2. `.tudo .miolo` (`1px solid var(--cor-borda)`): regra 1.
3. `.nome`: sem mudança. O selecionado já tem negrito e sublinhado.

**`FimDoFeed.svelte`**:
1. `h2`: `font-family: var(--fonte-titulo)`.
2. `.acao` (pílula `999px`): troque por `border-radius: calc(var(--raio) / 2)` com `border: var(--linha-peso) solid var(--cor-borda)` e `box-shadow: var(--sombra)`. É o botão primário do sistema, igual em todo o app (o WP04 aplica o mesmo nas telas).
3. `.marca` (círculo com borda de acerto): `border-width: var(--linha-peso)`.

### T017 — `BarraAbas` [P]

1. `.abas`: `border-top: var(--linha-peso) solid var(--cor-borda)`. A barra é o chão da tela, e no Aventura o contorno grosso ancora a página.
2. Sem sombra (a barra é fixa, e sombra dura para cima sobre o conteúdo rolando pesa).
3. A aba atual continua marcada por peso e sublinhado. Não acrescente cor.

### T018 — Varredura C-004 no feed

Passe pela lista de padrões genéricos da skill `frontend-design` e confira, **em cada componente de `feed/`**:

| Padrão | Onde procurar | Ação |
|---|---|---|
| Rótulo em caixa-alta ou com `letter-spacing` largo acima de título | `grep -rn "uppercase\|letter-spacing" src/lib/componentes/feed` | Remover. Em `db7ef10` só havia `letter-spacing` no avatar (T013) e no número do artigo (T015) |
| Número 01/02/03 enfeitando conteúdo que não é sequência | Carrossel (a posição "2/5" **é** sequência e fica) | Manter o que é sequência |
| Seta "→" anexada a texto de botão ou link | `grep -rn "→" src/lib/componentes/feed` | Remover, exceto quando for o ícone de navegação do carrossel |
| Sombra cinza suave | Nenhuma deve sobrar depois do T013 | Conferir |
| Meta com ponto do meio (`A · B · C`) | Rótulo do tipo no `Post`: "Questão · CGU 2022 · AFFC TI · Q. 47" | **Manter**: é dado real, e trocar muda texto (C-005). Registre no handoff que foi avaliado |

Anote no handoff o resultado de cada linha.

## Definition of Done

- [ ] T013 a T018 feitos; `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` passando, com `feed.spec.ts` e `salvos.spec.ts` **sem edição**.
- [ ] O grep da regra 7 volta vazio.
- [ ] Capturas nos 3 temas (forçando `data-tema` pelo console): um post de questão respondida errada, um de lei, um resumo, um flashcard virado e a barra de stories. Anexe ao handoff.
- [ ] Nenhum arquivo fora de `src/lib/componentes/feed/` alterado; `git add` por caminho (DIRECTIVE_033).

## Riscos

| Risco | Mitigação |
|---|---|
| `overflow: clip` do post corta o coração grande ou o foco visível | T013 passo 2, com alternativa de `border-top` |
| Contorno grosso aumenta a altura do post e mexe no `contain-intrinsic-size` | T013 passo 8 |
| O e2e procura algo pela cor ou pelo estilo | Os e2e usam papéis e textos; se algum falhar por estilo, **pare e reporte**, sem editar o teste (é do WP05) |
| Sombra dura em todos os cartões vira o "SaaS-card kit" (C-004) | O raio varia por hierarquia (regra 4), só o post e o botão primário têm sombra, e a cor forte fica na faixa da matéria |

## Orientação ao revisor

- Rode a regra 7 (grep) e a varredura do T018.
- Compare as capturas dos 3 temas: no Kindle não pode ter cor nenhuma nem sombra; no Aventura, o post tem contorno e sombra dura, sem borrão.
- Emule `prefers-reduced-motion` no Aventura: o coração não anima e o flashcard vira sem 3D.
