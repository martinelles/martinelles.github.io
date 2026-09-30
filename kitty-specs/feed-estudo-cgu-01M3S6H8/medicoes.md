# Medições — Feed de estudo CGU

Conferido em **2026-09-30** (entre 15:47Z e 15:58Z), no build da árvore do commit do WP06
(`feat(WP06): feed completo offline e medições`, pai `50f5aa9`, lane-f com WP01–WP05
mesclados). Máquina: Windows 10 Enterprise, 12 núcleos lógicos, Node 24.16.0; navegador
Chromium 153.0.8010.12 (o do Playwright 1.63.0, `ms-playwright/chromium-1243`). Servidor:
`npm run build && npx vite preview --port 4173`, que entrega com `Content-Encoding: gzip`.

Os limites vêm da `spec.md` e não foram ajustados. O modelo de medição é o de
`kitty-specs/painel-concurso-pwa-01M3RA84/medicoes.md`.

## Resumo

| Requisito | Meta | Medido | Situação |
|---|---|---|---|
| NFR-004 carga inicial sem conteúdo | ≤ 300 KB gzip | 65.447 B gzip (33 arquivos: todo `_app/immutable` + `index.html`); Lighthouse: 63.610 B transferidos fora de `/conteudo/` | atende |
| NFR-005 lote | ≤ 150 KB gzip cada | maior lote 143.973 B gzip (`lote-fundamentos-de-auditoria-governamental-1.json`) | atende |
| NFR-005 conteúdo total offline | todo após a 1ª visita | 26 arquivos, 1.285.047 B gzip (6.856.101 B brutos), todos no Cache Storage (`offline-conteudo.spec.ts`) | atende |
| NFR-001 primeira visita | ≤ 2,5 s | Lighthouse: LCP 6,02–6,03 s; Playwright com rede limitada na origem: LCP 5,05–5,08 s | **não atende** (ver a observação 1) |
| NFR-001 visitas seguintes | ≤ 1 s | LCP 856–928 ms com a fase 2 ainda baixando; 776–836 ms com o conteúdo todo no cache | atende, com folga de 72 ms no pior caso |
| NFR-002 rolagem | ≥ 55 quadros/s ao rolar 50 posts | média 59,2–59,3 fps; p5 59,5 fps (CPU 4×) | atende |
| NFR-003 resposta ao toque | ≤ 100 ms | pior valor 60 ms (responder); curtir ≤ 14, salvar ≤ 20, virar ≤ 10, trocar story ≤ 56 ms (CPU 4×) | atende |
| NFR-006 acessibilidade | Lighthouse ≥ 90 | 100 nas três execuções | atende |
| Boas práticas (charter) | Lighthouse ≥ 90 | 100 nas três execuções | atende |
| SC-005 offline | feed abre e rola offline em 100% das tentativas | `offline-conteudo.spec.ts` passou 3 de 3 vezes contra o SW final e 11 de 11 contra versões intermediárias | atende |
| Instalação | instalável | CDP `installabilityErrors: []`; Android **não conferido** | parcial |

## Service worker: pré-cache em duas fases (T033)

`src/service-worker.ts`, conforme `research.md` R4:

1. **`install`**: `addAll` só da casca, ou seja, `build` + `files` fora de `/conteudo/` +
   `/`, esta com os caminhos absolutizados, como na missão anterior. Depois vem o
   `skipWaiting`. Só essa parte fica no `waitUntil`: se ela falha, o SW não instala.
2. **Conteúdo**: depois que a casca está gravada, e fora do `waitUntil`, cada arquivo de
   `/conteudo/` é baixado **um por vez**, com `catch` por arquivo. `indice.json` e
   `materias.json` vêm primeiro. Um lote que falha não derruba a instalação nem os outros
   lotes.
3. **Gatilho de retentativa escolhido: o próprio SW, sem mensagem da página.** O que faltou é
   tentado de novo no `activate`, sem segurar a ativação, e a cada navegação que passa pelo
   SW, com o `FetchEvent.waitUntil` da navegação mantendo o SW vivo sem atrasar a resposta.
   Toda abertura do app é uma navegação, então nenhum código de página precisa conhecer o
   pré-cache. A mensagem `'completar-conteudo'` não foi implementada.
4. **`fetch` de `/conteudo/*`**: cache-first. Se o arquivo falta no cache, ele é baixado,
   gravado e servido do cache. O download é dividido com a fase 2 quando ela está no mesmo
   arquivo, e sem gravação a página recebe a resposta da rede. O pedido da página respeita o
   cache HTTP como faria sem SW; a fase 2 pede com `cache: 'no-cache'`, para não gravar uma
   cópia velha no cache da versão nova.
5. O nome do cache continua versionado (`painel-concurso-${version}`). O `activate`, que só
   acontece depois de um `install` bem-sucedido, ou seja, com a casca nova completa, apaga as
   versões antigas.
6. Mantidos: navegação network-first com fallback à casca, ativos cache-first e nenhuma
   interceptação de outra origem. `offline.spec.ts › o SW não intercepta outra origem` passa.

Custo conhecido: na primeira visita, a fase 2 baixa o conteúdo inteiro, 1.285.047 B gzip, até
os lotes que a página acabou de buscar antes de o SW controlá-la. Isso acontece porque o
`no-cache` revalida; um servidor que responda 304 reduz a repetição a cabeçalhos. Com a
limitação de rede abaixo, a fase 2 leva cerca de 6,3 s de banda.

## Testes (T034)

`tests/e2e/offline-conteudo.spec.ts`:

1. **SC-005.** Abre `/`, espera o SW controlar e recarrega. Espera, com timeout de 60 s,
   todos os `lote-*.json` do `indice.json` mais `indice.json` e `materias.json` aparecerem
   no Cache Storage. Então fica offline e abre `/?materia=` para `direito-constitucional`,
   `ti-ciencia-de-dados` e `contabilidade`, rolando 3 páginas em cada, sem alerta de erro e
   com os posts todos da mesma matéria. Salva um post e o vê em `/salvos`. Responde uma
   questão em `/?tipo=questao`.
2. **Lote que falha na instalação.** `context.route` devolve 500 para
   `lote-lingua-inglesa-1.json`, e a rota também pega os pedidos do SW. O SW chega a
   `activated` e controla a página, todo o resto do conteúdo entra no cache e o lote recusado
   não entra. Tirada a rota, uma recarga (navegação) faz o SW buscar o lote, que aparece no
   cache.

O teste 2 discrimina o comportamento: com o `service-worker.ts` anterior (um `addAll` de tudo),
ele falha por timeout, porque o SW não instala. Conferido em 2026-09-30 trocando o arquivo
temporariamente.

Execuções em 2026-09-30, contra o SW final: `CI=1 npx playwright test
tests/e2e/offline-conteudo.spec.ts` passou 2 de 2 vezes (12,3 s e 12,5 s), mais uma vez dentro
de `CI=1 npm run test:e2e` (63 de 63). Contra versões intermediárias do SW, passou mais 11
vezes, sem falha.

## Peso (NFR-004, NFR-005)

Comando, em `build/`, com `gzip 1.14` no nível padrão:

```sh
for f in $(find _app/immutable -type f | sort) index.html; do
  echo "$(wc -c < $f) $(gzip -c $f | wc -c) $f"; done
for f in conteudo/*.json; do echo "$(gzip -c $f | wc -c) $(wc -c < $f) $f"; done | sort -n
```

**Casca (NFR-004):** 33 arquivos (24 JS, 8 CSS e `index.html`), com 164.610 B brutos e
**65.447 B gzip**. A conta cobre todas as rotas; uma primeira visita a `/` baixa menos que
isso. Pelo Lighthouse, foram 35 requisições e 744.451 B transferidos, dos quais 680.841 B
são 11 arquivos de `/conteudo/` e **63.610 B** são o resto, contando cabeçalhos. Ficam fora
da conta `service-worker.js` (4.750 B brutos, 1.760 B gzip, baixado depois do `load`) e
`manifest.webmanifest` (668 B, 329 B gzip). Os nomes com hash mudam a cada build.

**Conteúdo (NFR-005):**

| Arquivo | gzip (B) | Bruto (B) |
|---|---:|---:|
| `materias.json` | 952 | 2.501 |
| `lote-raciocinio-critico-e-argumentacao-1.json` | 2.025 | 5.738 |
| `lote-estatistica-1.json` | 4.535 | 15.683 |
| `lote-raciocinio-logico-e-matematica-1.json` | 10.312 | 44.989 |
| `lote-outras-1.json` | 12.437 | 39.372 |
| `lote-lingua-inglesa-1.json` | 15.993 | 60.723 |
| `lote-cgu-correicao-integridade-e-leniencia-1.json` | 17.672 | 90.053 |
| `lote-economia-e-financas-publicas-1.json` | 19.419 | 77.404 |
| `indice.json` | 19.562 | 544.248 |
| `lote-contabilidade-1.json` | 20.646 | 99.491 |
| `lote-ti-infraestrutura-redes-e-sistemas-operacionais-1.json` | 21.475 | 102.349 |
| `lote-ouvidoria-e-comunicacao-social-1.json` | 21.652 | 84.806 |
| `lote-ti-desenvolvimento-e-engenharia-de-software-1.json` | 28.598 | 141.486 |
| `lote-ti-seguranca-da-informacao-1.json` | 36.424 | 183.313 |
| `lote-ti-ciencia-de-dados-1.json` | 46.646 | 206.506 |
| `lote-adm-publica-politicas-publicas-e-adm-geral-1.json` | 48.343 | 224.320 |
| `lote-adm-financeira-e-orcamentaria-1.json` | 56.923 | 286.778 |
| `lote-lingua-portuguesa-1.json` | 59.767 | 210.533 |
| `lote-ti-governanca-gestao-e-contratacoes-de-ti-1.json` | 61.843 | 321.260 |
| `lote-direito-administrativo-2.json` | 67.675 | 361.921 |
| `lote-direito-constitucional-2.json` | 91.121 | 459.965 |
| `lote-fundamentos-de-auditoria-governamental-2.json` | 91.132 | 514.941 |
| `lote-outros-ramos-do-direito-1.json` | 98.263 | 475.747 |
| `lote-direito-constitucional-1.json` | 143.721 | 744.445 |
| `lote-direito-administrativo-1.json` | 143.938 | 775.374 |
| `lote-fundamentos-de-auditoria-governamental-1.json` | 143.973 | 782.155 |
| **Total (26)** | **1.285.047** | **6.856.101** |

O maior lote, com 143.973 B, fica abaixo de 150 KB tanto em 150.000 B quanto em 153.600 B.
São 24 lotes, mais o índice e as matérias.

## Lighthouse (NFR-001, NFR-006)

Lighthouse **13.5.0** via `npx`, fora do `package.json`, com `CHROME_PATH` apontando para o
Chromium do Playwright:

```sh
CHROME_PATH=".../ms-playwright/chromium-1243/chrome-win64/chrome.exe" \
npx -y lighthouse@13 http://localhost:4173/ --preset=perf --form-factor=mobile \
  --throttling-method=simulate --only-categories=performance,accessibility,best-practices \
  --output=json --chrome-flags="--headless=new"
```

| Execução (2026-09-30, UTC) | Desempenho | Acessibilidade | Boas práticas | FCP | LCP | TTI | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1ª (15:54:52Z) | 72 | 100 | 100 | 1,24 s | 6,03 s | 6,03 s | 115 ms | 0,137 |
| 2ª (15:55:08Z) | 72 | 100 | 100 | 1,24 s | 6,02 s | 6,02 s | 104 ms | 0,137 |
| 3ª (15:55:24Z) | 72 | 100 | 100 | 1,24 s | 6,02 s | 6,02 s | 119 ms | 0,137 |

As únicas auditorias com peso abaixo de 0,9 foram `largest-contentful-paint` (0,13) e
`cumulative-layout-shift` (0,79). Em acessibilidade e boas práticas, nenhuma falhou. Como na
missão anterior, o Lighthouse não passa pelo SW, então a visita seguinte foi medida à parte.

## Visitas com Playwright (NFR-001)

Script Playwright avulso (`medir.mjs`), fora do repositório, com o perfil Pixel 7 em 412×823
px, CPU 4× por `Emulation.setCPUThrottlingRate`, sem `page.clock` (ele troca `performance.now`
e `requestAnimationFrame` por um relógio falso). O LCP foi lido por
`PerformanceObserver('largest-contentful-paint')` 1,5 s depois de o primeiro post aparecer.
O elemento LCP foi, em todas as rodadas, o rótulo da questão do primeiro post
(`SPAN.rotulo`, de `CorpoQuestao`). Sequência: `goto /` → `navigator.serviceWorker.ready` →
`about:blank` → `goto /`. Três contextos novos por linha.

**A limitação por CDP não serve com o SW.** O `Network.emulateNetworkConditions` da página não
vale para o alvo do service worker. Depois do `clients.claim`, os pedidos de lote da página
passam pelo SW e saem sem limitação: com CDP, a 1ª visita com SW deu LCP 1.764–1.916 ms,
contra 4.912–4.960 ms com o SW bloqueado. Esse número é artefato da medição. Por isso a
limitação foi posta na origem: `proxy-lento.mjs`, avulso, escuta a 4196 e repassa para a
4173. Cada resposta espera 150 ms (1 RTT) e entra numa fila única de 1.638,4 kbit/s de
descida, que vale para a página e para o SW. O corpo é entregue inteiro quando a fila chega
ao fim dele.

| Medição (proxy + CPU 4×) | Rodada 1 | Rodada 2 | Rodada 3 |
|---|---:|---:|---:|
| 1ª visita, SW ativo (15:58Z) | 5.084 ms | 5.048 ms | 5.072 ms |
| 1ª visita, SW bloqueado (15:58Z) | 5.020 ms | 5.004 ms | 5.012 ms |
| 2ª visita logo depois, fase 2 ainda baixando (15:58Z) | 856 ms | 924 ms | 928 ms |
| Visita com o conteúdo todo no cache (15:53Z) | 776 ms | 836 ms | 816 ms |

Com o SW, a 1ª visita fica cerca de 30 a 80 ms mais lenta: a fase 2 começa depois do `load`
e disputa pouco a banda. Só com CDP, com a rede do SW sem limitação, a visita seguinte deu 628–688 ms e
a visita com o conteúdo todo no cache, 600–680 ms.

## Rolagem (NFR-002)

Mesmo script, modo `rolagem`, em `/` com o conteúdo todo no cache, perfil Pixel 7 e CPU 4×. A
rolagem é por `window.scrollBy(0, 20)` a cada `requestAnimationFrame` até o 50º post sair
pelo topo, puxando as páginas novas no caminho; ao fim havia 60 posts no DOM. O fps por
quadro vem dos intervalos de `requestAnimationFrame`, e a conferência vem de CDP `Tracing`
(`devtools.timeline`, `disabled-by-default-devtools.timeline.frame`), com a contagem de
`DrawFrame`. Rolagem por JS roda na thread principal, então é mais pessimista que a rolagem
por toque, que o compositor faz.

| Rodada (15:56Z) | Duração | Quadros | fps médio | fps p5 | Quadros > 18 ms | Maior quadro | DrawFrame (fps) | DroppedFrame |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 27,7 s | 1.639 | 59,2 | 59,5 | 11 | 116,7 ms | 1.639 (59,2) | 22 |
| 2 | 27,7 s | 1.639 | 59,3 | 59,5 | 11 | 116,6 ms | 1.639 (59,3) | 21 |
| 3 | 27,7 s | 1.639 | 59,2 | 59,5 | 11 | 133,4 ms | 1.639 (59,2) | 23 |

Os 11 quadros longos, com até 133 ms, somam 0,7% dos quadros e ficam fora do p5. Eles
coincidem com a chegada das páginas novas, e são perceptíveis como soluços isolados.

## Toque (NFR-003)

Mesmo script, modo `toque`, com o conteúdo no cache e CPU 4×. A latência vai do `timeStamp`
do `pointerdown` até o primeiro `requestAnimationFrame` depois da primeira mutação do DOM, que
é a mudança de estado visível. Os cliques são `click()` do Playwright, que disparam `pointerdown`. Execução
das 15:57:54Z, em ms:

| Ação | Amostras | Pior |
|---|---|---:|
| Responder (5 questões diferentes) | 60, 23, 22, 20, 19 | 60 |
| Curtir (liga/desliga) | 14, 12, 13, 13, 13, 12 | 14 |
| Salvar (liga/desliga) | 14, 12, 13, 12, 11, 20 | 20 |
| Virar flashcard | 10, 7, 5, 5, 7, 7 | 10 |
| Trocar story | 46, 33, 31, 56, 27 | 56 |

## Instalação

- **Conferência por CDP.** `Page.getInstallabilityErrors`, no Chromium 153, depois de o SW
  ativar em `/`, devolveu `{"installabilityErrors":[]}`. `Page.getAppManifest` leu
  `/manifest.webmanifest` com `errors: []`. É o critério equivalente à antiga auditoria PWA,
  premissa da spec.
- **Chrome desktop, clique em "Instalar": não conferido.** Não havia interface gráfica.
- **Android: não conferido.** Não havia aparelho.

## Portas (2026-09-30, contra o SW final)

- `npm run check`: 286 arquivos, 0 erros, 0 avisos.
- `npm test`: 14 arquivos, 153 testes passando.
- `npm run build`: ok.
- `CI=1 npm run test:e2e`: 63 de 63 passando (33,6 s, 2 workers). Veja a observação 3.

## Observações

1. **NFR-001, primeira visita, não atendida: LCP de 5,0 a 6,0 s contra a meta de 2,5 s.** A
   causa provável é o desenho da primeira página do feed "Tudo", que é de WP03/WP05, e não o
   SW. Os 10 primeiros posts vêm de matérias variadas, então a página baixa **9 lotes
   inteiros**, 680.841 B dos 744.451 B transferidos, antes de mostrar o primeiro post. O LCP é
   o rótulo da primeira questão, que só aparece depois disso. Com o SW bloqueado, o número é o
   mesmo (5,00–5,02 s). O FCP é de 1,24 s. Saídas possíveis, fora deste WP: um lote de
   abertura pequeno com os posts da primeira página, primeira página tirada de um ou dois
   lotes, ou lotes menores. O limite não foi mexido.
2. **CLS 0,137** no Lighthouse, acima do 0,1 considerado bom. Não é NFR desta spec; fica
   registrado para quem mexer na primeira página.
3. **Oscilação do e2e.** Em 1 de 6 execuções completas de `CI=1 npm run test:e2e` nesta data,
   `feed.spec.ts › 1. "/" abre o feed … em até 3 s` falhou com 10.794 ms. As outras 5
   passaram, assim como 3 execuções seguidas de `feed.spec.ts` com `offline-conteudo.spec.ts`.
   O sintoma, uma parada longa na primeira visita de um worker, é o mesmo da observação 3 de
   `painel-concurso-pwa-01M3RA84/medicoes.md`. Não foi reproduzido de novo; a fase 2 do SW,
   que desce o conteúdo inteiro do mesmo `vite preview` em paralelo, pode contribuir, mas isso
   não foi demonstrado.
4. **Visita seguinte perto do limite.** O pior caso, 928 ms, deixa 72 ms de folga, e com o
   conteúdo todo no cache o pior foi 836 ms. Uma versão intermediária do SW, que revalidava
   (`no-cache`) também os pedidos da própria página, deu 3,6–3,9 s na 2ª visita. Por isso o
   pedido da página respeita o cache HTTP (item 4 do T033).
