---
work_package_id: WP05
title: Rotas, navegação e painel CGU
dependencies:
- WP02
- WP03
- WP04
requirement_refs:
- C-001
- C-002
- FR-001
- FR-002
- FR-009
- FR-012
- FR-013
- FR-014
- FR-015
- NFR-007
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts were generated on main; completed changes must merge back into main.
subtasks:
- T025
- T026
- T027
- T028
- T029
- T030
- T031
- T032
phase: Fase 3
assignee: ''
agent: ''
history:
- timestamp: '2026-09-30T13:35:11Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/
execution_mode: code_change
owned_files:
- src/routes/+layout.svelte
- src/routes/+page.svelte
- src/routes/salvos/**
- src/routes/escolher/**
- src/routes/painel/**
- src/routes/ferramenta/**
- src/lib/busca.ts
- src/lib/secoes.ts
- src/lib/preferencias.svelte.ts
- src/lib/componentes/CampoBusca.svelte
- src/lib/componentes/CartaoConcurso.svelte
- src/lib/componentes/SecaoRecolhivel.svelte
- src/lib/componentes/EstadoVazio.svelte
- src/lib/componentes/CabecalhoPainel.svelte
- src/lib/componentes/FocoEstudo.svelte
- src/lib/componentes/GradeFerramentas.svelte
- src/lib/componentes/ProgressoEstudo.svelte
- src/lib/dados/concursos.json
- src/lib/dados/config.json
- src/lib/dados/ferramentas.json
- src/lib/dados/validar.ts
- src/lib/dados/index.ts
- src/lib/dados/LEIA-ME.md
- tests/unit/busca.test.ts
- tests/unit/secoes.test.ts
- tests/unit/dados.test.ts
- tests/unit/preferencias.test.ts
- tests/e2e/escolher.spec.ts
- tests/e2e/feed.spec.ts
- tests/e2e/salvos.spec.ts
- tests/e2e/painel.spec.ts
- tests/e2e/smoke.spec.ts
- tests/e2e/offline.spec.ts
- tests/e2e/responsivo.spec.ts
tags: []
---

# WP05 – Rotas, navegação e painel CGU

## Objetivo

Montar o app novo: feed em `/`, aba Salvos, painel só da CGU com estatísticas, barra de abas, e
remover o que só servia à escolha de concurso — deixando todo o e2e verde.

## Contexto

- Spec: Cenários 1–5, FR-001, FR-002, FR-009, FR-012..FR-015, SC-001, SC-004, SC-007; bordas "/escolher antigo", "armazenamento indisponível".
- Motor (WP03): `src/lib/feed/*` — `criarRepositorio`, `ordemDoDia`, `criarSessao`, `interacoes`, `foco`, `estatisticas`, `ordenarStories`, `materiaVistaHoje`.
- Componentes (WP04): `src/lib/componentes/feed/*`.
- Conteúdo (WP02): `static/conteudo/` real (~4.000+ posts).
- A lane precisa do código de WP02, WP03 e WP04 (o orquestrador mescla).
- **Leia a API real** dos módulos acima antes de usar; se divergir deste prompt, vale o código.

## Branch Strategy

Planejamento em `main`; merge em `main`.
`spec-kitty agent action implement WP05 --agent <nome>`.

## Subtarefas

### T025 — Layout
`+layout.svelte`: mantém `app.css`; chama `carregarInteracoes()` e `carregarFoco()` uma vez; renderiza `children` com `padding-bottom` para a `BarraAbas`; aviso único e discreto quando `interacoes.persistindo === false` ("Seu progresso não está sendo salvo neste navegador").

### T026 — Feed em `/`
- Lê `?materia=` e `?tipo=` da URL (`page.url.searchParams`); `BarraStories` com "Tudo" + `ordenarStories(materias, foco)`, marcando `vista` por `materiaVistaHoje`.
- Sessão do motor para o filtro e o dia (`hojeLocal()`); primeira página ao montar; próxima página com sentinela `IntersectionObserver` perto do fim; `FimDoFeed` no fim; erro de lote com botão "Tentar de novo".
- Cada `Post` ligado a `interacoes` (curtir, salvar, responder, visto).
- Título da página: "Feed · Painel de Concurso" (e "Dados · Feed…" com matéria). Um `h1` visualmente oculto "Feed de estudo".
- Primeira pintura com esqueleto de 2 posts enquanto o índice carrega (SC-001 ≤ 3 s).

### T027 — `/salvos`
Lista `interacoes.salvosOrdenados()` carregando os posts via repositório, com as mesmas ações; vazio: "Nada salvo ainda — toque no marcador de um post para guardar aqui." Posts cujo id sumiu do índice são ignorados.

### T028 — Remover a escolha de concurso
- `src/routes/escolher/+page.svelte` sai; `src/routes/escolher/+page.ts`: `redirect(307, '/')` (FR-001).
- Apagar `busca.ts`, `secoes.ts`, `preferencias.svelte.ts`, `CampoBusca`, `CartaoConcurso`, `SecaoRecolhivel`, `EstadoVazio`, e os testes `busca/secoes/preferencias.test.ts` e `escolher.spec.ts`. Confirmar com `grep` que nada mais importa esses módulos.
- `ferramenta/[id]`: sem `preferencias` — o link de volta é sempre "Voltar ao painel".

### T029 — Dados só CGU
- `concursos.json` com **um** concurso (`data-model.md` → Concurso): `cgu-affc-ti-cd`, nome "CGU — Auditor Federal de Finanças e Controle", cargo único "TI — Ciência de Dados", Cebraspe, sem `dataProva`, sem `edital`, `situacao: "previsto"`.
- `validar.ts`: exige exatamente 1 concurso (troca a regra de ≥ 12); `index.ts` exporta `concursoCgu`; `ferramentas.json`: mantém ids; `config.json` sem `limiteEmAlta` se não for mais usado (e validador acompanha). `LEIA-ME.md` atualizado. `dados.test.ts` ajustado.

### T030 — Painel CGU
- `CabecalhoPainel`: sem "Trocar concurso"; mostra "CGU — Auditor Federal de Finanças e Controle · TI — Ciência de Dados", Cebraspe, "Data a definir".
- `FocoEstudo`: cargo fixo em texto (sem select); select de disciplina com as matérias do conteúdo (`materias.json`), padrão Ciência de Dados, gravando via `foco.escolherDisciplina`.
- `ProgressoEstudo.svelte` (novo): respondidas, acertos, taxa ("—" sem respostas), salvos; por matéria as 5 com mais respostas. Tudo de `estatisticas()` (FR-014, SC-007).
- `GradeFerramentas`: Questões Objetivas → `/?tipo=questao`, Resumos → `/?tipo=resumo`, Flashcards → `/?tipo=flashcard`, e o antigo "Jurisprudência" vira **"Lei seca"** → `/?tipo=lei` (FR-015); os demais seguem para `/ferramenta/[id]`. Ajustar o `ferramentas.json` conforme.
- `painel/+page.svelte` sem redirect por concurso ausente.

### T031 — e2e feed e salvos (`feed.spec.ts`, `salvos.spec.ts`)
Relógio fixo (`page.clock.setFixedTime('2026-09-30T12:00:00-03:00')`) e storage limpo por teste.
1. `/` abre o feed com stories e ≥ 3 posts em ≤ 3 s (SC-001); não existe tela de escolha.
2. Responder uma C/E e uma ME (encontrar pelo rótulo "Questão"): retorno, gabarito, persistência após reload.
3. Story "Dados" filtra (todos os posts com a matéria), "Tudo" desfaz; foco aparece logo após "Tudo".
4. Rolar até o fim de um filtro pequeno (`?materia=` da matéria com menos posts): ids únicos e mensagem de fim (FR-010).
5. Carrossel de lei/resumo: botão ›, contador "2/…", teclado →.
6. Flashcard vira e desvira.
7. Curtir (botão e duplo toque fora de questão), salvar; `/salvos` lista o salvo; reload mantém (SC-004).
8. Selo "gerado — a revisar" presente em resumo/flashcard e fonte visível (SC-006).
9. `/escolher` → `/`.

### T032 — e2e painel e atualização dos antigos
- `painel.spec.ts` reescrito: cabeçalho CGU, foco fixo, disciplina persiste, estatísticas mudam ao responder uma questão no feed (SC-007), atalhos abrem `/?tipo=…`, 12 ferramentas, "em breve" das restantes.
- `smoke.spec.ts`: esperar o feed (`h1`/título da rota), não o título fixo antigo.
- `offline.spec.ts`: trocar o fluxo de cartões de concurso por: carregar `/`, esperar SW, offline, abrir `/`, `/salvos`, `/painel`, `/ferramenta/pdfs` (conteúdo offline completo é do WP06).
- `responsivo.spec.ts`: telas `/`, `/?materia=<uma>`, `/salvos`, `/painel` em 5 larguras; alvos ≥ 44 px.

## Definition of Done

- [ ] `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` (2 workers) verdes, com saída real no histórico.
- [ ] `grep -r "preferencias.svelte\|busca\|secoes\|CartaoConcurso" src tests` vazio.
- [ ] Todos os aceites dos Cenários 1–5 cobertos por e2e.

## Riscos

- WP grande (8 subtarefas): implementar na ordem T028/T029 → T025 → T026 → T027 → T030 → testes.
- Conteúdo real é grande: nos e2e, não depender de posição exata de post; achar por rótulo/tipo.

## Guia do revisor

Percorrer os cinco cenários da spec no preview em 360 px; conferir remoção do código morto; conferir que estatísticas não têm número fixo.
