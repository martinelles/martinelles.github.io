# Tasks: Ajustes em Tela Própria

**Missão**: `aparencia-tela-propria-01M3YHGF` · **Branch**: planejamento em `main`, merge em `main`
**Entrada**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [contracts/tela-ajustes.md](contracts/tela-ajustes.md), [quickstart.md](quickstart.md)
**Charter**: antes de cada revisão, passar por `npm run check`, `npm test`, `npm run build` e `CI=1 npm run test:e2e`. O **e2e roda uma lane por vez**, com a porta 4173 conferida antes; na missão anterior, as lanes paralelas colidiram nessa porta.

> **Nota ao orquestrador**: a lane do WP02 não herda o código da lane do WP01. Mescle a lane do WP01 na do WP02 e rode `npm ci` antes de despachá-lo. A `main` costuma ter arquivos sem commit de outras sessões (por exemplo `static/conteudo/*`), e esses arquivos não podem entrar em nenhum commit desta missão.

## Subtask Index

| ID | Descrição | WP | Parallel |
|---|---|---|---|
| T001 | Ícone `ajustes` em `ICONES` e no `Icone` | WP01 | [P] |
| T002 | Rota `/painel/ajustes` com título, Voltar, FocoEstudo e SeletorTema | WP01 | |
| T003 | `CabecalhoPainel`: link "Ajustes" no canto e linha "Foco: …" | WP01 | |
| T004 | `/painel` sem FocoEstudo e SeletorTema, passando o foco ao cabeçalho | WP01 | |
| T005 | Migrar e2e existentes (`tema`, `painel`, `responsivo`) para a tela nova | WP01 | |
| T006 | `ajustes.spec.ts`: painel sem os blocos, link, volta, aba atual, 2 interações | WP02 | |
| T007 | `ajustes.spec.ts`: foco muda o texto do painel e a ordem dos stories | WP02 | |
| T008 | `offline.spec.ts`: `/painel/ajustes` por link direto e offline | WP02 | [P] |

## Fase 1 — Tela e cabeçalho

### WP01 — Tela de Ajustes e painel enxuto
**Prompt**: [tasks/WP01-tela-ajustes-painel.md](tasks/WP01-tela-ajustes-painel.md) · **Prioridade**: P1 (MVP) · **Dependências**: nenhuma · ~300 linhas

Objetivo: o painel deixa de mostrar Foco de Estudo e Aparência, ganha o link "Ajustes" e a linha do foco atual, e a tela `/painel/ajustes` reúne os dois blocos. Os e2e existentes passam apontando para a tela nova. Teste independente: abrir `/painel`, tocar em "Ajustes", trocar o tema e voltar.

- [ ] T001 Ícone `ajustes` em `ICONES` e no `Icone` (WP01)
- [ ] T002 Rota `/painel/ajustes` com título, Voltar, FocoEstudo e SeletorTema (WP01)
- [ ] T003 `CabecalhoPainel`: link "Ajustes" no canto e linha "Foco: …" (WP01)
- [ ] T004 `/painel` sem FocoEstudo e SeletorTema, passando o foco ao cabeçalho (WP01)
- [ ] T005 Migrar e2e existentes (`tema`, `painel`, `responsivo`) para a tela nova (WP01)

Riscos: conflito com a missão do plano no `painel/+page.svelte` (o diff é só de remoções, com merge da `main` antes da revisão); texto do cargo duplicado no painel quebrando `getByText(..., { exact: true })`.

## Fase 2 — Aceite

### WP02 — Testes de aceite dos Ajustes
**Prompt**: [tasks/WP02-aceite-ajustes.md](tasks/WP02-aceite-ajustes.md) · **Prioridade**: P1 · **Dependências**: WP01 · ~230 linhas

Objetivo: os cenários 1 a 4 da spec automatizados, incluindo o link direto e o offline.

- [ ] T006 `ajustes.spec.ts`: painel sem os blocos, link, volta, aba atual, 2 interações (WP02)
- [ ] T007 `ajustes.spec.ts`: foco muda o texto do painel e a ordem dos stories (WP02)
- [ ] T008 `offline.spec.ts`: `/painel/ajustes` por link direto e offline (WP02)

## Dependências

```
WP01 ── WP02
```

O MVP é o WP01, que já entrega a mudança inteira para a pessoa.

## Posse de arquivos

| WP | Arquivos |
|---|---|
| WP01 | `src/routes/painel/+page.svelte`, `src/routes/painel/ajustes/**`, `src/lib/componentes/CabecalhoPainel.svelte`, `src/lib/componentes/Icone.svelte`, `src/lib/dados/tipos.ts`, `tests/e2e/tema.spec.ts`, `tests/e2e/painel.spec.ts`, `tests/e2e/responsivo.spec.ts` |
| WP02 | `tests/e2e/ajustes.spec.ts`, `tests/e2e/offline.spec.ts` |
