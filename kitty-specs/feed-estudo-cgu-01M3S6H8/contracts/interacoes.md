# Contrato: estado no aparelho

## Interações

- **Chave**: `painel-concurso:interacoes:v1`
- **Valor**:
  ```json
  {
    "respostas": { "q:CGU2022-AFFC-TI-47": { "r": "E", "ok": true, "em": "2026-09-30" } },
    "curtidas": ["l:06-Lei-12527-2011-LAI:art-7"],
    "salvos": { "r:ti-ciencia-de-dados--supervisionado": "2026-09-30T14:02:11.000Z" },
    "vistos": { "2026-09-30": ["q:CGU2022-AFFC-TI-47"] }
  }
  ```
- Leitura e escrita em `try/catch`; JSON inválido ⇒ estado vazio; falha de escrita ⇒ estado segue em memória e a UI mostra uma vez o aviso "Seu progresso não está sendo salvo neste navegador".
- `vistos` é podado para os últimos 7 dias a cada escrita.
- Post que sumiu do conteúdo (id inexistente no índice) é mantido no estado e ignorado na tela.

## Foco

- **Chave**: `painel-concurso:preferencias:v2` → `{ "disciplina": "ti-ciencia-de-dados" }`.
- `painel-concurso:preferencias:v1` é ignorada (não migrada, não apagada).

## Interface (`src/lib/feed/interacoes.svelte.ts`)

```ts
export function carregarInteracoes(arm?: Storage | null): void;
export const interacoes: {
  resposta(id: string): { r: string; ok: boolean; em: string } | null;
  responder(id: string, r: string, gabarito: string): void; // ignora se já respondida
  curtido(id: string): boolean;  alternarCurtida(id: string): void;
  salvo(id: string): boolean;    alternarSalvo(id: string): void;
  salvosOrdenados(): string[];   // mais recente primeiro
  marcarVisto(id: string, dia: string): void;
  vistosNoDia(dia: string): Set<string>;
  readonly persistindo: boolean; // false quando o storage falhou
};
```
