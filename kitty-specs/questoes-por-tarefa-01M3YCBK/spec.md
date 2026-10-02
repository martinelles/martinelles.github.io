# Especificação: Questões por tarefa

**Missão**: `questoes-por-tarefa-01M3YCBK` · **Tipo**: software-dev · **Criada**: 2026-10-02
**Branch de planejamento e de merge**: `main` · **Base**: `main` em `f05a390` (plano de estudos mesclado)

## Visão geral

A tarefa de **Questões** de um tópico do plano passa a abrir **exatamente as questões do catálogo
ligadas àquele tópico**, em vez de todas as questões da matéria. A ligação já existe no catálogo:
a coluna `topico_estudo` de `catalogo-questoes/questoes.csv` guarda o id do tópico do `ESTUDO.csv`
(ex.: `FAG-02`), e desde 2026-10-02 vale `sem-topico` para matérias sem tópico no edital.

**Por quê**: estudar o tópico e resolver questões dele, não da matéria inteira.

## Decisões da dona (2026-10-02)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Coluna nova no catálogo? | Não: a tarefa de uma questão é derivada de `topico_estudo` (`<tópico>:Q`) |
| D2 | Escopo | Passo 2 (marcar `sem-topico`, já feito no vault) e passo 3 (esta missão); **sem** classificar as 584 questões ainda vazias |

## Cenários

### Cenário 1 — Questões do tópico (P1)
1. **Dado** uma tarefa de Questões cujo tópico tem questões ligadas, **quando** a pessoa toca o atalho de questões, **então** o feed mostra só essas questões, com o título "Questões de <id do tópico>" e a quantidade.
2. **Dado** esse filtro, **então** a ordem, a resposta no post, curtir/salvar e "Você viu tudo" funcionam como nos outros filtros, e o fim chega depois exatamente da quantidade ligada.

### Cenário 2 — Tópico sem questões ligadas (P1)
1. **Dado** um tópico sem nenhuma questão ligada, **então** a tela da tarefa diz "Nenhuma questão do catálogo ligada a este tópico ainda" e o atalho leva às questões da matéria, como hoje.

### Bordas
- `topico_estudo` vazio ou `sem-topico`: a questão não entra em filtro de tópico (continua nos filtros de matéria/tipo).
- Id de tópico na URL que não existe: feed mostra o fim imediatamente com link para "Tudo".

## Requisitos

### Funcionais
| ID | Requisito | Status |
|---|---|---|
| FR-001 | A importação leva `topico_estudo` para as questões (só ids de tópico; vazio e `sem-topico` ficam sem tópico) e para o índice, e conta questões por tópico. | Proposto |
| FR-002 | O feed aceita o filtro `?topico=<id>` (combinável com `tipo`), com ordem do dia e sessão sem repetição próprias. | Proposto |
| FR-003 | A tela da tarefa de Questões mostra quantas questões estão ligadas ao tópico e o atalho vai a `/?topico=<id>&tipo=questao`; com zero, mostra o aviso e cai no filtro da matéria. | Proposto |
| FR-004 | O feed com filtro de tópico mostra o título com o id do tópico e a quantidade. | Proposto |

### Não funcionais
| ID | Requisito | Limite | Status |
|---|---|---|---|
| NFR-001 | Peso do índice | aumento ≤ 10 KB gzip | Proposto |
| NFR-002 | Fidelidade | 100% das questões com `topico_estudo` válido aparecem no filtro do seu tópico | Proposto |

### Restrições
| ID | Restrição | Status |
|---|---|---|
| C-001 | Catálogo e `ESTUDO.csv` são só leitura para a importação. | Aceita |
| C-002 | Sem coluna nova no catálogo (D1). | Aceita |

## Critérios de sucesso
- SC-001: A partir de uma tarefa de Questões, 1 toque leva às questões do tópico.
- SC-002: Para 5 tópicos de amostra, o número de questões no filtro = número de linhas do catálogo com aquele `topico_estudo` (válidas e com gabarito).

## Premissas
- 1.266 questões têm `topico_estudo` com id válido (antes do descarte de anuladas/sem gabarito pela importação).

## Fora de escopo
Classificar as questões ainda sem tópico; filtro por tópico para lei seca, resumos e flashcards.
