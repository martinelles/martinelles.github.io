---
affected_files: []
cycle_number: 2
mission_slug: plano-de-estudos-01M3WPZ6
reproduction_command:
reviewed_at: '2026-10-02T01:13:14Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP03
---

# Pedido de mudança (emenda D5, pedida pela dona em 2026-10-02) — não é defeito

Leia D5 e FR-016 em kitty-specs/plano-de-estudos-01M3WPZ6/spec.md no checkout principal (main).

T019:
- Quando a missão do dia está cumprida (e a fila ainda tem pendentes), mostrar o botão primário "Continuar estudando" em: (a) MissaoDoDia no painel, junto do "Missão cumprida"; (b) ChamadaMissao no feed (troca o link discreto por "Missão cumprida · Continuar"); (c) tela da tarefa recém-concluída, quando a missão ficou cumprida com ela.
- O botão abre a próxima tarefa pendente da FILA INTEIRA (primeira tarefa do plano sem concluidaEm, fora da foto do dia) e inicia o cronômetro, como "Iniciar estudos". Se houver uma tarefa extra já com tempo (pausada), "Continuar estudando" retoma ela.
- Mostrar no painel, abaixo da missão cumprida, "Extras de hoje: N tarefas · X min" (tarefas concluídas hoje fora da foto), calculado — nada guardado.
- Não alterar a foto do dia; a missão de amanhã naturalmente começa depois das extras (regra do motor já existente). Se precisar de função nova no motor (src/lib/plano), use só a API existente (primeiraPendente(plano.tarefas, dados) etc.); se faltar algo, reporte em vez de editar src/lib/plano.
- Fila esgotada: mantém "Plano cumprido — revise".
- e2e: cumprir a missão (8 tarefas com relógio fixo), Continuar → abre a 9ª tarefa da fila com cronômetro; concluir; "Extras de hoje: 1"; % do plano sobe; dia seguinte começa na 10ª; identidade dos dias intacta; feed mostra Continuar.
