---
work_package_id: WP01
title: Importação do plano
dependencies: []
requirement_refs:
- C-001
- C-004
- FR-001
- NFR-005
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-plano-de-estudos-01M3WPZ6
base_commit: 8aeefb11a85f767efafdf7efd4fa52ddb25574e8
created_at: '2026-10-01T21:51:45.782280+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
phase: Fase 1
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "31316"
history:
- timestamp: '2026-10-01T21:50:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: scripts/importar/
execution_mode: code_change
owned_files:
- scripts/importar/plano.mjs
- scripts/importar/index.mjs
- tests/unit/importar/plano.test.ts
- tests/unit/importar/fixtures/plano/**
- static/conteudo/**
tags: []
---

# WP01 – Importação do plano

## Objetivo
Estender o importador (`npm run importar`) para gerar `static/conteudo/plano.json` a partir do
`ESTUDO.csv` do vault, no formato de `contracts/plano.schema.json`, e commitar a saída real.

## Contexto
- Spec FR-001, NFR-005, C-001, C-004; `plan.md` "Design › plano.json"; `research.md` R1, R5; `data-model.md` "Plano".
- Vault (só leitura, exceto criar `feed-conteudo/plano.md`): `…/00. vault/Estudo/cgu/ESTUDO.csv` (UTF-8 com BOM; colunas `id,disciplina,topico,peso,status,questoes_feitas,questoes_certas,ultima_sessao,proxima_revisao,data_conferido,fonte,obs,taxa_acerto,prioridade,situacao`; 242 linhas; 6 com `obs` iniciado por `CORTADO`).
- Reaproveitar `csv.mjs`, `frontmatter.mjs`, `materias.mjs` (só leitura destes — não edite: não são deste WP) e o padrão de saída determinística/temporária do `index.mjs`.

## Branch Strategy
Planejamento e merge em `main`; worktree pela lane. `spec-kitty agent action implement WP01 --agent <nome>`.

## Subtarefas

### T001 — `scripts/importar/plano.mjs`
- `importarPlano({ csvTexto, parametros, mtime })` → `{ plano, relatorio }`.
- Filtra `status !== 'dominado'` e `obs` que **não** começa com `CORTADO`; ordena por `prioridade` (número) desc, empate por `id` asc.
- `DISCIPLINA_PARA_MATERIA` (constante neste arquivo): mapear as 13 disciplinas reais do `ESTUDO.csv` (conferir os nomes no arquivo) para ids de matéria do feed (`materias.mjs`); ex.: Ciência de Dados e Bancos de Dados → `ti-ciencia-de-dados`; Desenvolvimento de Sistemas → `ti-desenvolvimento-e-engenharia-de-software`; Infraestrutura Tecnológica → `ti-infraestrutura-redes-e-sistemas-operacionais`; Segurança da Informação → `ti-seguranca-da-informacao`; Administração Pública e Políticas Públicas → `adm-publica-politicas-publicas-e-adm-geral`; Administração Financeira e Orçamentária → `adm-financeira-e-orcamentaria`; Controladoria-Geral da União… → `cgu-correicao-integridade-e-leniencia`; as demais pelo nome. Sem mapa ⇒ `materia: null` + aviso.
- Tarefa: `{ id, disciplina, materia, topico, minutos, prioridade, status }`.

### T002 — Parâmetros
- Ler `feed-conteudo/plano.md` (frontmatter `inicio`, `fim`, `horas_por_dia`, `minutos_por_tarefa`); ausente ⇒ padrão `2026-10-01`, `2026-12-20`, `3`, `45`. Validar (datas reais, `inicio ≤ fim`, números > 0); inválido ⇒ erro fatal com mensagem clara.

### T003 — `index.mjs`
- Chamar `importarPlano` junto das demais fontes; escrever `plano.json` no mesmo diretório temporário e trocar no fim; `geradoEm` = mtime do `ESTUDO.csv` (determinístico); seção "Plano" no relatório (tarefas, excluídas por dominado/cortado, sem matéria, parâmetros usados). `ESTUDO.csv` ausente ⇒ aviso e sem `plano.json` (não falha o resto).

### T004 — Testes (`tests/unit/importar/plano.test.ts`, fixtures em `fixtures/plano/`)
Filtro (dominado, cortado), ordenação e empate, mapa de disciplinas (todas as 13 reais mapeadas — o teste lê os nomes da fixture copiada do cabeçalho real), parâmetros padrão e do arquivo, parâmetros inválidos, saída casa com o schema (checagem própria, sem Ajv), determinismo.

### T005 — Saída real
- Criar no vault `feed-conteudo/plano.md` com os valores de D2 e um parágrafo explicando os campos (única escrita no vault).
- `npm run importar`; conferir: ~236 tarefas, 0 sem matéria (ou listar), `plano.json` ≤ 50 KB gzip; rodar 2× sem diff; commitar `static/conteudo/plano.json` (e só ele dentro de `static/conteudo/`, a menos que o resto tenha mudado por causa do vault — se mudou, commitar também e dizer o que mudou).

## Definition of Done
- [ ] Portas do charter passam; `plano.json` real commitado e determinístico; relatório colado no histórico.

## Guia do revisor
Conferir 10 tarefas contra o `ESTUDO.csv` (ordem, filtro, matéria); ver que INF-14..19 estão fora.

## Activity Log

- 2026-10-01T21:51:49Z – claude:opus:implementer:implementer – shell_pid=31316 – Assigned agent via action command
