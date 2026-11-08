# Qconcursos fora do painel: plano de implementação

Id: `2026-11-08-qconcursos-fora-do-painel` (datado, sem rastro fora do arquivo; o repo não tem
`ESTADO.csv` nem issue tracker, como os planos anteriores).

## Visão geral

Os atalhos de questões do Qconcursos saem do painel e das páginas de artefatos: os PDFs das
aulas da mentoria já trazem, no fim, um link do TEC Concursos com caderno de questões (o
atalho do TEC chega com o catálogo de aulas, plano
`2026-11-08-catalogo-de-aulas-da-mentoria.md`). Sai também o gatilho do Qconcursos no
"Você parou aqui", que passa a disparar ao abrir a aula da mentoria.

## Estado atual (conferido)

- Na Missão de hoje, cada subitem pode ter "Questões no Qconcursos ↗" e "Questões que errei ↗"
  ([MissaoDeHoje.svelte:198-219](../src/lib/componentes/missoes/MissaoDeHoje.svelte)); o clique
  grava o estado "Você parou aqui" via `abrirNoQc` ([MissaoDeHoje.svelte:89-93](../src/lib/componentes/missoes/MissaoDeHoje.svelte),
  texto em `:230`).
- `qc`/`qcErros` fazem parte do plano carregado
  ([tipos.ts:51,53](../src/lib/missoes/tipos.ts), [carregar.ts:32-33](../src/lib/missoes/carregar.ts))
  e são produzidos pelo importador: `linksDoPlano` lê `catalogo-questoes/qconcursos/links.json`
  do vault ([missoes.mjs:44](../scripts/importar/missoes.mjs), leitura em
  [index.mjs:294-296](../scripts/importar/index.mjs), chamada em `:334`).
- As páginas de artefatos Missões e Prioridades embutem os mesmos links (792 URLs do
  Qconcursos em cada HTML), injetados por `montar_artifacts.py:79-85` (vault) via `__LINKS__`;
  o consumo está em `artifacts/missoes/script.html:19-31,169-170` e
  `artifacts/prioridades/prioridades-edital.html:289-308` (vault), com o mesmo mecanismo de
  destaque "aberto no Qconcursos".
- Testes que cobrem o QC: unitário de `linksDoPlano`
  ([missoes.test.ts:60-73](../tests/unit/missoes/missoes.test.ts)), e2e da Missão de hoje
  ([missao.spec.ts:150-199](../tests/e2e/missao.spec.ts)) e da ponte com a página das Missões
  (`:317`), e2e dos artefatos ([artefatos.spec.ts:125](../tests/e2e/artefatos.spec.ts), `:301-309`).
- O Raio-X (`/artefato/raiox`) é página de estatísticas do Qconcursos e não é link de questões:
  fica de fora desta mudança.
- O atalho "Aula da mentoria ↗" existe por disciplina
  ([mentoria.json](../src/lib/dados/mentoria.json), uso em `MissaoDeHoje.svelte:167,224`) e não
  grava estado "Você parou aqui" hoje.

## Estado final desejado

- Nenhum atalho, link ou menção funcional ao Qconcursos na Missão de hoje, nas páginas de
  artefatos Missões e Prioridades e no pipeline do importador; o Raio-X permanece.
- O "Você parou aqui" continua existindo, disparado pelo atalho "Aula da mentoria ↗", com o
  texto "abriu a aula da mentoria"; a chave de armazenamento não muda.
- `npm run importar` idempotente e sem `qc`/`qcErros` em `missoes-<cargo>.json`.
- O vault mantém `catalogo-questoes/qconcursos/` intacto (links.json, gerador e fontes): só sai
  do fluxo, e reativar é reverter os commits.

## O que NÃO vamos fazer

- Não apagar nem editar `links.json`, `assuntos.json`, `termos.json` e
  `gerar_links_qconcursos.py` no vault.
- Não mexer no Raio-X (página, dados e e2e `artefatos.spec.ts:175` continuam).
- Não criar aqui o atalho do TEC Concursos: ele chega com o catálogo de aulas (plano seguinte).
- Não resolver a deriva de Infra do vault (movimento desde 27/10, registrado no plano
  `2026-10-30-links-qconcursos-tema-errado.md`); o diff da regeneração é revisado antes do
  commit, como sempre.

## Abordagem

Duas fases, um commit por fase, repo verde entre elas: primeiro o app (atalhos, tipos e
pipeline), mantendo os artefatos antigos funcionando (a página das Missões grava o mesmo
"Você parou aqui", então o e2e da ponte segue passando); depois o vault (templates sem links)
e a regeneração dos artefatos.

---

## Fase 1 — App sem Qconcursos

### Mudanças

#### Missão de hoje
**Arquivo**: `src/lib/componentes/missoes/MissaoDeHoje.svelte`
**Mudança**: saem os atalhos "Questões no Qconcursos ↗" e "Questões que errei ↗" e todo uso de
`plano.qc`/`plano.qcErros`; o gatilho do "Você parou aqui" passa ao atalho da aula.

```svelte
{@const erros = undefined} <!-- remove: não há mais qcErros -->
{@const aula = aulaDaMentoria(cargo, it.cod)}
...
{#if n > 0 || aula || plano.mapas?.[it.cid]}
	<span class="atalhos">
		{#if n > 0}…questões deste tópico…{/if}
		{#if aula}
			<a class="topico" href={aula} target="_blank" rel="noopener"
				onclick={() => abrirAula(i, it.cid)}>Aula da mentoria ↗</a>
		{/if}
		{#if plano.mapas?.[it.cid]}…{/if}
	</span>
{/if}
...
<strong>Você parou aqui:</strong> abriu a aula da mentoria.
```

`abrirNoQc` vira `abrirAula` (mesma implementação, novo nome); comentário do topo do arquivo
atualizado (as menções ao Qconcursos saem).

#### Tipos e carga
**Arquivo**: `src/lib/missoes/tipos.ts`, `src/lib/missoes/carregar.ts`
**Mudança**: `qc` e `qcErros` saem de `PlanoMissoes` (`tipos.ts:51,53`) e da carga
(`carregar.ts:32-33`).

#### Importador
**Arquivo**: `scripts/importar/missoes.mjs`, `scripts/importar/index.mjs`
**Mudança**: `linksDoPlano` sai inteiro (`missoes.mjs:44-72`); `montarMissoes` perde o parâmetro
`links` e o bloco de parse de `links.json` (`missoes.mjs:121-133`); `index.mjs` perde a leitura
(`:294-296`) e passa só o mapa (`:334`). Cabeçalho do `missoes.mjs` (parágrafo do link do
Qconcursos) reescrito. `missoes-<cargo>.json` sai sem `qc`/`qcErros`.

#### Testes
**Arquivo**: `tests/unit/missoes/missoes.test.ts`, `tests/e2e/missao.spec.ts`
**Mudança**: no unitário, a fixture `qc/qcErros` (`:29-30`) e o caso de `linksDoPlano` (`:60-73`)
saem, e `montarMissoes` passa a ser chamado sem links; no e2e, os casos `:150-172` saem, o de
destaque na volta (`:174-199`) passa a clicar "Aula da mentoria ↗", e o da página das Missões
(`:317`) permanece até a fase 2 (a página ainda tem os links QC).

### Critérios de aceite

#### Verificação automática
- [ ] `npm run check` e `npm test` verdes.
- [ ] `npm run importar` roda sem os links e `missoes-<cargo>.json` sai sem `qc`/`qcErros`
      (`node -e` conferindo as chaves do JSON gerado).

#### Verificação manual
- [ ] Missão de hoje: subitem com aula mostra só "Aula da mentoria ↗" (e mapa/questões do
      tópico quando houver); abrir a aula e voltar mostra "Você parou aqui: abriu a aula da
      mentoria" com marcar/dispensar.

**Pausa**: commit (`fix: qconcursos fora da missão de hoje`) e confirmação manual antes da
fase 2.

---

## Fase 2 — Artefatos sem Qconcursos (vault) e regeneração

### Mudanças

#### Vault
**Arquivo**: `scripts/montar_artifacts.py`
**Mudança**: sai a leitura de `LINKS` (`:34`, `:79`) e os replaces de `__LINKS__` (`:84-85`);
o `--check` perde a comparação de links com a `referencia-v6` (bloco que avalia o código de
links da versão publicada), mantendo o `node --check` dos scripts montados.

**Arquivo**: `artifacts/missoes/template.html` + `script.html`
**Mudança**: `const LINKS` (`script.html:19-20`) e os usos (`:31` atalho de questões, `:169-170`
"erros ↗") saem; o mecanismo de destaque "aberto no Qconcursos" da página (gravação do estado
ao clicar link QC) sai junto.

**Arquivo**: `artifacts/prioridades/prioridades-edital.html`
**Mudança**: `LINKS` (`:289-290`) e os atalhos de questões/erros (`:301-308`) saem.

#### Repo
**Arquivo**: `static/conteudo/` (gerado), `tests/e2e/artefatos.spec.ts`
**Mudança**: regenerar (`python scripts/montar_artifacts.py` no vault, `npm run importar` no
repo); no e2e, saem os casos do `a.qc` (`:125`, `:301-309`). Commit único com os artefatos
regenerados e o ajuste do e2e; diff do `static/conteudo` revisado (só artefatos e o que já é
deriva conhecida).

### Critérios de aceite

#### Verificação automática
- [x] `grep -ril qconcursos static/conteudo` devolve apenas os arquivos do Raio-X
      (`artefatos/raiox*`).
- [x] `npm run importar` duas vezes seguidas: o diff dos arquivos gerados é idêntico nas duas
      (idempotente). `missoes-<cargo>.json` sai com as chaves `gerado, plan, cortes, mapas`.
- [x] `npm run check` (0/0), `npm test` (350), `npm run test:e2e` (252 passaram; a única falha
      é a deriva de Infra do vault, sem commit por decisão dela, alheia a este plano).

#### Verificação manual
- [ ] Nas Missões e nas Prioridades (dentro do app), nenhum "questões ↗"/"erros ↗" de
      Qconcursos; o resto da página igual (plano, marcas, mapas).

### Nota de execução (2026-11-08)

- Fase 1 commitada como `fix: qconcursos fora da missão de hoje; parou-aqui dispara na aula`.
- Na página das Missões (script.html), o lembrete "Você parou aqui" passou a ser só consumo: o
  painel grava ao abrir a aula da mentoria; o clique em `a.qc` da página saiu junto com os
  links. Na página das Prioridades, o mecanismo próprio de destaque (linha ao voltar do
  Qconcursos, chave própria `prioridades:em-andamento`) saiu inteiro: era só gatilho de link de
  questões. O aviso do rodapé sobre "link com 0 questões" virou a indicação de onde ficaram os
  cadernos (aula da mentoria); a coluna "Questões" da tabela virou "Mapa".
- O `--check` do `montar_artifacts.py` perdeu a comparação com a `referencia-v6` (era só dos
  links) e mantém o `node --check` dos scripts montados.
- `montarMissoes` perdeu o parâmetro `links`; `linksDoPlano` saiu (as fontes de
  `catalogo-questoes/qconcursos/` continuam intactas no vault, desativadas).

## Estratégia de teste

### Unitários
- `montarMissoes` sem links: saída sem `qc`/`qcErros`, aviso nenhum de links ausentes.
- Carga do plano sem os campos: `carregar` monta `PlanoMissoes` completo.

### Manuais
1. Fluxo do "Você parou aqui" pelo atalho da aula (abrir, voltar, marcar, dispensar), no painel.
2. Página das Missões aberta direto pelo `.html`: sem links QC, menu e marcas funcionando.

## Migração de dados

Nada migrar: o "Você parou aqui" existente mantém a chave e passa a exibir o texto novo; as
marcas de missão são independentes dos links. `missoes-<cargo>.json` perde `qc`/`qcErros` no
deploy, sem consumidor.

## Referências

- Motivação e decisão: pedido de 2026-11-08 (reorganização pela mentoria; TEC Concursos no fim
  de cada aula-PDF).
- Pipeline dos links: `planos/2026-10-30-links-qconcursos-tema-errado.md` (auditoria e correção
  que esta mudança torna dormente, sem apagar as fontes).
- Atalho da mentoria atual: `planos/2026-11-03-aulas-da-mentoria-no-painel.md`.
