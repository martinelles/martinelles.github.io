# Implementation Plan: Painel de Concurso PWA

**Branch**: `main` (planejamento e merge) | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)
**Input**: `kitty-specs/painel-concurso-pwa-01M3RA84/spec.md`

## Summary

Casca visual instalável e offline de duas telas — escolha de concurso e "Seu Painel de
Estudos" — mais a tela "em breve" das 12 ferramentas, reproduzindo o fluxo de
`acertei.web.app/start-new` sem a marca nem os dados dele. Implementação em SvelteKit
com `adapter-static` em modo SPA, CSS puro, service worker nativo do SvelteKit e dados de
exemplo em JSON empacotados no build. Estado do usuário (concurso, cargo, disciplina) em
`localStorage` com fallback silencioso.

## Planning answers (registro)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Escopo da missão | Só a casca visual; ferramentas como "em breve" (resposta em 2026-09-30) |
| 2 | Stack | SvelteKit estático, CSS puro, service worker nativo (resposta em 2026-09-30) |
| 3 | Onde o projeto vive | `C:\Users\martinelle.santos\Documents\github\painel-concurso`, branch `main` |

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 5 (runes), Node 24 para build
**Primary Dependencies**: `@sveltejs/kit` 2.x, `@sveltejs/adapter-static` 3.x, `vite`; nada em runtime além do Svelte
**Storage**: `localStorage` (preferências); dados de exemplo em `src/lib/dados/*.json` importados no build
**Testing**: Vitest (unidade: busca, seções, datas, preferências, validação dos dados); Playwright (fluxos da spec, offline, 360 px); Lighthouse manual (NFR-003)
**Target Platform**: navegadores evergreen no Android, iOS e desktop; instalação onde houver suporte
**Project Type**: single (front-end estático, sem backend — C-001)
**Performance Goals**: busca ≤ 100 ms/tecla com 500 concursos (NFR-002); tela utilizável ≤ 2,5 s na 1ª visita em 4G (NFR-001)
**Constraints**: carga inicial ≤ 300 KB (NFR-006), offline após 1ª visita (FR-015), sem rastreamento (C-003), sem ativos do Acertei (C-002)
**Scale/Scope**: 4 rotas, ~8 componentes, 12+ concursos de exemplo

## Charter Check

Pulado: `.kittify/charter/charter.md` não existe (`spec-kitty charter context --action plan` retornou `mode: missing`). Os gates usados no lugar são as restrições C-001..C-005 da spec, todas atendidas pelo desenho abaixo. Reavaliado após a Fase 1: sem conflito novo.

## Design

### Rotas

| Rota | Tela | Requisitos |
|---|---|---|
| `/` | Decide: concurso salvo e válido → `/painel`; senão → `/escolher` | FR-013 |
| `/escolher` | Saudação, busca, 4 seções, estado vazio | FR-001..FR-007 |
| `/painel` | Seu Painel de Estudos, foco de estudo, grade | FR-008..FR-012 |
| `/ferramenta/[id]` | "Em breve" com voltar | FR-011 |

`src/routes/+layout.ts`: `ssr = false`, `prerender = false`; `svelte.config.js` com
`adapter-static({ fallback: 'index.html' })`. Motivo em [research.md](research.md) (R1).

### Módulos

- `src/lib/dados/concursos.json`, `src/lib/dados/ferramentas.json`, `src/lib/dados/config.json` — dados de exemplo (FR-014, SC-005), validados por `src/lib/dados/validar.ts` no carregamento e em teste.
- `src/lib/busca.ts` — `normalizar(texto)` (minúsculas + remoção de diacríticos via NFD) e `filtrar(concursos, termo)` (FR-002).
- `src/lib/secoes.ts` — `situacaoEfetiva(concurso, hoje)` (prova passada ⇒ encerrado) e `agruparEmSecoes(concursos, hoje)` (FR-003, casos de borda).
- `src/lib/datas.ts` — `diasParaProva(dataProva, hoje)` → número, `"data a definir"` ou `"prova realizada"`.
- `src/lib/preferencias.svelte.ts` — estado reativo persistido em `localStorage` com `try/catch` (FR-007, FR-009, borda "janela privada").
- `src/lib/componentes/` — `CartaoConcurso`, `SecaoRecolhivel`, `CampoBusca`, `EstadoVazio`, `CabecalhoPainel`, `FocoEstudo`, `GradeFerramentas`, `Icone` (SVG inline, sem biblioteca).
- `src/service-worker.ts` — pré-cache de `build` + `files` + `index.html`, cache nomeado pela `version` do `$service-worker`; navegação offline responde com `index.html` (FR-015, SC-003).
- `static/manifest.webmanifest` + ícones próprios 192/512/maskable (SC-004, C-002).

### Visual

CSS puro com tokens em `src/app.css` (`:root` claro, `prefers-color-scheme: dark`), fonte
do sistema, azul primário próprio (não o `#092e63` do Acertei), contraste ≥ 4,5:1
(NFR-005). Coluna única até 720 px; grade de ferramentas em 2 colunas no celular e 4 a
partir de 720 px (NFR-004).

## Project Structure

### Documentation (this feature)

```
kitty-specs/painel-concurso-pwa-01M3RA84/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── dados-exemplo.schema.json
│   └── preferencias.md
└── tasks.md             # /spec-kitty.tasks
```

### Source Code (repository root)

```
package.json
svelte.config.js
vite.config.ts
playwright.config.ts
static/
├── manifest.webmanifest
└── icones/ (icone-192.png, icone-512.png, icone-maskable-512.png)
src/
├── app.html
├── app.css
├── service-worker.ts
├── lib/
│   ├── busca.ts
│   ├── secoes.ts
│   ├── datas.ts
│   ├── preferencias.svelte.ts
│   ├── dados/ (concursos.json, ferramentas.json, config.json, validar.ts, index.ts)
│   └── componentes/ (*.svelte)
└── routes/
    ├── +layout.ts
    ├── +layout.svelte
    ├── +page.svelte              # redirecionamento
    ├── escolher/+page.svelte
    ├── painel/+page.svelte
    └── ferramenta/[id]/+page.svelte
tests/
├── unit/ (busca.test.ts, secoes.test.ts, datas.test.ts, preferencias.test.ts, dados.test.ts)
└── e2e/ (escolher.spec.ts, painel.spec.ts, offline.spec.ts, responsivo.spec.ts)
```

**Structure Decision**: projeto único na raiz; toda lógica testável fica em `src/lib/*.ts`, sem depender de componente, para os testes de unidade não precisarem de DOM.

## Rastreabilidade

| Requisito | Onde | Verificação |
|---|---|---|
| FR-001, FR-006 | `escolher/+page.svelte`, `EstadoVazio` | e2e `escolher.spec.ts` |
| FR-002, NFR-002 | `busca.ts` | unit `busca.test.ts` (inclui 500 itens, ≤ 100 ms) |
| FR-003, FR-004, FR-005 | `secoes.ts`, `SecaoRecolhivel`, `CartaoConcurso` | unit + e2e |
| FR-007, FR-009, FR-013 | `preferencias.svelte.ts`, `routes/+page.svelte` | unit + e2e (recarregar) |
| FR-008 | `CabecalhoPainel`, `datas.ts` | unit `datas.test.ts` + e2e |
| FR-010, FR-011, FR-012 | `GradeFerramentas`, `ferramenta/[id]` | e2e percorre as 12 (SC-002) |
| FR-014, SC-005 | `dados/*.json`, `validar.ts` | unit `dados.test.ts` |
| FR-015, SC-003, SC-004 | `service-worker.ts`, manifest | e2e `offline.spec.ts` + Lighthouse |
| NFR-004 | CSS | e2e `responsivo.spec.ts` (360 e 1440 px, `scrollWidth ≤ innerWidth`) |
| NFR-006 | build | `quickstart.md`, passo de medição do `build/` |

## Complexity Tracking

Sem violações a justificar.
