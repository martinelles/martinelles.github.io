---
work_package_id: WP07
title: Instalável, offline e medições
dependencies:
- WP05
- WP06
requirement_refs:
- FR-015
- NFR-001
- NFR-003
- NFR-004
- NFR-006
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T06:29:39.501927+00:00'
subtasks:
- T032
- T033
- T034
- T035
- T036
phase: Fase 4 - PWA e conferência
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "27384"
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: static/
execution_mode: code_change
owned_files:
- static/**
- scripts/gerar-icones.mjs
- src/service-worker.ts
- tests/e2e/offline.spec.ts
- tests/e2e/responsivo.spec.ts
- kitty-specs/painel-concurso-pwa-01M3RA84/medicoes.md
tags: []
---

# WP07 – Instalável, offline e medições

## Objetivo

Tornar o app instalável e utilizável sem conexão após a primeira visita (Cenário 3,
FR-015, SC-003, SC-004), provar o layout sem rolagem horizontal (NFR-004) e registrar
peso e Lighthouse (NFR-001, NFR-003, NFR-006).

## Contexto

- `research.md` R2 (service worker nativo, sem Workbox) e R6 (testar contra o build).
- `src/app.html` (WP01) já aponta para `/manifest.webmanifest`, `/icones/icone.svg` e `/icones/icone-192.png` — os nomes abaixo precisam bater.
- `svelte.config.js` (WP01) já tem `serviceWorker.register: true`; basta o arquivo `src/service-worker.ts` existir.
- `sharp` já está nas devDependencies (WP01) e o script `npm run icones` aponta para `scripts/gerar-icones.mjs`.

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`; começa depois de WP05 e WP06.
Comando: `spec-kitty agent action implement WP07 --agent <nome>`.

## Subtarefas

### T032 — Ícones e manifest

1. `static/icones/icone.svg`: ícone **próprio** (C-002) — por exemplo, um alvo/check estilizado sobre quadrado arredondado em `#1b4dd8` com traço branco. Nada que lembre a marca do Acertei.
2. `static/icones/icone-maskable.svg`: mesmo desenho com o conteúdo dentro da zona segura (80% central) e fundo cheio até a borda.
3. `scripts/gerar-icones.mjs` (Node, ESM) gera com `sharp`: `icone-192.png`, `icone-512.png` a partir de `icone.svg` e `icone-maskable-512.png` a partir de `icone-maskable.svg`. Rodar `npm run icones` e **commitar os PNGs** (build não depende de `sharp`). Se o `sharp` não instalar na máquina, gere os PNGs por outro meio e registre no histórico.
4. `static/manifest.webmanifest`:
   ```json
   {
     "name": "Painel de Concurso",
     "short_name": "Concurso",
     "description": "Escolha seu concurso e organize seus estudos.",
     "lang": "pt-BR",
     "start_url": "/",
     "scope": "/",
     "display": "standalone",
     "orientation": "portrait",
     "background_color": "#f6f7fb",
     "theme_color": "#1b4dd8",
     "icons": [
       { "src": "/icones/icone-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icones/icone-512.png", "sizes": "512x512", "type": "image/png" },
       { "src": "/icones/icone-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
       { "src": "/icones/icone.svg", "sizes": "any", "type": "image/svg+xml" }
     ]
   }
   ```
   `vite preview` serve `.webmanifest` com o tipo certo; se não servir, confira no teste T034 e registre.

### T033 — `src/service-worker.ts`

```ts
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';
const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `painel-concurso-${version}`;
const PRECACHE = ['/', '/index.html', ...build, ...files];

sw.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => sw.skipWaiting()));
});
sw.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await sw.clients.claim();
  })());
});
sw.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== sw.location.origin) return;           // edital e WhatsApp são externos: não interceptar
  if (req.mode === 'navigate') {                             // SPA: toda navegação cai no index.html
    e.respondWith(fetch(req).catch(async () => (await caches.match('/index.html'))!));
    return;
  }
  e.respondWith((async () => (await caches.match(req)) ?? fetch(req))());
});
```
- Navegação é **network-first** (pega versão nova quando online) com fallback ao `index.html` do cache; ativos versionados são **cache-first**.
- `'/'` no pré-cache: o `adapter-static` com `fallback` gera `index.html`; confira em `build/` que `/` resolve no `vite preview`. Se `addAll` falhar por algum item 404, o SW inteiro não instala — o teste T034 pega isso.
- Nada de rastreamento, `postMessage` de analytics ou `sync` (C-003).

### T034 — `tests/e2e/offline.spec.ts`

1. Abrir `/escolher`, esperar `navigator.serviceWorker.ready` (`page.evaluate`) e **recarregar uma vez** (o SW só controla a página depois disso).
2. `context.setOffline(true)`.
3. Navegar por URL a `/`, `/escolher`, `/painel` (com preferência gravada) e `/ferramenta/flashcards` — cada uma renderiza o `h1` esperado (SC-003).
4. Clicar num cartão e numa ferramenta offline — navegação interna funciona.
5. Manifest: `page.request.get('/manifest.webmanifest')` (online) → JSON com `name`, `display: "standalone"`, ícones 192 e 512 que respondem 200 (SC-004, parte automatizável).

### T035 — `tests/e2e/responsivo.spec.ts` (NFR-004)

Para larguras 360, 390, 768, 1024 e 1440 (altura 800), em `/escolher` (com "Ver mais" e todas as seções abertas), `/painel` e `/ferramenta/questoes-discursivas` (título mais longo):
```ts
const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
expect(sobra).toBeLessThanOrEqual(0);
```
Mais: em 360 px, todo `button, a, select, input` visível tem `getBoundingClientRect().height >= 44`.

Se algum caso falhar por CSS de componente de outro WP, **não edite o componente** (fora de posse): registre o achado em `medicoes.md` e reporte ao revisor, que devolve ao WP dono.

### T036 — `kitty-specs/painel-concurso-pwa-01M3RA84/medicoes.md`

Registrar, com data e versão do commit:
- **Peso (NFR-006)**: soma de `build/_app/immutable/**/*.{js,css}` + `build/index.html`, bruto e gzip (`gzip -c arquivo | wc -c`). Limite 300 KB transferidos (gzip) sem ícones. Tabela arquivo → bytes, e o total.
- **Lighthouse (NFR-001, NFR-003)**: `npx lighthouse http://localhost:4173/escolher --preset=perf --form-factor=mobile --throttling-method=simulate --only-categories=performance,accessibility,best-practices --output=json` (pacote `lighthouse` via `npx`, sem entrar no `package.json`). Registrar notas das três categorias, LCP e TTI da primeira visita. Metas: acessibilidade e boas práticas ≥ 90; tela utilizável ≤ 2,5 s. Para "≤ 1 s nas seguintes", registrar LCP com cache quente (segunda execução com `--disable-storage-reset`).
- **Instalação (SC-004)**: resultado manual no Chrome desktop (ícone de instalar aparece; app abre em janela própria). Android: registrar como "não conferido" se não houver aparelho — não inventar.
- Qualquer meta não atingida: registrar o número real e a causa provável; **não** ajustar o limite.

## Definition of Done

- [ ] Portas do charter passam, incluindo `npm run test:e2e` completo (smoke, escolher, painel, offline, responsivo).
- [ ] PNGs dos ícones commitados; manifest válido.
- [ ] `medicoes.md` com números reais e procedência (comando e data).
- [ ] Nenhum arquivo fora de `owned_files` alterado.

## Riscos

- SW antigo em cache durante desenvolvimento: no DevTools, "Update on reload". O `version` do `$service-worker` muda a cada build, e o `activate` apaga caches antigos.
- `setOffline` no Playwright não afeta um SW que já tenha respostas em cache — é o comportamento desejado; mas garanta que a primeira carga ocorreu **com** o SW controlando (passo 1 do T034).

## Guia do revisor

Rodar `npm run build && npm run preview`, abrir, ficar offline no DevTools e navegar; conferir `medicoes.md` contra uma execução própria do Lighthouse; ver que o SW não intercepta domínios externos.

## Activity Log

- 2026-09-30T06:29:41Z – claude:opus:implementer:implementer – shell_pid=29392 – Assigned agent via action command
- 2026-09-30T07:09:10Z – claude:opus:implementer:implementer – shell_pid=29392 – Ready for review. --force: o único arquivo em kitty-specs/ no diff é medicoes.md, listado em owned_files do WP07 (T036). E2E: 46/46 com --workers 3; com 5 workers (padrão) falha o 1º teste de cada worker por problema ambiental pré-existente — ver medicoes.md, observação 3.
- 2026-09-30T07:09:48Z – claude:opus:reviewer:reviewer – shell_pid=27384 – Started review via action command
- 2026-09-30T07:21:03Z – claude:opus:reviewer:reviewer – shell_pid=27384 – Review passed: SW/manifest/icons correct, only owned files; check, 53 unit, build OK; e2e flake is first-test-per-worker page.goto timeout, reproduced without the SW and not WP07's (follow-up: cap workers in playwright.config.ts, WP01, before merge); gzip total confirmed 52.6 KB; medicoes honest re Android/install click/PWA category. Follow-up: kit.paths.relative=false (WP01) would make SW absolutizar unnecessary. --force: kitty-specs guard, medicoes.md is WP07-owned (T036).
