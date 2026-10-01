---
affected_files: []
cycle_number: 1
mission_slug: plano-de-estudos-01M3WPZ6
reproduction_command:
reviewed_at: '2026-10-01T23:38:32Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP02
---

# Pedido de mudança (emenda D4, aprovada pela dona em 2026-10-02) — não é defeito

Leia a emenda em kitty-specs/plano-de-estudos-01M3WPZ6/spec.md (D4, Definições › Tarefa, FR-013..FR-015), data-model.md ("Emenda D4"), contracts/plano.schema.json e contracts/registro.md (exportação agregada) — no checkout principal (main).

T017:
- Tipos: Tarefa ganha `topicoId`, `modo` ('leitura'|'questoes'), `bloco`; Plano troca `minutosPorTarefa` por `minutosLeitura`/`minutosQuestoes`; `validarPlano` atualizado.
- Missão: mesma regra (soma de minutos ≤ horasPorDia·60), agora com tarefas de 25/20 min; não separar `:L` de `:Q` do mesmo tópico na borda da missão se couber (se a `:Q` não couber, ela abre a missão seguinte — documente).
- `registro.concluir` com questões só é aceito em tarefa `:Q` (em `:L`, questões ⇒ RangeError).
- `exportarCsv`: uma linha por tópico (topicoId), minutos somados das duas tarefas, questões da `:Q`, `status_sugerido` = `estudado` só se `:L` e `:Q` concluídas; ordem pela primeira conclusão do tópico.
- Testes atualizados (fixtures com `:L`/`:Q`), identidade dos dias mantida.
