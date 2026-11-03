# Aulas da mentoria nos subitens do painel — plano de implementação

Id: `2026-11-03-aulas-da-mentoria-no-painel` (datado, sem rastro fora do arquivo).

## Visão geral

A Missão de hoje ganha o terceiro atalho por subitem — **"Aula da mentoria ↗"** — ao lado de
"Questões no Qconcursos ↗" e "Mapa mental ↗", abrindo a playlist da disciplina do subitem na
plataforma do Pietro Viecili (inspecionada em 2026-11-03 com a sessão dela).

## Estado atual (conferido)

- A plataforma (mentoria.plataformatutory.com.br, Next.js + NextAuth) organiza o curso
  "Resumo Completo - CGU" (`d3ef2108-…`) em **26 playlists por disciplina** — mesma divisão do
  edital: B1–B4, C1–C5 e as P3 de Auditoria, Ciência de Dados, Infraestrutura e Desenvolvimento
  — 143 aulas no total, cada aula um PDF paginado no leitor da plataforma.
- A granularidade do link é **disciplina** (não subitem): todo subitem de B1 leva à playlist de
  B1, e assim por diante. URLs estáveis por UUID (`/dash/cursos/<curso>/playlists/<uuid>`),
  coletadas na inspeção.
- Os atalhos por subitem vivem em `MissaoDeHoje.svelte:172-201` (`.topico`); o padrão de dados
  fixos do app é `src/lib/dados/` com validador à mão (`validar.ts`, `dados/index.ts:1-6`).
- **Licença**: o material é marcado com nome e CPF dela, licença individual (sem rateio ou
  publicação). O painel só **linka** — nenhum conteúdo é copiado.

## Estado final desejado

- `src/lib/dados/mentoria.json` com o curso e as 22 playlists que o painel usa (B1–B4, C1–C5,
  `CD:E1-4`, `AUD:E1-5`, `INFRA:E1-4`; Desenvolvimento de Sistemas fica fora — o app não tem a
  especialidade), validado na carga como os outros dados.
- Na Missão de hoje, todo subitem cuja disciplina tem playlist mostra "Aula da mentoria ↗"
  (aba nova, igual ao Qconcursos); subitem sem playlist (nenhum hoje) não muda nada.
- `aulaDaMentoria(cargo, cod)` resolve `E2 1.2`+cd → `CD:E2`, `B1 8.2` → `B1`.

## O que NÃO vamos fazer

- Copiar conteúdo (PDF/páginas) da plataforma — só o link, pela licença.
- Atalho nas páginas de artefato (Prioridades/Missões) — igual ao mapa, pode vir depois.
- Controle de progresso ou login na plataforma pelo app — o link abre o site dela, logada.

## Abordagem

Como são 22 URLs estáveis de configuração (não conteúdo de estudo gerado do vault), moram em
`src/lib/dados/mentoria.json` com validação na carga — sem tocar no pipeline de import.

## Fases

Uma só: dado + validador + atalho + testes.

### Mudanças

- `src/lib/dados/mentoria.json` (novo): `{ curso, playlists: { "B1": url, "CD:E1": url, … } }`.
- `src/lib/dados/tipos.ts`: `Mentoria` + `Dados.mentoria?`.
- `src/lib/dados/validar.ts`: `validarMentoria` (chaves `^(B[1-4]|C[1-5]|(CD|AUD|INFRA):E[1-5])$`,
  URLs https da plataforma) no ramo opcional, como `config`.
- `src/lib/dados/index.ts`: importa, valida e exporta `aulaDaMentoria(cargo, cod)`.
- `MissaoDeHoje.svelte`: `{#if aula}` → `<a class="topico" target="_blank" rel="noopener">Aula da mentoria ↗</a>`.
- `tests/unit/dados/mentoria.test.ts`: resolução da chave por cargo, validação (chave torta,
  URL http recusada), ausência tolerada.
- `tests/e2e/missao.spec.ts`: no dia fixo 16/10, subitens C1 1.1 e E2 1.2 mostram o atalho com
  as URLs de C1 e CD:E2.

### Critérios de aceite

#### Verificação automática
- [x] `npm test` (345), `npm run check` (0/0), `npm run test:e2e` (254 passaram; a única falha
      é a deriva de Infra do vault, sem commit por decisão dela).

#### Verificação manual
- [ ] No celular, "Aula da mentoria ↗" numa missão com subitem de B/C e outra de E, abrindo a
      playlist certa já logada na plataforma.

### Nota de execução (2026-11-03)

Coletadas as 22 URLs na inspeção com a sessão dela. Sem novidades além do plano.
