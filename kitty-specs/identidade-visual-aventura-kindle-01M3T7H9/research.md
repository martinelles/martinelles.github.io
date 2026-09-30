# Pesquisa: Identidade Visual Aventura e Kindle

Levantamento no código em `main` `db7ef10` (2026-09-30).

## Estado atual

- Tokens em `src/app.css`: 41 propriedades em `:root`, redefinidas em `@media (prefers-color-scheme: dark)`.
- Uso nos componentes: todos via `var(--…)`. Cor fixa fora do CSS global: só `rgb(0 0 0 / 25%)` em `src/lib/componentes/feed/Post.svelte:239`, na sombra do coração.
- `--cor-borda` é usada em 15 arquivos, sempre com `1px`.
- Movimento: 8 arquivos. O único loop contínuo é o `pulso … infinite` em `src/routes/+page.svelte:258`.
- Certo e errado já têm ícone e texto (`CorpoQuestao.svelte`, linhas 78–97).
- Build atual: 67 KB gzip (JS, CSS e HTML, sem `/conteudo/`).
- Ferramentas disponíveis na máquina: `fonttools` 4.63 e `brotli`.

## Decisões

### D1. Onde vive o tema: `data-tema` em `<html>`

- **Decisão**: um atributo na raiz, com um bloco de tokens por valor.
- **Motivo**: os componentes já leem tokens, e trocar o atributo repinta tudo de uma vez (NFR-003) sem tocar em componente.
- **Alternativas**: classe no `<body>` (o mesmo efeito, mas o `<body>` é renderizado pelo SvelteKit e o script do `<head>` chega antes dele); CSS separado por tema, carregado sob demanda (clarão na troca e mais requisições offline).

### D2. Evitar clarão: script inline no `<head>`

- **Decisão**: um IIFE de cerca de 15 linhas em `src/app.html`, antes de `%sveltekit.head%`.
- **Motivo**: num SPA com adapter-static, qualquer coisa no `onMount` roda depois da primeira pintura.
- **Alternativas**: cookie mais SSR (não há servidor); `color-scheme` sozinho (não conhece a escolha salva).

### D3. Fontes

- **Decisão**: **Literata** (Google Fonts, OFL), em 400, 400 itálico e 700, para o texto de leitura nos três temas e para os títulos dos Kindle. **Grandstander** (OFL), em 700, só para os títulos do Aventura. Interface em `system-ui`.
- **Motivo**: a Literata foi desenhada para leitura longa em tela (Google Play Livros) e é o equivalente livre mais próximo da Bookerly, o que atende a FR-007 e C-002. A Grandstander tem traço gordo e arredondado, que conversa com o contorno do Aventura, e é pouco usada, então evita os padrões de "cara de IA" (Fraunces, Inter, Space Grotesk e Bricolage aparecem em quase todo gerado).
- **Corte**: `pyftsubset` com Latin básico, Latin-1 Supplement e a pontuação usada em pt-BR (`U+0000-00FF, U+0131, U+0152-0153, U+2013-2014, U+2018-201E, U+2022, U+2026, U+20AC`), com `--flavor=woff2 --layout-features='kern,liga'`. Estimativa: cerca de 25 KB por peso da Literata e cerca de 20 KB da Grandstander, uns 95 KB no total. O teto do NFR-002 é 120 KB.
- **Carga**: `font-display: swap`; `<link rel="preload">` só para `literata-400`. Com isso a carga inicial fica em cerca de 92 KB, abaixo dos 300 KB do charter.
- **Alternativas**: Source Serif 4 (boa, mas mais "editorial" que "livro"); fontes do sistema (Georgia e Iowan variam por aparelho, e o Kindle não fica reconhecível); fonte variável inteira (mais de 200 KB).

### D4. Textura de papel

- **Decisão**: um SVG com `feTurbulence` (`baseFrequency='0.04 0.9'`, que estica o ruído na horizontal como fibra) embutido em data URI, com uma versão por tema no token `--textura`. Aplicado num `body::before` fixo.
- **Motivo**: nenhum byte extra de rede, e a receita já está validada na nota do vault. A camada fixa única vai para uma layer própria e não é repintada ao rolar.
- **Risco**: `feTurbulence` em tela cheia pode custar na primeira rasterização em celular fraco. **Mitigação**: tile de 300×300 repetido em vez de tela cheia; se a medição do NFR-004 falhar, o SVG é trocado por um PNG de 300×300 gerado dele (cerca de 8 KB, dentro do NFR-002).
- **Alternativas**: imagem de papel real (pesada, e cinza neutro não combina com o Aventura); `background-blend-mode` (não resolve o tema escuro).

### D5. Movimento nos temas Kindle

- **Decisão**: estender a regra existente de `prefers-reduced-motion` para `:root[data-tema^="kindle"] *`.
- **Motivo**: uma regra só cobre os 8 arquivos com movimento e os que vierem depois (FR-008), com o menor diff possível.

### D6. Cor das matérias no Kindle

- **Decisão**: as 8 cores de matéria viram o mesmo cinza, e a matéria é identificada pelo nome, que já aparece.
- **Motivo**: o Cenário 4.3 proíbe cor fora da escala de cinza, e 8 cinzas distinguíveis com contraste ≥ 4,5 com o texto não existem.

### D7. Contorno grosso só onde é contorno

- **Decisão**: `--linha-peso` vale em cartão, post, botão, opção de questão e story; os divisores internos (entre ações, entre linhas de lista) passam para `--cor-divisor` a 1px.
- **Motivo**: 2,5px em todo divisor pesa e vira "broadsheet de linhas", um dos padrões da lista de C-004.

## Riscos

| Risco | Efeito | Mitigação |
|---|---|---|
| Troca de tema com a página rolada perde a posição | Falha no FR-010 | A troca só mexe em atributo e CSS, sem re-render de rota; o e2e confere `scrollY` antes e depois |
| Fonte chega depois da primeira pintura (FOUT) | Salto de layout no primeiro acesso | `preload` da Literata 400 e `size-adjust` no fallback Georgia |
| Kindle escuro com cinza quente parece "sujo" em tela OLED | Estético (SC-005) | Os valores estão no contrato; ajuste fino permitido se o teste de contraste passar (premissa da spec) |
| Cache antigo do service worker serve CSS velho | Tema novo não aparece | A `version` do SvelteKit já invalida a cada build |
