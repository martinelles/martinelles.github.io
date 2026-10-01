# Data Model: Plano de Estudos

## Plano (`static/conteudo/plano.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `versao` | 1 | |
| `geradoEm` | ISO date | data de modificação do `ESTUDO.csv` (determinístico) |
| `inicio`, `fim` | `AAAA-MM-DD` | `inicio ≤ fim` |
| `horasPorDia` | número > 0 | padrão 3 |
| `minutosPorTarefa` | inteiro > 0 | padrão 45 |
| `tarefas` | Tarefa[] | ordem = fila |

### Tarefa

| Campo | Regra |
|---|---|
| `id` | `id` do `ESTUDO.csv` (ex.: `CDA-01`), único |
| `disciplina` | como no `ESTUDO.csv` |
| `materia` | id de matéria do feed ou `null` |
| `topico` | texto literal do edital |
| `minutos` | `minutosPorTarefa` |
| `prioridade` | número do `ESTUDO.csv` |
| `status` | status no `ESTUDO.csv` no momento da importação (`nao_iniciado`, `estudado`, `revisado`, `travado`) |

## Registro (aparelho, `painel-concurso:plano:v1`)

```
{
  "registros": { "<tarefaId>": { "dia": "AAAA-MM-DD", "intervalos": [[inicioMs, fimMs], ...],
                                 "rodandoDesde": number|null, "concluidaEm": ISO|null,
                                 "questoes": number|null, "certas": number|null } },
  "fotos": { "AAAA-MM-DD": ["<tarefaId>", ...] }
}
```

- Uma tarefa tem no máximo um registro; `concluidaEm` não volta a `null` (concluir é definitivo nesta missão).
- `certas ≤ questoes`.
- Só um cronômetro rodando por vez: iniciar outra tarefa pausa a anterior.

## Derivados (nunca guardados — C-003)

- `minutosEstudados(registro, agora)` = Σ(fim−início) + (agora − rodandoDesde se rodando).
- `horasEstudadas` = Σ minutos / 60. `horasTotais` = `noPlano` × `horasPorDia`.
- `percentualPlano` = concluídas / `tarefas.length`.
- `missaoDoDia(dia)` = foto do dia, ou próximas pendentes que somam ≤ `horasPorDia`·60 (mín. 1).
- `percentualMissao` = concluídas da foto / tamanho da foto.
- Dias: para cada dia `d` em [inicio, fim]: `concluido` se existe foto de `d` e todas as tarefas dela têm `concluidaEm` ≤ fim de `d`; `emAberto` se `d < hoje` e não concluído; senão `restante`. Identidade: concluídos + em aberto + restantes = noPlano.

## Transições da tarefa

```
pendente ──iniciar──▶ rodando ──pausar──▶ pausada ──retomar──▶ rodando
rodando|pausada ──concluir(questoes?, certas?)──▶ concluída
```
