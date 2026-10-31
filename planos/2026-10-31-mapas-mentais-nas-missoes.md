# Mapas mentais nos subitens da Missão — plano de implementação

Id: `2026-10-31-mapas-mentais-nas-missoes` (datado: sem `ESTADO.csv` nem issue tracker, como
o de notificações e o de links).

## Visão geral

Os mapas mentais do vault (`resumos/**/Resumo <cód> ….excalidraw`) passam a abrir dentro do
app: o import copia os `.excalidraw.svg` para `/conteudo/mapas/`, e o subitem da Missão de
hoje que tem mapa ganha o atalho "Mapa mental ↗" ao lado dos links do Qconcursos, abrindo a
rota `/mapa/<slug>` com visor de arraste e zoom. Desenho aprovado em prévia interativa
(2026-10-30) e pela decisão dela: nada de post intercalado no feed.

## Estado atual (conferido)

- **Mapas no vault**: 24 `.excalidraw` em `resumos/{B - Básicos, C - Complementares,
  E - Específicos}/`, nomeados `Resumo <cód> <tema>.excalidraw` — 11 de B/C (comuns aos dois
  cargos), 11 de E (todos da P3 de Ciência de Dados; nenhum de Auditoria). Um deles cobre
  dois subitens: `Resumo E2 4.1-4.2 Processamento distribuído e tolerância a falhas`.
- **Auto-export ligado**: `autoexportSVG: true` no plugin do Obsidian (2026-10-31), mas o
  auto-export só roda ao editar um desenho — os existentes estão **sem** `.excalidraw.svg`
  até serem tocados. A geração inicial será um lote único com o conversor que validamos na
  prévia (Excalidraw `exportToSvg` + shim de DOM em Node; saída conferida: SVG fiel).
- **Import**: `scripts/importar/missoes.mjs:44` (`linksDoPlano`) já faz o caminho análogo —
  chave do edital (`chaveLink`, `:31`: `CD:E2-1.2`; `paiDe` como fallback) → `qc[cid]`. O
  importador só enxuga e repassa (`validarMissoes`, `:67`); `montarMissoes` (`:101`) recebe
  os links prontos de `index.mjs:292`.
- **App**: `carregar.ts:18` (`validarMissoes`) revalida e devolve só
  `{gerado, plan, cortes, qc, qcErros}` — campo novo precisa entrar aí e em
  `src/lib/missoes/tipos.ts`. `MissaoDeHoje.svelte:172-201` renderiza os atalhos `.topico`
  ("N questões deste tópico", "Questões no Qconcursos ↗" com `abrirNoQc`). Rotas dinâmicas
  no padrão `src/routes/artefato/[nome]/` e `src/routes/ferramenta/[id]/`.
- **Offline de graça**: o service worker pré-cachqueia em duas fases tudo que está em
  `static/conteudo/` (`service-worker.ts:33` monta `CONTEUDO` dos `files` do build) e serve
  `/conteudo/*` cache-first (`:159`). SVGs novos entram sem mudança no SW.
- **Nome de arquivo com `:` é inválido no Windows**: a chave `CD:E2-1.2` vira slug
  `cd-e2-1.2` (cargo minúsculo + hífen), tanto no arquivo quanto na rota.

## Estado final desejado

- `npm run importar` copia cada `resumos/**/Resumo *.excalidraw.svg` para
  `static/conteudo/mapas/<slug>.svg` e grava `mapas: { [cid]: slug }` em
  `missoes-<cargo>.json` (cid do plano, como `qc`), nos dois cargos quando o mapa é de B/C.
- Na Missão de hoje, subitem com mapa mostra "Mapa mental ↗" (link interno, mesmo estilo
  `.topico`); subitem sem mapa não muda. Os links do Qconcursos continuam exatamente como
  estão.
- `/mapa/<slug>` abre o visor: cabeçalho com código e tema, SVG com arraste, pinça/scroll e
  botões de zoom (a interação da prévia), offline após a primeira visita, botão de voltar.
- Mapa novo no vault → editar no Obsidian regenera o `.excalidraw.svg` (auto-export) →
  próximo `npm run importar` publica.

### Descobertas que sustentam o plano

- `linksDoPlano`/`chaveLink`/`paiDe` (`scripts/importar/missoes.mjs:31-60`) é o padrão a
  copiar para `mapasDoPlano`; `qc` já prova que mapa por cid funciona nos dois cargos.
- O conversor one-shot (Excalidraw `exportToSvg` + shim DOM) gerou SVG fiel de 90 KB do mapa
  real E2 1.2 na prévia; o esbundle do pacote não entra no repo — fica em `%TEMP%`, só para o
  lote inicial.
- `Resumo E2 4.1-4.2 …` exige expansão de faixa: o nome gera duas chaves (`CD:E2-4.1` e
  `CD:E2-4.2`), ambas apontando o mesmo SVG.
- Service worker: nada a mudar (fase 2 cacheia `/conteudo/` inteiro, `service-worker.ts:90`).

## O que NÃO vamos fazer

- **Post de mapa no feed** — decisão dela; o mapa fica ligado ao subitem da Missão.
- **Página das Missões (artefato do vault)** com o atalho — exige mexer no
  `montar_artifacts.py` e nos templates do vault; fica para depois, em cima da entrega.
- **Botão "Mapas Mentais" da grade** — segue "em breve"; a rota `/mapa` só é alcançada pelo
  atalho da Missão (e por URL).
- **Converter `.excalidraw` dentro do import** — o repo só copia SVG pronto (auto-export ou
  lote inicial); o conversor com shim não vira código do repo.
- **Marcação/edição de mapa no app** — o visor é só leitura.

## Abordagem

Mesma arquitetura do `qc`: fonte no vault → mapa chave→slug no import → cid→slug no JSON do
plano → link na Missão. O lote inicial de SVGs é gerado uma única vez direto no vault
(exatamente onde o auto-export gravaria), então o repo nunca precisa saber converter. A rota
do visor é cliente (SPA), igual `/ferramenta/[id]`; o SVG é buscado de `/conteudo/mapas/` e
cacheado pelo SW existente.

---

## Fase 1 — Lote inicial no vault e import no repo

### Mudanças

#### Vault (lote único, sem commit — OneDrive)
**Ação**: conversor temporário (`%TEMP%`, Excalidraw `exportToSvg` + shim DOM) lê os 22
`.excalidraw` de `resumos/` e grava o `Resumo <mesmo nome>.excalidraw.svg` ao lado de cada.
Depois disso, só o auto-export do Obsidian mantém.

#### `scripts/importar/mapas.mjs` (novo)
- `chavesDoNome(nome)`: casa `^Resumo (AUD )?([B-E]\d(?:\.\d+)?)(?:-(\d+\.\d+))?\b` —
  B/C viram a chave crua (`B1-8.2`); `E` vira `CD:E2-1.2` (ou `AUD:…` com o prefixo);
  faixa `E2 4.1-4.2` gera as duas chaves. Nome fora do padrão → aviso, não aborta.
- `slugDe(chave)`: `CD:E2-1.2` → `cd-e2-1.2`; `B1-8.2` → `b1-8.2`.
- `importarMapas({vault})`: varre `resumos/**/*.excalidraw.svg`, valida que as chaves
  existem nos subitens do edital (lidos como `chaves_do_edital` — mesmos `subitens/*.json`
  do gerador de links, lidos direto do vault), devolve
  `{ arquivos: [{arquivo: 'mapas/<slug>.svg', conteudo}], mapa: {chave: slug}, avisos }`.
  `.excalidraw` sem `.svg` → aviso ("auto-export pendente").

#### `scripts/importar/missoes.mjs`
- `mapasDoPlano(plano, cargo, mapa)`: igual `linksDoPlano` sem o ramo `erros` —
  `{ [cid]: slug }`.

#### `scripts/importar/index.mjs`
- Chama `importarMapas`, empurra os arquivos, passa `mapa` ao `montarMissoes` e soma
  `mapas: N` ao relatório.

#### `tests/unit/importar/mapas.test.ts` (novo)
- `chavesDoNome`: B/C, `E`→`CD:`, prefixo `AUD`, faixa `4.1-4.2`, lixo → aviso.
- `slugDe`; `mapasDoPlano` com mini-plano dos dois cargos (B/C aparece nos dois);
  `.excalidraw` órfão gera aviso; chave inexistente no edital é recusada com aviso.

### Critérios de aceite

#### Verificação automática
- [x] `find resumos -name '*.excalidraw.svg' | wc -l` = 24 no vault (lote inicial).
- [x] `npm test` verde com os testes novos (128 no pacote de import).
- [ ] `npm run importar` gera `static/conteudo/mapas/` com 24 SVGs e o relatório imprime
      `Mapas mentais: 24`; `missoes-cd.json` ganha `mapas` com os cids de B/C + CD:E* e
      `missoes-aud.json` só com os de B/C.

#### Verificação manual
- Nenhuma (fase de dados; o app nem sabe do campo ainda).

---

## Fase 2 — Rota `/mapa`, visor e atalho na Missão de hoje

### Mudanças

#### `src/lib/missoes/tipos.ts` + `src/lib/missoes/carregar.ts`
- `PlanoMissoes` ganha `mapas: Record<string, string>` (cid → slug); `validarMissoes`
  (`carregar.ts:18`) repassa com o mesmo `mapa()` dos outros campos.

#### `src/routes/mapa/[slug]/` (novo, no padrão de `ferramenta/[id]`)
- `+page.ts`/`+page.svelte`: busca `${BASE_CONTEUDO}mapas/<slug>.svg` (texto, com o
  recarregar-sem-cache do padrão `carregar.ts`), injeta no visor; título "Mapa mental ·
  <cód>" (cód derivado do slug: `cd-e2-1.2` → `E2 1.2`) e link de voltar ao painel.
  Slug sem SVG → tela de aviso, não erro.

#### `src/lib/componentes/mapas/MapaMental.svelte` (novo)
- O visor da prévia como componente: janela com arraste (pointer events), pinça de dois
  dedos, scroll para zoom centrado no cursor, botões +/−/voltar ao início, limites de pan.
  Alvo de toque ≥ 44 px nos botões, `aria-label` em tudo, `touch-action: none` só na janela.

#### `src/lib/componentes/missoes/MissaoDeHoje.svelte`
- Nos atalhos (`:172`), depois do ramo do Qconcursos:
  `{#if plano.mapas[it.cid]}<a class="topico" href="/mapa/{plano.mapas[it.cid]}">Mapa mental ↗</a>{/if}`
  — link interno, sem `target`/`abrirNoQc` (não sai do app).

#### `tests/e2e/mapa.spec.ts` (novo)
- `/mapa/cd-e2-1.2` abre com o cabeçalho e o SVG; botão + aumenta o zoom (transform muda);
  botão de voltar leva ao painel.
- No `/painel`, o subitem com mapa mostra "Mapa mental ↗" apontando para o slug certo
  (fixture e2e já roda contra o conteúdo real importado; o teste usa o cód que existe).

#### `README.md`
- "O que tem" ganha a rota `/mapa/<slug>` (uma linha, junto das Missões).

### Critérios de aceite

#### Verificação automática
- [x] `npm test` (336) e `npm run check` (0/0) verdes.
- [x] `npm run test:e2e`: 248 passaram, `mapa.spec.ts` 3/3 e os de Missão verdes. Duas exceções conhecidas: `painel.spec.ts:206` (deriva do vault — guia de Infraestrutura removido, mudança sem commit por decisão dela) e um flake em `artefatos.spec.ts:18` (passa isolada).

#### Verificação manual
- [ ] No celular, `/painel` com dia que tem subitem mapeado (ex.: E2 1.2 em 16/10 pelo
      histórico) → "Mapa mental ↗" abre o mapa, pinça funciona, voltar retorna à Missão.
- [ ] Com o app instalado e offline, abrir um mapa já visitado funciona.

**Pausa**: verificação manual no app antes de encerrar.

## Estratégia de teste

### Unitários
- `chavesDoNome` em todas as formas de nome (B/C, E, AUD, faixa, sujeira).
- `mapasDoPlano` por cargo; B/C presente nos dois planos; faixa cobre os dois cids.
- `validarMissoes` do app repassa `mapas` (e não derruba planos antigos sem o campo).

### E2E
- Rota do visor: carga, zoom, voltar.
- Missão de hoje: presença e destino do atalho.

### Manuais
1. Fluxo completo no celular (Missão → mapa → pinça → voltar → offline).
2. Editar um mapa no Obsidian e conferir que o `.excalidraw.svg` regenera (auto-export).

## Limites conhecidos

- **Auto-export só ao editar**: mapa editado sem abrir no Obsidian fica sem SVG até ser
  tocado; o import avisa qual está pendente.
- **Fonte do Excalidraw não embutida**: o texto do SVG usa a fonte do aparelho (visto na
  prévia).
- **Mapas somam ~2 MB** ao build/offline (24 × ~90 KB), dentro do padrão dos lotes.

## Migração de dados

Nenhuma: campo novo opcional no JSON (plano antigo sem `mapas` segue válido — `validarMissoes`
normaliza para `{}`); quem já usa só recebe o atalho no próximo deploy.

## Referências
- Prévia aprovada: conversa de 2026-10-30/31 (visor interativo com o mapa real E2 1.2)
- Padrão de links por cid: `scripts/importar/missoes.mjs:31-60`; carga no app:
  `src/lib/missoes/carregar.ts:18`
- Atalhos na Missão: `src/lib/componentes/missoes/MissaoDeHoje.svelte:172-201`
- Cache offline: `src/service-worker.ts:33` e `:90`
- Auto-export: `.obsidian/plugins/obsidian-excalidraw-plugin/data.json`
  (`autoexportSVG: true`, vault `00. vault`)
