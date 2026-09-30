# Research: Painel de Concurso PWA

Data: 2026-09-30. Versões conferidas no registro npm nessa data: `@sveltejs/kit` 2.70.3,
`svelte` 5.57.1, `vite` 8.3.1, `@sveltejs/adapter-static` 3.0.10, `vitest` 5.0.2,
`@playwright/test` 1.63.0.

## R0 — O que a tela de referência faz

- **Fonte**: bundle público de `acertei.web.app` (Angular + Ionic), rota `start-new` → `StartNewPageModule`, chunk `2979`.
- **Achado**: textos e métodos do componente: "Qual o concurso dos seus sonhos?", busca (`onSearchChange`), seções "abertos em alta" (`mostrarTodosEmAlta`/`mostrarMenosEmAlta`), "Autorizados ou Previstos" (`togglePrevistos`), "Por Área" (`togglePorArea`), "Encerrados" (`toggleEncerrados`), estado vazio 'Poxa, não encontramos "…"' com "Estudar por Disciplina" e "Pedir no WhatsApp"; após `selecionarConcurso`, "Seu Painel de Estudos" com vagas, `diasParaProva`, edital, "Foco de Estudo" (cargo/disciplina) e ferramentas (Questões Objetivas, Discursivas, Desafios Diários, Resumos, Flashcards, Mapas Mentais, Jurisprudência, PDFs, Simulados, Estudo por Disciplina, Meu Plano de Estudos).
- **Uso**: só fluxo e rótulos curtos de interface. Nada de marca, fonte Typekit, cores, imagens ou dados (C-002). O app de referência carrega Google Analytics e Meta Pixel; aqui não (C-003).

## R1 — SPA com fallback vs. prerender

- **Decision**: `adapter-static` com `fallback: 'index.html'`, `ssr = false`.
- **Rationale**: as duas telas dependem de preferência gravada no aparelho; prerender geraria HTML que muda logo na hidratação. Com SPA, o service worker só precisa servir um `index.html` para qualquer navegação offline.
- **Alternatives considered**: prerender de todas as rotas (ganho de primeira pintura pequeno para 3 telas leves, custo de lidar com `localStorage` no build); SSR (exige servidor, viola C-001).

## R2 — Service worker

- **Decision**: `src/service-worker.ts` nativo do SvelteKit, pré-cache de `build`, `files` e `/index.html`; estratégia cache-first para ativos versionados e fallback de navegação para `index.html`.
- **Rationale**: zero dependência, o SvelteKit já entrega a lista de arquivos e a versão; atende FR-015 e SC-003.
- **Alternatives considered**: `@vite-pwa/sveltekit` 1.1.0 (Workbox) — mais recurso do que a casca precisa e mais peso de build; revisitar quando houver conteúdo dinâmico grande (catálogo de questões).

## R3 — Busca sem acento

- **Decision**: `texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()`, com índice de busca pré-computado por concurso (nome + órgão + banca + cargos) na carga.
- **Rationale**: 500 concursos × `includes` em string curta fica bem abaixo de 100 ms (NFR-002); índice evita normalizar a cada tecla.
- **Alternatives considered**: biblioteca de busca difusa (peso extra, resultado menos previsível para o teste de aceite).

## R4 — Persistência

- **Decision**: `localStorage`, chave única `painel-concurso:preferencias:v1` com JSON; toda leitura e escrita em `try/catch`; valor inválido é descartado.
- **Rationale**: dado pequeno e só deste aparelho; cobre "janela privada" sem quebrar.
- **Alternatives considered**: IndexedDB (desnecessário para três campos).

## R5 — Ícones

- **Decision**: componente `Icone.svelte` com ~16 caminhos SVG desenhados à mão ou de conjunto com licença livre (Lucide, ISC), embutidos; ícones do app gerados a partir de um SVG próprio.
- **Rationale**: NFR-006 e C-002; o original usa Ionicons e imagens próprias.
- **Alternatives considered**: pacote de ícones inteiro (aumenta o bundle sem tree-shaking garantido).

## R6 — Testes

- **Decision**: Vitest para `src/lib/*.ts`; Playwright contra `vite preview` do build, com `context.setOffline(true)` para SC-003 e viewport 360×740 para NFR-004.
- **Rationale**: o service worker só existe no build; testar offline em `dev` daria falso positivo.
- **Alternatives considered**: testes de componente com Testing Library (redundantes com o e2e nesta casca).
