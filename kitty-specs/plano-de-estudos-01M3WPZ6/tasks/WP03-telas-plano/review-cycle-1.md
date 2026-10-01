---
affected_files: []
cycle_number: 1
mission_slug: plano-de-estudos-01M3WPZ6
reproduction_command:
reviewed_at: '2026-10-01T23:38:38Z'
reviewer_agent: unknown
verdict: rejected
wp_id: WP03
---

# Pedido de mudança (emenda D4, aprovada pela dona em 2026-10-02) — não é defeito

Leia a emenda em kitty-specs/plano-de-estudos-01M3WPZ6/spec.md (D4, FR-013..FR-015) no checkout principal (main). WP01 e WP02 serão refeitos antes; espere-os aprovados e mesclados na sua lane.

T018:
- Missão do dia e tela da tarefa mostram o modo ("Leitura" / "Questões") e o bloco (Básicos/Específicos/Especializados) — texto, não só cor.
- Atalho por modo: Questões ⇒ `/?materia=<m>&tipo=questao`; Leitura ⇒ `/?materia=<m>` (lei seca/resumos da matéria).
- "Concluir tarefa": campos de questões só na tarefa de Questões.
- "O que fazer" por modo (Leitura: estudar o tópico e anotar dúvidas; Questões: N itens C/E do tópico e lançar acertos).
- Exportação: botão inalterado; conferir o CSV agregado por tópico.
- e2e e medições atualizados (missão de 3 h = 8 tarefas com 25/20).
- Correção pedida pela dona junto: a aba inferior em /tarefa/* deve destacar "Painel" — o layout não é seu; se não puder tocar, registre e eu faço depois do merge.
