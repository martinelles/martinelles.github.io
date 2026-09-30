---
work_package_id: WP02
title: Conteúdo gerado e primeira importação
dependencies:
- WP01
requirement_refs:
- C-004
- C-005
- FR-007
- FR-016
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-feed-estudo-cgu-01M3S6H8
base_commit: d9885b75ba62702a7c11296c8bfc2d12104bf8ff
created_at: '2026-09-30T14:38:05.348551+00:00'
subtasks:
- T007
- T008
- T009
- T010
- T011
phase: Fase 2
assignee: ''
agent: ''
shell_pid: '2672'
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: static/conteudo/
execution_mode: code_change
owned_files:
- static/conteudo/**
- kitty-specs/feed-estudo-cgu-01M3S6H8/conteudo-gerado.md
tags: []
---

# WP02 – Conteúdo gerado e primeira importação

## Objetivo

Escrever a primeira leva de resumos e flashcards **no vault**, em
`…/Estudo/cgu/feed-conteudo/`, no formato de `contracts/feed-conteudo.md`, sempre com
`conferido: false` e fonte; depois rodar a importação do WP01 e commitar `static/conteudo/`.

## Contexto

- Spec: FR-007, C-004, C-005, D5, D6, D7; SC-003, SC-006.
- `research.md` R7 (quantidades e regras); `contracts/feed-conteudo.md` (formato e validação).
- Fontes de apoio (só leitura): `editais-verticalizados/fgv-2021-cgu-affc-edital-verticalizado.md` (tópicos de TI e Ciência de Dados), `incidencia-topicos-ciencia-de-dados.md` (prioridade dos subtópicos), `leis-secas/07-Lei-13709-2018-LGPD.md`, `leis-secas/06-Lei-12527-2011-LAI.md`, `leis-secas/19-…`, `leis-secas/20-…`, `leis-secas/21-…`, `leis-secas/23-…`, `leis-secas/24-…`, e o catálogo (`catalogo-questoes/por-materia/*.md`) para ver o que a banca cobra.
- **Escrita fora do repositório**: os arquivos do vault não entram no git. O rastro deles fica em `kitty-specs/feed-estudo-cgu-01M3S6H8/conteudo-gerado.md` (lista de arquivos, contagens, fontes, data).

## Branch Strategy

Planejamento em `main`; merge em `main`. Antes de começar, a lane deste WP precisa ter o código do WP01 (o orquestrador mescla).
`spec-kitty agent action implement WP02 --agent <nome>`.

## Subtarefas

### T007 — Estrutura e LEIA-ME
Criar `feed-conteudo/`, `feed-conteudo/resumos/`, `feed-conteudo/flashcards/` e `feed-conteudo/LEIA-ME.md` (curto: o que é a pasta, que tudo foi gerado por IA em 2026-09-30, como revisar e marcar `conferido: true`, e rodar `npm run importar` em `Documents/github/painel-concurso`). **Não** tocar em nenhum outro arquivo do vault.

### T008 — TI: Ciência de Dados (prioridade D6)
- 12 resumos e ~80 flashcards, pelos subtópicos da incidência (ordem de incidência): aprendizado supervisionado/não supervisionado, avaliação de modelos e métricas, overfitting e validação cruzada, árvores e ensembles, redes neurais e deep learning, NLP e transformers/LLM, big data e processamento distribuído (Spark), pipelines/ETL/ELT e ingestão, data lake/lakehouse/data mesh, qualidade e governança de dados (DMBOK), estatística para dados, Python/pandas.
- Resumo: 3–8 telas, cada uma ≤ 600 caracteres, linguagem direta; tela "Onde cai" com o tipo de afirmação que o Cebraspe costuma julgar (sem citar questão específica que não esteja no catálogo).
- `fonte`: item do edital FGV 2021 + arquivo de incidência. `materia: TI: Ciência de Dados` (nome exato do catálogo).

### T009 — Segurança da Informação e Governança/Contratações de TI
- 6 resumos e ~40 flashcards cada. Segurança: tríade, criptografia, certificação digital, ataques, gestão de riscos/ISO 27001–27005, IN GSI 1/2020. Governança/Contratações: COBIT, ITIL 4, IN SGD 94/2022 (e 1/2019 histórica), ETP (IN SEGES 40/2020), papéis no planejamento da contratação.
- Tema normativo: citar o arquivo de `leis-secas/` e os artigos; **todo artigo citado precisa existir no arquivo** (a importação recusa o contrário).

### T010 — LGPD, LAI e Auditoria
- LGPD e LAI: 4 resumos e ~30 flashcards cada, só com base no texto de `leis-secas/07-…` e `06-…`, citando artigos.
- Auditoria: 3 resumos (IN SFC 3/2017 e MOT 2017: tipos de serviço, independência/objetividade, planejamento baseado em riscos), fonte nos arquivos 19/20.
- Os baralhos existentes (`flashcards/*.csv`) **não** são reescritos: o importador já os traz.

### T011 — Importar e commitar
- `npm run importar` (vault padrão). Corrigir **nos arquivos gerados** qualquer recusa do relatório até zero recusas nos arquivos deste WP.
- Conferir: todo resumo/flashcard com `conferido: false`; contagens por matéria; nenhum lote > 150 KB gzip.
- Rodar de novo e confirmar saída idêntica (`git status` limpo após a 2ª execução).
- Escrever `conteudo-gerado.md`: data, lista de arquivos gerados com contagem de telas/cartões, fontes usadas, relatório da importação (totais e descartes), e a frase "Todo o conteúdo desta leva foi gerado por IA e está marcado como não conferido."
- Commitar `static/conteudo/**` e `conteudo-gerado.md` (staging por caminho).

## Definition of Done

- [ ] ≈ 37 resumos e ≈ 220 flashcards novos no vault + 140 dos baralhos no conteúdo importado.
- [ ] Zero arquivos recusados; zero artigo citado inexistente.
- [ ] `static/conteudo/` commitado, determinístico; portas do charter passam.

## Riscos

- Erro factual em conteúdo gerado: mitigado pelo selo e pela revisão da dona; **não** inventar número de artigo, data ou percentual que não esteja na fonte citada.
- OneDrive pode demorar a sincronizar arquivos novos; não depende disso.

## Guia do revisor

Ler por amostragem 5 resumos e 20 flashcards contra as fontes citadas; tentar achar artigo citado que não exista; conferir `conteudo-gerado.md` contra os arquivos no vault e contra o índice.
