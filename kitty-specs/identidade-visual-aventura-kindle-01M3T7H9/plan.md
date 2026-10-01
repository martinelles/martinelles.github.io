# Plano de Implementação: Identidade Visual Aventura e Kindle

**Missão**: `identidade-visual-aventura-kindle-01M3T7H9` | **Data**: 2026-09-30 | **Spec**: [spec.md](spec.md)
**Branch**: planejamento em `main`, merge em `main` (`branch_matches_target: true`)
**Base de código**: `main` em `db7ef10` (feed mesclado em `de25b4a`)

## Resumo

A troca é feita pela camada de tokens que o app já tem. Os componentes usam `var(--cor-*)` em quase
tudo (só uma cor fixa fora de `src/app.css`, a sombra do coração em `Post.svelte:239`). Por isso o
plano mantém os nomes dos tokens atuais e define um bloco de valores por tema em `[data-tema="…"]`
na raiz `<html>`, trocando o `@media (prefers-color-scheme: dark)`. Entram tokens novos só para o
que ainda não existe: peso da linha, sombra dura, textura de papel, fonte de título e movimento.

A escolha de tema é resolvida **antes da primeira pintura**, por um script inline pequeno em
`src/app.html` (FR-011). Um store `tema.svelte.ts`, no mesmo molde de `foco.svelte.ts`, cuida da
escolha, da persistência e do acompanhamento do aparelho. As fontes (Literata para leitura e
Grandstander para os títulos do Aventura) vão cortadas para o latim e empacotadas em `static/fontes/`,
o que já as coloca no precache do service worker (SC-006).

## Contexto técnico

**Linguagem/versão**: TypeScript 5.9, Svelte 5.57 (runes), SvelteKit 2.70 com adapter-static em SPA
**Dependências principais**: nenhuma nova em runtime. O corte de fontes usa `fonttools` 4.63 com `brotli`, em Python, como passo manual feito uma única vez; os `.woff2` gerados são commitados
**Armazenamento**: `localStorage`, chave `painel-concurso:tema:v1`, sempre em try/catch (charter)
**Testes**: Vitest para o store e para o **contraste calculado a partir de `app.css`**; Playwright contra o build para o tema padrão, a troca, a persistência, a ausência de clarão, a falta de animação e de cor nos temas Kindle, 360 px e o offline
**Plataforma-alvo**: navegadores móveis e desktop atuais, PWA instalável
**Tipo de projeto**: SPA única (`src/`)
**Metas de desempenho**: carga inicial ≤ 300 KB (charter); hoje são **67 KB** gzip (medido em 2026-09-30, sem `/conteudo/`), e as fontes somam cerca de 95 KB, o que dá cerca de 162 KB no total. Troca de tema em ≤ 100 ms (NFR-003) e ≥ 55 fps no feed (NFR-004)
**Restrições**: sem fonte ou CDN externa em runtime; só fonte OFL; nada de marca de terceiros (C-001 a C-003)
**Escopo**: `src/app.css`, `src/app.html`, 1 store novo, 1 componente novo (`SeletorTema`), cerca de 15 componentes com ajuste de borda e movimento, e 5 arquivos de fonte

## Charter Check

| Regra do charter | Situação |
|---|---|
| Stack TS 5, Svelte 5, SvelteKit 2 SPA, CSS puro com tokens em `:root` | ✅ Mantido. Tokens passam de `:root` para `:root[data-tema]`, ainda em CSS puro |
| "tema escuro por prefers-color-scheme" (Policy Summary) | ⚠️ **Muda**: o escuro passa a ser o Kindle escuro, escolhido por `data-tema`, e `prefers-color-scheme` só decide o padrão de "Seguir o aparelho". Decidido pela dona (D4). Registrado em Complexity Tracking; emenda do charter proposta junto com o merge |
| Nenhuma dependência de runtime além do Svelte | ✅ Nenhuma. `fonttools` é ferramenta de preparo, fora do build |
| Sem fontes ou CDNs externos em runtime | ✅ Fontes em `static/fontes/`, servidas pelo próprio app |
| Carga inicial ≤ 300 KB; Lighthouse acessibilidade ≥ 90 | ✅ Cerca de 162 KB previstos; auditoria em quickstart §4 |
| localStorage sempre em try/catch | ✅ No store e no script inline |
| Lógica em `src/lib/*.ts` coberta por Vitest; aceite por Playwright no build, com 360 px e offline | ✅ Seção Testes |
| Gates: `check`, `test`, `build` e `test:e2e` (telas) | ✅ Todo WP toca tela ou CSS, então todos rodam o e2e |
| DIRECTIVE_024 (menor raio de mudança) | ✅ Nomes de token preservados; componentes só trocam valor fixo por token |
| DIRECTIVE_033 (staging só do WP) | ✅ Nota para os WPs: `git add` por caminho |

**Gate**: aprovado, com uma exceção registrada.

## Decisões de arquitetura

Detalhe e alternativas em [research.md](research.md).

1. **Tema na raiz**: atributo `data-tema` em `<html>`, com os valores `aventura`, `kindle` e `kindle-escuro`. Cada bloco define **o conjunto completo** de tokens do contrato ([contracts/tema.md](contracts/tema.md)). O `:root` sem atributo repete o Aventura, para servir de fallback quando o JS está desligado.
2. **Resolução antes da pintura**: script inline síncrono no `<head>` de `src/app.html` (menos de 1 KB) que lê a preferência, cai em `matchMedia('(prefers-color-scheme: dark)')` quando ela é "sistema" e grava `data-tema` e o `<meta name="theme-color">`. O store depois assume a partir do mesmo atributo, sem ler de novo nem piscar.
3. **Store** `src/lib/tema.svelte.ts`: `preferencia` (`sistema`, `aventura`, `kindle` ou `kindle-escuro`), `ativo` derivado, `escolher()`, e um ouvinte de `matchMedia` ativo só enquanto a preferência é `sistema`. Valor inválido ou corrompido volta para `sistema`.
4. **Textura de papel**: pseudo-elemento `body::before` fixo, com `pointer-events: none`, `z-index: -1` e `background-image: var(--textura)`. A textura é um SVG com `feTurbulence` embutido em data URI, com uma variante por tema: ruído escuro nos temas claros e ruído claro no Kindle escuro, na intensidade `--grao`. Não pesa nada na rede. Uma camada fixa única é composta pela GPU, então não repinta ao rolar (NFR-004). Em `@media print` ela some.
5. **Contorno e sombra dura** (FR-006): tokens `--linha-peso` e `--sombra` (o token já existe e muda de valor: `4px 4px 0 var(--cor-texto)` no Aventura e `none` nos Kindle). Os componentes trocam `1px solid var(--cor-borda)` por `var(--linha-peso) solid var(--cor-borda)` nos contornos de cartão, post e botão. Divisores internos continuam finos, com um token novo `--cor-divisor`.
6. **Movimento** (FR-008): nos temas Kindle, a mesma regra de `prefers-reduced-motion` passa a valer também sob `[data-tema^="kindle"]`, zerando transição e animação. No Aventura, as animações atuais já respondem a ações, exceto o `pulso … infinite` de `src/routes/+page.svelte:258` (carregamento), que vira estático.
7. **Tipografia**: `--fonte-texto` passa a ser Literata (400, 400 itálico e 700) nos três temas; `--fonte-titulo` é Grandstander 700 no Aventura e Literata 700 nos Kindle; `--fonte`, das peças de interface, continua system-ui. A coluna de leitura (`--medida: 64ch`) vale para enunciado, artigo, resumo e flashcard (FR-007).
8. **Matérias**: `--materia-0…7` recebem as 8 cores da paleta no Aventura, com `--cor-materia-texto` em tinta. Nos Kindle, as 8 viram o mesmo cinza de realce, e o nome da matéria, que já aparece nos stories e posts, passa a ser o identificador (FR-009).
9. **Seletor**: componente `src/lib/componentes/SeletorTema.svelte` no painel, com `radiogroup` nativo (inputs `radio`), 4 opções e uma prévia de cada tema (miniatura em CSS com as cores do próprio tema, via `data-tema` no elemento da prévia).
10. **Anti-"cara de IA"** (C-004): conferência no review com base na lista da skill `frontend-design`. Os rótulos em caixa-alta que existem hoje são levantados e trocados por caixa normal no WP de componentes.

## Estrutura do projeto

### Documentação (esta missão)

```
kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/
├── spec.md
├── plan.md               # este arquivo
├── research.md           # decisões e alternativas
├── data-model.md         # Tema, PreferenciaTema, tokens
├── quickstart.md         # como ver, testar e medir
├── contracts/
│   └── tema.md           # contrato do atributo, dos tokens, do store e da chave de armazenamento
└── checklists/requirements.md
```

### Código-fonte (raiz do repositório)

```
src/
├── app.html                        # + script inline de tema; theme-color por tema
├── app.css                         # tokens por [data-tema]; @font-face; textura; movimento; print
├── lib/
│   ├── tema.svelte.ts              # NOVO: store de preferência e tema ativo
│   └── componentes/
│       ├── SeletorTema.svelte      # NOVO: radiogroup com prévia
│       ├── feed/*.svelte           # borda → --linha-peso; sombra fixa → token; medida de leitura
│       ├── GradeFerramentas.svelte, FocoEstudo.svelte, ProgressoEstudo.svelte
├── routes/
│   ├── painel/+page.svelte         # + SeletorTema
│   └── +page.svelte, salvos/, ferramenta/[id]/   # ajuste de borda e movimento
static/
└── fontes/                         # NOVO: literata-400.woff2, literata-400i.woff2, literata-700.woff2,
                                    #       grandstander-700.woff2, OFL.txt (licenças)
scripts/
└── fontes/cortar.py                # NOVO: corte reprodutível (pyftsubset, latim + pontuação pt-BR)
tests/
├── unit/tema.test.ts               # NOVO: resolução, persistência, corrompido, ouvinte do aparelho
├── unit/contraste.test.ts          # NOVO: lê app.css e mede os pares do contrato nos 3 temas
└── e2e/tema.spec.ts                # NOVO: cenários 1–5 da spec
```

**Decisão de estrutura**: SPA única, como já é. Nenhum diretório novo além de `static/fontes/` e `scripts/fontes/`.

## Testes

| Requisito | Como se verifica |
|---|---|
| FR-001, FR-002, FR-003, FR-010 | `tema.test.ts` para a lógica; `tema.spec.ts` com `colorScheme` emulado claro e escuro, troca no seletor, recarga e posição de rolagem mantida |
| FR-011, NFR-007 | e2e: `data-tema` já presente no `DOMContentLoaded`, antes de o app hidratar, em 10 cargas por tema |
| FR-004, SC-001 | e2e: em cada rota e tema, nenhum elemento visível tem cor calculada fora do conjunto de tokens do tema (tolerância de arredondamento) |
| FR-008, SC-004 | e2e: nos temas Kindle, todo elemento tem `transition-duration` e `animation-duration` iguais a 0 s depois de curtir, virar e deslizar |
| Cenário 4.3 | e2e: no Kindle, todas as cores calculadas pertencem aos tokens do tema Kindle (D5 da spec, 2026-09-30, substitui "saturação HSL ≤ 8%", que contradizia o data-model) |
| NFR-001, SC-003 | `contraste.test.ts`: a lista de pares vem do contrato e a saída é anexada à revisão |
| NFR-002 | e2e ou script: soma dos `.woff2` comprimidos ≤ 120 KB |
| NFR-006 | `responsivo.spec.ts` estendido aos 3 temas, a 360 px e com zoom de 200% |
| SC-006 | `offline-conteudo.spec.ts` estendido: offline, a `FontFace` carregada e a textura presente |
| NFR-003, NFR-004, NFR-005 | medição manual no quickstart §4 (DevTools Performance e Lighthouse), anotada na revisão |
| SC-005 | aprovação da dona, com capturas dos 3 temas anexadas |

## Complexity Tracking

| Regra | Motivo | Alternativa rejeitada | Data |
|---|---|---|---|
| Charter: "tema escuro por prefers-color-scheme" | A dona decidiu (D4) que o escuro é o Kindle escuro, escolhido pela pessoa; `prefers-color-scheme` passa a só definir o padrão | Manter o `@media` e criar variantes escuras de cada tema: dobraria os tokens e contraria D4 | 2026-09-30 |
| Script inline em `app.html` | Única forma de aplicar o tema antes da primeira pintura num SPA estático (FR-011) | Aplicar no `onMount` do layout: dá clarão do tema errado a cada carga | 2026-09-30 |
