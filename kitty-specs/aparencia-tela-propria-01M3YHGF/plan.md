# Plano de Implementação: Ajustes em Tela Própria

**Missão**: `aparencia-tela-propria-01M3YHGF` | **Data**: 2026-10-02 | **Spec**: [spec.md](spec.md)
**Branch**: planejamento em `main`, merge em `main` (`branch_matches_target: true`)
**Base de código**: `main` em `5e16a61`, com a missão `questoes-por-tarefa` já mesclada; o painel já traz os blocos do plano de estudos (`MissaoDoDia`, `ResumoPlano`, `AvisoRegistro`)

## Resumo

É uma mudança de composição, sem lógica nova:

1. Uma rota nova, `src/routes/painel/ajustes/+page.svelte`, monta `FocoEstudo` e `SeletorTema`, que já existem, com título "Ajustes" e o link "Voltar ao painel".
2. `src/routes/painel/+page.svelte` deixa de montar esses dois componentes.
3. `CabecalhoPainel` ganha no canto um link com ícone e nome acessível "Ajustes" (`href="/painel/ajustes"`) e uma linha de texto com o foco atual (cargo e disciplina), cumprindo o FR-006.
4. Entra um ícone novo, `ajustes` (controles deslizantes, do Lucide `sliders-horizontal`, licença ISC), no `Icone`.

A rota fica sob `/painel`, então a regra existente do layout (`caminho.startsWith('/painel')`) já marca a aba Painel (FR-008). O link direto e o modo offline já funcionam para qualquer rota: o service worker responde navegações com a casca do SPA, e o Pages entrega `404.html` (FR-007).

## Contexto técnico

**Linguagem/versão**: TypeScript 5.9, Svelte 5 (runes), SvelteKit 2 com adapter-static em SPA
**Dependências**: nenhuma nova
**Armazenamento**: sem mudança; foco em `painel-concurso:preferencias:v2` e tema em `painel-concurso:tema:v1`, ambos já existentes
**Testes**: Playwright contra o build. Os testes que hoje abrem o seletor ou o campo "Disciplina" em `/painel` passam a abrir `/painel/ajustes`, e entram testes novos para o botão, a volta, a aba atual e o link direto e offline. Vitest: nenhum módulo `.ts` novo, então nenhum teste de unidade novo
**Plataforma**: PWA publicado em `https://martinelles.github.io`
**Desempenho**: sem impacto mensurável (a rota nova só reúne componentes já carregados)
**Restrições**: C-001 (sem mudar a lógica de tema e de foco), C-002 (tokens e lista anti-"cara de IA"), C-003 (não mexer no código das outras missões)
**Escopo**: 1 rota nova, 3 arquivos alterados (`painel/+page.svelte`, `CabecalhoPainel.svelte`, `Icone.svelte` com `dados/tipos.ts`) e os testes e2e afetados

## Charter Check

| Regra | Situação |
|---|---|
| Stack TS, Svelte 5 e SvelteKit SPA, CSS com tokens por tema | ✅ Nada novo |
| Nenhuma dependência de runtime nova | ✅ |
| Lógica em `src/lib/*.ts` coberta por Vitest; aceite por Playwright no build, com 360 px e offline | ✅ Não há lógica nova em `.ts`; o aceite inclui 360 px e offline (seção Testes) |
| Gates `check`, `test`, `build` e `test:e2e` | ✅ Todo WP toca tela; o e2e roda **em série**, porque a porta 4173 é única (lição da missão anterior, registrada abaixo) |
| Antes do merge, a dona confere a missão | ✅ |
| DIRECTIVE_024 (menor raio de mudança) | ✅ Componentes reaproveitados sem alteração interna |
| DIRECTIVE_033 (staging só do WP) | ✅ `git add` por caminho; a `main` costuma ter mudanças de outras sessões (em 2026-10-02, `static/conteudo/*` sem commit), que não podem entrar nos commits desta missão |

**Gate**: aprovado, sem exceções.

## Decisões de arquitetura

Detalhes em [research.md](research.md).

1. **Rota `/painel/ajustes`** em vez de modal ou painel recolhível: tem endereço (FR-007), o voltar do aparelho funciona sozinho (Cenário 4.3) e herda a aba atual (FR-008).
2. **O acesso é um link, não um `<button>`**: é navegação, então leitor de tela e o "abrir em nova aba" funcionam. Visualmente é um quadrado de 44 px com ícone, `aria-label="Ajustes"` e `title="Ajustes"`. O teste o procura por `getByRole('link', { name: 'Ajustes' })`.
3. **Texto do foco no cabeçalho** (FR-006): a linha "Foco: TI: Ciência de Dados", com o nome da matéria resolvido pelo `id` a partir de `materias`. Enquanto as matérias carregam, mostra o `id` formatado, e não um "Carregando". Prop nova e opcional no `CabecalhoPainel`, `foco?: { cargo: string; disciplina: string }`. O cargo fica na linha que já existe.
4. **Ordem na tela de Ajustes**: título (`h1` "Ajustes", em `--fonte-titulo`), link "Voltar ao painel" (o mesmo texto e padrão de `/ferramenta/[id]`), `FocoEstudo` e depois `SeletorTema`, com o espaçamento do painel.
5. **Ícone `ajustes`**: um traço novo no `Icone`, adaptado do Lucide (ISC), convertido para um único `d`, como os demais (comentário do arquivo).
6. **Conflito com outras missões**: `painel/+page.svelte` também é editado pela missão do plano de estudos. A mudança aqui se limita a remover 2 componentes, 2 imports e a constante `CARGO`, que vai para a rota nova. O WP faz merge da `main` antes de começar e de novo antes de pedir revisão.

## Estrutura do projeto

### Documentação

```
kitty-specs/aparencia-tela-propria-01M3YHGF/
├── spec.md
├── plan.md            # este arquivo
├── research.md
├── quickstart.md
├── contracts/
│   └── tela-ajustes.md   # rota, papéis acessíveis e textos que os testes usam
└── checklists/requirements.md
```

Não há `data-model.md`: a missão não cria nem muda dado. As entidades Foco e Preferência de tema seguem como estão.

### Código-fonte

```
src/
├── routes/painel/
│   ├── +page.svelte              # remove FocoEstudo e SeletorTema; passa o foco ao cabeçalho
│   └── ajustes/+page.svelte      # NOVO: h1 "Ajustes", Voltar ao painel, FocoEstudo, SeletorTema
├── lib/componentes/
│   ├── CabecalhoPainel.svelte    # + link "Ajustes" no canto, + linha do foco atual
│   └── Icone.svelte              # + traço "ajustes"
└── lib/dados/tipos.ts            # + 'ajustes' em ICONES
tests/e2e/
├── ajustes.spec.ts               # NOVO: Cenários 1 a 4
├── tema.spec.ts                  # seletor passa a ser aberto em /painel/ajustes
├── painel.spec.ts                # campo Disciplina passa a ser aberto em /painel/ajustes
├── responsivo.spec.ts            # + tela /painel/ajustes; /painel sem "Disciplina"
└── offline.spec.ts               # + /painel/ajustes offline
```

## Testes

| Requisito | Verificação |
|---|---|
| FR-001, SC-001 | e2e: `/painel` não tem `group` "Aparência" nem o campo "Disciplina" |
| FR-002, NFR-002 | e2e: `link` "Ajustes" no cabeçalho, com caixa ≥ 44 × 44, leva a `/painel/ajustes`; teclado (Tab e Enter) |
| FR-003, FR-004, FR-005 | e2e: em `/painel/ajustes`, `heading` "Ajustes", depois "Foco de Estudo" e depois `group` "Aparência", nessa ordem no DOM; os testes de tema e de foco existentes passam nesta tela |
| FR-006 | e2e: o painel mostra o texto do foco; ao mudar a disciplina em Ajustes e voltar, o texto muda |
| FR-007, SC-003 | e2e: `goto('/painel/ajustes')` direto; offline depois da primeira visita (em `offline.spec.ts`) |
| FR-008 | e2e: `a.aba[aria-current="page"]` com `href` `/painel` |
| Cenário 4.3 | e2e: `page.goBack()` volta a `/painel` |
| NFR-001, SC-002 | e2e: do painel, um clique em "Ajustes" e um em "Kindle" deixam `data-tema="kindle"` |
| NFR-003 | Lighthouse em `/painel/ajustes` e `/painel`, nos 3 temas (anotado na revisão) |
| NFR-004 | `responsivo.spec.ts` com a tela nova, nos 3 temas, a 360 e 1440 px |

## Complexity Tracking

| Regra | Motivo | Alternativa rejeitada | Data |
|---|---|---|---|
| (sem exceções ao charter) | — | — | — |

**Lição registrada da missão anterior**: o e2e de lanes paralelas colidiu na porta 4173. Nesta missão, quem roda o e2e é o orquestrador, uma lane por vez, com `CI=1` e a porta conferida antes.
