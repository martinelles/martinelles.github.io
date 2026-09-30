# Contrato: `Estudo/cgu/feed-conteudo/` (resumos e flashcards no vault)

Pasta escrita pelo WP de geração e revisada pela dona no Obsidian. A importação só lê.

```
feed-conteudo/
├── LEIA-ME.md              # como revisar e marcar conferido
├── resumos/<materia>--<topico>.md
└── flashcards/<materia>--<topico>.md
```

## Resumo

```markdown
---
tipo: resumo
materia: TI: Ciência de Dados          # exatamente como em questoes.csv
subtopico: Aprendizado de máquina supervisionado
fonte: "Edital FGV 2021 AFFC, bloco Ciência de Dados; incidencia-topicos-ciencia-de-dados.md"
conferido: false
gerado_em: 2026-09-30
---

# Aprendizado supervisionado

## O que é
Texto curto (≤ 600 caracteres).

## Classificação × regressão
…

## Onde cai
…
```

- Cada `##` vira uma tela do carrossel; 3 a 8 telas; o `#` é o título do post.
- Tema jurídico: `fonte` aponta o arquivo de lei seca e os artigos (`leis-secas/07-Lei-13709-2018-LGPD.md, arts. 7º e 11`); todo `Art. N` citado no texto precisa existir nesse arquivo (a importação verifica e falha com o nome do arquivo).

## Flashcards

```markdown
---
tipo: flashcards
materia: TI: Segurança da Informação
subtopico: Criptografia
fonte: "Edital FGV 2021 AFFC, item 3"
conferido: false
gerado_em: 2026-09-30
---

P: Qual a diferença entre criptografia simétrica e assimétrica?
R: Simétrica usa a mesma chave para cifrar e decifrar; assimétrica usa par de chaves pública/privada.

P: …
R: …
```

- Pares `P:`/`R:` separados por linha em branco; resposta pode ter várias linhas até a próxima linha em branco seguida de `P:`.
- `conferido` vale para o arquivo inteiro.

## Marcar como conferido

Trocar `conferido: false` por `conferido: true` no cabeçalho e rodar `npm run importar` no
projeto. O selo some dos posts daquele arquivo.

## Regras de validação (a importação recusa o arquivo e segue com os demais, listando no relatório)

- `tipo`, `materia`, `fonte`, `conferido` obrigatórios; `materia` precisa existir na tabela de matérias.
- Resumo: 3–8 telas, cada uma com texto não vazio e ≤ 600 caracteres.
- Flashcards: ≥ 1 par; nenhum `P:` sem `R:`.
