# Medições: Plano de Estudos

Conferido em **2026-10-01** (UTC, entre 22:53Z e 22:57Z), no build da árvore do WP03 na lane-c
(WP01 e WP02 mesclados, telas do WP03 por commitar no momento da medição; o código medido é o do
commit `feat(WP03): painel do plano, missão do dia e cronômetro`).

- Máquina: Windows 10 Enterprise. Node 24.16.0.
- Navegador: Chromium do Playwright 1.63.0 (`ms-playwright/chromium-1243`).
- Lighthouse 13.5.0, via `npx`, fora do `package.json`.
- Servidor: `npx vite preview --port 4204 --strictPort` (a 4173 fica para o e2e), parado ao fim.
- O relógio do aparelho estava em 2026-10-01, primeiro dia do plano: o painel medido mostra a
  missão de hoje com 4 tarefas e o resumo do plano.

## Emenda D4 — remedição (2026-10-02 UTC, 00:07Z–00:09Z; 2026-10-01 à noite em Brasília)

Build da árvore do WP03 na lane-c com WP01 e WP02 refeitos para a D4 (472 tarefas `:L`/`:Q`,
25/20 min, bloco), telas por commitar no momento da medição; o código medido é o do commit
`feat(WP03): emenda D4 — modo e bloco nas telas do plano`. Mesma máquina, Node 24.16.0,
Playwright 1.63.0 (`chromium-1243`), Lighthouse 13 via `npx`. Servidor
`npx vite preview --port 4211 --strictPort` (a 4173 estava ocupada), parado ao fim. Relógio real:
1º dia do plano, missão de hoje com 8 tarefas.

| Requisito | Meta (spec) | Medido (D4) | Situação |
|---|---|---|---|
| NFR-001 painel com o plano, visitas seguintes | ≤ 1 s | 2ª visita: 705, 488 e 472 ms até a missão e o resumo no DOM (LCP 796, 548, 520 ms); 3ª visita: 368–404 ms (LCP 412–448 ms). CPU 4×, sem limitação de rede | atende |
| NFR-005 peso do plano | ≤ 50 KB comprimido | `plano.json`: 147.238 B brutos, **12.838 B** com `gzip -c`, 12.764 B servidos com `Content-Encoding: gzip` | atende |
| NFR-003 acessibilidade | Lighthouse ≥ 90 | `/painel`: **100**; `/tarefa/BDD-01:L`: **100**; `/tarefa/BDD-01:Q`: **100** (boas práticas 100 nas três; nenhuma auditoria binária reprovada) | atende |

| Rodada | 1ª visita (missão / LCP) | 2ª visita (missão / LCP) | 3ª visita (missão / LCP) |
|---|---:|---:|---:|
| 1 | 2.007 / 2.228 ms | 705 / 796 ms | 368 / 412 ms |
| 2 | 1.301 / 1.420 ms | 488 / 548 ms | 404 / 448 ms |
| 3 | 1.523 / 1.680 ms | 472 / 520 ms | 390 / 428 ms |

Pior caso da visita seguinte: **796 ms** (LCP), 204 ms de folga. Script avulso, não versionado
(pasta temporária da sessão), com o mesmo método descrito em "Painel em visita repetida" abaixo.
Lighthouse a 2026-10-02T00:07:35Z (`/painel`), 00:07:53Z (`/tarefa/BDD-01%3AL`) e 00:08:12Z
(`/tarefa/BDD-01%3AQ`), as duas tarefas sem registro (cronômetro parado). A de Leitura não tem
campos de questões; a de Questões tem os dois campos rotulados.

`responsivo.spec.ts` passou a cobrir também `/tarefa/<1ª de Questões>` (formulário com os campos)
em todas as larguras e temas, no zoom de 200% e na regra dos 44 px.

Portas (D4):

- `npm run check`: 323 arquivos, 0 erros, 0 avisos.
- `npm test`: 24 arquivos, 264 testes passando.
- `npm run build`: ok.
- `CI=1 npm run test:e2e`: 179 de 179 passando (config temporária na porta 4210, apagada depois).

As seções seguintes são a medição original, antes da D4 (236 tarefas de 45 min), mantidas como
registro.

Os limites vêm da `spec.md` e não foram ajustados. O formato segue
`kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md`.

## Resumo

| Requisito | Meta (spec) | Medido | Situação |
|---|---|---|---|
| NFR-001 painel com o plano, visitas seguintes | ≤ 1 s | 2ª visita: 453, 481 e 527 ms até a missão e o resumo estarem no DOM (LCP 496–564 ms); 3ª visita: 337–410 ms (LCP 368–452 ms). CPU 4×, sem limitação de rede | atende |
| NFR-005 peso do plano | ≤ 50 KB comprimido | `plano.json`: 59.121 B brutos, **8.584 B** com `gzip -c`, 8.493 B servidos com `Content-Encoding: gzip` | atende |
| NFR-003 acessibilidade | Lighthouse ≥ 90 | `/painel`: **100**; `/tarefa/BDD-01`: **100** (boas práticas 100 nas duas) | atende |

## Painel em visita repetida (NFR-001)

Mesmo método da missão do feed (script Playwright avulso, não versionado, em
`node_modules/.capturas/medir.mjs`): perfil Pixel 7 (412×823 px), CPU 4× por
`Emulation.setCPUThrottlingRate`, sem `page.clock`. Sequência por contexto novo:
`goto /painel` → `navigator.serviceWorker.ready` → `about:blank` → `goto /painel` →
`about:blank` → `goto /painel`. Um `MutationObserver` instalado antes da carga marca o
`performance.now()` em que aparecem o sumário da missão (`#titulo-missao ~ .sumario`) e o título do
resumo (`#titulo-plano`); os dois saem no mesmo quadro, porque dependem da mesma promessa do plano.
O LCP vem de `PerformanceObserver('largest-contentful-paint')`, lido 1,5 s depois.

| Rodada | 1ª visita (missão / LCP) | 2ª visita (missão / LCP) | 3ª visita (missão / LCP) |
|---|---:|---:|---:|
| 1 | 1.837 / 2.004 ms | 481 / 536 ms | 337 / 368 ms |
| 2 | 1.117 / 1.220 ms | 453 / 496 ms | 410 / 452 ms |
| 3 | 1.261 / 1.344 ms | 527 / 564 ms | 395 / 420 ms |

Pior caso da visita seguinte: **564 ms** (LCP), 436 ms de folga. A 1ª visita não tem limitação de
rede (localhost) e não é meta desta spec; serve só de referência.

## Peso do plano (NFR-005)

```sh
wc -c < static/conteudo/plano.json            # 59121
gzip -c static/conteudo/plano.json | wc -c    # 8584
curl -s -o /dev/null -w "%{size_download}" -H 'Accept-Encoding: gzip' http://localhost:4204/conteudo/plano.json  # 8493
```

236 tarefas. O plano é um arquivo só, sem lote: entra no pré-cache de `/conteudo/` do SW como os
demais.

## Lighthouse (NFR-003)

```sh
CHROME_PATH=".../ms-playwright/chromium-1243/chrome-win64/chrome.exe" \
npx -y lighthouse@13 http://localhost:4204/<rota> --form-factor=mobile \
  --only-categories=accessibility,best-practices --output=json --chrome-flags="--headless=new"
```

| Rota | Execução (UTC) | Acessibilidade | Boas práticas | Auditorias binárias reprovadas |
|---|---|---:|---:|---|
| `/painel` | 2026-10-01T22:55:48Z | 100 | 100 | nenhuma |
| `/tarefa/BDD-01` | 2026-10-01T22:56:07Z | 100 | 100 | nenhuma |

`/tarefa/BDD-01` foi auditada sem registro (cronômetro parado, botão "Iniciar"), o estado de quem
abre a tarefa pela lista. Leitor de tela, conferido por papel e nome no e2e: a barra é
`progressbar` com nome "Plano concluído: N%" e o valor em texto ao lado; o cronômetro é `timer`
com nome "Tempo estudado nesta tarefa" e o tempo por extenso em texto oculto; as transições
(iniciado, pausado em N minutos, retomado) vão para uma região `status`, sem fala a cada segundo.

## Capturas a 360 px (NFR-004)

Feitas com relógio fixo em 2026-10-02 09:00 (Brasília), com a 1ª tarefa concluída ontem e a 2ª
com o cronômetro correndo, nos três temas, para `/painel`, `/tarefa/BDD-02` e `/`. Ficam fora do
repositório (pasta temporária da sessão). Sem rolagem horizontal e alvos ≥ 44 px conferidos por
`responsivo.spec.ts`, que ganhou `/painel (missão do dia)` e `/tarefa/<1ª da fila>` em todas as
larguras e temas, no zoom de 200% e na regra dos 44 px.

## Portas (2026-10-01)

- `npm run check`: 321 arquivos, 0 erros, 0 avisos.
- `npm test`: 23 arquivos, 252 testes passando.
- `npm run build`: ok.
- `CI=1 npm run test:e2e`: 166 de 166 passando (config temporária na porta 4204, apagada depois).
