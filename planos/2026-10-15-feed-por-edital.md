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

## Atualização de 2026-10-15: a P3 de Auditoria ganha questões

O primeiro item das limitações deixou de valer em parte. Em vez de levar a P3 de Auditoria ao
`ESTUDO.csv` (que guia o estudo de Ciência de Dados e passaria a puxar subitens de Auditoria para
o `HOJE.md`), as questões recebem direto o id do subitem das Missões (`AUD-E2-3.1`), que o
importador agora aceita (`ID_TOPICO` em `questoes.mjs`) e leva a `aud-e<n>`.

- **Só as descartadas:** entraram apenas as 425 questões marcadas `sem-topico` (fora Português,
  Inglês, RLM e TI). As que já tinham tópico de P1/P2 ficaram onde estavam, para não sumirem do
  feed de Ciência de Dados.
- **Classificação:** cinco agentes leram cada questão contra o texto dos 89 subitens, com critério
  estrito (só quando estudar o subitem bastaria para responder). Saíram 64 atribuições; tirei 12 de
  custos industriais genéricos (TCU2015-AUD-145 e 147 a 157), que o próprio agente marcou como
  leitura branda de E2 5.2/5.3. Ficaram 52 questões, gravadas no `catalogo-questoes/questoes.csv`
  do vault com nota datada em `obs`; cópia anterior guardada fora do vault antes da edição.
- **Resultado no feed:** 216 posts (as de múltipla escolha viram itens C/E): E2 com 199, E3 com 10,
  E4 com 7. **E1 e E5 de Auditoria continuam vazias**: o catálogo não tem questão descartada que
  caiba nelas. Os subitens com questão passam a mostrar "N questões deste tópico" na Missão de hoje.
- Reabrir quando entrarem no catálogo provas de Auditoria com conteúdo de E1 (auditoria
  governamental) e E5 (integridade e responsabilização), ou se ela quiser reclassificar as
  questões de P1/P2 que também servem à P3 de Auditoria (isso pediria um post em duas disciplinas,
  que o índice hoje não suporta).

## Atualização de 2026-10-15: E1 e E5 de Auditoria por segundo tópico

Questão de P1/P2 que também cobre um subitem de E1 ou E5 de Auditoria passa a aparecer nas duas
disciplinas. O post fica no lote da disciplina principal; a entrada do índice ganha `m2`
(`aud-e1`/`aud-e5`) e `tp2` (o subitem), e o filtro por disciplina e por tópico, o anel de "tudo
visto" e a contagem "N questões deste tópico" leem os dois (`src/lib/feed/entrada.ts`). Respostas e
estatísticas por matéria continuam contando a questão uma vez só, na principal.

- **Onde mora:** `catalogo-questoes/topicos-p3-auditoria.csv` no vault (`id`, `topico`,
  `data_conferido`, `obs`), arquivo novo; o `questoes.csv` não mudou de esquema nem de conteúdo
  nesta etapa. Id do arquivo que não chega ao feed vira aviso na importação.
- **Classificação:** quatro agentes leram as 357 questões com tópico DPC, AGI, GRI, TOP e EPR contra
  os 45 subitens de E1 e E5, com critério estrito. Saíram 97 atribuições; tirei as 37 que os
  próprios agentes marcaram como leitura branda. Ficaram 60 questões (25 em E1, 35 em E5).
- **Resultado no feed:** E1 de Auditoria com 109 posts e E5 com 142 (múltipla escolha vira itens C/E).
  Com isso as cinco disciplinas da P3 de Auditoria têm conteúdo.
- Reabrir se as 37 de leitura branda devem entrar (lista nos `resultado*.json` da sessão, não
  guardados no repositório) ou se a mesma regra deve valer para as questões de P1/P2 que cobrem
  E2–E4.
