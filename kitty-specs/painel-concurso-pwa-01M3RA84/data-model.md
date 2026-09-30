# Data Model: Painel de Concurso PWA

Tudo é local. Os dados de exemplo são somente leitura e vêm de `src/lib/dados/*.json`
(esquema em [contracts/dados-exemplo.schema.json](contracts/dados-exemplo.schema.json)).
A única coisa gravada é a Preferência ([contracts/preferencias.md](contracts/preferencias.md)).

## Concurso (`concursos.json`, lista)

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | string kebab-case | sim | único na lista |
| `nome` | string | sim | ex.: "CGU — Auditor Federal de Finanças e Controle" |
| `orgao` | string | sim | |
| `banca` | string | sim | |
| `area` | string | sim | agrupa a seção "Por Área" (ex.: Controle, Fiscal, Tribunais) |
| `situacao` | `"aberto"` \| `"previsto"` \| `"encerrado"` | sim | situação registrada |
| `emAlta` | boolean | não (padrão `false`) | ordena primeiro dentro de "Abertos em alta" |
| `vagas` | inteiro ≥ 0 | não | ausente ⇒ "vagas a definir" |
| `salario` | string | não | texto livre, ex.: "R$ 22.921,71" |
| `dataProva` | data ISO `AAAA-MM-DD` | não | ausente ⇒ "data a definir" |
| `edital` | URL https | não | ausente ⇒ botão do edital oculto |
| `icone` | nome de ícone de `Icone.svelte` | sim | |
| `cor` | `"azul"` \| `"verde"` \| `"roxo"` \| `"laranja"` \| `"vermelho"` | sim | vira classe com token de cor |
| `cargos` | lista de Cargo | sim, ≥ 1 | |

### Situação efetiva e seções

`situacaoEfetiva(c, hoje)` = `"encerrado"` se `dataProva < hoje`; senão `c.situacao`.

| Seção | Conteúdo | Comportamento |
|---|---|---|
| Abertos em alta | efetiva `aberto`, `emAlta` primeiro, depois por `dataProva` | 5 visíveis + "Ver mais"/"Ver menos" |
| Autorizados ou Previstos | efetiva `previsto` | recolhível, começa fechada |
| Por Área | todos não encerrados, agrupados por `area` em ordem alfabética | recolhível, começa fechada |
| Encerrados | efetiva `encerrado` | recolhível, começa fechada |

Com busca ativa, as seções mostram só os resultados e abrem sozinhas se tiverem resultado.

## Cargo

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | único dentro do concurso |
| `nome` | string | o primeiro cargo é o "cargo principal" do cartão |
| `disciplinas` | lista de string | ≥ 1 |

## Ferramenta (`ferramentas.json`, lista de 12)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | único; é o `[id]` da rota `/ferramenta/[id]` |
| `titulo` | string | |
| `subtitulo` | string | |
| `icone` | nome de ícone | |
| `grupo` | `"teorico"` \| `"pratica"` \| `"atalho"` | teorico = Material Teórico; pratica = Prática & Revisão; atalho = Estudo por Disciplina e Meu Plano de Estudos |

Distribuição: teorico 4 (aulas, resumos, mapas-mentais, pdfs), pratica 6 (questoes-objetivas,
questoes-discursivas, desafios-diarios, flashcards, simulados, jurisprudencia), atalho 2
(estudo-por-disciplina, plano-de-estudos).

## Config (`config.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `whatsapp` | URL https ou `null` | `null` ⇒ botão "Pedir no WhatsApp" oculto |
| `limiteEmAlta` | inteiro | padrão 5 |

## Preferência (gravada no aparelho)

| Campo | Tipo | Regra |
|---|---|---|
| `concursoId` | string \| null | inválido (id inexistente) ⇒ tratado como null (borda "sumiu dos dados") |
| `cargoId` | string \| null | deve pertencer ao concurso; único cargo ⇒ preenchido automaticamente |
| `disciplina` | string \| null | deve pertencer ao cargo; troca de cargo limpa |

### Transições

```
sem concurso ──tocar cartão──▶ concurso escolhido (cargo = único cargo ou null)
concurso escolhido ──escolher cargo──▶ cargo definido (disciplina = null)
cargo definido ──escolher disciplina──▶ disciplina definida
qualquer estado ──trocar concurso──▶ tela de escolha (preferência mantida até novo toque)
```
