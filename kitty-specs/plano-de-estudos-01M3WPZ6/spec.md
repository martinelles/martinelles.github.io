# Especificação: Plano de Estudos

**Missão**: `plano-de-estudos-01M3WPZ6` · **Tipo**: software-dev
**Criada**: 2026-10-01 · **Branch de planejamento e de merge**: `main`
**Base**: `main` com o feed (`feed-estudo-cgu-01M3S6H8`) e a identidade visual (`identidade-visual-aventura-kindle-01M3T7H9`) já mesclados

## Visão geral

O app ganha a visão do **plano de estudos** até a prova: quanto do plano já foi feito em horas,
tarefas e dias, e a **missão do dia** — as tarefas de hoje, o tempo estimado, quanto já foi feito
e um botão para começar a estudar.

**Por quê**: o feed resolve o "estudar em momentos curtos"; falta o fio do plano — saber se o
ritmo dá conta de chegar à prova com o edital coberto, e ter uma única ação clara ao abrir o app.

## Decisões da dona (2026-10-01)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Onde mora o progresso (horas estudadas, tarefas feitas) | **No app**, com exportação para ela lançar no `ESTUDO.csv`; o plano (tarefas previstas) vem do `ESTUDO.csv` pela importação |
| D2 | Janela do plano | **01/10/2026 a 20/12/2026, 3 h por dia** (data-alvo estimada na planilha dela: prova em D+60 do edital) |
| D4 | Emenda (2026-10-02): estrutura de tarefa da planilha `material/plano-estudos-gerado.xlsx` | Cada tópico vira **duas tarefas concretas** — **Leitura** e **Questões** — com **bloco** (Básicos, Específicos, Especializados); a planilha não volta a ser fonte, o `ESTUDO.csv` continua a única |
| D5 | Emenda (2026-10-02): depois da missão cumprida | Deve ser possível **continuar estudando**: a próxima tarefa pendente da fila, além da missão do dia |
| D3 | Pedido literal | horas totais e já estudadas; porcentagem concluída e barra de progresso; dias no plano, em aberto, concluídos e restantes; missão do dia com botão para iniciar estudos, quantidade de tarefas, tempo estimado e porcentagem da tarefa do dia realizada |

## Definições

- **Tarefa** (emenda D4): uma ação concreta sobre um tópico do edital (`ESTUDO.csv`), em um de dois **modos**: **Leitura** (estudar o tópico; padrão 25 min) ou **Questões** (itens C/E do tópico; padrão 20 min). Cada tópico gera as duas, com a de Questões logo depois da de Leitura na fila. Toda tarefa traz o **bloco** do tópico (Básicos, Específicos ou Especializados), estimado por disciplina até o edital sair.
- **Fila do plano**: os tópicos ainda não dominados e não cortados, na ordem de prioridade do `ESTUDO.csv`. Tópico com `obs` iniciada por `CORTADO` fica fora.
- **Missão do dia**: as próximas tarefas pendentes da fila que cabem nas 3 h do dia. Tarefa não feita **não se perde**: amanhã a missão começa por ela (ciclo por horas, não por dia da semana).
- **Dia concluído**: dia do plano em que a missão foi cumprida (todas as tarefas da missão marcadas como feitas).
- **Dia em aberto**: dia do plano que já passou (antes de hoje) sem a missão cumprida.
- **Dias restantes**: de hoje (inclusive) até 20/12/2026, sem contar hoje se a missão de hoje já foi cumprida.
- Os quatro números fecham: **concluídos + em aberto + restantes = dias no plano**.
- **Horas totais do plano**: dias no plano × 3 h. **Horas estudadas**: soma do tempo cronometrado no app.
- **% concluída do plano**: tarefas concluídas ÷ tarefas da fila no início do plano.

## Cenários de uso e testes

### Cenário 1 — Ver o plano (P1)

**Aceite**
1. **Dado** o painel, **então** aparecem: horas estudadas / horas totais (ex.: "12 h de 243 h"), a porcentagem concluída e uma barra de progresso proporcional.
2. **Dado** o painel, **então** aparecem os quatro números de dias: no plano (81), concluídos, em aberto e restantes, e concluídos + em aberto + restantes = dias no plano.
3. **Dado** nenhum estudo registrado, **então** os números mostram zero, sem valor inventado.

### Cenário 2 — Missão do dia (P1)

**Aceite**
1. **Dado** um dia do plano, **então** a missão mostra a quantidade de tarefas, o tempo estimado total e a porcentagem já feita da missão.
2. **Dado** a missão, **então** cada tarefa mostra disciplina, tópico (texto do edital), tempo estimado e o que fazer (estudar + questões).
3. **Dado** uma tarefa não feita ontem, **então** ela abre a missão de hoje.
4. **Dado** todas as tarefas do dia feitas, **então** a missão mostra "Missão cumprida" e o dia conta como concluído.

### Cenário 3 — Iniciar estudos (P1)

**Aceite**
1. **Dado** a missão com tarefa pendente, **quando** a pessoa toca "Iniciar estudos", **então** abre a primeira tarefa pendente com o cronômetro correndo.
2. **Dado** a tarefa aberta, **então** há atalho para o feed filtrado na matéria da tarefa (questões, lei seca, resumos daquele assunto).
3. **Dado** o cronômetro, **quando** a pessoa pausa, retoma ou conclui a tarefa, **então** o tempo vai para as horas estudadas; fechar o app com o cronômetro correndo não perde o tempo já corrido.
4. **Dado** a tarefa concluída, **então** a pessoa pode lançar quantas questões fez e acertou (opcional) e a porcentagem da missão sobe.

### Cenário 4 — Exportar o progresso (P2)

**Aceite**
1. **Dado** o painel, **quando** a pessoa toca "Exportar progresso", **então** baixa um arquivo com, por tarefa feita: id do tópico, data, minutos, questões feitas e certas — no formato das colunas do `ESTUDO.csv`.
2. **Dado** o arquivo exportado, **então** ela consegue lançar no `ESTUDO.csv` sem redigitar.

### Casos de borda

- Hoje antes de 01/10 ou depois de 20/12: o painel mostra o plano como "ainda não começou" ou "encerrado", sem números negativos.
- Fila esgotada antes de 20/12: a missão vira "Plano cumprido — revise" e aponta as revisões.
- Armazenamento indisponível: o cronômetro funciona na sessão e o aviso de progresso não salvo (já existente) aparece.
- Relógio do aparelho muda de dia com o cronômetro correndo: o tempo conta para o dia em que a tarefa começou.
- Tópico da fila que sumiu do `ESTUDO.csv` numa nova importação: o progresso já registrado continua contando.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | A importação gera o plano a partir do `ESTUDO.csv`: fila de tarefas (tópico, disciplina, texto, tempo estimado, prioridade), excluindo dominados e cortados, e os parâmetros do plano (início, fim, horas por dia). | Proposto |
| FR-002 | O painel mostra horas estudadas e horas totais do plano. | Proposto |
| FR-003 | O painel mostra a porcentagem concluída do plano e uma barra de progresso proporcional e acessível. | Proposto |
| FR-004 | O painel mostra dias no plano, dias concluídos, dias em aberto e dias restantes, conforme as Definições. | Proposto |
| FR-005 | A missão do dia lista as próximas tarefas pendentes que cabem nas horas do dia, com quantidade de tarefas, tempo estimado total e porcentagem feita. | Proposto |
| FR-006 | Tarefa não feita passa para a missão do dia seguinte. | Proposto |
| FR-007 | O botão "Iniciar estudos" abre a primeira tarefa pendente com cronômetro; pausar, retomar e concluir registram o tempo. | Proposto |
| FR-008 | A tela da tarefa tem atalho para o feed filtrado pela matéria da tarefa. | Proposto |
| FR-009 | Ao concluir, a pessoa pode registrar questões feitas e certas da tarefa. | Proposto |
| FR-010 | Todo o progresso (tarefas feitas, tempos, questões) persiste no aparelho e sobrevive a fechar o app, inclusive com cronômetro correndo. | Proposto |
| FR-011 | O progresso pode ser exportado num arquivo compatível com as colunas do `ESTUDO.csv`. | Proposto |
| FR-012 | A tela inicial (feed) mostra um acesso curto à missão do dia (quantas tarefas faltam e o botão de iniciar). | Proposto |
| FR-013 | (D4) Cada tópico da fila gera duas tarefas — Leitura e Questões — nessa ordem, com minutos próprios configuráveis no arquivo de parâmetros. | Proposto |
| FR-014 | (D4) Toda tarefa mostra o modo e o bloco; a tarefa de Questões leva ao feed filtrado em questões da matéria, a de Leitura ao feed filtrado em lei seca/resumos da matéria; só a tarefa de Questões pede questões feitas/certas ao concluir. | Proposto |
| FR-015 | (D4) A exportação agrega por tópico (uma linha por `id` do `ESTUDO.csv`), somando minutos das duas tarefas e trazendo questões da tarefa de Questões; `status_sugerido` = `estudado` só quando as duas estiverem concluídas. | Proposto |
| FR-016 | (D5) Com a missão do dia cumprida, o painel, a chamada no feed e a tela da tarefa concluída oferecem "Continuar estudando", que abre a próxima tarefa pendente da fila (fora da missão) com o cronômetro; tarefas extras contam em horas e % do plano, não mudam a foto do dia, e a missão do dia seguinte começa depois delas. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Painel com o plano aberto | ≤ 1 s nas visitas seguintes à primeira | Proposto |
| NFR-002 | Precisão do cronômetro | erro ≤ 1 s por hora; sem perda ao fechar e reabrir | Proposto |
| NFR-003 | Acessibilidade | barra de progresso e cronômetro anunciados por leitor de tela; Lighthouse acessibilidade ≥ 90 | Proposto |
| NFR-004 | Visual | segue os três temas existentes (Aventura, Kindle, Kindle escuro), sem rolagem horizontal de 360 a 1440 px, alvos ≥ 44 px | Proposto |
| NFR-005 | Peso | plano importado ≤ 50 KB comprimido | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | O app não escreve no vault; o `ESTUDO.csv` continua sendo a fonte do estado do edital e só muda pela mão dela (com ajuda do arquivo exportado). | Aceita |
| C-002 | Sem servidor nem conta (charter). | Aceita |
| C-003 | Números de progresso sempre calculados a partir dos registros, nunca guardados prontos. | Aceita |
| C-004 | Janela e horas por dia ficam no plano importado, mudáveis sem tocar no código, para quando o edital sair. | Aceita |

## Entidades

- **Plano**: início, fim, horas por dia, minutos por tarefa, fila de tarefas (gerado na importação).
- **Tarefa**: id (`<id do tópico>:L` ou `:Q`), id do tópico, modo, bloco, disciplina, matéria do feed, texto do tópico, minutos estimados, prioridade.
- **Registro de estudo** (aparelho): tarefa, dia, intervalos cronometrados, concluída em, questões feitas/certas.

## Critérios de sucesso

- SC-001: Ao abrir o painel, a pessoa sabe em ≤ 5 s quanto do plano fez e o que fazer hoje.
- SC-002: Do toque em "Iniciar estudos" até estar estudando a tarefa: 1 toque.
- SC-003: Os números do painel batem com os registros (soma das horas, tarefas e dias recalculados à mão numa amostra).
- SC-004: Fechar e reabrir o app no meio de uma tarefa não perde tempo nem tarefas feitas.
- SC-005: O arquivo exportado é lançado no `ESTUDO.csv` sem redigitar.

## Premissas

- A fila sai do `ESTUDO.csv` atual: 242 tópicos, 6 cortados (INF-14 a INF-19, decisão de 2026-09-30).
- 25 + 20 min por tópico e 3 h por dia dão 4 tópicos (8 tarefas) por missão, o mesmo ritmo do `HOJE.md`.
- Blocos por disciplina (estimativa até o edital): **Básicos** — Língua Portuguesa, Língua Inglesa, Administração Pública e Políticas Públicas, Administração Financeira e Orçamentária, Controladoria-Geral da União; **Específicos** — Direito Constitucional, Direito Administrativo, Fundamentos de Auditoria Governamental, Desenvolvimento de Sistemas, Infraestrutura Tecnológica, Segurança da Informação; **Especializados** — Ciência de Dados, Bancos de Dados.
- O plano inclui o tempo de questões dentro da tarefa; revisões espaçadas continuam no `REVISOES.md` do vault (fora desta missão).
- A data da prova continua "Data a definir" no cabeçalho; a data-fim do plano é a estimativa de 20/12/2026.

## Fora de escopo

Escrever no `ESTUDO.csv` automaticamente; revisão espaçada dentro do app; metas semanais;
notificações; sincronização entre aparelhos; replanejamento automático quando o ritmo atrasa
(o painel mostra o atraso; replanejar é decisão dela).
