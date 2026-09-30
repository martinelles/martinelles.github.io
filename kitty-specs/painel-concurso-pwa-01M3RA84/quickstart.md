# Quickstart: Painel de Concurso PWA

Pasta: `C:\Users\martinelle.santos\Documents\github\painel-concurso`. Node 24.

```bash
npm install
npm run dev            # http://localhost:5173 — sem service worker ativo
npm run check          # svelte-check (tipos)
npm test               # Vitest, src/lib
npm run build          # gera build/
npm run preview        # http://localhost:4173 — build real, com service worker
npx playwright install chromium   # uma vez
npm run test:e2e       # Playwright contra o preview
```

## Conferências manuais

1. **Fluxo** (SC-001): abrir o preview, digitar "cgu", tocar o cartão, ver o painel.
2. **Offline** (SC-003): com o preview aberto uma vez, DevTools → Network → Offline, recarregar `/`, `/escolher` e `/ferramenta/flashcards`.
3. **Instalação** (SC-004): ícone de instalar na barra do navegador; o app abre em janela própria com o nome "Painel de Concurso".
4. **Lighthouse** (NFR-003): DevTools → Lighthouse, modo mobile, categorias Performance, Accessibility, Best Practices; registrar as notas no PR.
5. **Peso** (NFR-006): `du -ch build/_app/immutable/**/*.js build/_app/immutable/**/*.css build/index.html | tail -1` — soma sem ícones, antes de gzip; deve ficar ≤ 300 KB.

## Acrescentar um concurso (SC-005)

Editar só `src/lib/dados/concursos.json` seguindo [contracts/dados-exemplo.schema.json](contracts/dados-exemplo.schema.json) e rodar `npm test` — `dados.test.ts` recusa id repetido, campo faltando ou cargo sem disciplina.
