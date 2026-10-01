# Research: Plano de Estudos

2026-10-01.

## R1 — Fila a partir do ESTUDO.csv
- **Decision**: fila = tópicos não dominados e não cortados, por `prioridade` desc (coluna derivada do gerador `gerar_visoes_estudo.py`), 1 tarefa = 1 tópico de 45 min.
- **Rationale**: é a mesma regra do `HOJE.md`; o app e o vault dizem a mesma coisa sobre "o que estudar".
- **Alternatives**: ler o `HOJE.md` (só 1 dia, sem fila); a planilha `material/plano-estudos-gerado.xlsx` (fonte paralela ao `ESTUDO.csv`, viola fonte única).

## R2 — Missão do dia com rolagem e foto
- **Decision**: a missão de um dia é **fotografada** na primeira vez que é calculada naquele dia; pendências passam para o dia seguinte porque a próxima foto parte da fila pendente.
- **Rationale**: "dia concluído" precisa de uma definição estável; sem foto, concluir uma tarefa extra mudaria retroativamente o que era a missão.
- **Alternatives**: missão por calendário fixo (quebra no primeiro dia ruim; contra o ciclo por horas da skill estudo-total).

## R3 — Cronômetro por timestamps
- **Decision**: guardar `rodandoDesde` (epoch ms) e intervalos fechados; o tempo exibido é calculado; `setInterval` só redesenha.
- **Rationale**: aba em segundo plano e app fechado não "pausam" a conta; atende NFR-002 e SC-004.
- **Edge**: virada de dia com cronômetro correndo conta para o `dia` da tarefa (spec, borda).

## R4 — Exportação
- **Decision**: CSV com BOM, colunas alinhadas ao `ESTUDO.csv` (`id`, `ultima_sessao`, `questoes_feitas`, `questoes_certas`) mais `minutos` e `status_sugerido`; download por `Blob` + `<a download>`.
- **Rationale**: ela cola as colunas no CSV ou um script futuro mescla; sem servidor (C-001/C-002).

## R5 — Parâmetros mudáveis
- **Decision**: `feed-conteudo/plano.md` com frontmatter; padrão no importador = D2.
- **Rationale**: C-004 — quando o edital sair, muda a data-fim sem código.
