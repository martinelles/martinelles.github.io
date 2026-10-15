# Especialidade Infraestrutura de TI

Id: `2026-10-15-especialidade-infraestrutura`. Decisão registrada em 2026-10-15.

## O que mudou

A especialidade ganha uma terceira opção, Infraestrutura, que é o Cargo 3 do Edital CGU 1/2026
(AFFC — Tecnologia da Informação — Infraestrutura de TI, itens 2.1.3 e 15.2.4). Ela aparece no
seletor de cargo do cabeçalho do painel ("TI — Infraestrutura") e nos Ajustes ("Infraestrutura"),
e é gravada na chave de foco com o id `infraestrutura`.

- **P3 no edital:** quatro disciplinas, `infra-e1` a `infra-e4`, em `scripts/importar/disciplinas.mjs`:
  E1 Redes, Sistemas e Plataformas de Dados; E2 Computação em Nuvem, Virtualização e Automação;
  E3 Cibersegurança, Privacidade e Continuidade de Serviços; E4 Operação, Governança e Gestão de
  Serviços Digitais. Os nomes saem do texto do edital, que está em
  `fontes-escopo/certame-2026/cebraspe-2026-cgu-affc-edital-01.pdf` no vault.
- **Feed:** cada especialidade tira a P3 das outras duas (`foraDaP3` em `src/lib/feed/foco.svelte.ts`).
  Em Infraestrutura, o foco padrão é C4 (Evidências, Dados e IA), a disciplina comum mais próxima
  da P3 dela.
- **Missões:** a especialidade não tem `ancora`, então o painel não busca plano. No lugar da Missão
  de hoje aparece "Infraestrutura ainda não tem plano nas Missões", e a chamada da missão some do
  feed. Os links "Prioridades do edital" e "Missões até a prova" abrem as páginas sem âncora.
- O seletor de cargo quebra em duas linhas em 360 px e se estica até a borda.

## Limitações aceitas

- **A P3 de Infraestrutura fica vazia no feed.** O catálogo não tem questão com tópico dela, e
  nenhuma norma, baralho ou arquivo do `feed-conteudo/` foi levado para lá. As disciplinas
  `infra-e*` existem na tabela, mas `ordenarDisciplinas` tira quem não tem post, por isso não
  aparecem nos stories nem nos Ajustes. O conteúdo de segurança da informação (IN GSI 1/2020,
  `ti-seguranca-da-informacao--*`) cabe literalmente em E3 de Infraestrutura, mas continua em E4
  de Ciência de Dados, porque um post tem uma disciplina principal só e mudá-lo o tiraria do feed
  de Ciência de Dados. Reabrir quando entrarem questões ou material da P3 de Infraestrutura, ou se
  o segundo tópico (`m2`/`tp2`, plano `2026-10-15-feed-por-edital`) dever valer também para esses
  arquivos.
- **Sem plano nas Missões.** O vault só tem `artifacts/missoes/plano-cd.json` e `plano-aud.json`,
  e as páginas das Missões e das Prioridades só entendem `#cd` e `#aud`. Reabrir quando o vault
  ganhar um `plano-infra.json`: aí é preciso acrescentar `infra` a `CARGOS` em
  `scripts/importar/missoes.mjs` e ao tipo `Cargo`, e dar `ancora: 'infra'` à especialidade.
