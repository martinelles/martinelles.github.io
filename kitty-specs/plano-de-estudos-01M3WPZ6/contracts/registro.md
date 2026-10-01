# Contrato: registro do plano no aparelho

- **Chave**: `painel-concurso:plano:v1` — formato em [../data-model.md](../data-model.md#registro-aparelho-painel-concursoplanov1).
- Toda leitura/escrita em `try/catch`; JSON inválido ⇒ vazio; falha de escrita ⇒ segue em memória e o aviso existente de progresso não salvo aparece (mesmo mecanismo de `interacoes.persistindo`).
- Escrita a cada transição (iniciar, pausar, retomar, concluir) e ao gravar foto; nunca a cada segundo.

## Interface (`src/lib/plano/registro.svelte.ts`)

```ts
export const CHAVE_PLANO = 'painel-concurso:plano:v1';
export function carregarRegistro(arm?: Storage | null): void;
export const registro: {
  readonly persistindo: boolean;
  doTarefa(id: string): RegistroTarefa | null;
  rodando(): string | null;                         // id da tarefa com cronômetro ativo
  iniciar(id: string, dia: string, agora?: number): void;   // pausa a que estiver rodando
  pausar(id: string, agora?: number): void;
  retomar(id: string, agora?: number): void;
  concluir(id: string, q?: { questoes: number; certas: number }, agora?: number): void;
  foto(dia: string): string[] | null;
  gravarFoto(dia: string, ids: string[]): void;     // só grava se ainda não existe
  dados(): DadosPlano;                               // snapshot para funções puras
};
```

## Exportação (`exportar.ts`)

`exportarCsv(plano, dados): string` — cabeçalho
`id,ultima_sessao,minutos,questoes_feitas,questoes_certas,status_sugerido`, **uma linha por tópico** (`topicoId`) com ao menos uma tarefa concluída (emenda D4), ordem pela primeira conclusão; `minutos` = soma das tarefas `:L` e `:Q`; questões da `:Q`; `status_sugerido` = `estudado` só com as duas concluídas, senão vazio; `ultima_sessao` = data de `concluidaEm`; `minutos` inteiro;
campos vazios quando questões não lançadas. Nome do arquivo: `progresso-plano-AAAA-MM-DD.csv`.
