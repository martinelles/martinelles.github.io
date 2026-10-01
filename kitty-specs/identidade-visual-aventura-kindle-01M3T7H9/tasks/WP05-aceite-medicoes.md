---
work_package_id: WP05
title: Testes de aceite, medições e charter
dependencies:
- WP02
- WP03
- WP04
requirement_refs:
- FR-011
- NFR-001
- NFR-002
- NFR-003
- NFR-004
- NFR-005
- NFR-006
- NFR-007
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-identidade-visual-aventura-kindle-01M3T7H9
base_commit: 206a7c080882d9e44c9b93486f9ac21b7a875a28
created_at: '2026-10-01T00:30:20.607210+00:00'
subtasks:
- T025
- T026
- T027
- T028
- T029
- T030
phase: Fase 3 - Aceite
assignee: ''
agent: ''
shell_pid: '35040'
history:
- timestamp: '2026-09-30T22:57:03Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: tests/e2e/
execution_mode: code_change
owned_files:
- tests/e2e/tema.spec.ts
- tests/e2e/responsivo.spec.ts
- tests/e2e/offline-conteudo.spec.ts
- kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/medicoes.md
- .kittify/charter/**
tags: []
---

# WP05 – Testes de aceite, medições e charter

## Objetivo

Provar a missão: os cenários 1 a 5 da spec automatizados em Playwright contra o build, as NFR medidas e
registradas em `medicoes.md` com procedência, as capturas para a dona aprovar o visual (SC-005) e a
emenda do charter pronta, porque o modo escuro deixou de ser por `prefers-color-scheme`.

Este WP **não corrige** componente. Se um teste revelar defeito de WP02, WP03 ou WP04, registre no
handoff com o nome do teste, o que esperava e o que veio, e devolva ao orquestrador. Não contorne o teste.

## Contexto

- Spec: Cenários 1 a 5, casos de borda; FR-001 a FR-012; NFR-001 a NFR-007; SC-001 a SC-006.
- Plan: seção "Testes" (a tabela requisito → verificação é o roteiro deste WP); quickstart §4 (medições manuais).
- Contrato: [contracts/tema.md](../contracts/tema.md) (chave, regra, tokens, movimento).
- Modelos no repositório: `tests/e2e/responsivo.spec.ts` (larguras e telas, com os helpers `sobraHorizontal` e `alvosPequenos`), `tests/e2e/offline-conteudo.spec.ts` (`esperarControle`, Cache Storage), `kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md` (**formato** das medições: ambiente, versões, tabela de resumo, e o limite que vem da spec sem ajuste).
- Playwright: `workers: 2` (limite da máquina), projeto `Pixel 7`, `webServer` faz build e preview na porta 4173. Use `page.emulateMedia({ colorScheme })` e `test.use({ colorScheme })`.
- Relógio fixo como nos outros specs: `page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'))`.
- Ponto de atenção herdado: a missão do feed registrou NFR-001 (primeira visita ≤ 2,5 s) **não atendido** (LCP de cerca de 6 s). Esta missão acrescenta o preload de uma fonte; meça o antes e o depois para mostrar que não piorou mais de 5%.

## Branch Strategy

Planejamento em `main` e merge em `main`. Depende de WP02, WP03 e WP04: mescle as três lanes (e, por
elas, a do WP01) na lane deste WP e rode `npm ci`. A worktree vem da lane calculada em `lanes.json`.
Comando: `spec-kitty agent action implement WP05 --agent <nome>`.

## Subtarefas

### T025 — `tests/e2e/tema.spec.ts`: padrão, troca, persistência, clarão

Crie `tests/e2e/tema.spec.ts` com constantes `CHAVE = 'painel-concurso:tema:v1'` e `TEMAS`.

| Teste | Passos | Esperado | Requisito |
|---|---|---|---|
| padrão claro | `colorScheme: 'light'`, sem chave, `goto('/')` | `html[data-tema="aventura"]` | FR-002, Cenário 1.1 |
| padrão escuro | `colorScheme: 'dark'` | `kindle-escuro` | FR-002, Cenário 1.2 |
| seletor | `goto('/painel')` | `group` "Aparência" com 4 `radio`: "Seguir o aparelho", "Aventura", "Kindle", "Kindle escuro"; "Seguir o aparelho" marcado | FR-001, FR-003, Cenário 2.1 |
| troca e persistência | marcar "Kindle"; `reload()` | `kindle` antes e depois do reload; chave = `{"tema":"kindle"}` | FR-003, SC-002 |
| ao vivo | "Seguir o aparelho", `emulateMedia({ colorScheme: 'dark' })` e depois `'light'` | `kindle-escuro` e depois `aventura`, sem reload | Cenário 2.3 |
| fixo ignora aparelho | "Kindle", `emulateMedia('dark')` | continua `kindle` | contrato §3 |
| teclado | foco no primeiro rádio, `ArrowDown` duas vezes | `data-tema` muda a cada tecla | NFR-005 |
| posição do feed | em `/`, rolar até `scrollY ≥ 1500`; ir a `/painel` pela barra de abas; trocar o tema; voltar pela barra | `scrollY` volta com diferença de no máximo 50 px do anterior. Se o app não restaura a rolagem entre rotas **também sem trocar tema**, compare com esse comportamento-base e registre | FR-010 |
| corrompido | chave = `lixo{` e depois `{"tema":"roxo"}` | abre pelo aparelho; nenhum `pageerror`; a chave continua igual | borda, contrato §2 |
| **sem clarão** | `page.addInitScript` que, no primeiro `DOMContentLoaded`, grava `window.__temaInicial = document.documentElement.dataset.tema`; e um `MutationObserver` que conta as mudanças de `data-tema` até `load` + 500 ms | `__temaInicial` é o esperado e **0** mutações depois do primeiro valor. Repita **10 cargas por tema** (3 temas × 10) | FR-011, NFR-007 |
| sem JS do app | `page.route('**/_app/**', r => r.abort())` com a chave em `kindle` | `data-tema="kindle"` mesmo assim (o script inline é independente) | FR-011 |

Borda: o `addInitScript` roda **antes** do script inline do `<head>`. Para ler o valor depois dele, leia
no `DOMContentLoaded`, e não no próprio init script.

### T026 — `tema.spec.ts`: cores só de token, Kindle sem movimento e sem cor

Acrescente ao mesmo arquivo:

1. **Cores só de token** (FR-004, SC-001). Para cada tema e para as telas `/`, `/salvos` (com um salvo, como em `responsivo.spec.ts`), `/painel` e `/ferramenta/questoes-discursivas`:
   - Leia os valores de cor dos tokens do tema com `getComputedStyle(document.documentElement).getPropertyValue(…)`, para a lista do contrato §5, e normalize para `rgb(r, g, b)`.
   - Percorra todos os elementos visíveis e colete `color`, `background-color` e `border-*-color` (ignorando `transparent` e `rgba(…, 0)`), além das cores dentro de `box-shadow`.
   - Espere que cada cor coletada esteja no conjunto de tokens, com tolerância de ±2 por canal (arredondamento), ou seja `currentColor` resolvida para um token. Falha lista `seletor → propriedade → cor`.
   - Exceções permitidas, listadas no teste com comentário: `color-mix` não é usado; as cores de sistema do `select` aberto não aparecem porque ele fica fechado.
2. **Kindle sem movimento** (FR-008, SC-004). Em `kindle` e `kindle-escuro`, no `/`: curtir um post (duplo toque e botão), virar um flashcard (`/?tipo=flashcard`), avançar um carrossel (`/?tipo=resumo`). Depois de cada ação, **todo** elemento tem `transition-duration` e `animation-duration` iguais a `0s` (ou lista só de `0s`). Pelo `getAnimations()` do documento, espere `document.getAnimations().length === 0`.
3. **Kindle sem cor** (Cenário 4.3). Em `kindle`, nas mesmas telas: toda cor coletada no item 1 tem saturação HSL ≤ 8%. Converta no próprio teste.
4. **Aventura anima só em resposta** (plan §6). Em `aventura`, no `/` parado por 2 s sem interação: `document.getAnimations().filter(a => a.playState === 'running').length === 0` (nada em loop).

### T027 — `responsivo.spec.ts` nos 3 temas [P]

1. Envolva o laço existente de `LARGURAS × TELAS` num laço de temas: grave a chave `{ "tema": X }` com `addInitScript` antes do `goto`. Mantenha os nomes de teste distinguíveis (`[kindle] largura 360px …`).
2. Para não triplicar o tempo: os 3 temas em **360 e 1440 px**; só o Aventura nas larguras intermediárias (390, 768, 1024), como hoje.
3. Novo teste **zoom 200%** (NFR-006): a 720 px de viewport com `deviceScaleFactor` inalterado, aplique `document.documentElement.style.fontSize = '200%'` e confira `sobraHorizontal(page) <= 0` e que nenhum post tem texto sobreposto. Aproximação: para cada `[data-post-id]`, a soma das alturas dos filhos diretos é ≤ à altura do post + 1 px.
4. **Sombra não cortada** (WP04): no Aventura a 360 px, para o primeiro `[data-post-id]`, confira que o `getBoundingClientRect().right + 4` é ≤ `window.innerWidth` (a sombra de 4 px cabe).
5. Não mude as asserções existentes; só as envolva.

### T028 — `offline-conteudo.spec.ts`: fontes e textura [P]

Acrescente um teste depois do fluxo existente (reaproveite `esperarControle`):
1. Primeira visita online; espere o SW controlar.
2. `context.setOffline(true)`; `reload()`.
3. Para cada tema (gravando a chave e recarregando): `await page.evaluate(() => document.fonts.ready)` e depois `document.fonts.check('16px Literata')` é `true`; no Aventura, `document.fonts.check('700 16px Grandstander')` é `true`.
4. A textura: `getComputedStyle(document.body, '::before').backgroundImage` começa com `url(` e é igual à obtida online (grave antes do offline). Se o WP01 escolheu PNG (`static/papel/`), confira que a URL responde do cache.
5. Os 4 arquivos de `static/fontes/*.woff2` estão no Cache Storage (mesmo padrão de `conteudoNoCache`, trocando o prefixo para `/fontes/`).

### T029 — Medições em `medicoes.md`

Crie `kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/medicoes.md` no **formato** do
`medicoes.md` da missão do feed: cabeçalho com data e hora, commit medido, máquina, Node, Chromium e
comando do servidor; depois a tabela "Requisito | Meta | Medido | Situação", com a meta copiada da spec
sem ajuste.

| Requisito | Como medir |
|---|---|
| NFR-002 fontes e textura ≤ 120 KB | `du -cb static/fontes/*.woff2` (e `static/papel/*` se houver) e o peso comprimido servido: `curl -sH 'Accept-Encoding: gzip' … \| wc -c` para cada um |
| Carga inicial do charter ≤ 300 KB | mesmo método da missão do feed: soma gzip de `_app/immutable` + `index.html` + a fonte com preload |
| NFR-003 troca ≤ 100 ms | Playwright com `page.evaluate` medindo `performance.now()` entre o `click` no rádio e o próximo `requestAnimationFrame` duplo, 10 repetições por tema, CPU 4× (CDP `Emulation.setCPUThrottlingRate`). Informe a mediana e o pior valor |
| NFR-004 ≥ 55 fps | o mesmo roteiro da missão do feed (rolar 50 posts, CPU 4×), **no Aventura**, que tem a textura mais forte e sombra; e no Kindle, para comparar |
| NFR-005 acessibilidade ≥ 90 | Lighthouse mobile em `/` e `/painel`, uma vez por tema (6 execuções) |
| NFR-001 (herdado) | LCP da primeira visita antes (commit `db7ef10`) e depois; a diferença não pode passar de 5% |
| NFR-007 | o resultado do teste "sem clarão" (30 cargas) |
| SC-003 | cole a tabela impressa pelo `contraste.test.ts` |

**Capturas para SC-005** (a dona aprova olhando): gere as capturas com Playwright (`page.screenshot`) no diretório de saída do teste (`test-results/`), que não é versionado, e **liste no `medicoes.md`** o caminho e o que cada uma mostra: `/`, um post de lei e `/painel` nos 3 temas, mais `/` e `/painel` do build antigo (`db7ef10`), para comparar lado a lado. O orquestrador anexa as imagens ao pedido de aprovação da dona.

### T030 — Emenda do charter

O charter diz "CSS puro com tokens em :root e tema escuro por prefers-color-scheme". Isso deixou de ser
verdade (plan, Complexity Tracking, linha 1).

1. Em `.kittify/charter/interview/answers.yaml`, na chave `languages_frameworks`, troque o trecho
   "CSS puro com tokens em :root e tema escuro por prefers-color-scheme" por
   "CSS puro com tokens por tema em [data-tema] (Aventura, Kindle e Kindle escuro), escolhido pela pessoa; prefers-color-scheme só define o padrão".
2. Rode `spec-kitty charter generate --from-interview --force` (processo de emenda do charter).
3. Confira com `git diff .kittify/charter/charter.md` que só essa frase mudou, nas duas ocorrências (Policy Summary e Languages).
4. **Commit próprio**, só com os arquivos do charter, e com o motivo na mensagem: `charter: tema escuro passa a ser o Kindle escuro escolhido pela pessoa (missão identidade-visual-aventura-kindle, D4)`.
5. Não mude nenhuma outra regra do charter.

## Definition of Done

- [ ] T025 a T030 feitos; `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` passando **inteiros** (os novos e os antigos).
- [ ] `tema.spec.ts` cobre cada linha da tabela do T025 e os 4 itens do T026.
- [ ] `medicoes.md` com todas as linhas, cada uma com número e procedência; nenhuma meta ajustada.
- [ ] Charter emendado em commit próprio.
- [ ] Nenhum arquivo fora de `owned_files` alterado; `git add` por caminho (DIRECTIVE_033).

## Riscos

| Risco | Mitigação |
|---|---|
| O teste de "cores só de token" pega cor de UA (scrollbar, `select`, `::selection`) | Restrinja aos elementos visíveis e às propriedades listadas; documente cada exceção no teste |
| 30 cargas do teste de clarão deixam a suíte lenta | Rode as 30 num único `test` com `for`, sem reiniciar o contexto; tempo alvo ≤ 20 s |
| A restauração de rolagem entre rotas não existe hoje | T025 "posição do feed": compare com o comportamento-base e registre, sem inventar requisito |
| Medida de fps varia entre execuções | 3 execuções, informe a mediana, como na missão anterior |

## Orientação ao revisor

- Quebre de propósito um token no `app.css` local (por exemplo, um hex fixo num componente) e confira que o T026 item 1 falha com uma mensagem legível. Desfaça depois.
- Confira que o `medicoes.md` tem a meta da spec **igual** ao texto da spec.
- Confira que o commit do charter tem só os arquivos do charter.
