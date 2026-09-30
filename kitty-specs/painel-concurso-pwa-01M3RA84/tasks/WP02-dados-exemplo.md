---
work_package_id: WP02
title: Dados de exemplo e validação
dependencies:
- WP01
requirement_refs:
- C-002
- FR-014
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T05:33:38.414674+00:00'
subtasks:
- T006
- T007
- T008
- T009
- T010
phase: Fase 1 - Fundação
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "10012"
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/lib/dados/
execution_mode: code_change
owned_files:
- src/lib/dados/**
- tests/unit/dados.test.ts
tags: []
---

# WP02 – Dados de exemplo e validação

## Objetivo

Criar a fonte única de dados das telas: tipos TypeScript, três JSONs de exemplo e um
validador que recusa dado malformado com mensagem clara. Critério de sucesso SC-005:
acrescentar concurso = editar só `concursos.json`.

## Contexto

- `data-model.md` (campos, regras, seções) e `contracts/dados-exemplo.schema.json` (forma exata) — são a referência; em divergência, o data-model vence e o schema deve ser corrigido em nota no histórico.
- FR-014; C-002 (nada copiado do Acertei — nomes de concursos públicos reais são fato público, mas vagas, salários e datas aqui são **ilustrativos**).
- Sem dependência de runtime: o validador é escrito à mão, não usa Ajv/Zod.

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`.
Comando: `spec-kitty agent action implement WP02 --agent <nome>`.

## Subtarefas

### T006 — `src/lib/dados/tipos.ts`

```ts
export type Situacao = 'aberto' | 'previsto' | 'encerrado';
export type CorConcurso = 'azul' | 'verde' | 'roxo' | 'laranja' | 'vermelho';
export type GrupoFerramenta = 'teorico' | 'pratica' | 'atalho';

export interface Cargo { id: string; nome: string; disciplinas: string[]; }

export interface Concurso {
  id: string; nome: string; orgao: string; banca: string; area: string;
  situacao: Situacao; emAlta?: boolean; vagas?: number; salario?: string;
  dataProva?: string; // AAAA-MM-DD
  edital?: string;    // https://
  icone: string; cor: CorConcurso; cargos: Cargo[];
}

export interface Ferramenta { id: string; titulo: string; subtitulo: string; icone: string; grupo: GrupoFerramenta; }
export interface Config { whatsapp: string | null; limiteEmAlta: number; }
export interface Dados { concursos: Concurso[]; ferramentas: Ferramenta[]; config: Config; }
```

Nomes de ícone válidos (o WP04 desenha estes e só estes; exporte a lista):
```ts
export const ICONES = ['balanca','escudo','moeda','predio','martelo','grafico','livro','caderno',
  'mapa','documento','lista','raio','cartas','cronometro','calendario','busca','whatsapp',
  'voltar','seta-baixo','seta-cima','edital','pessoas','relogio','trocar'] as const;
export type NomeIcone = typeof ICONES[number];
```

### T007 — `concursos.json` (≥ 12)

Lista JSON na raiz (sem objeto envelope). Distribuição mínima, com hoje de referência 2026-09-30:
- **Abertos em alta** (`situacao: "aberto"`, `dataProva` futura): 7 itens, 3 com `emAlta: true` — força o "Ver mais" (limite 5).
- **Previstos** (`situacao: "previsto"`, sem `dataProva` ou futura): 3 itens.
- **Encerrados**: 2 com `situacao: "encerrado"` **e** 1 com `situacao: "aberto"` mas `dataProva` passada (testa a situação efetiva).
- Pelo menos um concurso com **um único cargo** e um **sem `edital`**, um **sem `vagas`**.
- Áreas usadas: "Controle", "Fiscal", "Tribunais", "Policial", "Bancária" (seção Por Área).

Itens obrigatórios (o usuário estuda para eles):
1. `cgu-affc-ti` — "CGU — Auditor Federal de Finanças e Controle", órgão "Controladoria-Geral da União", banca "Cebraspe", área "Controle", `aberto`, `emAlta: true`, cargos: `auditor-ti` "Auditor — Tecnologia da Informação" (disciplinas: "Língua Portuguesa", "Controle Externo", "Administração Pública", "Direito Constitucional", "Direito Administrativo", "Ciência de Dados", "Segurança da Informação", "Engenharia de Software", "Governança de TI"), `auditor-geral` "Auditor — Auditoria e Fiscalização" (disciplinas próprias). `icone: "escudo"`, `cor: "azul"`.
2. `tcu-auditor` — "TCU — Auditor Federal de Controle Externo", banca "Cebraspe", área "Tribunais", `previsto`, sem `dataProva`.

Os demais: escolha concursos federais plausíveis (Receita Federal, PF, Banco do Brasil, TCE, etc.) com números **ilustrativos**. Acrescente ao lado, em `src/lib/dados/LEIA-ME.md`, a frase "Dados ilustrativos para a casca visual; vagas, salários e datas não são oficiais." e como acrescentar um concurso.

### T008 — `ferramentas.json` (12) e `config.json`

`ferramentas.json` — exatamente estes ids, nesta ordem, com títulos da spec (FR-010) e subtítulos curtos **escritos por você** (não copie os do Acertei):

| id | titulo | grupo | icone |
|---|---|---|---|
| aulas | Aulas Digitais | teorico | livro |
| resumos | Resumos | teorico | documento |
| mapas-mentais | Mapas Mentais | teorico | mapa |
| pdfs | PDFs | teorico | caderno |
| questoes-objetivas | Questões Objetivas | pratica | lista |
| questoes-discursivas | Questões Discursivas | pratica | documento |
| desafios-diarios | Desafios Diários | pratica | raio |
| flashcards | Flashcards | pratica | cartas |
| simulados | Simulados | pratica | cronometro |
| jurisprudencia | Jurisprudência | pratica | balanca |
| estudo-por-disciplina | Estudo por Disciplina | atalho | busca |
| plano-de-estudos | Meu Plano de Estudos | atalho | calendario |

`config.json`: `{ "whatsapp": null, "limiteEmAlta": 5 }` — com `null` o botão "Pedir no WhatsApp" some (premissa da spec).

### T009 — `validar.ts` e `index.ts`

`validar.ts` exporta `validarDados(bruto: unknown): Dados` que **lança** `Error` com todas as falhas juntas, uma por linha, com o caminho: `concursos[3].cargos[0].disciplinas: lista vazia`. Regras (do data-model e do schema):
- campos obrigatórios presentes e do tipo certo; enums válidos; `id` kebab-case `^[a-z0-9-]+$`;
- `id` de concurso único; `id` de cargo único dentro do concurso; `id` de ferramenta único;
- `cargos.length ≥ 1`, `disciplinas.length ≥ 1`;
- `dataProva` casa `^\d{4}-\d{2}-\d{2}$` e é data real (`2026-02-30` falha);
- `edital`/`whatsapp` começam com `https://`;
- `icone` está em `ICONES`;
- `ferramentas.length === 12`; `concursos.length ≥ 12`;
- campo desconhecido é erro (`additionalProperties: false`) — pega erro de digitação no JSON.

`index.ts`:
```ts
import concursos from './concursos.json';
import ferramentas from './ferramentas.json';
import config from './config.json';
import { validarDados } from './validar';
export const dados = validarDados({ concursos, ferramentas, config });
export const buscarConcurso = (id: string | null) => dados.concursos.find(c => c.id === id) ?? null;
export const buscarFerramenta = (id: string) => dados.ferramentas.find(f => f.id === id) ?? null;
export * from './tipos';
```
Validar na carga custa < 1 ms com 12 itens; se o dado estiver quebrado, o app falha cedo e o erro aparece no console — preferível a tela com buraco.

### T010 — `tests/unit/dados.test.ts`

Casos:
1. Os dados reais passam (`import { dados } from '$lib/dados'` não lança) e têm ≥ 12 concursos, 12 ferramentas.
2. Distribuição: ≥ 1 concurso por seção esperada (conte por `situacao` e por `dataProva < '2026-09-30'`), ≥ 6 abertos futuros, ≥ 1 com cargo único, ≥ 1 sem edital, `cgu-affc-ti` e `tcu-auditor` presentes.
3. Para cada regra do T009, um objeto mínimo quebrado só naquela regra lança e a mensagem contém o caminho esperado (use `structuredClone` de um concurso válido).
4. Várias falhas juntas: a mensagem lista todas.

Se `$lib` não resolver no Vitest, o plugin `sveltekit()` no `vite.config.ts` (WP01) já cuida; não edite o config — reporte ao revisor.

## Definition of Done

- [ ] Portas do charter passam (`check`, `test`, `build`).
- [ ] `dados.test.ts` cobre todas as regras do T009.
- [ ] Nenhum texto longo, cor, ícone ou número copiado do Acertei; `LEIA-ME.md` presente.

## Riscos

- `resolveJsonModule` infere tipos largos (`string` em vez do union); por isso o `validarDados` recebe `unknown` e devolve `Dados` tipado.

## Guia do revisor

Rodar `npm test -- dados`; abrir `concursos.json` e conferir a distribuição; tentar remover uma disciplina de um cargo e ver o teste falhar com caminho legível.

## Activity Log

- 2026-09-30T05:33:41Z – claude:opus:implementer:implementer – shell_pid=10012 – Assigned agent via action command
- 2026-09-30T05:37:56Z – claude:opus:implementer:implementer – shell_pid=10012 – Ready for review: tipos, 13 concursos ilustrativos, 12 ferramentas, config, validador manual com caminho por falha, 22 testes; check/test/build/e2e verdes
