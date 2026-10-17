# Os três artefatos dentro do painel: plano de implementação

Id: `2026-10-14-artefatos-no-git`. O repositório não tem `ESTADO.csv`. O rastro destes artefatos
mora no vault (`Estudo/cgu/ESTADO.csv` e `planos/2026-10-13-F7-01-…`), que este repositório só lê.

## Visão geral

Prioridades, Missões e Raio-X do Qconcursos passam a ser servidos pelo próprio painel
(`cgu.solarpunk.workers.dev/conteudo/artefatos/…`), versionados no git e gerados a partir do vault pelo
`npm run importar`. Assim deixam de depender do claude.ai: as marcações das Missões passam a
sair do login por nome e do D1, e o Raio-X roda sem o tipo "dashboard" do claude.ai.

## Estado atual (conferido em 2026-10-14)

**Os três artefatos.** São os que `concursos.json` e as próprias páginas ligam entre si:

| artefato | claude.ai | tamanho publicado | depende do claude.ai para |
|---|---|---|---|
| Prioridades do edital | `Jjm6kekrZGBneHmJNvgUPN` | 529.051 bytes | nada: HTML estático com dados embutidos |
| Missões até a prova | `M5gJa9q3po9iCyLNzkFxdF` | 839.784 bytes | marcações: `window.claude.use('db')` e `use('user')`, coleção `marcas`, só o dono grava |
| Raio-X do Qconcursos | `Q4MYW9Fpk7eg4oKnv36H12` | página de 22.281 bytes + 2 JSON anexados | tudo: é do tipo "dashboard" (`window.dash`, d3 fornecido pelo tipo, dados em `/_blob/…`) |

"Missão 1 com o guia" (`WBpQ59cE1Ska5VFbZdYato`) fica de fora: a própria página se rotula
"Exemplo" e nenhum dos outros três aponta para ela.

**Fontes no vault** (`OneDrive - mtegovbr/00. vault/Estudo/cgu`, o mesmo `VAULT_PADRAO` de
`scripts/importar/index.mjs:29`):
- `scripts/montar_artifacts.py` monta `artifacts/_publicar/missoes-cgu-2026.html` e
  `prioridades-edital.html` a partir de `artifacts/missoes/{template,script}.html`,
  `plano-{cd,aud}.json` e `artifacts/prioridades/prioridades-edital.html`, mais
  `catalogo-questoes/qconcursos/links.json`. O cabeçalho do script diz que os HTML de
  `_publicar/` são gerados e não devem ser editados à mão.
- Conferido: os dois HTML de `_publicar/` (gerados em 2026-10-13 às 19:48) são iguais aos
  publicados. A única diferença é o esqueleto `<!doctype>…<body>` que o claude.ai acrescenta.
- **O Raio-X não tem fonte no vault.** A página (`files/index.html`) e os dois conjuntos de
  dados (`assuntos`, com 466 assuntos, e `subitens`, com 264) só existem no banco do artefato.
  As descrições deles dizem que foram montados de `contagem.csv`, `assuntos.json` e
  `links.json` do `catalogo-questoes/qconcursos`.

**No painel:**
- `src/lib/dados/concursos.json:11-12`: `prioridades` e `missoes` apontam para o claude.ai.
- `src/lib/dados/validar.ts:127-128` exige `https://` nesses dois campos, então caminho
  relativo é recusado hoje.
- `src/lib/componentes/CabecalhoPainel.svelte:25` troca a âncora (`#cd`/`#aud`) conforme a
  especialidade, e as páginas leem essa âncora para escolher o cargo.
- Service worker: tudo de `static/` fora de `/conteudo/` entra na casca, que o `install` exige
  por inteiro (`src/service-worker.ts:29-30`). Uma navegação offline cai na casca do app
  (`:59-63`), então uma página de artefato aberta offline mostraria o app, e não a página.
- Login: `src/lib/conta/regras.ts` lista as quatro chaves que sobem ao D1. A chave das
  marcações das Missões (`missoes-cgu-2026`, guardada no `localStorage`) não está entre elas.

## Decisões tomadas neste plano (em 2026-10-14)

1. **O vault continua sendo a fonte; o repositório guarda a saída gerada.** `npm run importar`
   passa a copiar os dois HTML de `artifacts/_publicar/` para `static/artefatos/`. É o mesmo
   caminho do conteúdo do feed, com o vault só lido. **Reabrir** se o vault deixar de ser
   onde os artefatos são editados.
2. **O Raio-X ganha fonte no vault.** A página e os dois JSON saem do claude.ai uma única vez
   e vão para `Estudo/cgu/artifacts/raiox/`. Isso é uma escrita no vault, mas é a única forma
   de o Raio-X não ficar sem fonte. **Reabrir** se você preferir que essa fonte fique no
   repositório.
3. **O Raio-X roda com um substituto mínimo de `window.dash`** (`data`, `onData`, `calc`,
   `colors`, `params`, `setParams` e `setLink`, que são as 7 funções que a página usa) e com o
   d3 v7 vendorizado. A página fica como está. Os atributos `data-source` passam a ser só
   marcação, sem o painel de fontes do tipo dashboard.
4. **As marcações das Missões passam a usar o login por nome.** `missoes-cgu-2026` entra em
   `CHAVES_SINCRONIZADAS`, e a página, servida na mesma origem, lê o nome e usa
   `/api/progresso`. As marcações que já estão no banco do claude.ai (coleção `marcas`) são
   migradas uma vez para o seu nome. Sem login, a página volta ao `localStorage`, como já
   fazia antes de ter banco.
5. **Os links entre as páginas e os do painel passam a ser relativos** (`/conteudo/artefatos/…`). Os
   artefatos do claude.ai continuam no ar, mas deixam de ser atualizados. **Reabrir** (apagar
   os três) quando você confirmar que não usa mais os links antigos.
6. **Offline:** as páginas vão para `static/conteudo/artefatos/`, e não para `static/artefatos/`,
   para entrar no pré-cache de conteúdo (fase 2 do SW) sem pesar a casca. O SW passa a servir
   do cache uma navegação para `/conteudo/artefatos/*`. As URLs públicas ficam
   `/conteudo/artefatos/prioridades.html`, `missoes.html` e `raiox.html`.

## Estado final desejado

- Os botões do cabeçalho do painel abrem `/conteudo/artefatos/prioridades.html#cd` e
  `missoes.html#cd` (ou `#aud`). As páginas ligam umas às outras sem passar pelo claude.ai.
- `/conteudo/artefatos/raiox.html` mostra os mesmos números do Raio-X publicado.
- Logada, uma marcação nas Missões aparece no outro aparelho; deslogada, fica no navegador.
- As três páginas abrem offline depois da primeira visita ao app.
- Os três HTML e os dois JSON do Raio-X estão no git, e `npm run importar` os regenera a
  partir do vault.

## O que NÃO vamos fazer

- Reescrever as páginas em Svelte ou trazer o gerador Python (`montar_artifacts.py`,
  `plano.py`, `gerar_links_qconcursos.py`) para o repositório.
- Recontar as questões do Qconcursos ou mudar os dados.
- Apagar os artefatos do claude.ai (decisão 5).
- Trazer "Missão 1 com o guia".
- Vendorizar as fontes do Google: offline, as páginas usam as fontes de reserva que já declaram.

## Fase 1: Prioridades e Missões servidas pelo painel, sem as marcações

### Mudanças
- `scripts/importar/artefatos.mjs` (novo): lê `artifacts/_publicar/{prioridades-edital,missoes-cgu-2026}.html`
  e grava `static/conteudo/artefatos/{prioridades,missoes}.html`. Ao gravar, envolve a página
  no esqueleto `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" …>`
  e troca os links `https://claude.ai/artifact/<id>` pelo caminho local (mantendo a âncora).
  Id desconhecido é erro fatal. Chamado de `scripts/importar/index.mjs`, logo depois do plano.
- `src/lib/dados/validar.ts`: `prioridades` e `missoes` aceitam `https://…` ou um caminho
  iniciado por `/conteudo/artefatos/`.
- `src/lib/dados/concursos.json`, `src/lib/dados/LEIA-ME.md`: caminhos locais.
- `src/service-worker.ts`: uma navegação para `/conteudo/artefatos/` é servida da rede e, sem
  rede, do cache de conteúdo (e não mais da casca do app).

### Critérios de aceite
#### Automáticos
- [x] `npm test`: o teste do importador cobre a troca dos links (`#cd` mantido), o id
      desconhecido como erro e o esqueleto; `tests/unit/dados.test.ts` cobre o caminho local
      aceito e o `http://` recusado.
- [x] `npm run check` sem erro.
- [x] `npx playwright test`: `tests/e2e/artefatos.spec.ts` abre as duas páginas pelo painel, segue
      Prioridades → Missões, confere que nenhum link aponta para `claude.ai` e abre
      `missoes.html` offline depois de uma visita online.
#### Manuais
- [ ] No celular, abrir Prioridades e Missões pelos botões do cabeçalho e trocar de cargo.

### Nota de execução (2026-10-14)

- O importador ganhou `scripts/importar/artefatos.mjs`, e `index.mjs` passou a criar subpastas na saída.
  O `npm run importar` real mudou só `static/conteudo/artefatos/`; o resto do conteúdo saiu idêntico.
- O link do Raio-X segue para o claude.ai até a fase 2: o importador só troca os links das
  páginas que ele gera. Os `href` montados por JavaScript nas duas páginas também foram
  trocados, porque a URL aparece literal no script.
- O teste unitário ficou em `tests/unit/importar/artefatos.test.ts`. O `svelte-check` pediu
  `dirname` na declaração mínima `tests/unit/importar/node-minimo.d.ts`.
- Resultado: `npm test` com 334, `npm run check` sem erro e `npx playwright test` com 244.

## Fase 2: Raio-X fora do tipo dashboard

### Mudanças
- Extrair uma vez, com a ferramenta `ArtifactData` e a leitura de anexos (`Artifact read path`),
  a página e os dois JSON para `vault/.../artifacts/raiox/{index.html,assuntos.json,subitens.json}`.
  A extração fica anotada em `artifacts/raiox/LEIA-ME.md` no vault.
- `static/conteudo/artefatos/vendor/d3-7.9.0.min.js` (vendorizado, com licença ISC ao lado).
- `static/conteudo/artefatos/dash-local.js` (novo): o substituto da decisão 3. `data(id)`
  devolve `{status, data, columns}` a partir de `fetch('raiox-<id>.json')`; `onData` roda de
  novo quando os dados chegam e quando a largura muda; `calc` guarda e calcula na leitura;
  `colors` traz as 8 cores com tokens claro e escuro; `params` e `setParams` usam a query
  string.
- `scripts/importar/artefatos.mjs`: monta `raiox.html` (esqueleto + tokens `--color-*` e
  fontes que a página espera do tipo + `<div id="dash-root">` + d3 + `dash-local.js` + a
  página) e copia os JSON como `raiox-assuntos.json` e `raiox-subitens.json`.

### Critérios de aceite
#### Automáticos
- [x] `npm test`: `dash-local.js` testado com dados falsos (`data` passando de loading a ok,
      `calc` com entradas, `params` ida e volta).
- [x] `npx playwright test`: `raiox.html` abre sem erro no console, mostra os 264 subitens e
      o total que aparece bate com a soma de `raiox-subitens.json`.
#### Manuais
- [ ] Comparar lado a lado com o Raio-X do claude.ai: os mesmos números e gráficos.

### Nota de execução (2026-10-14)

- **O d3 e o `dash-local.js` moram em `scripts/importar/raiox/`, não em `static/conteudo/artefatos/`.**
  O importador recria `static/conteudo/` inteiro a cada execução e apagaria o que fosse posto
  ali à mão; por isso ele copia os dois para a saída. O d3 7.9.0 saiu do `npm pack`, com a
  integridade conferida contra o `dist.integrity` do registro (`sha512-e1U46jVP…`).
- **Fonte do Raio-X no vault:** `artifacts/raiox/{index.html,subitens.json,assuntos.json,LEIA-ME.md}`.
  Os anexos foram baixados com os sha256 conferidos (`9b963d3c…` e `3241c88e…`). Não há script
  que regenere os dois JSON, e isso ficou dito no LEIA-ME de lá.
- **Tokens:** a página usa uns 25 tokens de CSS do tipo dashboard (`--cds-*`, `--color-*`,
  `--font-anthropic-*`). `montarRaiox` os define com a paleta e as fontes das Missões, claro e
  escuro, e as 8 `dash.colors` viram `var(--dash-cor-N)`.
- **Além do plano:** uma barra no topo liga às Prioridades e às Missões (a página original
  não tinha volta), e a âncora `#cd`/`#aud` vale como cargo, como nas outras duas.
- **Testes:** os unitários ficaram em `tests/unit/importar/raiox.test.ts`, e não em um arquivo
  à parte do `dash-local.js`. O `dash-local.js` é carregado com `new Function(window, fetch)`.
- **Visual:** capturas em 1280 px, claro e escuro, conferidas.
- Resultado: `npm test` com 345, `npm run check` sem erro e `npx playwright test` com 246.
  Nenhuma das três páginas tem mais link para `claude.ai/artifact`.

## Fase 3: marcações das Missões no login por nome

### Mudanças
- `src/lib/conta/regras.ts`: `missoes-cgu-2026` em `CHAVES_SINCRONIZADAS`, no formato que a
  página já grava (`{ "cd~2026-10-13~0": true, … }`), com o teste de regras atualizado.
- `vault/.../artifacts/missoes/script.html`: o bloco `window.claude.use` (`script.html`, fim do
  arquivo) é trocado por: se `localStorage['painel-concurso:usuario:v1']` existir, GET e PUT em
  `/api/progresso/<nome>/missoes-cgu-2026` com a mesma regra de carimbo (vale o mais novo) e o
  mesmo aviso "Salvo na sua conta"; sem nome, "Marcações salvas só neste navegador. Entre no
  painel para levá-las a outro aparelho". Depois, `python scripts/montar_artifacts.py` no vault
  e `npm run importar` aqui.
- Migração: ler a coleção `marcas` do artefato com `ArtifactData`, montar o JSON
  `{chave: true}` e gravar por PUT no seu nome (o nome fica perguntado na hora da execução).

### Critérios de aceite
#### Automáticos
- [x] `npm test` e `npm run check`.
- [x] `npx playwright test`: com `/api` simulada, marcar um bloco logado sobe para
      `missoes-cgu-2026`; deslogado, nada vai ao servidor.
- [x] `python scripts/montar_artifacts.py --check` no vault sem erro.
#### Manuais
- [ ] Depois da migração, as marcações que você já tinha aparecem nas Missões do painel.
- [ ] Marcar no celular e ver no PC.

### Nota de execução (2026-10-14)

- **Migração: nada a migrar.** A coleção `marcas` do artefato das Missões no claude.ai foi lida
  com `ArtifactData` e está vazia: nenhuma marcação foi feita com o banco de lá. O item manual
  "as marcações que você já tinha aparecem" vale só para as que estiverem no `localStorage` do
  domínio do claude.ai, que não atravessam (ver "Migração de dados").
- **No vault:** `artifacts/missoes/script.html` trocou o bloco `window.claude.use` pela conta do
  painel, com as mesmas chaves (`painel-concurso:usuario:v1`, `painel-concurso:sinc:v1`) e a
  mesma regra de carimbo de `src/lib/conta/`. Saiu também o `canWrite` (só o dono marcava),
  que não faz sentido sem o banco do claude.ai. O `python scripts/montar_artifacts.py --check`
  deu 264 links iguais à referência nas duas páginas, e os `_publicar/` foram regenerados.
- **No painel:** `CHAVE_MISSOES` foi para `src/lib/conta/regras.ts`. O teste confere que é a
  mesma `KEY` que a página grava. Com isso, o app também traz e sobe essa chave ao abrir, e o
  "Sair" a apaga.
- Resultado: `npm test` com 346, `npm run check` sem erro e `npx playwright test` com 250.

## Estratégia de teste
- O importador é testado como os outros (`tests/unit/importar/`), com um vault falso em pasta
  temporária.
- O `dash-local.js` é testado isolado no vitest; a página inteira, no Playwright.
- A comparação dos números do Raio-X com o original é manual, uma vez.

## Migração de dados
- Marcações do claude.ai: migradas uma vez na fase 3.
- Marcações só no `localStorage` do domínio `claude.ai`/`claudeusercontent` não atravessam
  para a origem do painel. Quem marcou sem banco perde essas marcações. Era o modo antigo; o
  artefato tem banco desde a v6.

## Referências
- Vault: `scripts/montar_artifacts.py`, `artifacts/`, `catalogo-questoes/qconcursos/LEIA-ME.md`
- Painel: `src/lib/dados/concursos.json:11-12`, `src/lib/dados/validar.ts:127-128`,
  `src/lib/componentes/CabecalhoPainel.svelte:25`, `src/service-worker.ts:29-63`,
  `src/lib/conta/regras.ts`
- Login: `planos/2026-10-13-login-por-nome-backend-cloudflare.md`

## Correção depois do teste manual (2026-10-14)

No teste, você viu que as Missões ainda deixavam marcar sem login. A decisão 4 previa voltar
ao `localStorage` nesse caso, mas a regra passa a ser outra: **sem login, as Missões ficam só
para leitura**. As bolhas aparecem desabilitadas, o clique é ignorado mesmo que chegue ao
`change`, e o aviso "Para marcar missões, entre com seu nome no painel" leva a `/entrar`. As
marcações que já estavam no navegador continuam aparecendo. Mudança em
`artifacts/missoes/script.html` (vault), com `_publicar/` regenerado e reimportado. O e2e
"sem login" agora confere as bolhas desabilitadas, que nada é gravado e que nada vai ao servidor.

## Ajuste: popup de login ao marcar (2026-10-14)

Pedido seu: em vez de bolha desabilitada, tocar numa bolha sem login abre um popup "Entre
para marcar", com o mesmo login por nome da tela `/entrar` (normalização e regra de
`src/lib/conta/regras.ts`, repetidas no script da página). Ao entrar, a página guarda o nome,
apaga os carimbos de outro usuário (igual ao `entrar` do painel), recarrega e aplica a
marcação que pediu o login, depois de trazer a conta, para que ela seja a mais nova. "Agora
não" fecha o popup sem marcar nada. Sem API (GitHub Pages ou sem rede), o popup avisa e não
entra. Mudanças em `artifacts/missoes/{script,template}.html` (vault), com o `--check` passando
e `_publicar/` regenerado. Os e2e cobrem cancelar, entrar e marcar, e a falta de API.
`npm test` com 346, `npx playwright test` com 252.

## Atualização de 2026-10-15: destaque do dia clicado na régua das Missões

Clicar num quadrado da régua abria "Os 61 dias" e rolava a página até o dia, mas o único quadrado destacado continuava sendo o de hoje.

- **Correção na fonte, no vault:** em `artifacts/missoes/script.html`, o dia clicado fica em `diaSel`. O nome não é `sel`, porque `renderList` já tem uma variável local com esse nome. O quadrado ganha a classe `sel` e `aria-current="true"`, e o card do dia ganha `is-sel`. O clique só troca as classes, sem refazer a régua, e com isso o foco do teclado continua no quadrado. Trocar de cargo limpa a escolha.
- **Estilo** (`template.html`):
  - o quadrado escolhido ganha contorno de 3 px na cor de destaque e fica 25% mais alto;
  - o card do dia ganha borda na cor do texto;
  - a régua ganhou 6 px de respiro em cima e embaixo, porque o `overflow:hidden` cortava os contornos.
- **Publicação:** `python scripts/montar_artifacts.py` no vault, com `--check` dando 264 links iguais nas duas páginas, e depois `npm run importar`. Do que o importador regerou, só `missoes.html` entrou no commit; os outros artefatos voltaram com `git restore`.
- **Backup** do `script.html`, do `template.html` e do `_publicar/missoes-cgu-2026.html` de antes, no scratchpad da sessão, em `backup/missoes-*.2026-10-15`.
- **Teste:** um teste novo em `tests/e2e/missao.spec.ts` cobre o destaque do quadrado e do card, que só um quadrado fica destacado e o foco depois do segundo clique. O `npx playwright test` passou com 240.

## Atualização de 2026-10-15: a régua das Missões acompanha a visão

Os botões "Hoje" e "Esta semana" trocavam a lista, mas a régua continuava igual, inclusive com o destaque de um dia clicado antes.

- **No vault** (`artifacts/missoes/script.html`):
  - `naVista(p, i)` diz se o dia está na visão atual. A lista e a régua usam essa mesma regra.
  - `marcarRegua()` liga e desliga as classes `fora` e `sel` nos botões que já existem, sem refazê-los, e roda a cada `setView`.
  - "Hoje" e "Esta semana" tiram a escolha da régua; "Os 61 dias" a mantém.
- **Estilo** (`template.html`): quadrado fora da visão fica com `opacity:.3`.
- **Publicação:** do mesmo jeito da atualização anterior (`montar_artifacts.py`, `--check` com 264 links, `npm run importar` e só `missoes.html` no commit). Backup do vault em `backup/missoes-*.2026-10-15b`.
- **Teste:** `tests/e2e/missao.spec.ts` confere a régua nas três visões: 1, 6 e 61 quadrados acesos, para 14/10. O `npx playwright test` passou com 241.

## Atualização de 2026-10-17: lembrete do subitem aberto no Qconcursos

Pedido dela: ao voltar do Qconcursos, saber qual tarefa estava fazendo. O painel ganhou isso em `3839a82`, e a página das Missões passou a fazer o mesmo.

- **Mesma chave do painel:** `painel-concurso:missoes:em-andamento:v1`, com `{ cargo, data, bloco, cid }`, no `localStorage` e sem subir para a conta. Ela abre o link numa página e vê o destaque na outra.
- **No vault** (`artifacts/missoes/script.html`):
  - clicar em qualquer `a.qc` do subitem (mais cobrados, todos ou erros) grava o lembrete. O `li` passou a ter `data-d`, `data-j` e `data-c` para isso;
  - o subitem fica com a classe `em-andamento` e mostra "Você parou aqui" e os botões "Terminei, marcar" e "Dispensar";
  - "Terminei, marcar" dispara o `change` da caixa do subitem, ou da bolha do bloco, e assim passa pelo mesmo pedido de login;
  - o lembrete se apaga quando o bloco ou o subitem já está marcado (`emAndamentoFeito`, checado no `renderList` e no `refletir`);
  - ao voltar para a aba (`visibilitychange`), a página relê a chave e rola até o subitem.
- **Estilo** (`template.html`): fundo de marca-texto (`#f5c400` a 26% sobre `--sheet`, para valer nos dois temas), com borda na cor do tipo e botões de 44 px.
- **Painel:** `MissaoDeHoje` relê a chave a cada montagem e ao voltar para a aba, porque a página das Missões, no iframe de `/artefato/missoes`, grava nela.
- **Publicação:** `montar_artifacts.py --check` com 264 links iguais nas duas páginas, depois `npm run importar`. Só `missoes.html` entrou; os outros artefatos voltaram com `git restore`. Backup do vault em `backup/missoes-*.2026-10-17`, no scratchpad da sessão.
- **Teste:** um teste novo em `tests/e2e/missao.spec.ts` cobre o destaque na página, o mesmo subitem destacado no painel, a marcação pelo lembrete e que um subitem já marcado não volta a ficar destacado. `npm test` com 303, `npx playwright test` com 244.
