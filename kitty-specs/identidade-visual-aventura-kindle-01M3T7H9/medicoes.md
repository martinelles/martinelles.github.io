# Medições: Identidade Visual Aventura e Kindle

Conferido em **2026-10-01** (UTC, entre 01:05Z e 01:37Z; 2026-09-30 à noite no horário de Brasília),
no build da árvore do commit `e1549ab`. Esse commit é a lane-e com WP01–WP04 mesclados (merge `e996c61`)
mais a emenda do charter, que não muda o código. Os testes do WP05 ainda não estavam commitados e não
entram no build.

- Máquina: Windows 10 Enterprise, 12 núcleos lógicos. Node 24.16.0.
- Navegador: Chromium 153.0.8010.12, o do Playwright 1.63.0 (`ms-playwright/chromium-1243`).
- Lighthouse 13.5.0, via `npx`, fora do `package.json`.
- Servidores: `npx vite preview --port 4197 --strictPort` para o build atual e `--port 4198` para o
  build de comparação de `db7ef10`. Esse build foi tirado com `git archive db7ef10`, numa pasta
  temporária fora do repositório, sem mudança de dependência entre os dois commits. Os dois foram
  parados ao fim. O e2e usou a porta 4173 do `webServer` do Playwright.

Os limites vêm da `spec.md` e não foram ajustados. O formato segue
`kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md`.

## Resumo

| Requisito | Meta (spec) | Medido | Situação |
|---|---|---|---|
| NFR-002 peso das fontes e da textura | ≤ 120 KB comprimidos no total, somados os arquivos de fonte e a textura | 4 `.woff2` com 70.660 B no total, servidos sem `Content-Encoding` porque o woff2 já é comprimido. A textura é SVG em data URI no CSS: 3 × 377 B = 1.131 B brutos, 281 B gzip. Total: **71.791 B** | atende |
| Carga inicial (charter) | ≤ 300 KB | `_app/immutable` + `index.html`: 35 arquivos, 68.801 B gzip. Somando `literata-400.woff2`, que tem preload: **85.349 B**. Em `db7ef10` eram 33 arquivos e 65.463 B | atende |
| NFR-003 troca de tema | tela toda repintada em ≤ 100 ms após o toque | 3 rodadas × 10 por tema, com CPU 4×. Medianas de 44 a 84 ms. **Pior: 192 ms**. Foram 7 de 90 amostras acima de 100 ms, todas nas rodadas 2 e 3 | **aceito com registro (D6)**: não atende no pior caso, atende na mediana; reabrir se a mediana passar de 100 ms ou a demora aparecer no aparelho da dona (obs. 2) |
| NFR-004 rolagem com textura | ≥ 55 quadros/s rolando 50 posts em celular médio | Aventura: 55,9, 57,8 e 57,9 fps de média (mediana 57,8), p5 de 59,5. Kindle: 57,6, 55,5 e 57,6 (mediana 57,6), p5 de 59,5. Com CPU 4× | atende (folga pequena; ver obs. 3) |
| NFR-005 acessibilidade | ≥ 90 na auditoria do navegador, nos três temas; seletor operável por teclado e anunciado | Lighthouse mobile: **100** nas 6 execuções (3 temas × `/` e `/painel`). E2e `teclado › setas trocam o tema a cada tecla` passa | atende |
| NFR-001 herdado (feed): 1ª visita, LCP | diferença ≤ 5% entre o antes (`db7ef10`) e o depois | Lighthouse mobile, 3 execuções em cada build: `db7ef10` 6.049, 6.087 e 6.066 ms (mediana **6.066**); atual 6.013, 6.073 e 6.031 ms (mediana **6.031**). Diferença: **−0,6%** | atende o limite de não piorar mais de 5%. A meta original de ≤ 2,5 s continua **não atendida**, como na missão do feed |
| NFR-006 layout | sem rolagem horizontal de 360 a 1440 px e com texto em 200% | `responsivo.spec.ts`: os 3 temas a 360 e 1440 px e o Aventura nas larguras intermediárias (45 testes). Zoom de 200% a 720 px nos 3 temas × 5 telas (15 testes). Sombra do Aventura a 360 px. Todos passam | atende |
| NFR-007 primeira exibição | nenhum quadro no tema errado, 10 cargas por tema | `tema.spec.ts › sem clarão`: 30 cargas, tema certo no `DOMContentLoaded` e nenhuma mutação de `data-tema` depois da primeira até `load` + 500 ms. Leva 17,7 s | atende |
| SC-003 contraste | todos os pares de texto ≥ 4,5:1, com a lista anexada | tabela abaixo. O pior par de texto é `materia-texto / materia-0` do Aventura, com 5,12. O pior de componente é `visto / fundo` do Kindle, com 3,27 (mínimo 3) | atende |
| Cenário 4.3 (Kindle sem cor) | critério D5 (spec, 2026-09-30): toda cor calculada no Kindle pertence aos tokens do tema Kindle; substitui "saturação HSL ≤ 8%" | e2e `[kindle] cores › <tela>: no Kindle, nenhuma cor fora dos tokens do tema Kindle (Cenário 4.3, D5)` passa nas 4 telas. Para registro, a saturação HSL dos tokens fica entre **10,9 e 21,7%**: `#f6f5f1` com 21,7%, `#edebe6` com 16,3% e `#d6d3cc` com 10,9% | **atende (critério D5)** (obs. 1) |
| SC-005 aprovação visual | a dona reconhece o app como "não genérico" e aprova os três temas | capturas dos 3 temas ao lado de `db7ef10` (seção "Capturas para SC-005") | **aprovado (D7)** |
| SC-006 offline | três temas idênticos à versão online | `offline-conteudo.spec.ts › SC-006`: offline, Literata (e Grandstander no Aventura) carregam do cache, sem `FontFace` com erro. A textura é a mesma string online e offline, e os 4 `.woff2` estão no Cache Storage | atende |

## Peso (NFR-002 e carga inicial)

```sh
du -cb static/fontes/*.woff2
for f in static/fontes/*.woff2; do n=$(basename $f)
  curl -sH 'Accept-Encoding: gzip' http://localhost:4197/fontes/$n | wc -c; done
# em build/:
for f in $(find _app/immutable -type f | sort) index.html; do gzip -c $f | wc -c; done
```

| Arquivo | Bruto (B) | Servido com `Accept-Encoding: gzip` (B) | `gzip -c` (B) |
|---|---:|---:|---:|
| `grandstander-700.woff2` | 19.172 | 19.172 | 19.218 |
| `literata-400.woff2` | 16.548 | 16.548 | 16.587 |
| `literata-400i.woff2` | 17.104 | 17.104 | 17.133 |
| `literata-700.woff2` | 17.836 | 17.836 | 17.866 |
| **Total das fontes** | **70.660** | **70.660** | 70.784 |
| `--textura` × 3 (data URI em `app.css`) | 1.131 | (dentro do CSS) | 281 |

Não existe `static/papel/`, porque o WP01 fez a textura em SVG inline. O `vite preview` não comprime
`.woff2`, e o `gzip` deixaria os arquivos maiores. Por isso o número que vale é o bruto.

## Troca de tema (NFR-003)

Script Playwright avulso (`.medir/medir.mjs`, não versionado), com perfil Pixel 7, `/painel` e CPU 4×
por `Emulation.setCPUThrottlingRate`, sem `page.clock`. A medida começa no `timeStamp` do `pointerdown`
do clique no rádio. Um `MutationObserver` em `data-tema` agenda dois `requestAnimationFrame` seguidos, e
o fim é o segundo deles, o quadro depois da repintura. Antes de cada amostra, outro tema é escolhido
para que o clique troque de fato. São 10 amostras por tema, em ms:

| Rodada (UTC) | Tema | Amostras | Mediana | Pior |
|---|---|---|---:|---:|
| 1 (01:08Z) | aventura | 83, 70, 69, 90, 70, 67, 47, 90, 47, 12 | 69,5 | 90 |
| 1 | kindle | 56, 43, 41, 44, 37, 64, 44, 57, 47, 44 | 44 | 64 |
| 1 | kindle-escuro | 55, 58, 65, 68, 50, 41, 40, 51, 70, 62 | 56,5 | 70 |
| 2 (01:09Z) | aventura | 72, 39, 73, 62, 47, 59, 49, 56, 56, 65 | 57,5 | 73 |
| 2 | kindle | 40, 68, 72, 53, 40, 36, 45, 46, 71, 58 | 49,5 | 72 |
| 2 | kindle-escuro | **124**, 73, 70, 49, 60, 63, 85, 81, 54, 67 | 68,5 | **124** |
| 3 (01:15Z) | aventura | **103**, 67, **192**, 99, 84, 84, 72, 81, 41, **137** | 84 | **192** |
| 3 | kindle | 90, 78, 42, 66, 73, 56, 77, 79, 53, 46 | 69,5 | 90 |
| 3 | kindle-escuro | 61, 57, 35, 76, **112**, 79, **126**, **122**, 78, **158** | 78,5 | **158** |

## Rolagem (NFR-004)

Mesmo script, modo `rolagem`, mesmo roteiro da missão do feed. Primeira visita, SW controlando, 8 s
para a fase 2 baixar o conteúdo e recarga. Depois, CPU 4× e `window.scrollBy(0, 20)` a cada
`requestAnimationFrame` até o 50º post sair pelo topo. Ao fim havia 60 posts no DOM. O fps vem dos
intervalos de `requestAnimationFrame`, e o CDP Tracing não foi usado desta vez.

| Rodada (01:09Z–01:17Z) | Build e tema | Duração | Quadros | fps médio | fps p5 | Quadros > 18 ms | Maior quadro |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 | atual, aventura | 33,7 s | 1.887 | 55,9 | 59,5 | 49 | 433,3 ms |
| 2 | atual, aventura | 32,7 s | 1.887 | 57,8 | 59,5 | 25 | 266,7 ms |
| 3 | atual, aventura | 32,6 s | 1.887 | 57,9 | 59,5 | 32 | 216,7 ms |
| 1 | atual, kindle | 32,3 s | 1.859 | 57,6 | 59,5 | 26 | 233,3 ms |
| 2 | atual, kindle | 33,5 s | 1.859 | 55,5 | 59,5 | 58 | 250,0 ms |
| 3 | atual, kindle | 32,3 s | 1.859 | 57,6 | 59,5 | 34 | 233,4 ms |
| 1 | `db7ef10` (referência) | 29,0 s | 1.638 | 56,5 | 59,5 | 36 | 349,9 ms |
| 2 | `db7ef10` (referência) | 28,4 s | 1.638 | 57,7 | 59,5 | 26 | 233,4 ms |
| 3 | `db7ef10` (referência) | 28,2 s | 1.638 | 58,1 | 59,5 | 21 | 233,3 ms |

## Lighthouse

**Acessibilidade (NFR-005).** O tema é gravado antes da auditoria. O script `.medir/lh2.mjs` abre o
Chromium do Playwright com `--remote-debugging-port=9333` e perfil novo, grava a chave
`painel-concurso:tema:v1` pela origem e roda:

```sh
npx -y lighthouse@13 http://localhost:4197<rota> --port=9333 --disable-storage-reset \
  --form-factor=mobile --only-categories=accessibility --output=json
```

Depois de cada execução, uma página nova no mesmo perfil conferiu o `data-tema`, e ele era sempre o
gravado.

| Tema | Rota | Acessibilidade | Auditorias binárias com falha | Quando (UTC) |
|---|---|---:|---|---|
| aventura | `/` | 100 | nenhuma | 01:28:57Z |
| aventura | `/painel` | 100 | nenhuma | 01:29:17Z |
| kindle | `/` | 100 | nenhuma | 01:29:37Z |
| kindle | `/painel` | 100 | nenhuma | 01:29:57Z |
| kindle-escuro | `/` | 100 | nenhuma | 01:30:18Z |
| kindle-escuro | `/painel` | 100 | nenhuma | 01:30:37Z |

**Desempenho (NFR-001 herdado).** Perfil novo a cada execução, sem tema gravado, então vale o
Aventura. As execuções dos dois builds foram alternadas:

```sh
CHROME_PATH=".../ms-playwright/chromium-1243/chrome-win64/chrome.exe" \
npx -y lighthouse@13 http://localhost:<porta>/ --preset=perf --form-factor=mobile \
  --throttling-method=simulate --only-categories=performance --output=json --chrome-flags="--headless=new"
```

| Execução (UTC) | Build | Desempenho | FCP | LCP | TBT | CLS | Bytes |
|---|---|---:|---:|---:|---:|---:|---:|
| 01:31:01Z | `db7ef10` | 71 | 1.253 ms | 6.049 ms | 147 ms | 0,141 | 744.456 |
| 01:31:18Z | atual | 72 | 1.260 ms | 6.013 ms | 178 ms | 0,117 | 763.735 |
| 01:31:35Z | `db7ef10` | 69 | 1.252 ms | 6.087 ms | 204 ms | 0,141 | 744.456 |
| 01:31:52Z | atual | 63 | 1.272 ms | 6.073 ms | 441 ms | 0,121 | 763.735 |
| 01:32:09Z | `db7ef10` | 69 | 1.246 ms | 6.066 ms | 200 ms | 0,137 | 744.456 |
| 01:32:26Z | atual | 71 | 1.263 ms | 6.031 ms | 186 ms | 0,121 | 763.735 |

O preload da Literata somou 19.279 B à primeira visita e não piorou o LCP: a mediana caiu 0,6%. O CLS
também caiu, de 0,137–0,141 para 0,117–0,121.

## Contraste (SC-003)

Saída de `npx vitest run tests/unit/contraste.test.ts --reporter=verbose`, teste
`tabela de contraste por tema (SC-003)`, com os pares de `contracts/tema.md` §6:

| Par | Mínimo | Aventura | Kindle | Kindle escuro |
|---|---:|---:|---:|---:|
| texto / fundo | 4,5 | 18,27 | 14,30 | 12,48 |
| texto / superficie | 4,5 | 18,84 | 15,62 | 11,38 |
| texto-suave / fundo | 4,5 | 7,49 | 5,79 | 6,94 |
| texto-suave / superficie | 4,5 | 7,73 | 6,32 | 6,33 |
| primaria-texto / primaria | 4,5 | 5,81 | 15,62 | 12,48 |
| acerto / acerto-fundo | 4,5 | 6,62 | 11,40 | 7,97 |
| erro / erro-fundo | 4,5 | 6,10 | 15,62 | 11,38 |
| aviso / aviso-fundo | 4,5 | 15,45 | 11,40 | 7,97 |
| lei / superficie | 4,5 | 5,81 | 15,62 | 11,38 |
| borda / fundo | 3 | 18,27 | 3,71 | 3,89 |
| borda / superficie | 3 | 18,84 | 4,05 | 3,54 |
| primaria / fundo | 3 | 5,63 | 14,30 | 12,48 |
| curtida / superficie | 3 | 5,37 | 15,62 | 11,38 |
| visto / fundo | 3 | 3,50 | 3,27 | 3,45 |
| materia-texto / materia-0 | 4,5 | 5,12 | 11,40 | 7,97 |
| materia-texto / materia-1 | 4,5 | 7,94 | 11,40 | 7,97 |
| materia-texto / materia-2 | 4,5 | 12,19 | 11,40 | 7,97 |
| materia-texto / materia-3 | 4,5 | 15,45 | 11,40 | 7,97 |
| materia-texto / materia-4 | 4,5 | 11,84 | 11,40 | 7,97 |
| materia-texto / materia-5 | 4,5 | 8,62 | 11,40 | 7,97 |
| materia-texto / materia-6 | 4,5 | 5,13 | 11,40 | 7,97 |
| materia-texto / materia-7 | 4,5 | 9,05 | 11,40 | 7,97 |

## Capturas para SC-005

Geradas por `.medir/capturas.mjs` (Playwright, Pixel 7 com 412×915 CSS px e escala 2,625, relógio fixo
em 2026-09-30 12:00 −03:00, esquema claro) em
`.worktrees/identidade-visual-aventura-kindle-01M3T7H9-lane-e/test-results/sc005/`. Esse diretório não
é versionado e é apagado na próxima execução do Playwright nessa worktree.

| Arquivo | O que mostra |
|---|---|
| `novo-aventura-feed.png` | `/`, primeira tela, tema Aventura |
| `novo-aventura-lei.png` | primeiro post de `/?tipo=lei` (Lei 9.784/1999, art. 60), Aventura |
| `novo-aventura-painel.png` | `/painel` com a página inteira e o seletor de aparência, Aventura |
| `novo-kindle-feed.png` | `/`, primeira tela, Kindle |
| `novo-kindle-lei.png` | o mesmo post de lei, Kindle |
| `novo-kindle-painel.png` | `/painel` com a página inteira, Kindle |
| `novo-kindle-escuro-feed.png` | `/`, primeira tela, Kindle escuro |
| `novo-kindle-escuro-lei.png` | o mesmo post de lei, Kindle escuro |
| `novo-kindle-escuro-painel.png` | `/painel` com a página inteira, Kindle escuro |
| `antigo-db7ef10-feed.png` | `/` do build antigo (`db7ef10`), para comparar |
| `antigo-db7ef10-lei.png` | o mesmo post de lei no build antigo |
| `antigo-db7ef10-painel.png` | `/painel` do build antigo, página inteira |

## Testes (T025–T028)

`CI=1 npm run test:e2e`, em 2026-10-01 entre 01:33Z e 01:35Z: **131 testes, 127 passando e 4
falhando**, em 1,4 min com 2 workers. Os 63 testes antigos passam. Os 4 que falham são os de
saturação do Kindle (obs. 1). Depois de D5, eles foram trocados pelo teste de pertença aos tokens
do Kindle; o resultado está em "Execução depois de D5–D7", abaixo.

- `tema.spec.ts`: 31 testes, todas as linhas da tabela do T025 e os 4 itens do T026.
- `responsivo.spec.ts`: de 30 para 66 testes. O laço de larguras ganhou os temas: 25 Aventura, 10
  Kindle e 10 Kindle escuro. Somam-se 15 de zoom de 200%, 1 de sombra e os 5 de alvo de toque, sem
  mudança.
- `offline-conteudo.spec.ts`: mais 1 teste (SC-006).

`npm run check` deu 291 arquivos, 0 erros e 0 avisos. `npm test` deu 16 arquivos e 186 testes
passando. `npm run build` terminou sem erro.

## Observações

1. **Cenário 4.3: o critério do plan contradizia a paleta do data-model. Resolvido por D5** (spec,
   2026-09-30, commit `003ac4f` em `main`): o Kindle fica com o papel quente, e o critério passa a ser a
   pertença aos tokens do Kindle, com tolerância de ±2 por canal. O registro original segue abaixo. O plan e o WP05 pedem
   saturação HSL ≤ 8% em toda cor do Kindle. Os tokens aprovados em `data-model.md` e implementados
   no WP01 são cinzas quentes de papel, e a saturação HSL deles passa disso:
   - `--cor-superficie`, `--cor-erro-fundo` e `--cor-primaria-texto` = `#f6f5f1`: 21,7%
   - `--cor-fundo` = `#edebe6`: 16,3%
   - `--cor-divisor`, `--cor-acerto-fundo`, `--cor-aviso-fundo` e `--materia-0…7` = `#d6d3cc`: 10,9%

   Os demais tokens do Kindle ficam abaixo de 8%: `#1c1c1c` e `#5a5a5a` com 0%, `#7a7872` com 3,4% e
   `#83817c` com 2,7%. Perto do branco, a saturação HSL infla: a diferença entre os canais nesses tons
   é de 5 a 10 em 255. Os testes
   `[kindle] cores › <tela>: nenhuma cor fora da escala de cinza, saturação HSL ≤ 8% (Cenário 4.3)`
   falham nas 4 telas e foram mantidos como estão. Decidir se o Kindle é cinza neutro ou papel quente
   é com a dona ou com o planejamento; o teste não foi afrouxado. A prévia dos outros temas no seletor
   do painel tem `data-tema` próprio e fica fora dessa conta, porque o FR-003 pede uma prévia de cada
   opção.
2. **NFR-003 tem o pior caso acima de 100 ms. Aceito com registro por D6**; reabrir se a mediana passar de
   100 ms ou a demora aparecer no aparelho da dona. Na rodada 1, todas as amostras ficaram ≤ 90 ms. Nas
   rodadas 2 e 3, 7 de 60 passaram de 100 ms, até 192 ms, e a mediana subiu de 44–70 para 57–84 ms. A
   máquina estava mais lenta nesta sessão: o build antigo rolou a 56,5–58,1 fps, contra 59,2–59,3 fps
   na medição da missão do feed com o mesmo roteiro. Pela meta, que vale para cada toque, o resultado é
   não atende no pior caso. A troca de `data-tema` no `<html>` recalcula o estilo do documento todo,
   inclusive a camada de textura fixa. A medição não separou quanto disso é estilo, layout ou pintura.
3. **NFR-004 tem folga pequena.** A média de 55,5–57,9 fps fica perto do limite, mas o build antigo,
   medido na mesma sessão, deu 56,5–58,1 fps. Não houve perda mensurável por causa da textura ou da
   sombra. O p5 é de 59,5 fps em todas as rodadas. Os quadros longos coincidem com a chegada de páginas
   novas, como na missão anterior.
4. **FR-010, posição do feed.** Com `/` rolado até 1.600 px, ir ao painel e voltar pela barra de abas
   leva a página a 0 px, tanto **sem** quanto **com** troca de tema. O app não restaura a rolagem entre
   rotas pela barra de abas. Esse é o comportamento-base, e a troca de tema não o muda: o teste
   `posição do feed` compara com ele e anota o resultado. Na própria página, a troca de tema mantém a
   rolagem (teste `troca de tema não perde a posição na própria página`). Restaurar a rolagem do feed
   entre abas seria um requisito novo, e não foi inventado aqui.
5. **Oscilação do e2e.** Na primeira execução de `tema.spec.ts` nesta sessão, o build do `webServer`
   passou de 120 s duas vezes. Numa execução, 4 testes ficaram parados em `page.goto` até o timeout de
   30 s, e a mesma suíte levou 7 min. Repetida logo depois, levou 1,1 min, sem falha de tempo. O
   sintoma é o da observação 3 da missão do feed.
6. **Não medido.** O instrumento de tempo foi `requestAnimationFrame`, e não o DevTools Performance
   do quickstart §4 nem o CDP Tracing. Não houve aparelho real. O SC-005 foi aprovado pela dona olhando as
   capturas (D7).

## Execução depois de D5–D7

Em 2026-10-01, entre 02:54Z e 02:56Z, com `main` (commit `003ac4f`, D5–D7) mesclado na lane-e, foram
rodadas todas as portas:

- `npm run check`: 291 arquivos, 0 erros, 0 avisos.
- `npm test`: 16 arquivos, 186 testes passando.
- `npm run build`: ok.
- `CI=1 npm run test:e2e`: **131 de 131 passando** em 1,4 min, com 2 workers. Os 4 testes
  `[kindle] cores › <tela>: no Kindle, nenhuma cor fora dos tokens do tema Kindle (Cenário 4.3, D5)`
  passam em `/`, `/salvos (com um salvo)`, `/painel` e `/ferramenta/questoes-discursivas`.
