# Lista de discursivas: plano de implementação

Id: `2026-11-13-lista-de-discursivas`.

## Visão geral

Tela `/discursivas` com todas as discursivas do plano (blocos `disc`), na ordem dos dias, para
fazê-las em ordem diferente da do plano. Marcar na lista grava a mesma chave do bloco no dia dele
(`cd~data~índice`, chave `missoes-cgu-2026`), então a Missão de hoje, a página das Missões e a
lista mostram sempre o mesmo estado, em qualquer aparelho logado.

## Decisões

- A lista é do cargo escolhido em Ajustes (`usarPlanoMissoes`), como o painel; especialidade sem
  plano mostra aviso.
- Marcar exige login, como nas Missões (`marcarMissao`, de `pedidoLogin`).
- `discursivasDoPlano` (pura, em `calculos.ts`) alimenta a tela: `{ dia, indice, bloco }`, o
  índice é o da chave da marcação.
- O cartão "Questões Discursivas" do painel abre a tela (`rotaDaFerramenta`, `ROTA_PROPRIA`); o
  endereço antigo `/ferramenta/questoes-discursivas` redireciona para lá. A aba do rodapé é a do
  painel.
- O dia de hoje fica destacado; dias passados ficam com a data suave. A linha concluída mostra
  "concluída" junto da data.

## Testes

- Unitário: `discursivasDoPlano` devolve só os blocos `disc`, com dia e índice
  (`tests/unit/missoes/missoes.test.ts`).
- E2E (`tests/e2e/discursivas.spec.ts`): a lista cobre todas as discursivas do plano; marcar a de
  outro dia grava a chave certa, aparece marcada na missão do dia dela e desmarcar lá volta a
  lista.
