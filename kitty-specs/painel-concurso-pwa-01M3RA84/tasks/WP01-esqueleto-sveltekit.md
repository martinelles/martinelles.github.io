---
work_package_id: WP01
title: Esqueleto do projeto SvelteKit
dependencies: []
requirement_refs:
- C-001
- C-003
- C-004
- NFR-005
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T05:25:28.081408+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
phase: Fase 1 - Fundação
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "18920"
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/
execution_mode: code_change
owned_files:
- package.json
- package-lock.json
- svelte.config.js
- vite.config.ts
- tsconfig.json
- playwright.config.ts
- .gitignore
- .npmrc
- src/app.html
- src/app.css
- src/app.d.ts
- src/routes/+layout.ts
- src/routes/+layout.svelte
- tests/unit/smoke.test.ts
- tests/e2e/smoke.spec.ts
tags: []
---

# WP01 – Esqueleto do projeto SvelteKit

## Objetivo

Deixar o repositório com um app SvelteKit 2 / Svelte 5 estático em modo SPA, TypeScript,
CSS puro com tokens de tema, e as quatro portas do charter funcionando:
`npm run check`, `npm test`, `npm run build`, `npm run test:e2e`. Nenhuma tela de negócio
entra aqui — só a moldura que os outros WPs preenchem.

## Contexto

- Spec: `kitty-specs/painel-concurso-pwa-01M3RA84/spec.md` (C-001 sem servidor, C-003 sem rastreamento, C-004 pt-BR, NFR-005 contraste).
- Plano: `plan.md` seções "Rotas", "Visual" e "Project Structure"; `research.md` R1 (SPA com fallback) e R6 (testes contra o build).
- Charter: `.kittify/charter/charter.md` — nenhuma dependência de runtime além do Svelte; sem fonte/CDN externa.
- Versões conferidas em 2026-09-30: `@sveltejs/kit` 2.70.3, `svelte` 5.57.1, `vite` 8.3.1, `@sveltejs/adapter-static` 3.0.10, `@sveltejs/vite-plugin-svelte` 7.3.1, `vitest` 5.0.2, `@playwright/test` 1.63.0. Use `^` dessas versões; se alguma combinação não resolver no `npm install`, use a mais recente compatível e anote no histórico do WP.

## Branch Strategy

Planejamento em `main`; merge final em `main`. O worktree deste WP é alocado pela lane
calculada em `kitty-specs/painel-concurso-pwa-01M3RA84/lanes.json` — não crie branch à mão.
Comando: `spec-kitty agent action implement WP01 --agent <nome>`.

## Subtarefas

### T001 — `package.json`, dependências e scripts

**Passos**
1. Criar `package.json` à mão (não rodar `npx sv create` dentro do repo, que sobrescreveria arquivos; use-o numa pasta temporária só como referência, se quiser):
   ```json
   {
     "name": "painel-concurso",
     "private": true,
     "version": "0.1.0",
     "type": "module",
     "scripts": {
       "dev": "vite dev",
       "build": "vite build",
       "preview": "vite preview",
       "prepare": "svelte-kit sync || echo ''",
       "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
       "test": "vitest run",
       "test:e2e": "playwright test",
       "icones": "node scripts/gerar-icones.mjs"
     }
   }
   ```
2. `devDependencies`: `@sveltejs/kit`, `@sveltejs/adapter-static`, `@sveltejs/vite-plugin-svelte`, `svelte`, `svelte-check`, `typescript`, `vite`, `vitest`, `@playwright/test`, `sharp` (usado pelo WP07 para gerar os PNGs dos ícones — instalar aqui porque `package.json` é deste WP). **Sem `dependencies` de runtime.**
3. `npm install` gera `package-lock.json`; commitar os dois.
4. `.npmrc` com `engine-strict=true`; em `package.json`, `"engines": { "node": ">=24" }`.
5. `.gitignore`: acrescentar (sem apagar o que o `spec-kitty init` escreveu) `node_modules/`, `.svelte-kit/`, `build/`, `test-results/`, `playwright-report/`.

**Validação**: `npm install` sem erro de peer dependency; `npm ls --omit=dev` vazio.

### T002 — SvelteKit estático SPA, Vite e TypeScript

**Arquivos**: `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.d.ts`.

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: 'index.html' }),
    serviceWorker: { register: true }
  }
};
```

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }
});
```

- `tsconfig.json` estende `./.svelte-kit/tsconfig.json`, com `strict: true`, `resolveJsonModule: true`, `moduleResolution: "bundler"`.
- `src/app.d.ts` padrão do SvelteKit (namespace `App` vazio).
- `serviceWorker.register: true` já está ligado, mas `src/service-worker.ts` só nasce no WP07; até lá o Kit não registra nada. Não criar o arquivo aqui.

**Validação**: `npm run build` gera `build/index.html`; `npm run check` sem erro.

### T003 — `app.html` e `app.css`

**`src/app.html`**
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#1b4dd8" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0f1729" media="(prefers-color-scheme: dark)" />
    <meta name="description" content="Escolha seu concurso e organize seus estudos." />
    <link rel="manifest" href="%sveltekit.assets%/manifest.webmanifest" />
    <link rel="icon" href="%sveltekit.assets%/icones/icone.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="%sveltekit.assets%/icones/icone-192.png" />
    <title>Painel de Concurso</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```
Manifest e ícones são criados no WP07; até lá o navegador só registra 404 no console, sem quebrar nada. Não use `maximum-scale`/`user-scalable=no` (o original usa; prejudica acessibilidade e o Lighthouse).

**`src/app.css`** — tokens e base. Cor primária própria (não usar `#092e63` nem as cores do Acertei — C-002):
```css
:root {
  --cor-fundo: #f6f7fb;
  --cor-superficie: #ffffff;
  --cor-texto: #111827;
  --cor-texto-suave: #4b5563;
  --cor-borda: #e5e7eb;
  --cor-primaria: #1b4dd8;
  --cor-primaria-texto: #ffffff;
  --cor-azul: #1b4dd8; --cor-verde: #047857; --cor-roxo: #6d28d9;
  --cor-laranja: #b45309; --cor-vermelho: #b91c1c;
  --raio: 14px; --espaco: 16px;
  --sombra: 0 1px 2px rgb(0 0 0 / 6%), 0 4px 12px rgb(0 0 0 / 6%);
  --fonte: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --cor-fundo: #0b1220; --cor-superficie: #111a2e; --cor-texto: #e5e7eb;
    --cor-texto-suave: #a3adbf; --cor-borda: #24304a; --cor-primaria: #7aa2ff;
    --cor-primaria-texto: #0b1220;
    --cor-azul: #7aa2ff; --cor-verde: #34d399; --cor-roxo: #c4b5fd;
    --cor-laranja: #fbbf24; --cor-vermelho: #fca5a5;
    color-scheme: dark;
  }
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--cor-fundo); color: var(--cor-texto); font-family: var(--fonte);
       line-height: 1.5; -webkit-font-smoothing: antialiased; }
button, input, select { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--cor-primaria); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
```
Cada par texto/fundo deve ter contraste ≥ 4,5:1 nos dois temas (NFR-005). Conferir com a ferramenta de contraste do DevTools e anotar os pares no histórico do WP. As cores de etiqueta (`--cor-verde` etc.) são usadas como texto sobre `--cor-superficie`.

### T004 — Layout raiz

- `src/routes/+layout.ts`:
  ```ts
  export const ssr = false;
  export const prerender = false;
  ```
- `src/routes/+layout.svelte`: importa `../app.css`; renderiza `<main class="app">{@render children()}</main>` com `let { children } = $props();`. CSS do layout: `.app { max-width: 960px; margin: 0 auto; padding: var(--espaco); padding-bottom: calc(var(--espaco) + env(safe-area-inset-bottom)); min-height: 100dvh; }`.
- Sem cabeçalho global: cada tela desenha o seu. Sem script de analytics (C-003).
- O WP03 vai precisar chamar `carregar()` das preferências no layout; **não** antecipar essa importação aqui (o módulo ainda não existe). O WP05 é quem acrescenta essa chamada — ver nota de posse abaixo.

> **Nota de posse**: `src/routes/+layout.svelte` é deste WP. O WP05 precisa inserir a chamada `carregar()`; para evitar edição fora de posse, o WP05 faz isso em `src/routes/+page.svelte` e nas telas, não no layout. Não há outra edição planejada no layout.

### T005 — Vitest e Playwright com testes de fumaça

- `tests/unit/smoke.test.ts`: `expect(1 + 1).toBe(2)` — só prova que o Vitest roda com a config.
- `playwright.config.ts`:
  ```ts
  import { defineConfig, devices } from '@playwright/test';
  export default defineConfig({
    testDir: 'tests/e2e',
    webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', port: 4173, reuseExistingServer: !process.env.CI, timeout: 120_000 },
    use: { baseURL: 'http://localhost:4173', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' },
    projects: [{ name: 'chromium', use: { ...devices['Pixel 7'] } }]
  });
  ```
  (`Pixel 7` usa Chromium; o viewport de 360 px é testado explicitamente no WP07.)
- `tests/e2e/smoke.spec.ts`: abre `/`, espera `document.title === 'Painel de Concurso'`.
- `npx playwright install chromium` uma vez na máquina.

## Definition of Done

- [ ] `npm install`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` passam.
- [ ] `build/index.html` existe; nenhuma requisição a domínio externo ao abrir o preview (aba Network).
- [ ] Nenhuma dependência de runtime; nenhum arquivo fora de `owned_files` alterado.
- [ ] Contraste dos pares de token anotado no histórico.

## Riscos

- Vite 8 / plugin-svelte 7 recém-lançados: se `svelte-check` ou o Kit reclamarem, fixe a combinação que o `npx sv create` da mesma data gera.
- `sharp` tem binário nativo; no Windows instala por prebuild. Se falhar, registre e deixe para o WP07 decidir (ícones PNG podem ser commitados prontos).

## Guia do revisor

Conferir: modo SPA (`fallback: 'index.html'`, `ssr = false`), ausência de fonte externa/analytics, `lang="pt-BR"`, sem `user-scalable=no`, tokens com tema escuro, as quatro portas rodando de verdade (peça a saída).

## Activity Log

- 2026-09-30T05:25:30Z – claude:opus:implementer:implementer – shell_pid=18920 – Assigned agent via action command
- 2026-09-30T05:31:27Z – claude:opus:implementer:implementer – shell_pid=18920 – Contraste NFR-005 (WCAG, calculado): claro texto/fundo 16.57, texto/superficie 17.74, suave/fundo 7.06, suave/superficie 7.56, primaria-texto/primaria 6.77, primaria/superficie 6.77, verde 5.48, roxo 7.10, laranja 5.02, vermelho 6.47; escuro texto/fundo 15.12, texto/superficie 14.01, suave/fundo 8.28, suave/superficie 7.67, primaria-texto/primaria 7.52, primaria/superficie 6.97, verde 9.02, roxo 9.39, laranja 10.39, vermelho 9.14. Versoes: as do prompt resolveram; svelte-check 4.7.6, typescript 5.9.3, sharp 0.35.5 (instalou por prebuild). Preview loga 404 em / porque +page.svelte nao e deste WP; titulo vem do fallback index.html.
- 2026-09-30T05:31:40Z – claude:opus:implementer:implementer – shell_pid=18920 – Ready for review
