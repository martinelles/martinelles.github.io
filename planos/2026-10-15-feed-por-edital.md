# Feed dividido pelas disciplinas do edital

Id: `2026-10-15-feed-por-edital`. Decisão registrada em 2026-10-15.

## O que mudou

As matérias do feed (stories, filtro `?materia=`, disciplina de foco, progresso por matéria) eram
as 17 do catálogo de questões, no estilo do Qconcursos ("Direito Administrativo", "AFO", "TI:
Ciência de Dados"…). Passam a ser as disciplinas do Edital CGU 1/2026, as mesmas dos dois guias
de conteúdo programático e das Missões:

- P1: B1 a B4; P2: C1 a C5 — comuns aos dois cargos, ids `b1`…`c5`;
- P3 de Ciência de Dados: E1 a E4, ids `cd-e1`…`cd-e4`;
- P3 de Auditoria: E1 a E5, ids `aud-e1`…`aud-e5`.

Cada especialidade tira do feed a P3 da outra (`fora` em `src/lib/feed/foco.svelte.ts`). O foco
padrão é `cd-e1` em Ciência de Dados e `c5` em Auditoria; foco gravado com id antigo volta ao
padrão. A tabela e as regras ficam em `scripts/importar/disciplinas.mjs`.

## Como cada post ganha a disciplina

- **Questão:** pelo prefixo do `topico_estudo` (id do `ESTUDO.csv` do vault): EDC→B1, SBD→B2,
  EPR→B3, ADP→B4, GRI→C1, TOP→C2, DPC→C3, EDI→C4, AGI→C5, EPA/EAG/AMI/OGS→E1–E4 de Ciência de
  Dados. É a classificação do próprio vault, sem julgamento novo.
- **Lei seca, baralhos, resumos e flashcards do `feed-conteudo/`:** por tabela, arquivo a
  arquivo. Essa classificação é minha, feita lendo os guias: norma que serve a mais de uma
  disciplina vai à comum aos dois cargos (P1/P2), para não sumir de um deles. Exemplos: CF, 8.112,
  9.784, 8.429, 14.133 e LINDB em C3; LAI e LGPD em C2; Código de Ética e conflito de interesses
  em B3; LRF e leis de estrutura dos ministérios em B4; normas de controle interno e da CGU em C5;
  Decreto 9.203 em C1; INs de contratação de TIC e a IN GSI 1/2020 em E4 de Ciência de Dados.

Na importação de 2026-10-15: 6.365 posts, nenhum sem disciplina.

## Limitações aceitas

- **A P3 de Auditoria fica vazia no feed.** O `ESTUDO.csv` só tem a P3 de Ciência de Dados; as
  questões não têm tópico `AUD-E*`, e nenhuma norma ou baralho foi posto só lá (LRF, 14.133 e
  afins foram às disciplinas comuns). Em Auditoria, o feed mostra B1–C5. Reabrir quando o
  `ESTUDO.csv` ganhar as linhas da P3 de Auditoria ou o catálogo de questões ganhar tópicos
  `AUD-E*`: aí basta acrescentar os prefixos em `TOPICO_PARA_DISCIPLINA`.
- **Segurança da informação e ITIL/COBIT em E4 de Ciência de Dados** é encaixe pelo mais
  próximo (governança e proteção de soluções de dados), não item literal do edital. Reabrir se o
  guia de Ciência de Dados apontar outro lugar ou se esse conteúdo deve sair do feed.
- **Arquivo novo no vault sem regra** (norma, baralho ou `feed-conteudo/` com prefixo novo) não
  entra no feed: o relatório da importação conta em "sem disciplina do edital". Basta acrescentar
  a regra em `disciplinas.mjs`.
- O progresso por matéria do painel passa a contar por disciplina; as respostas e os vistos, que
  são por post, continuam valendo.
