---
work_package_id: WP03
title: Lógica de domínio e preferências
dependencies:
- WP02
requirement_refs:
- FR-002
- FR-003
- FR-007
- FR-009
- FR-013
- NFR-002
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T05:40:24.710935+00:00'
subtasks:
- T011
- T012
- T013
- T014
- T015
phase: Fase 2 - Lógica e componentes
assignee: ''
agent: "claude:opus:reviewer:reviewer"
shell_pid: "27168"
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/
execution_mode: code_change
owned_files:
- src/lib/busca.ts
- src/lib/secoes.ts
- src/lib/datas.ts
- src/lib/preferencias.svelte.ts
- tests/unit/busca.test.ts
- tests/unit/secoes.test.ts
- tests/unit/datas.test.ts
- tests/unit/preferencias.test.ts
tags: []
---

# WP03 – Lógica de domínio e preferências

## Objetivo

Toda regra de negócio das duas telas em funções puras testáveis sem DOM, mais o estado de
preferências persistido. As telas (WP05, WP06) só chamam estas funções.

## Contexto

- FR-002 (busca sem acento), FR-003/FR-004 (seções), FR-007/FR-009/FR-013 (preferências), FR-008 (dias para a prova), NFR-002 (≤ 100 ms com 500 itens).
- `data-model.md` "Situação efetiva e seções" e "Transições"; `contracts/preferencias.md` (chave, formato, interface); `research.md` R3 e R4.
- Tipos vêm de `$lib/dados` (WP02). **Todas as funções recebem `hoje` como parâmetro** (`Date` ou `AAAA-MM-DD`) — nada de `new Date()` escondido, para os testes serem determinísticos. As telas passam `hojeLocal()` (definida em `datas.ts`).

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`; este WP pode correr em paralelo com o WP04.
Comando: `spec-kitty agent action implement WP03 --agent <nome>`.

## Subtarefas

### T011 — `src/lib/busca.ts`

```ts
export function normalizar(texto: string): string;
// 'Controladoria-Geral da União' -> 'controladoria-geral da uniao'
// texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export interface ItemIndexado<T> { item: T; chave: string; }
export function indexar(concursos: Concurso[]): ItemIndexado<Concurso>[];
// chave = normalizar([nome, orgao, banca, ...cargos.map(c => c.nome)].join(' '))

export function filtrar(indice: ItemIndexado<Concurso>[], termo: string): Concurso[];
// termo normalizado vazio -> todos, na ordem original
// cada palavra do termo (split em espaço) precisa aparecer na chave (AND) — "cgu ti" acha o CGU TI
```

Regras: termo com só espaços = vazio; não usar regex montada a partir do termo (evita erro com `(`, `+`); `includes` resolve.

### T012 — `src/lib/secoes.ts`

```ts
export type IdSecao = 'em-alta' | 'previstos' | 'por-area' | 'encerrados';
export function situacaoEfetiva(c: Concurso, hoje: string): Situacao;
// c.dataProva && c.dataProva < hoje ? 'encerrado' : c.situacao   (comparação de string ISO funciona)

export interface GrupoArea { area: string; concursos: Concurso[]; }
export interface Secoes {
  emAlta: Concurso[];      // efetiva 'aberto'; emAlta primeiro; depois dataProva asc; sem data por último; empate por nome (localeCompare 'pt-BR')
  previstos: Concurso[];   // efetiva 'previsto'; ordem por nome
  porArea: GrupoArea[];    // todos não encerrados, agrupados por area; áreas em ordem alfabética pt-BR; dentro, por nome
  encerrados: Concurso[];  // efetiva 'encerrado'; dataProva desc; sem data por último
}
export function agruparEmSecoes(concursos: Concurso[], hoje: string): Secoes;
export function totalVisivel(s: Secoes): number; // emAlta + previstos + encerrados (porArea repete os mesmos e não conta)
```

O limite "5 + Ver mais" é de apresentação e fica na tela (WP05), lendo `dados.config.limiteEmAlta`.

### T013 — `src/lib/datas.ts`

```ts
export function hojeLocal(agora = new Date()): string; // AAAA-MM-DD no fuso do aparelho (não usar toISOString, que é UTC)
export type Prazo =
  | { tipo: 'dias'; dias: number; texto: string }   // 'Faltam 45 dias' | 'Falta 1 dia' | 'É hoje!'
  | { tipo: 'indefinido'; texto: 'Data a definir' }
  | { tipo: 'realizada'; texto: 'Prova realizada' };
export function diasParaProva(dataProva: string | undefined, hoje: string): Prazo;
// diferença em dias de calendário: parse 'AAAA-MM-DD' como UTC nos dois lados e divide por 86_400_000 (evita erro de horário de verão)
export function formatarData(iso: string): string; // '15/11/2026' via Intl pt-BR, timeZone 'UTC'
```

### T014 — `src/lib/preferencias.svelte.ts`

Seguir `contracts/preferencias.md` à risca. Esboço com runes (arquivo `.svelte.ts` é obrigatório para `$state` fora de componente):

```ts
import { buscarConcurso } from '$lib/dados';
const CHAVE = 'painel-concurso:preferencias:v1';
interface Estado { concursoId: string | null; cargoId: string | null; disciplina: string | null; }
const vazio = (): Estado => ({ concursoId: null, cargoId: null, disciplina: null });

let estado = $state<Estado>(vazio());
let armazenamento: Storage | null = null;

function saneado(bruto: unknown): Estado { /* aplica cascata: concurso inexistente -> tudo null; cargo fora do concurso -> cargo e disciplina null; disciplina fora do cargo -> null; concurso com cargo único e cargoId null -> preenche */ }
function gravar() { try { armazenamento?.setItem(CHAVE, JSON.stringify(estado)); } catch { /* silencioso */ } }

export function carregar(arm: Storage | null = tentarLocalStorage()) {
  armazenamento = arm;
  try { estado = saneado(JSON.parse(arm?.getItem(CHAVE) ?? 'null')); } catch { estado = vazio(); }
}
export const preferencias = {
  get concursoId() { return estado.concursoId; },
  get cargoId() { return estado.cargoId; },
  get disciplina() { return estado.disciplina; },
  escolherConcurso(id: string) { /* se id mudou: cargo = único cargo ou null; disciplina = null */ gravar(); },
  escolherCargo(id: string) { estado.cargoId = id; estado.disciplina = null; gravar(); },
  escolherDisciplina(nome: string) { estado.disciplina = nome; gravar(); }
};
function tentarLocalStorage(): Storage | null { try { return globalThis.localStorage ?? null; } catch { return null; } }
```

Pontos de atenção:
- `escolherConcurso` com o **mesmo** id não apaga cargo/disciplina (voltar da escolha e tocar o mesmo cartão preserva o foco).
- `escolherCargo`/`escolherDisciplina` com valor que não pertence ao concurso/cargo atual: ignorar (não gravar lixo).
- `carregar()` é idempotente; as telas chamam no topo do `<script>` (o layout é do WP01 e não será editado).

### T015 — Testes de unidade

`tests/unit/busca.test.ts`
- `normalizar('ÁRVORE Ção')` → `'arvore cao'`.
- "cgu" acha `cgu-affc-ti`; "uniao" acha por órgão; "cebraspe" acha por banca; "tecnologia" acha por cargo; "cgu ti" (AND) acha; "xyz" → `[]`; "  " → todos; termo com `(` não lança.
- **Desempenho (NFR-002)**: gerar 500 concursos sintéticos, `indexar` uma vez, medir 20 chamadas de `filtrar` com termos diferentes via `performance.now()`; a **maior** deve ser < 100 ms. (Na prática fica < 5 ms; o limite folgado evita teste instável em CI.)

`tests/unit/secoes.test.ts` (hoje fixo `'2026-09-30'`)
- `aberto` com `dataProva` `'2026-09-29'` → `encerrado`; com `'2026-09-30'` → continua `aberto` (prova hoje não encerrou).
- Ordenação de `emAlta` (emAlta primeiro, depois data, sem data por último).
- `porArea` sem encerrados, áreas ordenadas, "Área" com acento ordena certo.
- Com os dados reais do WP02: as quatro seções não vazias.

`tests/unit/datas.test.ts`
- 45 dias → "Faltam 45 dias"; 1 → "Falta 1 dia"; 0 → "É hoje!"; passada → realizada; `undefined` → indefinido.
- Travessia de horário de verão/ano bissexto: `'2028-02-28'` → `'2028-03-01'` = 2 dias.
- `hojeLocal(new Date(2026, 8, 30, 23, 30))` → `'2026-09-30'` (não vira dia seguinte por UTC).
- `formatarData('2026-11-15')` → `'15/11/2026'`.

`tests/unit/preferencias.test.ts` — use um `Storage` falso em memória (classe com `getItem/setItem/removeItem/clear/key/length`) e outro que **lança** em toda chamada:
- sem nada gravado → tudo `null`;
- escolher concurso de cargo único preenche `cargoId`;
- trocar cargo limpa disciplina; mesmo concurso de novo preserva foco;
- JSON corrompido → vazio, sem lançar;
- concurso gravado que não existe mais → vazio (borda "sumiu dos dados");
- storage que lança: `carregar` e `escolher*` não lançam, e o estado em memória muda mesmo assim (borda "janela privada");
- o que foi gravado segue exatamente o formato de `contracts/preferencias.md`.

Se o Vitest precisar compilar runes em `.svelte.ts`, o plugin `sveltekit()` já está no `vite.config.ts`; não edite o config.

## Definition of Done

- [ ] Portas do charter passam; os quatro arquivos de teste cobrem os casos acima.
- [ ] Nenhuma função lê o relógio sem receber `hoje`, exceto `hojeLocal`.
- [ ] Nenhum acesso a `localStorage` fora de `try/catch`.

## Riscos

- `$state` reatribuído (`estado = ...`) dentro de módulo: funciona com `let` em `.svelte.ts`; exporte só getters, nunca a variável.
- `\p{Diacritic}` requer flag `u` — já no exemplo.

## Guia do revisor

Conferir os casos de borda da spec um a um contra os testes; rodar `npm test` e ver o tempo do teste de desempenho.

## Activity Log

- 2026-09-30T05:40:27Z – claude:opus:implementer:implementer – shell_pid=10100 – Assigned agent via action command
- 2026-09-30T05:45:19Z – claude:opus:implementer:implementer – shell_pid=10100 – Ready for review: busca/secoes/datas/preferencias + 31 testes; busca 500 itens 0,23 ms
- 2026-09-30T05:45:47Z – claude:opus:reviewer:reviewer – shell_pid=27168 – Started review via action command
- 2026-09-30T05:47:40Z – claude:opus:reviewer:reviewer – shell_pid=27168 – Review passed: T011-T015 complete, signatures match WP spec and contracts/preferencias.md; date math UTC-based (DST/leap tested, hojeLocal local, verified under TZ=Pacific/Kiritimati); section ordering and prova-hoje rule correct; cascade/same-concurso/throwing-storage covered. Cargo-id-in-search-key deviation accepted: required by T015 'cgu ti' case, adds no extra false positive on current data (ti already substring-matches via other words), consistent with FR-002. Gates: check 0/0, 53 unit tests, build ok, e2e 1 passed; NFR-002 max 0.16 ms. Only owned files changed.
