# Data Model: Feed de Estudo CGU

Formato exato dos arquivos em [contracts/conteudo-importado.schema.json](contracts/conteudo-importado.schema.json);
fonte dos resumos/flashcards em [contracts/feed-conteudo.md](contracts/feed-conteudo.md);
estado do aparelho em [contracts/interacoes.md](contracts/interacoes.md).

## Post (base comum)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | estável entre importações: `q:<id do catálogo>`, `l:<arquivo>:<art>`, `r:<arquivo>`, `f:<arquivo>:<n>`, `f:baralho:<slug>:<n>` |
| `tipo` | `questao` \| `lei` \| `resumo` \| `flashcard` | |
| `materia` | id de Matéria | obrigatório |
| `subtopico` | string | opcional |
| `fonte` | `{ rotulo, arquivo?, url? }` | obrigatório em resumo e flashcard (C-004) |

### Questão (`tipo: questao`)

| Campo | Regra |
|---|---|
| `prova` | `{ orgao: 'CGU'\|'TCU', ano, cargo, banca? }` derivado de `id_prova` (ex.: `CGU2022-AFFC-TI` → CGU, 2022, AFFC TI) |
| `numero` | número na prova |
| `textoBase` | conteúdo entre colchetes no início do enunciado, sem os colchetes; opcional |
| `enunciado` | restante do enunciado |
| `formato` | `ce` (gabarito C/E) ou `me` (A–E) |
| `alternativas` | só em `me`: lista `{ letra, texto }` partida em ` \| ` e `(X) ` |
| `gabarito` | `C`/`E` ou `A`–`E`, igual ao catálogo (NFR-008) |
| `situacao` | `valida` ou `alterada` (anulada e sem gabarito são descartadas) |

Etiqueta exibida: `"{orgao} {ano} · {cargo} · Q. {numero}"`.

### Lei (`tipo: lei`)

| Campo | Regra |
|---|---|
| `norma` | `{ arquivo, titulo, numero }` (ex.: "Lei 12.527/2011 — LAI") |
| `artigo` | rótulo: "Art. 5º" ou "Item 2.3" |
| `telas` | lista de strings (1 = post simples; > 1 = carrossel), cada uma ≤ ~700 caracteres, quebra em fronteira de parágrafo/inciso |
| `revogados` | índices de linhas revogadas dentro do artigo (exibidas riscadas) |

### Resumo (`tipo: resumo`)

| Campo | Regra |
|---|---|
| `titulo` | tópico |
| `telas` | 3 a 8 `{ titulo?, texto }`; texto ≤ 600 caracteres |
| `conferido` | boolean da fonte; `false` ⇒ selo "gerado — a revisar" |

### Flashcard (`tipo: flashcard`)

| Campo | Regra |
|---|---|
| `pergunta`, `resposta` | não vazios |
| `conferido` | boolean; baralhos CSV existentes entram com `false` |

## Matéria (`materias.json`)

| Campo | Regra |
|---|---|
| `id` | slug (`ti-ciencia-de-dados`) |
| `nome` | como no catálogo ("TI: Ciência de Dados") |
| `abrev` | ≤ 10 caracteres para o story ("Dados", "Const.", "Adm.") |
| `ordem` | TI: Ciência de Dados = 1; demais TI em seguida; depois por quantidade de posts |
| `total` | posts da matéria (calculado na importação) |

Mapa lei → matéria em `scripts/importar/materias.mjs` (ex.: CF/88 → Direito Constitucional; Leis 8.112, 9.784, 8.429, 14.133 → Direito Administrativo; LAI, LGPD, Decreto 1.171, Lei 12.813 → Outros Ramos do Direito; LRF → Adm. Financeira e Orçamentária; Lei 10.180, Decretos 3.591/9.681/11.330, Leis 13.844/14.600, MOT, IN SFC 3 → Fundamentos de Auditoria Governamental; Decreto 9.203 → Adm. Pública; INs SGD/SEGES/GSI → TI: Governança, Gestão e Contratações de TI / TI: Segurança). A tabela definitiva é revisada no WP da importação.

## Índice (`indice.json`)

`{ versao, geradoEm, posts: [{ id, t, m, l }], lotes: { [l]: 'lote-<materia>-<n>.json' } }` — `t` é a inicial do tipo, `m` o id da matéria, `l` o lote.

## Interações (aparelho)

| Campo | Regra |
|---|---|
| `respostas` | `{ [postId]: { r: 'C'\|'E'\|'A'..'E', ok: boolean, em: 'AAAA-MM-DD' } }`; primeira resposta vale (não se responde de novo a mesma questão nesta missão) |
| `curtidas` | lista de postIds |
| `salvos` | `{ [postId]: ISO datetime }` |
| `vistos` | `{ 'AAAA-MM-DD': postId[] }`, só os últimos 7 dias |

Estatísticas (calculadas): `respondidas = |respostas|`, `acertos = |ok|`, `taxa = acertos / respondidas` (— quando 0), `salvos = |salvos|`; por matéria também.

## Foco (aparelho, `preferencias:v2`)

`{ disciplina: materiaId }`, padrão `ti-ciencia-de-dados`. v1 (concursoId/cargoId) é ignorada.

## Concurso (`src/lib/dados/concursos.json`)

Exatamente um: `cgu-affc-ti-cd` — "CGU — Auditor Federal de Finanças e Controle", cargo "TI — Ciência de Dados", banca Cebraspe, sem `dataProva` (edital não publicado), `edital` ausente.

## Transições de um post de questão

```
não respondida ──toca opção──▶ respondida (ok | erro)   [persistida; não volta]
qualquer post ──♥/duplo toque──▶ curtido ──♥──▶ não curtido
qualquer post ──marcador──▶ salvo(data) ──marcador──▶ não salvo
post exibido na tela ≥ 1 s ──▶ visto(hoje)
```
