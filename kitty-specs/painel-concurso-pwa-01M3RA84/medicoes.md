# Medições — Painel de Concurso PWA

Conferido em **2026-09-30**, no build do commit do WP07 (`feat(WP07): PWA instalável,
offline e medições`, pai `823a5fa`, lane-g com WP01–WP06 mesclados). Máquina: Windows 10
Enterprise, 12 núcleos lógicos, Node ≥ 24; navegador Chromium 153.0.8010.12 (o do
Playwright, `ms-playwright/chromium-1243`). Servidor: `npm run build && npx vite preview --port 4173`.

Os limites vêm da `spec.md` e não foram ajustados.

## Resumo

| Requisito | Meta | Medido | Situação |
|---|---|---|---|
| NFR-006 peso inicial | ≤ 300 KB transferidos (gzip), sem ícones | 52.611 B gzip (134.480 B brutos): todo o JS/CSS do app + `index.html` | atende |
| NFR-001 primeira visita | ≤ 2,5 s | Lighthouse: LCP 1,77 s, TTI 1,78 s | atende |
| NFR-001 visitas seguintes | ≤ 1 s | LCP 172–180 ms com o SW controlando (Playwright + CDP, ver abaixo) | atende |
| NFR-003 acessibilidade | ≥ 90 | Lighthouse 100 | atende |
| NFR-003 boas práticas | ≥ 90 (meta do WP07) | Lighthouse 100 | atende |
| NFR-003 "auditoria de PWA" | ≥ 90 | a categoria PWA não existe no Lighthouse 13; a instalabilidade foi conferida por CDP: nenhum erro | ver a observação 1 |
| NFR-004 sem rolagem horizontal | 360–1440 px | 0 px de sobra nas 15 combinações (5 larguras × 3 telas) | atende |
| NFR-004 alvo de toque (WP07) | ≥ 44 px em 360 px | nenhum controle visível abaixo de 44 px nas 3 telas | atende |
| SC-003 offline | as duas telas abrem sem conexão | `tests/e2e/offline.spec.ts` passa | atende |
| SC-004 instalável | Android e Windows | Chrome desktop: `installabilityErrors: []`; o clique em "Instalar" não foi feito (ver abaixo); Android **não conferido** | parcial |

## Peso (NFR-006)

Comando, em `build/`:

```sh
for f in $(find _app/immutable -type f \( -name '*.js' -o -name '*.css' \) | sort) index.html; do
  echo "$f $(wc -c < $f) $(gzip -c $f | wc -c)"; done
```

`gzip 1.14`, nível padrão. A soma cobre **todos** os 27 arquivos de `_app/immutable`, as
duas telas e a de ferramenta. Uma primeira visita baixa menos que isso: o Lighthouse mediu
**54.349 B transferidos em 21 requisições** para abrir `/escolher`, contando os cabeçalhos HTTP.

| Arquivo | Bruto (B) | gzip (B) |
|---|---:|---:|
| `_app/immutable/assets/0.BdB4d3Kn.css` | 1413 | 711 |
| `_app/immutable/assets/2.BCmsq-u1.css` | 649 | 343 |
| `_app/immutable/assets/3.D256xIaA.css` | 91 | 119 |
| `_app/immutable/assets/4.BTHBRCWy.css` | 5439 | 1403 |
| `_app/immutable/assets/5.By-Z7hkx.css` | 804 | 386 |
| `_app/immutable/assets/6.D_3sCp2k.css` | 3445 | 1014 |
| `_app/immutable/assets/Icone.B6zMihrC.css` | 51 | 90 |
| `_app/immutable/chunks/B7giG4lX.js` | 294 | 179 |
| `_app/immutable/chunks/BEVVTAJS.js` | 28052 | 10780 |
| `_app/immutable/chunks/Bjy-W4x2.js` | 1365 | 666 |
| `_app/immutable/chunks/C3Fxwl-3.js` | 619 | 425 |
| `_app/immutable/chunks/C4DKBSgR.js` | 38 | 70 |
| `_app/immutable/chunks/C7_gnjxJ.js` | 14205 | 4454 |
| `_app/immutable/chunks/CWW6V_Yd.js` | 3267 | 1494 |
| `_app/immutable/chunks/DcqZrD8w.js` | 22 | 54 |
| `_app/immutable/chunks/Dt-HX3Vu.js` | 623 | 388 |
| `_app/immutable/chunks/SrMoHcWW.js` | 47171 | 17773 |
| `_app/immutable/chunks/xihTtKlq.js` | 65 | 91 |
| `_app/immutable/entry/app.xPBZjflo.js` | 4921 | 2209 |
| `_app/immutable/entry/start.BJFkKB4V.js` | 82 | 110 |
| `_app/immutable/nodes/0.CrXSyat8.js` | 301 | 254 |
| `_app/immutable/nodes/1.CQFkH69A.js` | 352 | 274 |
| `_app/immutable/nodes/2.CUSAyvE1.js` | 910 | 556 |
| `_app/immutable/nodes/3.Im6q4Mmx.js` | 525 | 371 |
| `_app/immutable/nodes/4.CyZ1xoCp.js` | 9737 | 4072 |
| `_app/immutable/nodes/5.D3PXXQFl.js` | 1453 | 797 |
| `_app/immutable/nodes/6.Dqj50ejU.js` | 6393 | 2603 |
| `index.html` | 2193 | 925 |
| **Total** | **134.480** | **52.611** |

Fora da conta, conforme a meta: `service-worker.js` com 2.321 B brutos e 1.004 B gzip,
baixado depois do `load`; `manifest.webmanifest` com 650 B e 327 B gzip. Ícones PNG:
`icone-192.png` 6.391 B, `icone-512.png` 20.175 B, `icone-maskable-512.png` 13.526 B.

Os nomes com hash mudam a cada build; a tabela vale para o build desta data.

## Lighthouse (NFR-001, NFR-003)

Lighthouse **13.5.0** via `npx`, fora do `package.json`, com `CHROME_PATH` apontando para o
Chromium do Playwright:

```sh
CHROME_PATH=".../ms-playwright/chromium-1243/chrome-win64/chrome.exe" \
npx lighthouse http://localhost:4173/escolher --preset=perf --form-factor=mobile \
  --throttling-method=simulate --only-categories=performance,accessibility,best-practices \
  --output=json --chrome-flags="--headless=new"
```

| Execução (2026-09-30, UTC) | Desempenho | Acessibilidade | Boas práticas | FCP | LCP | TTI | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1ª, perfil novo (07:03:45Z) | 100 | 100 | 100 | 1,22 s | 1,78 s | 1,79 s | 57 ms | 0 |
| 2ª, perfil novo, `--disable-storage-reset` (07:04:00Z) | 99 | 100 | 100 | 1,20 s | 1,78 s | 1,81 s | 67 ms | 0 |
| 3ª, perfil persistente, `--user-data-dir` (07:04:37Z) | 100 | 100 | 100 | 1,20 s | 1,77 s | 1,78 s | — | 0 |
| 4ª, mesmo perfil, `--disable-storage-reset` (07:04:52Z) | 99 | 100 | 100 | 1,21 s | 1,65 s | 1,77 s | — | 0 |

Nenhuma auditoria com peso falhou em acessibilidade nem em boas práticas.

**Cache quente não se mede com o Lighthouse.** Na 2ª e na 4ª execução o Lighthouse baixou
de novo os mesmos 54.349 B, com nenhuma requisição atendida pelo SW. O modo de navegação
desliga o cache HTTP e não passa pelo service worker, com ou sem `--disable-storage-reset`
e com ou sem perfil persistente. Por isso os números das execuções 2 e 4 **não** servem
como "visita seguinte". A medição de cache quente vem da seção abaixo.

### Visita seguinte (NFR-001, "≤ 1 s nas seguintes")

Script Playwright avulso, fora do repositório, contra o mesmo `vite preview`. A
limitação do perfil móvel do Lighthouse foi aplicada por CDP: RTT de 150 ms, 1.638,4 kbit/s
de descida, 675 kbit/s de subida, CPU 4×, tela de 412×823 px. A sequência foi `goto
/escolher` → esperar `navigator.serviceWorker.ready` → `about:blank` → `goto /escolher`. O
LCP foi lido por `PerformanceObserver('largest-contentful-paint')`. Três contextos novos:

| Rodada | LCP da 1ª visita | LCP da 2ª visita | 2ª página controlada pelo SW |
|---|---:|---:|---|
| 1 | 1.104 ms | 180 ms | sim |
| 2 | 1.112 ms | 172 ms | sim |
| 3 | 1.092 ms | 172 ms | sim |

## Instalação (SC-004)

- **Chrome desktop (Windows), conferência automática.** `Page.getInstallabilityErrors` por
  CDP, no Chromium 153, depois de o SW ativar em `/escolher`, devolveu
  `{"installabilityErrors":[]}`. `Page.getAppManifest` leu `/manifest.webmanifest` sem erros.
  O teste `offline.spec.ts › SC-004` confere `name`, `display: "standalone"` e ícones 192 e
  512 respondendo 200.
- **Chrome desktop, clique em "Instalar" e abertura em janela própria: não conferido.**
  Este trabalho foi feito sem interface gráfica. Falta alguém abrir o `vite preview` no
  Chrome, ver o ícone de instalar na barra de endereço, instalar e confirmar que o app abre
  em janela própria.
- **Android: não conferido.** Não havia aparelho.

## Responsivo (NFR-004)

`tests/e2e/responsivo.spec.ts`, no perfil Pixel 7 do Playwright, com a largura sobrescrita e
altura de 800 px. Telas: `/escolher` com "Ver mais" e as três seções abertas, `/painel` e
`/ferramenta/questoes-discursivas`. Larguras: 360, 390, 768, 1024 e 1440 px.
`document.documentElement.scrollWidth - innerWidth` deu ≤ 0 nos 15 casos. Em 360 px, nenhum
`button, a, select, input` visível ficou abaixo de 44 px de altura. Nenhum achado de CSS de
outro WP.

## Observações

1. **"Auditoria de PWA" (NFR-003).** O Lighthouse removeu a categoria PWA na versão 12, e a
   13.5.0 usada aqui não tem nota de PWA para comparar com a meta de 90. No lugar dela
   ficaram a conferência de instalabilidade por CDP, sem erros, e o teste do manifest. A
   meta não foi alterada; para fechá-la, é preciso decidir o que a substitui.
2. **Casca do SPA no service worker.** O `vite preview` responde 404 a `/index.html` e, em
   `/`, devolve a casca com caminhos relativos (`./_app/...`, `new URL(".", location)`). O
   SW guarda a casca de `/` com esses caminhos trocados por absolutos, para que o fallback
   offline funcione também em `/ferramenta/<id>`. O `build/index.html` do adapter-static já
   usa caminhos absolutos, e nele a troca não muda nada.
3. **E2E com 4 ou mais workers trava neste Windows.** O problema vem de antes do WP07. Com
   5 workers, as specs de WP01, WP05 e WP06 duplicadas, sem nenhum arquivo do WP07 (sem SW,
   sem `static/`), falharam em 9 de 50 testes. Com 3 workers, passaram os 50. Os sintomas
   foram subrecursos de `localhost:4173` pendentes por mais de 30 s no primeiro teste de
   cada worker e a raiz parada em "Abrindo…". Com as duas specs novas, o Playwright sobe de
   3 para 5 workers por padrão (`workers` indefinido, 12 núcleos) e o problema aparece em
   `CI=1 npm run test:e2e`. Com `--workers 3`, as 46 passam. A correção é de
   `playwright.config.ts`, que é do WP01, e não entra neste WP.
