---
work_package_id: WP02
title: Store de tema e seletor
dependencies:
- WP01
requirement_refs:
- C-006
- FR-001
- FR-002
- FR-003
- FR-010
- NFR-003
- NFR-005
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-identidade-visual-aventura-kindle-01M3T7H9
base_commit: 206a7c080882d9e44c9b93486f9ac21b7a875a28
created_at: '2026-09-30T23:37:38.359611+00:00'
subtasks:
- T008
- T009
- T010
- T011
- T012
phase: Fase 2 - Aplicação
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "21036"
history:
- timestamp: '2026-09-30T22:57:03Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/tema.svelte.ts
execution_mode: code_change
owned_files:
- src/lib/tema.svelte.ts
- src/lib/componentes/SeletorTema.svelte
- src/routes/+layout.svelte
- src/routes/painel/+page.svelte
- tests/unit/tema.test.ts
tags: []
---

# WP02 – Store de tema e seletor

## Objetivo

A pessoa escolhe no painel entre **Seguir o aparelho**, **Aventura**, **Kindle** e **Kindle escuro**.
A escolha vale na hora, sem recarregar e sem perder a posição (FR-010), persiste entre sessões (FR-003)
e, em "Seguir o aparelho", acompanha o modo claro ou escuro do aparelho ao vivo (FR-002, Cenário 2.3).

## Contexto

- Spec: Cenários 1 e 2; FR-001, FR-002, FR-003, FR-010; NFR-003, NFR-005; C-006.
- **Contrato**: [contracts/tema.md](../contracts/tema.md), §2 (chave), §3 (regra de resolução) e §4 (API do store). A regra do §3 é **a mesma** do script inline que o WP01 pôs em `src/app.html`, e as duas precisam dar o mesmo resultado.
- Modelo a seguir: `src/lib/feed/foco.svelte.ts` (store de rune com `$state`, `carregar…()` idempotente, `Storage` injetável e try/catch em toda leitura e escrita). Copie o estilo, com comentários curtos e em português.
- Falsos de armazenamento prontos: `tests/unit/feed/apoio.ts` exporta `StorageFalso`, `StorageQueLanca` e `StorageSoLeitura`. Importe de lá, sem copiar nem editar esse arquivo, que não é deste WP.
- Do WP01 (mescle a lane dele antes de começar): os blocos `[data-tema='X']` em `app.css` funcionam também num elemento interno, e é isso que faz a prévia do T011 funcionar.
- Vitest roda em `environment: 'node'`: não há `document` nem `matchMedia`, então tudo que toca o DOM é injetável (`AlvoTema`, contrato §4).

## Branch Strategy

Planejamento em `main` e merge em `main`. Depende do WP01: a lane deste WP precisa ter o código da lane
do WP01 mesclado (veja a nota ao orquestrador em `tasks.md`). A worktree é alocada pela lane calculada em
`lanes.json`. Comando: `spec-kitty agent action implement WP02 --agent <nome>`.

## Subtarefas

### T008 — Store `src/lib/tema.svelte.ts`

**Propósito**: uma fonte única do tema no app, com a API do contrato §4.

**Passos**:
1. Exporte `Tema`, `PreferenciaTema`, `CHAVE_TEMA = 'painel-concurso:tema:v1'` e
   `TEMAS = [{ id: 'aventura', nome: 'Aventura' }, { id: 'kindle', nome: 'Kindle' }, { id: 'kindle-escuro', nome: 'Kindle escuro' }] as const`.
2. Estado interno: `let preferencia = $state<PreferenciaTema>('sistema')` e `let escuroAparelho = $state(false)`.
   Derivado: `const ativo = $derived(preferencia !== 'sistema' ? preferencia : escuroAparelho ? 'kindle-escuro' : 'aventura')`.
   Atenção: `$derived` em módulo `.svelte.ts` só funciona como propriedade lida por getter. Siga o padrão de `foco` e exponha `get ativo()` calculando a regra, ou use `$derived` dentro de um objeto de classe. Escolha o mais simples que passar no `svelte-check`.
3. `carregarTema(arm = tentarLocalStorage(), mq = tentarMatchMedia(), alvo = alvoDocumento())`:
   - Lê a chave (JSON `{ tema }`). Se for inválida, ausente ou lançar erro, usa `sistema`. Não apaga nem reescreve (contrato §2).
   - `escuroAparelho = mq?.matches ?? false`.
   - Remove o ouvinte anterior, se houver, e registra `mq.addEventListener('change', …)`, que atualiza `escuroAparelho` e reaplica. Idempotente: chamar duas vezes deixa **um** ouvinte (o T009 testa isso).
   - Aplica: `alvo?.definir(ativo)`.
4. `alvoDocumento()`: devolve `null` sem `document`. Senão, `definir(t)` faz `document.documentElement.dataset.tema = t` e atualiza `<meta name="theme-color">` com a cor calculada: `getComputedStyle(document.documentElement).getPropertyValue('--cor-fundo').trim()`, lida **depois** de trocar o atributo. Não duplique as cores em TS.
5. `tema.escolher(p)`: ignora valor fora de `['sistema', ...TEMAS.map(t => t.id)]`; senão grava `preferencia`, aplica e persiste `{ tema: p }` em try/catch (a falha deixa só em memória, contrato §2).
6. O ouvinte de `matchMedia` atualiza `escuroAparelho` **sempre**, mas só muda o que aparece quando `preferencia === 'sistema'`, porque o `ativo` já cuida disso.
7. Cabeçalho do arquivo: 3 linhas com o que é, o contrato e a chave.

**Não faça**: nenhuma leitura de `localStorage` fora do `carregarTema`; nenhum `setTimeout`; nenhuma animação de troca (NFR-003 pede ≤ 100 ms, e a troca por atributo já é instantânea).

### T009 — `tests/unit/tema.test.ts`

**Casos** (use `StorageFalso` e companhia, um `MediaQueryList` falso e um `AlvoTema` que registra as chamadas):

| # | Situação | Esperado |
|---|---|---|
| 1 | nada gravado, aparelho claro | `preferencia` = `sistema`, `ativo` = `aventura`, alvo chamado com `aventura` |
| 2 | nada gravado, aparelho escuro | `ativo` = `kindle-escuro` |
| 3 | gravado `{"tema":"kindle"}`, aparelho escuro | `ativo` = `kindle` |
| 4 | gravado `lixo{`, `{"tema":"roxo"}`, `"kindle"` (string solta) ou `{"tema":null}` | `sistema`; o armazenamento continua igual byte a byte |
| 5 | `StorageQueLanca` na leitura | `sistema`, sem exceção |
| 6 | `escolher('kindle')` | alvo com `kindle`; gravado exatamente `{"tema":"kindle"}` |
| 7 | `escolher('roxo' as any)` | nada muda, nada gravado |
| 8 | `StorageSoLeitura` e `escolher('kindle')` | `ativo` = `kindle` em memória, sem exceção |
| 9 | `sistema` e o aparelho muda para escuro (dispara `change`) | alvo com `kindle-escuro` |
| 10 | `kindle` fixo e o aparelho muda | `ativo` continua `kindle` |
| 11 | `carregarTema` chamado 2 vezes | 1 ouvinte registrado no `MediaQueryList` falso |
| 12 | `mq = null` (sem `matchMedia`) | `sistema` resolve para `aventura` |
| 13 | **Paridade com o script inline**: leia `src/app.html`, extraia o corpo do IIFE, rode com `new Function` com `localStorage`, `matchMedia` e `document` falsos, e compare o `dataset.tema` com o do store para os casos 1 a 5 | iguais nos 5 |

O caso 13 é o que garante que o script do WP01 e o store não divergem. Se o script do WP01 não der para
rodar isolado, **pare e reporte**, sem editar o `app.html`, que não é deste WP.

### T010 — `carregarTema()` no layout raiz

**Passos**: em `src/routes/+layout.svelte`, junto de `carregarInteracoes()` e `carregarFoco()`, chame
`carregarTema()` uma vez. O comentário existente ("Uma vez por aba…") já explica o porquê; acrescente o
tema na mesma linha de raciocínio.

**Validação**: ao abrir, o `data-tema` que o script inline pôs **não muda** (nenhum piscar). O store lê
a mesma preferência e chega ao mesmo valor. Confira com um `MutationObserver` no console: zero mutações de
`data-tema` na carga.

### T011 — `src/lib/componentes/SeletorTema.svelte`

**Propósito**: FR-003 e Cenário 2.1. Quatro opções, cada uma com prévia, acessível por teclado e leitor de tela (NFR-005).

**Estrutura**:
```svelte
<fieldset class="seletor">
	<legend>Aparência</legend>
	<label class="opcao">
		<input type="radio" name="tema" value="sistema" checked={tema.preferencia === 'sistema'} onchange={…} />
		<span class="previa previa-dupla" aria-hidden="true">
			<span data-tema="aventura">…</span><span data-tema="kindle-escuro">…</span>
		</span>
		<span class="nome">Seguir o aparelho</span>
		<span class="detalhe">Aventura no claro, Kindle escuro no escuro</span>
	</label>
	{#each TEMAS as t (t.id)}
		<label class="opcao">
			<input type="radio" name="tema" value={t.id} … />
			<span class="previa" data-tema={t.id} aria-hidden="true">
				<span class="previa-titulo">Aa</span>
				<span class="previa-linha"></span>
				<span class="previa-linha curta"></span>
			</span>
			<span class="nome">{t.nome}</span>
		</label>
	{/each}
</fieldset>
```

- **Rádio nativo** (`fieldset`, `legend`, `input type="radio"`): as setas e a leitura por leitor de tela vêm de graça. O `input` fica visualmente escondido com a classe global `.so-leitor` (já em `app.css`), e o foco aparece no `label`: use `.opcao:has(input:focus-visible) { outline: 3px solid var(--cor-primaria); outline-offset: 2px; }`.
- **Prévia**: o `data-tema={t.id}` no `<span class="previa">` faz aquele trecho receber os tokens do tema (WP01, contrato §1). Estilize a prévia **só com tokens**: `background: var(--cor-fundo)`, `background-image: var(--textura)`, `border: var(--linha-peso) solid var(--cor-borda)`, `box-shadow: var(--sombra)`, `.previa-titulo { font-family: var(--fonte-titulo); color: var(--cor-texto) }`, `.previa-linha { background: var(--cor-texto-suave) }`. Nenhum hex no componente (FR-004).
- A opção selecionada se marca por **forma**, não só por cor: contorno de 3px em `--cor-texto` e um ícone `check` (`Icone nome="check"`, que já existe). O ícone fica escondido quando não está selecionada (FR-009).
- Layout: grade de 2 colunas no celular e 4 a partir de 592 px; alvo de toque ≥ 44 px (NFR-006); sem rolagem horizontal a 360 px.
- `onchange={() => tema.escolher(valor)}`. A troca é instantânea. Não use `transition`: a regra do Kindle zeraria de todo jeito, e no Aventura a troca de tema não é "resposta a ação" que peça animação.
- Textos em pt-BR (C-006): legenda "Aparência"; nomes "Seguir o aparelho", "Aventura", "Kindle", "Kindle escuro". **Sem** caixa-alta nem rótulo em cima do título (C-004).

### T012 — Seletor no painel

**Passos**: em `src/routes/painel/+page.svelte`, importe `SeletorTema` e coloque **depois** de
`ProgressoEstudo` e **antes** da grade de ferramentas. Não mexa nos outros componentes, que são do WP04.

**Validação manual (anote no handoff)**:
- [ ] Rolar o feed até o meio, ir ao painel, trocar o tema e voltar: o feed abre no mesmo ponto (FR-010, já que a troca não re-renderiza a rota).
- [ ] Trocar o tema com o teclado: Tab até o grupo e as setas trocam na hora.
- [ ] NVDA ou o leitor de tela do sistema lê "Aparência, grupo" e "Kindle, botão de opção, 2 de 4".
- [ ] DevTools › Performance: do clique ao fim do paint ≤ 100 ms (NFR-003). Anote o número.

## Definition of Done

- [ ] T008 a T012 feitos; `npm run check`, `npm test`, `npm run build` e `npm run test:e2e` passando.
- [ ] `tema.test.ts` com os 13 casos.
- [ ] Nenhum arquivo fora de `owned_files` alterado; `git add <caminho>` (DIRECTIVE_033).
- [ ] Capturas do seletor nos 3 temas anexadas.

## Riscos

| Risco | Mitigação |
|---|---|
| Store e script inline divergem com o tempo | Caso 13 do T009 |
| `$derived` fora de componente não reage como esperado | Getter que calcula a regra (padrão do `foco`); o `svelte-check` e o T009 pegam |
| O ouvinte de `matchMedia` vaza em HMR (dev) | `carregarTema` remove o anterior (caso 11) |

## Orientação ao revisor

- Rode o caso 13 alterando temporariamente a regra no store, que deve falhar, e desfaça depois.
- Confira que não há hex nem `rgb(` em `SeletorTema.svelte`.
- Teste com o aparelho emulado em escuro e a preferência em "Seguir o aparelho": alternar a emulação troca o tema ao vivo.

## Activity Log

- 2026-09-30T23:37:41Z – claude:opus:implementer:implementer – shell_pid=32328 – Assigned agent via action command
- 2026-10-01T00:26:18Z – claude:opus:implementer:implementer – shell_pid=32328 – Ready for review; e2e 63/63 run by orchestrator (CI=1, clean port) on 670b1b2
- 2026-10-01T00:26:26Z – claude:opus:reviewer:reviewer – shell_pid=21036 – Started review via action command
- 2026-10-01T00:29:49Z – claude:opus:reviewer:reviewer – shell_pid=21036 – Review passed: owned files only; store matches contract §2-§4; check 0 errors, unit 186/186 (tema 27), build ok; mutation checks fail 9 and 2 tests incl. case 13 parity; Playwright on 4195: arrows switch theme, 3px focus ring, sistema follows emulated scheme live, 0 store mutations of data-tema on load, theme switch does not change feed scroll vs baseline
