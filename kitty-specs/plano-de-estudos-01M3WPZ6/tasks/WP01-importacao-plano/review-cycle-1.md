---
affected_files: []
cycle_number: 1
mission_slug: plano-de-estudos-01M3WPZ6
reproduction_command:
reviewed_at: '2026-10-01T23:38:25Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP01
---

# Pedido de mudança (emenda D4, aprovada pela dona em 2026-10-02) — não é defeito

Leia a emenda em kitty-specs/plano-de-estudos-01M3WPZ6/spec.md (D4, Definições › Tarefa, FR-013..FR-015, Premissas › blocos), data-model.md (Tarefa + "Emenda D4") e contracts/plano.schema.json (atualizado). Tudo no checkout principal (main), não na lane.

T016:
- Cada tópico da fila gera duas tarefas consecutivas: `<id>:L` (modo `leitura`, `minutosLeitura`) e `<id>:Q` (modo `questoes`, `minutosQuestoes`), com `topicoId`, `bloco` e os demais campos repetidos.
- `bloco` por disciplina conforme a tabela da Premissa da spec (constante DISCIPLINA_PARA_BLOCO; disciplina sem bloco ⇒ erro claro).
- Parâmetros: `minutos_leitura` e `minutos_questoes` em `feed-conteudo/plano.md` (padrão 25 e 20); `minutos_por_tarefa` deixa de existir (se presente, aviso e ignorar). Atualize `feed-conteudo/plano.md` no vault com as duas chaves novas (única escrita permitida).
- Reimportar e commitar `static/conteudo/plano.json` (472 tarefas esperadas); testes atualizados; determinismo.
