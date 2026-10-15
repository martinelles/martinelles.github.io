# Guia da P3 de Infraestrutura no feed

Id: `2026-10-15-guia-infraestrutura-no-feed`. Decisão registrada em 2026-10-15.

## O que mudou

O `GUIA CGU 2026 AFFC Infraestrutura P3.md`, na raiz do vault, passa a alimentar as disciplinas
`infra-e1` a `infra-e4`, que até aqui ficavam fora do feed por não terem posts
(plano `2026-10-15-especialidade-infraestrutura`). O importador está em `scripts/importar/guias.mjs`,
e a tabela `GUIAS` liga cada guia ao prefixo da P3.

Para cada um dos 98 subitens (`#### E3 · 6.4 — Prioridade alta`):

- **Resumo:** o título é o código mais o texto do edital (A). As telas são, em ordem: "O que estudar" (B), "Fontes" (C, só o que cabe em uma tela) e a prioridade com a justificativa (E).
  - A parte (B) é cortada em telas de até 600 caracteres, sem partir item de lista quando cabe e sem partir bloco de código SQL.
  - Subitem com mais de 8 telas vira mais de um post ("parte 1 de 2"). Sem (C), a tela do texto do edital completa o mínimo de três.
  - O markdown sai (links, negrito, itálico); o código entre crases fica como está.
- **Flashcards:** cada pegadinha da parte (D), escrita como "*Afirmação errada:* … → *Certo:* …", vira um cartão "Certo ou errado? …" com resposta "Errado. …". Pegadinha fora desse formato vira aviso na importação.
- A disciplina sai do código do subitem, no início do subtópico (`disciplinaDoPost`).
- Todo post leva `conferido: false`: o guia foi gerado por IA e não foi revisado, e o feed mostra o selo "não conferido".

Na importação de 2026-10-15: 144 resumos e 243 flashcards. Por disciplina: E1 80 posts, E2 81, E3 110 e E4 116.

Junto com isso:

- o foco padrão de Infraestrutura passa de C4 para `infra-e1`;
- o aviso do painel diz que a P3 vem do guia;
- as telas do resumo passam a mostrar o recuo das listas aninhadas e das consultas (`white-space: pre-wrap`).

## Limitações aceitas

- **Conteúdo não conferido.** O guia tem pontos marcados "conferir no DOU" e fontes secundárias, listados na seção final dele. Reabrir quando ela revisar o guia: aí basta trocar o `false` fixo por um campo no guia, como o `conferido:` do `feed-conteudo/`.
- **Resumos longos.** A parte (B) de alguns subitens passa de 8 mil caracteres, e E1 1.1 vira três posts. O corte é mecânico, por tamanho, e não um resumo reescrito. Reabrir se a leitura no celular ficar ruim. A saída seria um campo de resumo curto por subitem, escrito no próprio guia.
- **Sem tópico das Missões.** Os posts não têm `tp`, porque Infraestrutura não tem plano nas Missões. Reabrir junto com o `plano-infra.json`.
- **Só o guia de Infraestrutura.** O guia de Ciência de Dados não entra: a P3 dela já tem questões e material próprio. Para incluí-lo, basta acrescentar o arquivo a `GUIAS` com o prefixo `cd`.
