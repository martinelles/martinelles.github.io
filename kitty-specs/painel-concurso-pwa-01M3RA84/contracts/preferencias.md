# Contrato: preferências no aparelho

Não há API de rede (C-001). O único contrato externo às telas é o que fica gravado no
`localStorage` do navegador.

- **Chave**: `painel-concurso:preferencias:v1`
- **Valor**: JSON `{ "concursoId": string|null, "cargoId": string|null, "disciplina": string|null }`
- **Leitura**: em `try/catch`; JSON inválido, chave ausente ou armazenamento bloqueado ⇒ `{ null, null, null }`. Ids que não existem nos dados atuais viram `null` (cascata: concurso inválido limpa cargo e disciplina).
- **Escrita**: a cada mudança, em `try/catch`; falha é silenciosa e o estado continua em memória na sessão.
- **Versão**: mudança incompatível de formato troca o sufixo `v1`; a versão antiga é ignorada, não migrada.

## Interface de `src/lib/preferencias.svelte.ts`

```ts
export const preferencias: {
  readonly concursoId: string | null;
  readonly cargoId: string | null;
  readonly disciplina: string | null;
  escolherConcurso(id: string): void;   // define cargo automático se houver só um
  escolherCargo(id: string): void;      // limpa disciplina
  escolherDisciplina(nome: string): void;
};
export function carregar(armazenamento?: Storage | null): void; // chamado no +layout
```
