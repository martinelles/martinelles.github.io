---
work_package_id: WP01
title: Importação do vault
dependencies: []
requirement_refs:
- C-004
- C-005
- FR-004
- FR-006
- FR-016
- NFR-005
- NFR-008
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-feed-estudo-cgu-01M3S6H8
base_commit: d9885b75ba62702a7c11296c8bfc2d12104bf8ff
created_at: '2026-09-30T13:43:06.709990+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
phase: Fase 1 - Conteúdo e motor
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "2316"
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: scripts/importar/
execution_mode: code_change
owned_files:
- scripts/importar/**
- tests/unit/importar/**
- package.json
tags: []
---

# WP01 – Importação do vault

## Objetivo

Script Node, sem dependência nova, que lê as fontes do vault da dona e escreve o conteúdo do
feed em `static/conteudo/` (índice, matérias, lotes), de forma determinística e com relatório.
**Este WP não commita a saída** (quem roda e commita a importação real é o WP02); os testes usam
fixtures pequenas em `tests/unit/importar/fixtures/`.

## Contexto

- Spec: FR-004, FR-006, FR-007, FR-016, NFR-005, NFR-008, C-004, C-005.
- `research.md` R0 (formato real das fontes), R1, R2, R3, R6, R7; `data-model.md` (Post, Questão, Lei, Resumo, Flashcard, Matéria, Índice); `contracts/conteudo-importado.schema.json`; `contracts/feed-conteudo.md`.
- Vault: `C:\Users\martinelle.santos\OneDrive - mtegovbr\00. vault\Estudo\cgu` (Git Bash: `/c/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu`). **Só leitura** (C-005). Pastas: `catalogo-questoes/questoes.csv`, `leis-secas/*.md`, `flashcards/*.csv`, `feed-conteudo/` (ainda não existe — o importador deve tolerar a ausência).
- Charter: sem dependência de runtime; aqui nem devDependency nova, salvo se o parser próprio falhar em caso real (registrar).

## Branch Strategy

Planejamento em `main`; merge em `main`; worktree pela lane de `lanes.json`.
`spec-kitty agent action implement WP01 --agent <nome>`.

## Subtarefas

### T001 — `csv.mjs` e `frontmatter.mjs`

- `lerCsv(texto, { cabecalho = true })` → array de objetos (ou de arrays sem cabeçalho). RFC 4180: campos entre aspas, `""` como aspa, vírgula e quebra de linha dentro de aspas, `\r\n` e `\n`, BOM no início removido.
- `lerFrontmatter(texto)` → `{ dados, corpo }`: bloco `---` inicial com `chave: valor`, valores com aspas duplas, `true`/`false`, números, datas como string. Sem suporte a YAML aninhado (não precisa).
- Testes: casos do R0 (BOM, campo com `|` e aspas tipográficas, célula com quebra de linha), frontmatter válido, ausente e malformado (erro com número da linha).

### T002 — `materias.mjs`

- Lista das matérias do catálogo (ler os nomes reais distintos da coluna `materia` do `questoes.csv` do vault e fixar a tabela no código) com `id` (slug sem acento), `nome` (igual ao catálogo), `abrev` (≤ 10 caracteres, legível: "Dados", "Seg. Info", "Const.", "Adm.", "AFO", "Auditoria", "Português"…) e `ordem` (TI: Ciência de Dados = 1, depois as outras TI, depois as demais; empate resolvido por total de posts na fatia).
- `LEI_PARA_MATERIA`: arquivo de `leis-secas/` → id de matéria, conforme `data-model.md`. Conferir cada arquivo real (25 + índice) e cobrir todos; `00-INDICE.md` é ignorado.
- `materiaPorNome(nome)` lança erro claro para nome desconhecido.

### T003 — `questoes.mjs`

- Entrada: linhas do CSV. Descarta `situacao === 'anulada'` e gabarito vazio (conta no relatório por motivo).
- `prova` a partir de `id_prova`: prefixo `CGU`/`TCU`, ano de 4 dígitos, resto vira `cargo` legível (`AFFC-TI` → "AFFC TI", `P3-TI-DES` → "Prova 3 · TI Desenv.", `TFFC` → "TFFC"). Tabela de rótulos explícita para os ids reais; id desconhecido → rótulo cru, com aviso.
- `textoBase`: se o enunciado começa com `[`, tudo até o `]` correspondente (sem os colchetes); o resto é `enunciado`.
- `formato`: `ce` se gabarito ∈ {C, E} e não há alternativas; `me` se há alternativas (partir em ` | `, prefixo `(X) `). Gabarito `C` com alternativas é **me** (letra C) — cuidado.
- `id`: `q:<id do catálogo>`. `materia`: pela tabela do T002. Gabarito copiado sem transformação (NFR-008).

### T004 — `lei-seca.mjs`

Seguir R6 à risca:
- Cabeçalho do arquivo (título `# …`, linhas `> Fonte oficial:` e `> Baixado em:`) vira `norma.titulo` e `fonte`.
- Artigo: começa em linha que casa `^(\*\*)?Art\.\s*\d+` (inclui `Art. 5º`, `Art. 10.`, `Art. 1°-A`); termina antes do próximo artigo ou cabeçalho `#`. Rótulo `"Art. 5º"`.
- Descartar artigo cujo caput está revogado/vetado inteiro (`(Revogado`, `(VETADO)`, `(Revogada`); dentro de artigo vigente, linhas revogadas ficam, com índice em `revogados`.
- `telas`: se o texto do artigo tem > 700 caracteres, quebrar em telas ≤ 700 em fronteira de linha (parágrafo, inciso, alínea); nunca quebrar no meio de linha, exceto linha única > 700 (quebrar em fim de frase).
- Normas sem `Art.` (MOT 2017, IN SFC 3/2017): trechos por item numerado `^\d+(\.\d+)*\s`; rótulo "Item 2.3"; se < 10 trechos, pular o arquivo com aviso.
- `id`: `l:<nome do arquivo sem .md>:<rótulo em slug>` (ex.: `l:06-Lei-12527-2011-LAI:art-7`); rótulo repetido no mesmo arquivo (ex.: artigos renumerados) ganha sufixo `-2`.

### T005 — `feed-conteudo.mjs` e `baralhos.mjs`

- `feed-conteudo/resumos/*.md` e `feed-conteudo/flashcards/*.md` no formato de `contracts/feed-conteudo.md`. Validações do contrato; arquivo inválido é recusado e listado no relatório, os demais seguem.
- Resumo: `#` = título; cada `##` = tela (`titulo` = texto do `##`, `texto` = corpo até o próximo `##`). Id `r:<nome do arquivo sem .md>`.
- Flashcards: pares `P:`/`R:`; id `f:<arquivo>:<n>` (n a partir de 1, na ordem do arquivo).
- **Checagem C-004**: em resumo cuja `fonte` cita um arquivo de `leis-secas/`, todo `Art. N` mencionado no texto precisa existir entre os artigos importados daquele arquivo; senão, recusar o arquivo com a lista dos artigos inexistentes.
- `baralhos.mjs`: `flashcards/*.csv` sem cabeçalho (`pergunta,resposta`); matéria pelo nome do arquivo (tabela: `LGPD Flashcards.csv` → matéria da LGPD; `Auditoria Governamental Flashcards.csv` → Fundamentos de Auditoria Governamental); `conferido: false`; `fonte.rotulo` = "Baralho <nome>"; id `f:baralho:<slug>:<n>`.

### T006 — `fatiar.mjs`, `index.mjs`, relatório, script npm

- Agrupar posts por matéria; dentro da matéria, ordem estável por id; lotes com tamanho **gzip** ≤ 150 KB (medir com `zlib.gzipSync`); nomes `lote-<materia>-<n>.json`.
- `indice.json` (`versao: 1`, `geradoEm` = data do arquivo mais recente entre as fontes, **não** `Date.now()` — saída determinística), `materias.json` com `total`.
- Escrever em diretório temporário e trocar pelo destino só no fim (sem vault ou com erro fatal, a saída anterior fica intacta).
- Relatório no stdout: totais por tipo e por matéria, descartes por motivo, arquivos recusados, avisos; código de saída ≠ 0 só em erro fatal.
- CLI: `node scripts/importar/index.mjs [--vault <dir>] [--saida static/conteudo]`; `--vault` > `PAINEL_VAULT` > caminho padrão. `package.json`: `"importar": "node scripts/importar/index.mjs"` — **só essa linha** muda no `package.json`.
- Teste de ponta a ponta com um vault de fixture (2 leis, 10 questões, 1 resumo, 1 flashcard, 1 baralho): saída casa com `contracts/conteudo-importado.schema.json` (validar com checagem própria nos testes, sem Ajv), duas execuções geram bytes idênticos, contagem do relatório = entradas do índice.
- Rodar **uma vez contra o vault real** e colar no histórico do WP o relatório (totais e descartes). Não commitar `static/conteudo/`.

## Definition of Done

- [ ] Portas do charter passam (o e2e existente deve continuar verde — este WP não toca o app).
- [ ] Execução real: ~1.928 questões importadas, descartes batendo com o catálogo (anuladas + sem gabarito), todas as leis com `Art.` importadas, MOT/IN SFC 3 importadas ou puladas com aviso, 140 flashcards dos baralhos.
- [ ] Nenhum lote > 150 KB gzip; saída determinística.
- [ ] Nada escrito no vault.

## Riscos

- Caracteres especiais no CSV (aspas tipográficas, `|` dentro de alternativa): testar com linhas reais copiadas para a fixture.
- Constituição com 514 artigos e emendas: artigos com `-A`, `-B`; ADCT tem numeração própria (prefixar rótulo com "ADCT" quando depois do cabeçalho do ADCT).

## Guia do revisor

Rodar `npm run importar -- --saida /tmp/x` contra o vault, conferir relatório, abrir um lote e comparar 5 questões e 3 artigos com a fonte; conferir determinismo com `diff -r` entre duas execuções.

## Activity Log

- 2026-09-30T13:43:09Z – claude:opus:implementer:implementer – shell_pid=24184 – Assigned agent via action command
- 2026-09-30T14:02:34Z – claude:opus:implementer:implementer – shell_pid=24184 – Importação real (vault 2026-09-30, saída em temp, não commitada): 4111 posts = 1928 questões + 2043 artigos/itens de lei + 0 resumos + 140 flashcards de baralho. Descartes: 69 anuladas, 100 sem gabarito (TCU2026 itens 1-100), 154 artigos com caput revogado/vetado. Recusados 0, pulados 0. MOT 2017 importado por itens (165); IN SFC 3/2017 só com os 4 Art. (anexo-referencial avisado, 81.914 caracteres). 24 lotes, maior 140,0 KB gzip (zlib nível 6; GNU gzip -6 dá 144.124 B). Duas execuções: diff -r vazio. Desvios: alvo de empacotamento 140 KB (margem para outros compressores, teto 150 KB mantido); rótulo 'Anexo N Art. X' para artigos de anexo (além do 'ADCT' pedido); linhas de PDF emendadas em parágrafo nos arquivos marcados 'PDF oficial'; tests/unit/importar/node-minimo.d.ts declara as APIs do Node usadas em vez de adicionar @types/node (projeto não tem).
- 2026-09-30T14:02:43Z – claude:opus:implementer:implementer – shell_pid=24184 – Ready for review: importador + 71 testes do WP (124 no total); check/test/build/e2e verdes
- 2026-09-30T14:03:18Z – claude:opus:reviewer:reviewer – shell_pid=21564 – Started review via action command
- 2026-09-30T14:08:33Z – claude:opus:reviewer:reviewer – shell_pid=21564 – Moved to planned
- 2026-09-30T14:09:19Z – claude:opus:implementer:implementer – shell_pid=2316 – Started implementation via action command
