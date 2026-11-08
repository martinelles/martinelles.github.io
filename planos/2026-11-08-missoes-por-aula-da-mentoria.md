# Missões por aula da mentoria: plano de implementação

Id: `2026-11-08-missoes-por-aula-da-mentoria` (datado, sem rastro fora do arquivo). Depende do
catálogo de aulas (`planos/2026-11-08-catalogo-de-aulas-da-mentoria.md`) e convive com a saída
do Qconcursos (`planos/2026-11-08-qconcursos-fora-do-painel.md`, idealmente já executado).

## Visão geral

A partir de 09/11 até a prova (13/12), a unidade de estudo das Missões passa a ser a aula da
mentoria: o plano diário é regerado com as aulas no lugar dos subitens avulsos, priorizadas pela
prioridade dos subitens que cada aula cobre (a divisão por aulas da mentoria tem precedência);
os subitens continuam como referência dentro da aula. Os dias 13/10 a 08/11 e todas as marcações
feitas ficam como estão.

## Estado atual (conferido)

- O plano de 61 dias (13/10 a 12/12, prova 13/12) é gerado no vault por
  `artifacts/missoes/plano.py`: subitens do edital com prioridade alta → média → baixa
  (`stream`), custo por (prova, prioridade) (`COST`: P3 70/30/15, P2 35/18, P1 30/12; E4 de
  Auditoria 110), round-robin entre disciplinas (`rr`), corte das baixas de P1/P2 (`CUT`),
  simulados fixos em 14/11, 28/11, 5 e 6/12 e discursivas por cenário. Saída:
  `plano-<cargo>.json` (175 itens no `cd`, 183 no `aud`), consumido pelo importador
  ([missoes.mjs:121+](../scripts/importar/missoes.mjs)) e por `montar_artifacts.py` (página das
  Missões).
- Hoje, 08/11, é o dia 27; restam 34 dias de plano (09/11 a 12/12).
- O item do plano é `{ cid, cod, prova, prio, texto, min, fim }` (ex. no
  `static/conteudo/missoes-cd.json`), cid atrelado ao subitem (linha do `ESTUDO.csv` do vault ou
  `AUD-<disc>-<n>`); `validarMissoes` exige `cid`, `cod` e `texto`
  ([missoes.mjs:96-115](../scripts/importar/missoes.mjs)).
- A Missão de hoje mostra o item com atalhos por subitem (aula da mentoria, mapa mental,
  questões do tópico no feed) em [MissaoDeHoje.svelte:161-244](../src/lib/componentes/missoes/MissaoDeHoje.svelte);
  as marcações e o progresso são por (cargo, data, bloco, cid)
  (`src/lib/missoes/calculos.ts`, `marcas.svelte.ts`).
- O catálogo de aulas (pós-plano do catálogo) dá `id`, `titulo`, `url`, `tec` e `subitens` por
  aula em `src/lib/dados/mentoria.json`.

## Estado final desejado

- `plano-<cargo>.json` novo: dias 13/10 a 08/11 idênticos ao atual; dias 09/11 a 12/12 com
  blocos cujos itens são aulas da mentoria, na priorização alta → média → baixa (prioridade da
  aula = maior prioridade entre os subitens que cobre), corte das aulas cujos subitens são
  todos (P1|P2, baixa), round-robin por disciplina, simulados e discursivas nas mesmas datas.
- Item por aula: `{ cid: <uuid da aula>, cod: "E2·A3", prova, prio, texto: <título da aula>,
  min, subitens: [{ cid, cod }] }`; `min` = soma dos custos dos subitens da aula, múltiplo de 5.
- Missão de hoje: o bloco mostra a aula (título) com os subitens como referência; atalhos por
  aula ("Aula da mentoria ↗" direto na aula, "Questões no TEC ↗" com o link do fim do PDF) e
  por subitem (questões do tópico no feed, mapa mental).
- Página das Missões (artefato) mostra os mesmos dias por aula, com os mesmos atalhos.
- Marcações dos dias até 08/11 intactas e contando no progresso; o denominador do progresso
  total recalcula com o plano novo (esperado e comunicado a ela).

## O que NÃO vamos fazer

- Não reescrever os dias passados (13/10 a 08/11): o histórico e as marcações ficam exatamente
  como estão.
- Não mover simulados e discursivas de data nem mudar seus conteúdos.
- Não incluir aulas das especialidades que o app não tem (Desenvolvimento de Sistemas).
- Não resolver a deriva de Infra do vault (P3 de Infra sem lote no feed desde 27/10): a
  especialidade Infra continua como está; este plano gera para `cd` e `aud` (`CARGOS`).
- Não copiar conteúdo de aula: títulos e links apenas (licença individual).

## Abordagem

O gerador (vault) vira consumidor do catálogo (repo): `plano.py` recebe o caminho do
`mentoria.json`, preserva o passado por leitura do plano atual e gera o futuro por aula. O app
identifica item-aula pelo `cid` (uuid) resolvendo no catálogo, o que evita duplicar url/tec no
plano e mantém `validarMissoes` quase como está (só o campo `subitens` novo, opcional).

---

## Fase 1 — Gerador por aula (vault)

### Mudanças

**Arquivo**: `artifacts/missoes/plano.py`
**Mudança**: nova assinatura com o catálogo:

```sh
python artifacts/missoes/plano.py catalogo-questoes/qconcursos/subitens ESTUDO.csv cd \
    <repo>/src/lib/dados/mentoria.json
```

1. Ler o `plano-<cargo>.json` atual e manter os dias com `data < 2026-11-09` byte a byte
   (estrutura de saída igual; só os dias a partir de 09/11 são regerados).
2. Para os dias 09/11 a 12/12: montar a fila de aulas a partir dos subitens ainda não estudados
   (subitens dos dias passados saem, o papel deles passou a ser das aulas), com:
   - prioridade da aula = máxima entre as prioridades dos subitens mapeados;
   - custo/min = soma dos `COST` dos subitens mapeados, arredondada a múltiplo de 5;
   - corte: aula cujos subitens são todos (P1|P2, baixa) não entra (mesma regra do `CUT`);
   - aula sem subitens mapeados no cargo não entra (não há como priorizá-la);
   - round-robin entre disciplinas (a fila por prioridade, como `stream` + `rr` de hoje);
   - simulados de 14/11, 28/11, 5/12 e 6/12 e discursivas nos mesmos dias e conteúdos de hoje;
   - revisões: cada aula volta 1 vez em distância ≥ 3 dias, como o padrão atual de revisão.
3. Saída: item-aula no formato do "Estado final" (cid = `id` da aula no catálogo; `subitens`
   carrega `cid`/`cod` originais para referência, mapa mental e questões do tópico).
4. Avisos impressos: subitens restantes sem aula mapeada (caem no fallback: viram item-aula
   "playlist da disciplina" com o mesmo formato de hoje), aulas puladas pelo corte.

### Critérios de aceite

#### Verificação automática
- [ ] `python artifacts/missoes/plano.py …` roda para os dois cargos; dias `< 2026-11-09`
      idênticos aos do arquivo anterior (comparação `node -e` de fatia do `plan`).
- [ ] Todo dia 09/11 a 12/12 tem blocos somando o mesmo padrão de minutos dos dias de hoje
      (≈180 min, menos dias de simulado, como o plano atual).
- [ ] Nenhum item-aula repete disciplina em blocos "novo" consecutivos do mesmo dia
      (round-robin preservado).

#### Verificação manual
- [ ] Ela abre o plano gerado (dias 09/11 a 12/12) e aprova a distribuição antes de qualquer
      publicação: carga diária, aulas cortadas e revisões.

### Nota de execução (2026-11-08, fases 2 e 3: publicado)

- Distribuição aprovada por ela em 2026-11-08 ("pode fazer todos os planos até estar rodando em
  produção"); publicado no mesmo dia.
- App: `ItemBloco.subitens` e render por aula na Missão de hoje (título da aula, "Aula da
  mentoria ↗" pela URL da aula, "Questões no TEC ↗" com o caderno do tópico, questões do feed e
  mapa mental por subitem de referência; placeholder `ag-` cai na playlist). `mapasDoPlano`
  mapeia pelos subitens de dentro do item-aula.
- Página das Missões: `__AULAS__`/`__PLAYLISTS__` injetados pelo `montar_artifacts.py` (lê o
  `mentoria.json` do repo via `PAINEL_REPO`); item-aula com "aula ↗"/"TEC ↗" e subitens como
  referência; revisão de aula também linka.
- Gerador oficial: `artifacts/missoes/plano_aulas.py --oficial` (sem a flag, grava
  `plano-v2-<cargo>.json` de conferência). `plano.py` antigo segue no vault como histórico.
- Verificações: `npm run check` 0/0, `npm test` 354, `npm run test:e2e` 253 (única falha: a
  deriva de Infra do vault, sem commit por decisão dela). e2e novo: dia 09/11 com item-aula e
  atalhos.
- **Pendência pós-publicação**: quando as 6 aulas agendadas saírem (B1 7–9, item 7 de
  AUD:E2/E3/E5; previstas para 09/11), reexecutar a coleta
  (`scripts/coleta-mentoria/coletar.mjs` + `enriquecer-tecs.mjs` + `gerar-mentoria.mjs`),
  regerar o plano (`plano_aulas.py --oficial`), `montar_artifacts.py`, `npm run importar` e
  publicar de novo: os placeholders `ag-` viram aulas de verdade.

### Nota de execução (2026-11-08, repartição: 1 tarefa = 1 aula)

Ela pediu no mesmo dia, depois de ver o plano no ar: com a aula como unidade, a tarefa do dia
deve ser a aula inteira, não fatias de 45 min da mesma aula "continuando" num dia só. O gerador
mudou: cada bloco de estudo novo é **1 aula** (bloco "Aula da mentoria · P3/P2/P1", com o min
da aula no dia); aula maior que o espaço do dia fica sozinha no dia e continua no seguinte
("a aula é maior que o dia"); aulas pequenas se acumulam (2–6 por dia conforme o custo); sobra
de estudo < 15 min não vira bloco. Vantagem extra: a revisão D+1 de uma aula concluída agora
aponta a própria aula. Regrado nos dois cargos sem sobra (5.985/5.990 min), revalidado
(check 0/0, 354 testes, e2e de missão e artefatos verdes) e publicado.

### Nota de execução (2026-11-08, fase 1: proposta)

- Gerador escrito no vault como `artifacts/missoes/plano_aulas.py` (o `plano.py` segue intacto
  como fonte do plano em produção). Saída em `plano-v2-<cargo>.json`, **arquivo separado** até a
  aprovação; o painel não o importa.
- Estado: dias < 09/11 copiados byte a byte do plano atual (conferido igual nos dois cargos);
  subitens concluídos até 08/11 extraídos do próprio plano atual (itens com `fim`), e as revisões
  D+1/7/30 deles continuam vencendo nos dias novos como itens de subitem (formato antigo).
- Unidades: 54 (cd) e 58 (aud), sem sobra nos 34 dias (6.030 min; 180/dia, 12/12 com 90 como
  hoje). Itens das 6 aulas ainda agendadas entram como unidade placeholder `ag-<disc>-<n>` (B1
  7–9 e item 7 de AUD:E2/E3/E5), com atalho da playlist até a aula sair. O corte de
  (P1|P2, baixa) é o mesmo do plano atual, aplicado aos subitens vivos da aula.
- Aulas grandes dominam mais de um dia (ex.: E4·5 de cd, ~8 subitens, segue "(continua)" por
  2–3 dias): efeito natural de somar o custo dos subitens, como o E4 de Auditoria (110 min) já
  fazia no plano atual. Round-robin mantido na fila; 4 (cd) e 9 (aud) pares de blocos "novo"
  consecutivos do mesmo dia acabam na mesma disciplina no fim da fila, como no plano atual.
- Resumo dia a dia para aprovação: `artifacts/missoes/plano-v2-resumo.md` (vault).

**Pausa**: distribuição aguardando aprovação dela; nada publicado.

---

## Fase 2 — App consumindo aulas (repo)

### Mudanças

#### Importador
**Arquivo**: `scripts/importar/missoes.mjs`
**Mudança**: `validarMissoes` aceita o campo opcional `subitens: [{ cid, cod }]` no item (valida
formato quando presente); `mapasDoPlano` passa a mapear também item-aula: para item com
`subitens`, junta os slugs dos subitens (o atalho de mapa vira "Mapas mentais (2) ↗" quando
houver mais de um; com um, como hoje). Item sem `subitens` segue como hoje.

#### Tipos e carga
**Arquivo**: `src/lib/missoes/tipos.ts`, `src/lib/missoes/carregar.ts`
**Mudança**: `ItemMissao` ganha `subitens?: { cid: string; cod: string }[]`; carga copia quando
presente.

#### Missão de hoje
**Arquivo**: `src/lib/componentes/missoes/MissaoDeHoje.svelte`
**Mudança**: item-aula (resolvido pela presença de `subitens` ou pelo `cid` no catálogo, via
nova `aulaPorId(id)` em `src/lib/dados/index.ts`) renderiza:

```svelte
<span class="cod">{it.cod}</span>
<span class="texto">
	{it.texto}                      <!-- título da aula -->
	<em> · {it.min} min</em>
	<span class="atalhos">
		<a class="topico" href={aula.url} target="_blank" rel="noopener"
			onclick={() => abrirAula(i, it.cid)}>Aula da mentoria ↗</a>
		{#if aula.tec}
			<a class="topico" href={aula.tec} target="_blank" rel="noopener">Questões no TEC ↗</a>
		{/if}
		{#each atalhos dos subitens: questões do tópico no feed, mapa mental}
	</span>
	{#if it.subitens}<em class="ref">Subitens: {it.subitens.map((s) => s.cod).join(' · ')}</em>{/if}
</span>
```

O "Você parou aqui" (gatilho `abrirAula`) segue valendo para o atalho da aula.

#### Testes
**Arquivo**: `tests/unit/missoes/missoes.test.ts`, `tests/e2e/missao.spec.ts`
**Mudança**: unitário de `validarMissoes` com `subitens` e de `mapasDoPlano` por aula; e2e: dia
fixo futuro (ex.: 10/11) mostra bloco por aula com "Aula da mentoria ↗" na URL da aula,
"Questões no TEC ↗" no link do catálogo e subitens de referência; dia fixo antigo (16/10)
 continua igual ao de hoje.

### Critérios de aceite

#### Verificação automática
- [ ] `npm run check`, `npm test`, `npm run importar` (sem aviso novo) verdes.
- [ ] `npm run test:e2e`: casos antigos de dias passados continuam passando sem edição (o
      plano preservado).

#### Verificação manual
- [ ] No celular: missão de 09/11 em diante por aula; abrir aula e TEC; marcação por aula
      persiste entre abas (painel e página das Missões).

**Pausa**: verificação manual antes da fase 3.

---

## Fase 3 — Página das Missões por aula (vault) e publicação

### Mudanças

#### Vault
**Arquivo**: `scripts/montar_artifacts.py`, `artifacts/missoes/template.html` + `script.html`
**Mudança**: `montar_artifacts.py` recebe o caminho do `mentoria.json` e injeta
`__AULAS__` (id → url/tec/título) no `script.html`; a página das Missões renderiza item-aula
com os mesmos atalhos da Missão de hoje (aula ↗, TEC ↗, subitens como referência, marcas por
aula), mantendo dias passados por subitem.

#### Repo
**Arquivo**: `static/conteudo/` (gerado), `tests/e2e/missao.spec.ts`, `tests/e2e/artefatos.spec.ts`
**Mudança**: regenerar artefatos e `npm run importar`; e2e da página das Missões com um dia por
aula (atalhos e marcação); commit único com plano novo + artefatos + testes, diff revisado
(deriva do vault conhecida, como sempre).

### Critérios de aceite

#### Verificação automática
- [ ] `npm run check`, `npm test`, `npm run test:e2e` verdes no CI (push para `main` publica).
- [ ] `npm run importar` idempotente (segunda execução com `git diff static/conteudo` vazio).

#### Verificação manual
- [ ] Página das Missões: dias 09/11+ por aula com atalhos; dias anteriores iguais; marcas
      antigas visíveis onde estavam.

## Estratégia de teste

### Unitários
- `validarMissoes`: item com/sem `subitens`, `subitens` torto recusado.
- `mapasDoPlano`: aula com dois subitens com mapa junta os slugs.
- `calculos` (progresso do dia): bloco por aula conta como hoje (1 item = 1 marcação; o
  por-item só quando a aula tem subitens marcáveis: decisão da fase 2 é não marcar subitem
  dentro da aula, só a aula inteira, mantendo o gesto simples).

### Manuais
1. Missão de 09/11 a 12/12: uma aula por vez, conferir carga diária e revisões.
2. Progresso total das Missões: dias antigos contam; novo denominador coerente (61 dias).

## Migração de dados

- Marcações são por (cargo, data, bloco, cid): dias até 08/11 ficam com cids existentes e
  contam normalmente; a partir de 09/11 os cids são os das aulas (novos). Marcação avulsa de
  dia futuro feita antes da troca (se existir) fica órfã e inofensiva: o cálculo só olha o que
  o plano traz.
- Servidor (D1) e `localStorage` não mudam de esquema; nada a migrar.

## Limites conhecidos

- Aula publicada pela mentoria depois da geração: o plano não a inclui; incorporar é refazer a
  fase 1 (o gerador preserva o passado e regera só o futuro, barato de rodar de novo).
- Subitem sem aula mapeada vira item-aula "playlist" (fallback): continua no plano, com o
  atalho da playlist e sem TEC.
- 34 dias para as aulas priorizadas podem apertar na baixa prioridade: o corte (P1|P2 baixa)
  e o aviso do gerador mostram o que ficou fora; ajuste fino com ela na aprovação da fase 1.

## Referências

- Plano atual das Missões: `artifacts/missoes/plano.py` (vault) e
  `planos/2026-10-14-missao-unica.md` (decisões originais).
- Catálogo de aulas: `planos/2026-11-08-catalogo-de-aulas-da-mentoria.md` (formato do
  `mentoria.json` consumido aqui).
- Marcações e progresso: `src/lib/missoes/calculos.ts`, `src/lib/missoes/marcas.svelte.ts`.
