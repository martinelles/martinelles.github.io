---
work_package_id: WP05
title: Tela de escolha de concurso
dependencies:
- WP03
- WP04
requirement_refs:
- FR-001
- FR-002
- FR-003
- FR-004
- FR-006
- FR-007
- FR-013
planning_base_branch: main
merge_target_branch: main
branch_strategy: Planning artifacts for this feature were generated on main. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into main unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-painel-concurso-pwa-01M3RA84
base_commit: 3637d60c73e8fb1b8e5329d7868bd89cc7f313c8
created_at: '2026-09-30T05:48:06.514513+00:00'
subtasks:
- T021
- T022
- T023
- T024
- T025
phase: Fase 3 - Telas
assignee: ''
agent: "claude:opus:implementer:implementer"
shell_pid: "11160"
history:
- timestamp: '2026-09-30T05:18:22Z'
  agent: system
  action: Prompt generated via /spec-kitty.tasks
authoritative_surface: src/routes/escolher/
execution_mode: code_change
owned_files:
- src/routes/+page.svelte
- src/routes/escolher/**
- tests/e2e/escolher.spec.ts
tags: []
---

# WP05 – Tela de escolha de concurso

## Objetivo

Entregar o Cenário 1 da spec inteiro (aceites 1 a 6) e a decisão da rota raiz (FR-013),
montando os componentes do WP04 sobre a lógica do WP03.

## Contexto

- Spec: Cenário 1, FR-001..FR-007, FR-013, casos de borda "concurso que sumiu" e "janela privada".
- Lógica pronta (WP03): `indexar`, `filtrar`, `agruparEmSecoes`, `situacaoEfetiva`, `hojeLocal`, `preferencias`, `carregar`.
- Componentes prontos (WP04): `CampoBusca`, `CartaoConcurso`, `SecaoRecolhivel`, `EstadoVazio`, `Icone`.
- Dados (WP02): `dados`, `buscarConcurso`.
- Navegação: `goto` de `$app/navigation`; `replaceState: true` no redirecionamento da raiz para não empilhar histórico.
- O layout (`src/routes/+layout.svelte`) é do WP01 e **não** chama `carregar()`; cada tela chama no topo do script (idempotente).

## Branch Strategy

Planejamento em `main`; merge em `main`. Worktree pela lane de `lanes.json`; paralelo ao WP06.
Comando: `spec-kitty agent action implement WP05 --agent <nome>`.

## Subtarefas

### T021 — Rota raiz `src/routes/+page.svelte`

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { carregar, preferencias } from '$lib/preferencias.svelte';
  import { buscarConcurso } from '$lib/dados';
  import { onMount } from 'svelte';
  carregar();
  onMount(() => {
    const destino = buscarConcurso(preferencias.concursoId) ? '/painel' : '/escolher';
    goto(destino, { replaceState: true });
  });
</script>
<p class="carregando" aria-live="polite">Abrindo…</p>
```
Sem piscar conteúdo: o parágrafo é discreto e centralizado. `carregar()` já trata concurso inexistente (volta `null`) — a raiz não repete a regra.

### T022 — `src/routes/escolher/+page.svelte`: cabeçalho, busca e seções

Estrutura (de cima para baixo):
1. `<header>`: "Olá!" (premissa: sem login, sem nome), `<h1>Qual o concurso dos seus sonhos?</h1>`, parágrafo "Vamos personalizar a inteligência do aplicativo para o seu objetivo." (FR-001).
2. `<CampoBusca bind:valor={termo} />`.
3. Seções, cada uma com `<h2>` dentro do cabeçalho do `SecaoRecolhivel` ou acima da lista:
   - "Abertos em alta" — lista direta (não recolhível), com limite (T023);
   - "Autorizados ou Previstos", "Por Área", "Encerrados" — `SecaoRecolhivel`, fechadas por padrão (FR-004).
   - "Por Área": dentro da seção, um `<h3>` por área e seus cartões.
4. `<svelte:head><title>Escolha seu concurso · Painel de Concurso</title></svelte:head>`.

Estado derivado com runes:
```ts
carregar();
const hoje = hojeLocal();
const indice = indexar(dados.concursos);          // uma vez
let termo = $state('');
const filtrados = $derived(filtrar(indice, termo));
const secoes = $derived(agruparEmSecoes(filtrados, hoje));
const buscando = $derived(normalizar(termo) !== '');
```
Etiqueta do cartão: `{ aberto: 'Aberto', previsto: 'Previsto', encerrado: 'Encerrado' }[situacaoEfetiva(c, hoje)]`.

Se o concurso salvo existir, mostrar no topo um aviso discreto "Continuar com {nome}" que leva ao painel — conveniência de quem veio por "trocar concurso" e desistiu.

### T023 — Ver mais / Ver menos, abrir/fechar, abertura na busca

- "Abertos em alta": mostra `secoes.emAlta.slice(0, limite)` com `limite = dados.config.limiteEmAlta`; se houver mais, botão "Ver mais ({restantes})"; expandido, botão "Ver menos". Ao recolher, rolar suavemente até o `<h2>` da seção (sem pular a pessoa para o fim da página).
- Seções recolhíveis: estado `aberta` por seção em `$state`. **Com busca ativa**, toda seção com resultado abre sozinha e "Abertos em alta" mostra todos (não limitar resultado de busca). Ao limpar a busca, volta ao estado que a pessoa tinha deixado (guarde o estado manual separado do estado "forçado pela busca").
- Anunciar a contagem de resultados em `aria-live="polite"`: "3 concursos encontrados" / "1 concurso encontrado".

### T024 — Seleção e estado vazio

- `onescolher={(id) => { preferencias.escolherConcurso(id); goto('/painel'); }}` em todos os cartões (FR-007).
- Busca com zero resultados (`buscando && filtrados.length === 0`): esconder todas as seções e renderizar `<EstadoVazio termo={termo} whatsapp={dados.config.whatsapp} onestudarPorDisciplina={() => goto('/ferramenta/estudo-por-disciplina')} />` (FR-006). A rota `/ferramenta/[id]` é do WP06; no e2e deste WP, confira só a URL.

### T025 — `tests/e2e/escolher.spec.ts`

Cada teste começa com `page.addInitScript(() => localStorage.clear())` e `page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'))` para as seções não mudarem com a data real. Casos (numerados como os aceites da spec):
1. Primeiro acesso em `/` → URL vira `/escolher`; vê o `h1` "Qual o concurso dos seus sonhos?", o campo de busca e os títulos das quatro seções.
2. Digitar "cgu" → só cartões cujo texto contém CGU/Controladoria; digitar "UNIAO" (sem acento, maiúsculas) → mesmo resultado.
3. Digitar "zzzz" → texto `Poxa, não encontramos "zzzz"`, "A gente adiciona para você!", botão "Estudar por Disciplina"; com `whatsapp: null` **não** existe link "Pedir no WhatsApp". Clicar "Estudar por Disciplina" → URL `/ferramenta/estudo-por-disciplina`.
4. "Abertos em alta" mostra 5 cartões; "Ver mais" mostra todos; "Ver menos" volta a 5.
5. Clicar no cabeçalho "Encerrados" → `aria-expanded="true"` e cartões visíveis; clicar de novo → fecha. Idem "Autorizados ou Previstos" e "Por Área".
6. Clicar no cartão do CGU → URL `/painel` e `localStorage['painel-concurso:preferencias:v1']` contém `"concursoId":"cgu-affc-ti"`.
7. (FR-013) Com preferência válida gravada via `addInitScript`, abrir `/` → vai para `/painel`. Com `concursoId: "nao-existe"` → vai para `/escolher`.
8. Concurso com prova passada e `situacao: "aberto"` aparece em "Encerrados" e não em "Abertos em alta".

Enquanto o WP06 não estiver na mesma base, `/painel` pode não renderizar nada — os testes 6 e 7 checam só a URL e o `localStorage`.

## Definition of Done

- [ ] Portas do charter passam, incluindo `npm run test:e2e`.
- [ ] Aceites 1–6 do Cenário 1 e FR-013 cobertos por teste.
- [ ] Navegação só por teclado funciona: Tab chega à busca, aos cabeçalhos e aos cartões; Enter/Espaço acionam.
- [ ] Nenhum arquivo fora de `owned_files` alterado.

## Riscos

- `page.clock` exige Playwright ≥ 1.45 (instalado 1.63).
- Mudar o estado das seções dentro de `$derived` causa loop; use `$derived` para o "forçado pela busca" e `$state` para o manual, combinando na renderização.

## Guia do revisor

Percorrer os aceites da spec no preview em 360 px; conferir que o limite de 5 não se aplica durante a busca e que o estado manual das seções volta depois de limpar a busca.

## Activity Log

- 2026-09-30T05:48:09Z – claude:opus:implementer:implementer – shell_pid=11160 – Assigned agent via action command
- 2026-09-30T06:19:39Z – claude:opus:implementer:implementer – shell_pid=11160 – Ready for review
