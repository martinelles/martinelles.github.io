# Uma missão só: o painel passa a usar o plano das Missões

Id: `2026-10-14-missao-unica`. O repositório não tem `ESTADO.csv`, então este plano fica sem rastro
fora do próprio arquivo, como os outros dois de `planos/`.

## Visão geral

Hoje a "Missão de hoje" do `/painel` e a página das Missões mostram planos diferentes. O painel
passa a mostrar os blocos do dia do plano de 61 dias das Missões, marcados com as mesmas bolhas,
na mesma chave e na mesma conta. O motor antigo sai: fila do `ESTUDO.csv`, cronômetro, tela
`/tarefa`, questões feitas e certas, e CSV.

## Estado atual (conferido em 2026-10-14)

**Dois planos.**
- O painel lê `static/conteudo/plano.json` (ou `plano-auditoria.json`, conforme a especialidade),
  gerado por `scripts/importar/plano.mjs` a partir do `ESTUDO.csv`. São 350 tarefas de Leitura e
  Questões, de 09/10 a 12/12, numa fila por prioridade. Captura de 14/10: 8 tarefas, todas de
  Aprendizado de Máquina.
- A página das Missões lê `artifacts/missoes/plano-{cd,aud}.json` do vault, gerados por
  `artifacts/missoes/plano.py`. São 61 dias, de 13/10 a 12/12, com 180 min por dia (90 min em
  um dos dias). Os blocos são `novo`, `rev`, `disc`, `sim` e `q`; em Ciência de Dados há 133,
  60, 13, 4 e 11 de cada.

**Ids.** Os 169 `cid` do plano de Ciência de Dados existem todos no `plano.json` (o mesmo id do
`ESTUDO.csv`, que é o `tp` das questões do feed). Na Auditoria, 89 dos 177 são `AUD-E<n>-<x.y>`
(P3 de Auditoria) e não existem no `plano-auditoria.json`. A conferência foi feita por script
em 14/10, cruzando os `cid` dos dois `plano-*.json` com os `topicoId` do app.

**O motor antigo** (13 arquivos em `src/` importam `$lib/plano` ou `componentes/plano`):
- `src/routes/painel/+page.svelte:49-74`: `garantirRegistro`, `usarPlano`, `usarMissao`,
  `MissaoDoDia` e `ResumoPlano` (com "Exportar progresso").
- `src/routes/+page.svelte:20-37,158`: `ChamadaMissao` no feed, com "Iniciar"/"Continuar" abrindo
  o cronômetro.
- `src/routes/tarefa/[id]/+page.svelte` (488 linhas): cronômetro, questões feitas e certas, e o
  atalho `/?topico=<id>&tipo=questao` (`:68`), que é o atalho para o feed do tópico que fica.
- `src/lib/plano/*.ts` e `src/lib/componentes/plano/*` (cerca de 1.900 linhas, contadas com
  `wc -l` em 14/10).
- `src/lib/conta/regras.ts`: a chave `painel-concurso:plano:v1` (o registro do cronômetro) está
  entre as que sobem para a conta.

**Marcações das Missões.** A chave é `missoes-cgu-2026`, com o formato
`{ "<cargo>~<AAAA-MM-DD>~<índice do bloco>": true }`. Ela já está em `CHAVES_SINCRONIZADAS`, e a
página só deixa marcar com login (o popup de 14/10).

**Testes que dependem do motor antigo** (listados por grep de `Iniciar estudos|/tarefa/|Missão de
hoje|Exportar progresso|plano.json` em `tests/e2e`):
- `plano.spec.ts`: os 12 testes.
- `feed-topico.spec.ts`: 7 testes, que entram pela `/tarefa`.
- `responsivo.spec.ts`: as telas `/painel (missão do dia)` e as duas `/tarefa/…`.
- Unitários: os 8 arquivos de `tests/unit/plano/`.

## Decisões (14/10)

1. **Recursos que ficam** (escolha sua): a chamada da missão no feed e o atalho para o feed do
   tópico. **Recursos que saem:** cronômetro, tela `/tarefa`, questões feitas e certas, e
   "Exportar progresso" (CSV). **Reabrir** se você sentir falta de medir o tempo de estudo.
2. **O plano de 61 dias vem do vault, pelo importador**, como já acontece com a página.
   `npm run importar` copia `plano-{cd,aud}.json` para `static/conteudo/missoes-{cd,aud}.json`, e
   o vault continua sendo a fonte. Some o `plano.json` gerado do `ESTUDO.csv`.
3. **O cargo vem da especialidade dos Ajustes.** A âncora já existe: `foco.especialidade.ancora`
   vale `cd` ou `aud` (`src/routes/painel/+page.svelte:65`).
4. **Marcar exige login, igual à página.** Sem login, tocar numa bolha leva a `/entrar` e deixa a
   marcação pendente, na mesma chave de sessão da página (`missoes-cgu-2026:pendente`). Depois de
   entrar, o painel aplica a pendência quando a sincronização inicial termina.
5. **O card do dia no painel mostra o essencial:** os blocos, com tipo, título e minutos, cada
   subitem (código, texto e minutos) e a instrução do bloco. Os links do Qconcursos ficam só na
   página das Missões, e um link "Abrir nas Missões" leva ao dia lá.
6. **O registro antigo é aposentado.** `painel-concurso:plano:v1` sai de `CHAVES_SINCRONIZADAS`.
   O que já está no D1 e no `localStorage` fica onde está, sem ser lido (nada é apagado).

## Estado final desejado

- `/painel`: "Missão de hoje" com os blocos do dia (de 13/10 a 12/12) do cargo da especialidade.
  Cada bolha marca ou desmarca o bloco na chave `missoes-cgu-2026`, e a mesma marcação aparece na
  página das Missões, no mesmo aparelho e, logada, em outro. Antes de 13/10 aparece "começa em
  13/10"; depois de 12/12, "plano encerrado".
- "Seu plano": dias cumpridos (de 61), blocos feitos (do total) e horas dos blocos feitos (do
  total), com um link para os 61 dias nas Missões.
- Feed: a chamada mostra "Missão de hoje · N de M blocos" e leva ao painel, ou "Missão cumprida".
- Subitem com questões no feed: "N questões deste tópico ↗" para `/?topico=<cid>&tipo=questao`.
- `/tarefa/*` não existe mais e cai no 404 do app.

## O que NÃO vamos fazer

- Mudar o plano de 61 dias, o `plano.py` ou a página das Missões.
- Trazer os links do Qconcursos para o painel (decisão 5).
- Migrar o registro do cronômetro antigo para marcações: não há equivalência entre "tarefa de
  Leitura concluída" e "bloco do dia cumprido".
- Mapear os ids `AUD-E*` para tópicos do feed. As questões do feed só têm `tp` com ids do
  `ESTUDO.csv`, então esses 89 subitens ficam sem atalho.
- Apagar dados antigos do D1.

## Fase 1: dados e módulo `missoes`, sem mudar a tela

### Mudanças
- `scripts/importar/missoes.mjs` (novo), chamado em `index.mjs` no lugar do plano: lê
  `artifacts/missoes/plano-{cd,aud}.json`, valida (61 dias em ordem, blocos com `tipo` entre
  `novo|rev|disc|sim|q`, `min` inteiro, itens com `cid`, `cod` e `texto`) e grava
  `missoes-{cd,aud}.json` com `{ gerado, plan, cortes }`. Faltando arquivo: aviso. Formato
  inválido: erro fatal, como no plano antigo.
- `src/lib/missoes/tipos.ts`, `carregar.ts` (fetch com validação, como `src/lib/plano/carregar.ts`)
  e `calculos.ts` com funções puras: `diaDeHoje(plano, hoje)` →
  `{ fase: 'antes'|'durante'|'depois', dia? }`, `chaveBloco(cargo, data, i)`,
  `resumo(plano, marcas, cargo, hoje)` → dias cumpridos, blocos feitos e horas.
- `src/lib/missoes/marcas.svelte.ts`: store da chave `missoes-cgu-2026` no `armazenamentoAtual()`
  (com login, sobe pelo `Storage` sincronizado da conta). Lê o formato antigo (`cd#…`) como a
  página faz e grava só `true`.
- `src/lib/conta/regras.ts`: sai `painel-concurso:plano:v1` (decisão 6), e o teste de regras é
  ajustado.

### Critérios de aceite
#### Automáticos
- [x] `npm test`: testes novos em `tests/unit/missoes/`: o importador com vault falso (ok,
      ausente, inválido), `diaDeHoje` nas três fases e na virada do dia, `resumo` com dia
      parcial, dia cumprido e o dia de 90 min, e o store lendo o formato antigo.
- [x] `npm run check` sem erro.
- [x] `npm run importar` real: o relatório lista `missoes-cd.json` e `missoes-aud.json`.

### Nota de execução (2026-10-14)

- **O `plano.json` e a chave `painel-concurso:plano:v1` continuam até a Fase 3.** Nesta fase a
  tela ainda usa o motor antigo, e tirá-los aqui quebraria o painel e a sincronização do
  registro entre as fases. O importador ganhou `missoes.mjs` ao lado do plano antigo, sem
  substituí-lo.
- **`min` aceita 0.** Os planos reais têm 4 blocos `rev` "encaixe 15 min" com `min: 0` nos dias
  de simulado (14/11, 28/11, 5/12 e 6/12, nos dois cargos); os 15 min já estão contados no
  simulado. A validação passou a pedir inteiro maior ou igual a 0.
- **Testes:** um arquivo só, `tests/unit/missoes/missoes.test.ts` (17 testes), que também confere
  os dois `missoes-*.json` reais: 61 dias, começando em 13/10.
- `npm test` com 363 e `npm run check` sem erro.

## Fase 2: o painel com a missão das Missões

### Mudanças
- `src/lib/componentes/missoes/MissaoDeHoje.svelte` (novo), no lugar de `MissaoDoDia`: o card
  do dia com bolhas iguais às da página (letra do tipo, cor por tipo nos tokens do tema do
  painel), subitens, atalho do tópico (contagem por `tp` no índice, como
  `tarefa/[id]/+page.svelte` faz hoje) e "Abrir nas Missões" (`/conteudo/artefatos/missoes.html#<cargo>`).
- `src/lib/componentes/missoes/ResumoMissoes.svelte` (novo), no lugar de `ResumoPlano`.
- `src/routes/painel/+page.svelte`: usa os dois componentes, carrega
  `missoes-<ancora>.json` e troca de plano quando a especialidade muda.
- Login pendente (decisão 4): sem usuário, a bolha grava a pendência e vai para `/entrar`.
  `src/lib/conta/sessao.svelte.ts` ganha `sincronizacaoInicial()`, a promessa do
  `sincronizarAoAbrir`, e o painel aplica a pendência depois dela.

### Critérios de aceite
#### Automáticos
- [x] `npx playwright test`: `tests/e2e/missao.spec.ts` (novo). Cobre:
  - o dia de hoje mostra os mesmos blocos e subitens que a página das Missões no mesmo dia;
  - marcar no painel aparece marcado na página, e o contrário também;
  - sem login, a bolha leva a `/entrar` e, depois de entrar, o bloco está marcado;
  - antes de 13/10 e depois de 12/12;
  - Auditoria troca o plano;
  - o atalho do tópico abre o feed filtrado.
- [x] `responsivo.spec.ts`: a tela `/painel (missão do dia)` volta a passar nos 3 temas, a 360 e
      1440 px, com alvos de 44 px.
- [x] `npm test`, `npm run check`.
#### Manuais
- [ ] No celular, logada: marcar um bloco no painel e vê-lo marcado nas Missões no PC.

## Fase 3: feed e remoção do motor antigo

### Mudanças
- `ChamadaMissao.svelte` reescrita sobre o `resumo` do dia, sem cronômetro, e sem os botões
  "Iniciar" e "Continuar".
- Removidos: `src/routes/tarefa/`, `src/lib/plano/`, `src/lib/componentes/plano/` (o que sobrar
  sem uso), `scripts/importar/plano.mjs`, a geração de `plano.json` e `plano-auditoria.json`, e a
  dependência de `Especialidade.plano` em `foco.svelte.ts`.
- Testes: saem `plano.spec.ts` e `tests/unit/plano/`. Os 7 de `feed-topico.spec.ts` passam a
  entrar pelo atalho do painel em vez da `/tarefa`. Em `responsivo.spec.ts` saem as telas
  `/tarefa/…`.

### Critérios de aceite
#### Automáticos
- [x] `npm test`, `npm run check` e `npx playwright test` sem falha.
- [x] `grep -r "\$lib/plano\|componentes/plano" src` sem resultado.
#### Manuais
- [ ] Abrir o feed: a chamada mostra o progresso de hoje e leva ao painel.

## Estratégia de teste
- **Funções puras** (`diaDeHoje`, `resumo`, validação do importador) no vitest, com o relógio
  passado por parâmetro, como no motor antigo.
- **A igualdade com a página** é testada lendo os dois na mesma data:
  `static/conteudo/missoes-cd.json` e o DOM da página `missoes.html`.

## Migração de dados
- **Marcações feitas na página das Missões:** aparecem no painel sem migração, porque é a mesma
  chave.
- **Registro do cronômetro antigo:** fica no aparelho e no D1, sem uso (decisão 6).

## Referências
- Planos anteriores: `planos/2026-10-14-artefatos-no-git.md` (página das Missões no painel),
  `planos/2026-10-13-login-por-nome-backend-cloudflare.md` (conta).
- Vault: `artifacts/missoes/plano.py`, `artifacts/missoes/plano-{cd,aud}.json`.
- Painel: `src/routes/painel/+page.svelte:49-74`, `src/routes/+page.svelte:20-37`,
  `src/routes/tarefa/[id]/+page.svelte:68`, `src/lib/conta/regras.ts`.

## Nota de execução das fases 2 e 3 (2026-10-14)

- **As fases 2 e 3 foram feitas juntas.** Na Fase 2, o painel perdeu o botão "Iniciar estudos",
  de que dependiam os testes antigos (`plano.spec.ts` e as telas `/tarefa` do
  `responsivo.spec.ts`). Com isso a suíte não ficava verde entre as fases, então a remoção da
  Fase 3 veio logo em seguida, e a verificação manual das duas fica para o fim.
- **`usarPlanoMissoes()`** (`src/lib/missoes/estado.svelte.ts`) carrega o plano do cargo para o
  painel e para o feed, no lugar do `usarPlano` antigo.
- **Componentes novos** em `src/lib/componentes/missoes/`: `MissaoDeHoje`, `ResumoMissoes` e
  `ChamadaMissoes`. A chamada do feed tem "Abrir", e não "Iniciar", porque não há mais cronômetro.
  As bolhas são um checkbox transparente de 44 px sobre o círculo, como no seletor de tema, para
  passar no teste de alvo de toque.
- **`sincronizacaoInicial()`** foi para `src/lib/conta/sessao.svelte.ts`. O painel aplica a
  marcação pendente do login depois dela.
- **Removidos:** `src/routes/tarefa/`, `src/lib/plano/`, `src/lib/componentes/plano/`,
  `scripts/importar/plano.mjs`, `tests/e2e/plano.spec.ts`, `tests/unit/plano/`,
  `tests/unit/importar/plano.test.ts` e `fixtures/plano`. Também saíram `Especialidade.plano`
  (a âncora virou `'cd' | 'aud'`) e a chave `painel-concurso:plano:v1` da conta. O
  `npm run importar` real já não gera `plano.json` nem `plano-auditoria.json`.
- **`feed-topico.spec.ts`** agora entra pelo atalho do subitem no painel, no dia em que o
  subitem está na missão. Saiu o teste de "tarefa de Leitura", que não tem equivalente.
- **Em `missao.spec.ts`** entraram os dois testes da chamada no feed que estavam no
  `plano.spec.ts` (acima dos stories em 360 px; cumprida e fora da janela).
- **Visual:** uma captura do painel em 14/10 mostrou um conflito da classe `.feito` (o resumo do
  dia contra o bloco marcado), corrigido.
- Resultado: `npm test` com 280, `npm run check` sem erro, `npx playwright test` com 222, e
  `grep -r "lib/plano|componentes/plano" src` sem resultado.

## Atualização de 2026-10-15: os textos das Missões não citam mais o ESTUDO.csv

O app funciona sem o `ESTUDO.csv`, mas o plano mandava "lançar" desempenho nele, e a página citava o arquivo como origem dos códigos e como "o registro que conta".

- **No vault**, com backup em `backup/missoes-*.2026-10-15d`:
  - `artifacts/missoes/plano.py`:
    - as 49 revisões perderam "Lance no ESTUDO.csv.";
    - os três simulados agora dizem "corrija e anote os tópicos em que errou";
    - os dois blocos "taxa abaixo de 70%" agora dizem "nas suas questões";
    - saiu a troca de texto que só valia para Auditoria. Ela gerava "lance … por id por id" nos simulados.
  - `script.html`: as apresentações e o rodapé não citam mais o CSV.
  - `template.html`: em "Fora do plano", saiu a menção ao CSV.
- **Regeneração:** `plano.py` rodou de novo para `cd` e `aud`. Comparados aos backups, os dois planos têm a mesma estrutura (dias, blocos, minutos e itens); mudaram só `det` e `titulo`. Depois rodaram `montar_artifacts.py` (264 links iguais) e `npm run importar`.
- **O `plano.py` ainda lê o `ESTUDO.csv`** para dar os ids dos tópicos (`EPA-01` etc.). É só entrada da geração; nenhum texto do app o cita. Os comentários em `src/lib/*/tipos.ts` que explicam a origem dos ids ficam.
- **Verificação:** `npm test` passou com 300 e `npx playwright test` com 242.
