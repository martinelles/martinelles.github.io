---
work_package_id: WP01
title: Tokens, fontes e tema antes da pintura
dependencies: []
requirement_refs:
- C-001
- C-002
- C-003
- FR-004
- FR-005
- FR-008
- FR-011
- FR-012
- NFR-001
- NFR-002
- NFR-007
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-identidade-visual-aventura-kindle-01M3T7H9
base_commit: 206a7c080882d9e44c9b93486f9ac21b7a875a28
created_at: '2026-09-30T23:06:53.557951+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
- T007
phase: Fase 1 - Fundação
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "27376"
history:
- timestamp: '2026-09-30T22:57:03Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/app.css
execution_mode: code_change
owned_files:
- src/app.css
- src/app.html
- static/manifest.webmanifest
- static/fontes/**
- static/papel/**
- scripts/fontes/**
- tests/unit/contraste.test.ts
- .gitignore
tags: []
---

# WP01 – Tokens, fontes e tema antes da pintura

## Objetivo

Deixar pronta a camada que o resto da missão consome: os três temas completos em `src/app.css`,
as fontes empacotadas, a textura de papel, a regra de movimento dos temas Kindle e o `src/app.html`
aplicando `data-tema` **antes da primeira pintura**. Ao fim deste WP, o app inteiro já troca de
cara só por mudar `document.documentElement.dataset.tema`, mesmo sem o seletor, que vem no WP02.

## Contexto

- Spec: FR-004, FR-005, FR-008, FR-011, FR-012; NFR-001, NFR-002, NFR-007; C-001, C-002, C-003.
- **Contrato obrigatório**: [contracts/tema.md](../contracts/tema.md). Os §1, §2, §3, §5, §6 e §7 são deste WP.
- Valores das cores: [data-model.md](../data-model.md), tabela "Valores propostos dos tokens de cor", já com contraste medido.
- Decisões: [research.md](../research.md), D1 a D5.
- Estado atual: `src/app.css` tem 41 tokens em `:root` e um `@media (prefers-color-scheme: dark)`. Os componentes já usam `var(--…)`, então **não mexa em componente neste WP**, porque eles são dos WP03 e WP04.
- Stack: SvelteKit 2 com adapter-static (SPA), Svelte 5, CSS puro. Nenhuma dependência nova no `package.json`.

## Branch Strategy

Planejamento em `main` e merge em `main`. Este WP não tem dependência, e a worktree é alocada pela lane
calculada em `lanes.json`. Comando: `spec-kitty agent action implement WP01 --agent <nome>`.

## Subtarefas

### T001 — Script de corte de fontes e os `.woff2`

**Propósito**: ter Literata (400, 400 itálico e 700) e Grandstander (700) como `.woff2` pequenos,
cortados para o latim, servidos pelo próprio app (C-001, C-002 e NFR-002 com teto de 120 KB).

**Passos**:
1. Crie `scripts/fontes/cortar.py` (Python 3, `fontTools` e `brotli`, ambos já instalados na máquina: fonttools 4.63).
2. O script baixa as fontes variáveis do repositório `google/fonts` para `scripts/fontes/origem/`, que fica fora do git: acrescente `scripts/fontes/origem/` ao `.gitignore`. Fixe as URLs em **um commit** do repositório, e não em `main`, para o resultado ser reprodutível:
   - `ofl/literata/Literata[opsz,wght].ttf`
   - `ofl/literata/Literata-Italic[opsz,wght].ttf`
   - `ofl/grandstander/Grandstander[wght].ttf`
   - `ofl/literata/OFL.txt` e `ofl/grandstander/OFL.txt`

   Confira os nomes exatos na listagem do repositório antes de fixar; se o nome tiver mudado, use o atual e anote no cabeçalho do script.
3. Instancie cada variável num peso estático com `fontTools.varLib.instancer.instantiateVariableFont`:
   - Literata: `wght=400, opsz=12` → `literata-400`; `wght=700, opsz=12` → `literata-700`; itálica `wght=400, opsz=12` → `literata-400i`. O `opsz` 12 é o tamanho de texto corrido.
   - Grandstander: `wght=700` → `grandstander-700`.
4. Corte com `fontTools.subset`, com estas opções:
   - `unicodes`: `U+0000-00FF, U+0131, U+0152-0153, U+2013-2014, U+2018-201E, U+2022, U+2026, U+20AC`
   - `layout_features`: `kern`, `liga`
   - `flavor='woff2'`; tire hinting (`hinting=False`) e as tabelas de nome desnecessárias (`name_IDs=[0,1,2,3,4,5,6]`)
5. Grave em `static/fontes/literata-400.woff2`, `literata-400i.woff2`, `literata-700.woff2` e `grandstander-700.woff2`. Junte as licenças em `static/fontes/OFL.txt`, uma seção por família, com o título da família em cada uma.
6. No fim, o script imprime o tamanho de cada arquivo e a soma, e **sai com erro se a soma passar de 110 KB**, deixando 10 KB de folga para a textura (NFR-002).
7. Cabeçalho do script: o que faz, o commit fixado do `google/fonts`, a data e como rodar (`python scripts/fontes/cortar.py`).

**Validação**:
- [ ] Os 4 `.woff2` e o `OFL.txt` estão commitados, e `scripts/fontes/origem/` não está.
- [ ] A soma é ≤ 110 KB, e a saída do script vai colada na descrição do commit.
- [ ] Rodar o script de novo gera arquivos com o mesmo hash (reprodutível).

**Borda**: se `instantiateVariableFont` reclamar de `opsz` fora do intervalo, leia o eixo com `fvar` e use o valor padrão, anotando no cabeçalho.

### T002 — `@font-face` e tokens comuns

**Propósito**: as fontes novas no CSS, com fallback que não pula o layout.

**Passos** (em `src/app.css`, no topo do arquivo):
1. Um `@font-face` por arquivo, com `font-display: swap` e `src: url('/fontes/<arquivo>.woff2') format('woff2')`, `font-weight` e `font-style` corretos. Família `'Literata'` com 3 faces e família `'Grandstander'` com 1.
2. Um fallback métrico para reduzir o salto de layout:
   ```css
   @font-face {
   	font-family: 'Literata Fallback';
   	src: local('Georgia');
   	size-adjust: 104%;
   	ascent-override: 92%;
   }
   ```
   Ajuste os percentuais comparando um parágrafo de `CorpoLei` com e sem a fonte carregada. Para ver sem a fonte, bloqueie `/fontes/*` na aba Network do DevTools. Tolerância: a linha não pode mudar de quebra num parágrafo de 3 linhas a 360 px.
3. Tokens comuns (valem nos três temas, então ficam fora dos blocos de tema):
   - `--fonte-texto: 'Literata', 'Literata Fallback', Georgia, serif;` (substitui a pilha Iowan/Palatino atual)
   - `--fonte: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;` (sem mudança)
   - `--medida: 64ch;` (coluna de leitura, FR-007; o WP03 é quem aplica)
   - `--espaco` e `--altura-abas`: sem mudança.

**Validação**: com o app aberto, `document.fonts.check('16px Literata')` dá `true` depois do carregamento.

### T003 — Blocos de tokens por tema

**Propósito**: o coração do WP. Cada tema define **todos** os tokens do contrato §5.

**Passos**:
1. Apague o bloco `@media (prefers-color-scheme: dark) { :root { … } }` inteiro (FR-012).
2. Apague os tokens sem uso: `--cor-azul`, `--cor-verde`, `--cor-roxo`, `--cor-laranja` e `--cor-vermelho`. Antes, confirme que não há uso com `grep -rn "cor-azul\|cor-verde\|cor-roxo\|cor-laranja\|cor-vermelho" src`, que deve voltar vazio.
3. Estrutura:
   ```css
   :root,
   [data-tema='aventura'] {
   	/* Aventura: paleta pastel (vault: Paleta — Doodles). Fallback sem JS. */
   	color-scheme: light;
   	--cor-fundo: #fefbe4;
   	/* … todos os tokens da coluna Aventura do data-model … */
   }
   :root[data-tema='kindle'],
   [data-tema='kindle'] { color-scheme: light; /* coluna Kindle */ }
   :root[data-tema='kindle-escuro'],
   [data-tema='kindle-escuro'] { color-scheme: dark; /* coluna Kindle escuro */ }
   ```
   Os seletores sem `:root` existem para a **prévia do seletor** (WP02), que aplica `data-tema` num elemento interno e precisa receber os tokens daquele tema. O `:root[data-tema=…]` serve para ganhar em especificidade do `:root` puro, que é o fallback.
4. Copie os valores **exatamente** da tabela do `data-model.md`. Tokens de cada bloco: `--cor-fundo`, `--cor-superficie`, `--cor-divisor`, `--cor-texto`, `--cor-texto-suave`, `--cor-lei`, `--cor-primaria`, `--cor-primaria-texto`, `--cor-curtida`, `--cor-acerto`, `--cor-acerto-fundo`, `--cor-erro`, `--cor-erro-fundo`, `--cor-aviso`, `--cor-aviso-fundo`, `--cor-visto`, `--cor-materia-texto`, `--materia-0` … `--materia-7`, `--cor-borda`, `--linha-peso`, `--sombra`, `--raio`, `--textura` (T004) e `--fonte-titulo`.
   - `--fonte-titulo`: Aventura, `'Grandstander', var(--fonte)`; os dois Kindle, `var(--fonte-texto)`.
   - `--sombra`: Aventura, `4px 4px 0 var(--cor-texto)`; os Kindle, `none`.
5. Mantenha o comentário de cabeçalho no estilo do atual, com o contraste de cada par ao lado, como hoje, por exemplo `/* 18,3 sobre fundo */`.
6. `:focus-visible` continua com `outline: 3px solid var(--cor-primaria)`. No Kindle, a primária é a tinta, o que dá 14:1 e está ok.

**Validação**:
- [ ] `grep -c "prefers-color-scheme" src/app.css` dá 0.
- [ ] Os 3 blocos têm o mesmo conjunto de nomes de token. O T007 verifica isso automaticamente.

### T004 — Textura de papel e impressão [P]

**Propósito**: FR-005, com o grão por tema, sem arquivo de imagem.

**Passos**:
1. Em cada bloco de tema, defina `--textura` como `url("data:image/svg+xml,…")`: um SVG de 300×300 com `feTurbulence type='fractalNoise' baseFrequency='0.04 0.9' numOctaves='3' seed='4'` e um `feColorMatrix` que converte o ruído em alfa. A receita-base está na nota do vault, seção "Fundo de papel".
   - Temas claros, ruído escuro: `values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.1'`.
   - Kindle escuro, ruído claro: `values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 1.1'`.
   - Opacidade do `<rect>`: Aventura `.18`, Kindle `.06`, Kindle escuro `.04`.
   - Escape no data URI: `<` como `%3C`, `>` como `%3E`, `#` como `%23`, `%` como `%25`, e aspas simples dentro do SVG.
2. Camada:
   ```css
   body::before {
   	content: '';
   	position: fixed;
   	inset: 0;
   	z-index: -1;
   	pointer-events: none;
   	background-image: var(--textura);
   	background-repeat: repeat;
   }
   ```
   `body` precisa de `position: relative` e de `isolation: isolate` para o `z-index: -1` ficar acima do fundo do body e abaixo do conteúdo. Confira que o fundo (`background: var(--cor-fundo)`) continua no `body`.
3. `@media print`: `body::before { display: none }` e `:root { --cor-fundo: #fff; --cor-superficie: #fff; --cor-texto: #000; --sombra: none; }`.

**Validação**:
- [ ] A textura aparece nos 3 temas, forte no Aventura e quase invisível nos Kindle, a 100% de zoom.
- [ ] Nada fica atrás da textura, e cliques e seleção funcionam.
- [ ] Rolar o feed com o DevTools › Rendering › "Paint flashing" ligado **não** pisca a tela toda.

**Risco**: se o paint flashing mostrar repintura da camada ao rolar, troque `position: fixed` por `background-attachment: fixed` no `html`. Se ainda assim pesar, gere um PNG de 300×300 por tema a partir do SVG (≤ 8 KB cada), em `static/papel/<tema>.png`, que é deste WP, e aponte `--textura` para ele. Registre a escolha e o peso no commit, para o WP05 somar no NFR-002.

### T005 — Movimento nos temas Kindle [P]

**Propósito**: FR-008 com uma regra só (research D5).

**Passos**: substitua o bloco atual `@media (prefers-reduced-motion: reduce) { * { … } }` por:

```css
/* FR-008: temas Kindle não animam (tinta eletrônica); reduzir movimento vale em qualquer tema. */
[data-tema^='kindle'],
[data-tema^='kindle'] *,
[data-tema^='kindle'] *::before,
[data-tema^='kindle'] *::after {
	transition: none !important;
	animation: none !important;
}
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		transition: none !important;
		animation: none !important;
	}
}
```

**Validação**: no Kindle, virar um flashcard troca de face na hora.

**Borda**: o `CorpoFlashcard` usa `transform` para virar. Sem transição, o estado final precisa continuar correto (face certa visível). Confirme manualmente e, se quebrar, anote para o WP03, que é dono do componente, e não corrija aqui.

### T006 — Script inline, `theme-color`, preload e manifesto

**Propósito**: FR-011 e NFR-007. O tema certo já na primeira pintura.

**Passos**:
1. Em `src/app.html`, no `<head>`, **antes** de `%sveltekit.head%`:
   ```html
   <script>
   	// Tema antes da primeira pintura (contrato tema.md §3). Mesma regra de src/lib/tema.svelte.ts.
   	(function () {
   		var temas = ['aventura', 'kindle', 'kindle-escuro'];
   		var fundo = { aventura: '#fefbe4', kindle: '#edebe6', 'kindle-escuro': '#161615' };
   		var p = 'sistema';
   		try {
   			var v = JSON.parse(localStorage.getItem('painel-concurso:tema:v1') || 'null');
   			if (v && temas.indexOf(v.tema) >= 0) p = v.tema;
   		} catch (e) {}
   		var escuro = false;
   		try { escuro = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
   		var t = p !== 'sistema' ? p : escuro ? 'kindle-escuro' : 'aventura';
   		document.documentElement.dataset.tema = t;
   		var m = document.querySelector('meta[name="theme-color"]');
   		if (m) m.setAttribute('content', fundo[t]);
   	})();
   </script>
   ```
   Os valores de `fundo` precisam ser iguais a `--cor-fundo` de cada bloco. O T007 confere isso.
2. Troque as duas `<meta name="theme-color" media=…>` por **uma** `<meta name="theme-color" content="#fefbe4">`, colocada **antes** do script.
3. Troque `<meta name="color-scheme" content="light dark">` por `content="light"`. O Kindle escuro declara `color-scheme: dark` no próprio bloco.
4. Acrescente o preload: `<link rel="preload" href="%sveltekit.assets%/fontes/literata-400.woff2" as="font" type="font/woff2" crossorigin>`.
5. Atualize a `description` do `<meta>` e do manifesto para "Feed de estudo para o concurso da CGU." (a atual ainda fala em "escolha seu concurso", resto da missão anterior).
6. `static/manifest.webmanifest`: `background_color` e `theme_color` passam para `#fefbe4`.

**Validação**:
- [ ] Com o JS da aplicação bloqueado (DevTools › Network › bloquear `/_app/*`), o `<html>` ainda recebe `data-tema`.
- [ ] Com a chave gravada como `{"tema":"kindle"}` e o aparelho no escuro, abre no Kindle.
- [ ] Com a chave em `lixo{`, abre pelo aparelho, sem erro no console.

**Borda**: o SvelteKit não reescreve scripts inline do `app.html`. Confira no `build/index.html` que o script está lá, antes do `<link rel="modulepreload">`.

### T007 — `contraste.test.ts`

**Propósito**: NFR-001 e SC-003, automáticos, a partir da fonte da verdade (`app.css`).

**Passos**:
1. Crie `tests/unit/contraste.test.ts` (Vitest, ambiente `node`).
2. Leia `src/app.css` com `fs` e extraia, com regex simples, para cada tema o bloco cujo seletor contém `[data-tema='X']` (o do Aventura começa com `:root,`). Monte `Record<Tema, Record<string, string>>` só com as declarações `--nome: #hex;`.
3. Testes:
   - **Conjunto completo**: os três temas têm exatamente o mesmo conjunto de nomes de token do contrato §5. Liste os esperados no teste; `--textura` e `--fonte-titulo` só precisam existir.
   - **Pares**: para cada tema, cada par do contrato §6 cumpre o mínimo, e `materia-texto` é checada contra `materia-0` … `materia-7`. Implemente a luminância relativa e o contraste da WCAG 2.x (sRGB linearizado; `(L1 + 0.05) / (L2 + 0.05)`).
   - **Tabela**: um `it` final imprime com `console.table` todos os pares, o valor e o mínimo, por tema. Essa saída vai para a revisão (SC-003).
   - **Script inline**: leia `src/app.html`, extraia o objeto `fundo` do script e confira que cada valor é igual a `--cor-fundo` do tema, sem diferenciar maiúscula de minúscula.
4. Mensagem de falha legível, por exemplo: `kindle: visto/fundo = 2,98 (mín. 3)`.

**Validação**:
- [ ] `npm test` passa, e a tabela aparece na saída.
- [ ] Trocando à mão `--cor-visto` do Kindle para `#8A8882`, o teste falha com a mensagem acima. Desfaça depois.

## Definition of Done

- [ ] T001 a T007 feitos; `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` passando. Os e2e existentes não devem quebrar: eles não conferem cor, e, se algum conferir, **pare e reporte** em vez de mudar o teste, que não é deste WP.
- [ ] Nenhum arquivo fora de `owned_files` alterado. Commits com `git add <caminho>` (DIRECTIVE_033).
- [ ] Captura de `/` e `/painel` nos 3 temas (forçando `data-tema` pelo console) anexada ao handoff.
- [ ] Saída do `cortar.py` (tamanhos) e do `contraste.test.ts` (tabela) anexadas.

## Riscos

| Risco | Mitigação |
|---|---|
| Os componentes ainda com borda de 1px fazem o Aventura parecer "pela metade" | É esperado: contorno grosso e sombra nos componentes são dos WP03 e WP04. Neste WP, só os tokens |
| Textura cara em celular fraco | Validação do T004 e plano B com PNG |
| `opsz` da Literata ausente na versão baixada | Borda do T001 |

## Orientação ao revisor

- Confira os valores do CSS contra o `data-model.md` célula a célula, porque é fácil trocar coluna.
- Rode o `cortar.py` duas vezes e compare os hashes.
- Bloqueie o JS do app e confira que o tema continua certo (FR-011).
- Não aceite `@media (prefers-color-scheme` sobrando em nenhum lugar de `app.css`.

## Activity Log

- 2026-09-30T23:06:57Z – claude:opus:implementer:implementer – shell_pid=23724 – Assigned agent via action command
- 2026-09-30T23:33:47Z – claude:opus:implementer:implementer – shell_pid=23724 – Ready for review: tokens dos 3 temas, fontes (69,0 KB), textura SVG, tema antes da pintura; check/test(159)/build/e2e(63) ok
- 2026-09-30T23:34:11Z – claude:opus:reviewer:reviewer – shell_pid=27376 – Started review via action command
