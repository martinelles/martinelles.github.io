# Research: Feed de Estudo CGU

Conferido em 2026-09-30 contra os arquivos do vault `…/00. vault/Estudo/cgu/` e o código de `main` (`0442f98`).

## R0 — Fontes e o que elas trazem

- **Questões** — `catalogo-questoes/questoes.csv`, UTF-8 com BOM, colunas `id,id_prova,numero,materia,subtopico,topico_estudo,enunciado,alternativas,gabarito,situacao,pagina,data_conferido,obs`. 2.097 linhas; 1.928 não anuladas e com gabarito (1.458 CGU, 470 TCU). Gabarito `C`/`E` (itens Cebraspe) ou `A`–`E`. Texto-base comum vem no início do `enunciado` entre colchetes (`[Julgue os itens a seguir.] …`). Alternativas numa só célula, separadas por ` | `, cada uma com prefixo `(A) `. Português e alguns enunciados longos (textos de interpretação com milhares de caracteres).
- **Lei seca** — `leis-secas/*.md`, 24 normas com `Art.` (de 3 a 514 artigos cada) + `19-MOT-CGU-2017` (sem `Art.`, cabeçalhos quebrados pela extração) + `20-IN-SFC-CGU-3-2017` (4 `Art.`, o resto em itens numerados) + `00-INDICE.md`. Marcas de revogação no texto: `(Revogado pela …)`, `(Execução suspensa …)`, `(VETADO)`. Parágrafos `§ 1º`/`§ 1°`/`Parágrafo único`, incisos `I -`, alíneas `a)`. Cabeçalho de cada arquivo traz fonte oficial e data de download.
- **Baralhos** — `flashcards/LGPD Flashcards.csv` (65) e `flashcards/Auditoria Governamental Flashcards.csv` (75): CSV sem cabeçalho, `pergunta,resposta`, formato Anki.
- **Editais verticalizados** — `editais-verticalizados/*.md` (ESAF 2004/2008/2012, FGV 2021 AFFC) com a lista de tópicos por disciplina; base para os tópicos dos resumos. O de 2026 não existe (TR 64/2026 diz que o conteúdo sai com o edital).
- **Incidência** — `incidencia-topicos-ciencia-de-dados.md` prioriza os subtópicos de Ciência de Dados.
- **Protótipo anterior** — `Documents/github/instagram-resumos` (HTML único): achados ACH-01/02/03 viraram FR-010, FR-013 e SC-007.

## R1 — Importação fora do app, conteúdo commitado

- **Decision**: script Node rodado à mão gera `static/conteudo/*.json`, que é commitado.
- **Rationale**: o app é estático e offline; o vault fica no OneDrive e não está no build de ninguém além da dona. JSON commitado dá diff revisável (NFR-008) e build reprodutível. Rodar de novo quando o catálogo crescer é um comando.
- **Alternatives**: plugin Vite lendo o vault no build (quebra o build em qualquer outra máquina e nos worktrees do Spec Kitty); copiar CSV/MD cru para `static/` e parsear no navegador (mais bytes, parse no celular, sem validação prévia).

## R2 — Parsers sem dependência

- **Decision**: CSV RFC 4180 próprio (~60 linhas: aspas, aspas duplicadas, quebra de linha dentro de campo, BOM) e frontmatter YAML restrito (chave: valor, listas simples) próprio, ambos com testes.
- **Rationale**: charter pede justificativa para cada dependência; o formato das fontes é conhecido e estreito.
- **Alternatives**: `csv-parse`, `gray-matter`/`js-yaml` como devDependencies — aceitáveis se o parser próprio falhar em caso real; registrar no histórico do WP.

## R3 — Lotes e carregamento sob demanda

- **Decision**: `indice.json` com uma entrada curta por post (`id`, `t` tipo, `m` matéria, `l` lote) ≈ 40 bytes × ~4.300 posts ≈ 170 KB bruto / ~25 KB gz, carregado ao abrir o feed; o corpo dos posts em lotes por matéria de até 150 KB gz (NFR-005), buscados quando a página do feed precisa.
- **Rationale**: a ordem do dia e os filtros precisam de todos os ids, não dos textos; o shell continua ≤ 300 KB (NFR-004).
- **Alternatives**: um JSON único (vários MB antes do primeiro post); lote por tipo (filtro por matéria buscaria todos os lotes).

## R4 — Service worker com conteúdo grande

- **Decision**: `install` faz `addAll` só do shell (`build` + ícones + manifest); em seguida, sem bloquear a instalação, grava os arquivos de `static/conteudo/` um a um, ignorando falhas; `activate` e cada abertura do app completam o que faltou. Busca de lote: cache-first.
- **Rationale**: com alguns MB, um `addAll` único falha por qualquer 404/timeout e o SW não instala; o shell é o que precisa estar garantido.
- **Alternatives**: cache em tempo de execução só dos lotes vistos (não cumpre FR-017 "todo o conteúdo offline").

## R5 — Ordem do feed

- **Decision**: embaralhamento Fisher–Yates com PRNG `mulberry32` semeado por hash de `AAAA-MM-DD` + filtro; depois intercalação round-robin por tipo na proporção questão 3 : lei 2 : resumo 1 : flashcard 2, até esgotar cada fila. Página = 10 posts. Sessão guarda ids mostrados por filtro; nunca repete (FR-010); ao esgotar, `FimDoFeed`.
- **Rationale**: determinística no dia (FR-011), testável como função pura, sem repetição por construção (é uma permutação).
- **Alternatives**: aleatório a cada abertura (instável, dificulta teste); ordem fixa (cansa).

## R6 — Lei seca em posts

- **Decision**: um post por artigo (`Art. N` até o próximo `Art.`/cabeçalho); incisos, parágrafos e alíneas preservados em linhas. Artigo integralmente revogado/vetado é descartado; dispositivo revogado dentro de artigo vigente fica, riscado (classe CSS) com a nota. Artigo com mais de 700 caracteres vira carrossel: telas quebradas em fronteira de parágrafo/inciso, alvo ≤ 700 caracteres por tela. Normas sem `Art.` (MOT 2017, IN SFC 3/2017): trechos por item numerado (`^\d+(\.\d+)*\s`); se o arquivo render menos de 10 trechos válidos, é pulado com aviso no relatório.
- **Rationale**: FR-006 pede artigo integral; carrossel preserva o texto sem truncar.

## R7 — Resumos e flashcards gerados

- **Decision**: um arquivo Markdown por tópico em `feed-conteudo/resumos/` e `feed-conteudo/flashcards/` ([contracts/feed-conteudo.md](contracts/feed-conteudo.md)). 1ª leva: TI: Ciência de Dados (12 resumos, 80 flashcards, pelos subtópicos da incidência), TI: Segurança da Informação e TI: Governança/Contratações de TI (6 resumos e 40 flashcards cada), LGPD e LAI a partir da lei seca (4 resumos, 30 flashcards cada), e Auditoria (3 resumos). Mais os 140 cartões dos dois baralhos existentes, importados direto do CSV. Total ≈ 37 resumos, ≈ 360 flashcards.
- **Rationale**: foco D6 primeiro; leis com texto no vault permitem fonte verificável (C-004).
- Regras: todo resumo cita fonte (arquivo e artigo, ou item do edital); resumo de tema jurídico só cita dispositivo que existe no arquivo de lei seca (verificado por teste da importação: todo `Art. N` citado precisa existir no post de lei correspondente); `conferido: false` sempre na geração.

## R8 — Interações e estatísticas

- **Decision**: um objeto versionado em `localStorage` ([contracts/interacoes.md](contracts/interacoes.md)); "vistos" guarda só os últimos 7 dias (anel cinza é do dia; limita tamanho). Estatísticas calculadas a cada leitura, nunca armazenadas.
- **Rationale**: ~2.000 respostas × ~30 bytes ≈ 60 KB, dentro do limite do `localStorage`; ACH-01 do protótipo (números fixos) proíbe número guardado.

## R9 — Duplo toque sem atrapalhar resposta

- **Decision**: curtir por duplo toque só na área de conteúdo de post que não é questão aberta (em questão ainda não respondida, só o coração); animação de coração respeita `prefers-reduced-motion`.
- **Rationale**: evita curtir ao tocar duas vezes numa alternativa.
