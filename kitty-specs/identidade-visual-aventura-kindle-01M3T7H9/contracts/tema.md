# Contrato: tema

Vale para `src/app.html`, `src/app.css`, `src/lib/tema.svelte.ts` e `SeletorTema.svelte`.
Qualquer mudança aqui exige atualizar `tests/unit/contraste.test.ts` e `tests/e2e/tema.spec.ts`.

## 1. Atributo na raiz

- Elemento: `<html>`. Atributo: `data-tema`. Valores: `aventura`, `kindle` e `kindle-escuro`.
- Sempre presente depois do script inline. Sem JS, fica ausente, e o `:root` sem atributo vale Aventura.
- Os blocos de token usam `:root[data-tema='X'], [data-tema='X']`: o mesmo atributo num elemento interno aplica o tema só naquele trecho. A prévia do seletor usa isso.
- `<meta name="theme-color">` único, com o `content` igual a `--cor-fundo` do tema ativo, atualizado junto com o atributo.

## 2. Preferência gravada

- Chave: `painel-concurso:tema:v1`. Valor: JSON `{ "tema": "sistema" | "aventura" | "kindle" | "kindle-escuro" }`.
- Ausente, JSON inválido, valor fora da lista ou `localStorage` inacessível: tratado como `sistema`, sem apagar nem reescrever.
- Toda leitura e escrita em try/catch. Se a escrita falhar, a escolha vale só na sessão.

## 3. Resolução (script inline e store usam a mesma regra)

```
preferencia = lerChave() ?? 'sistema'
ativo = preferencia !== 'sistema'
      ? preferencia
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'kindle-escuro' : 'aventura')
```

Com a preferência em `sistema`, a mudança de `prefers-color-scheme` reaplica a regra na hora (FR-002, Cenário 2.3).

## 4. Store `src/lib/tema.svelte.ts`

```ts
export type Tema = 'aventura' | 'kindle' | 'kindle-escuro';
export type PreferenciaTema = 'sistema' | Tema;
export const CHAVE_TEMA = 'painel-concurso:tema:v1';
export const TEMAS: readonly { id: Tema; nome: string }[];   // ordem do seletor
/** Onde o tema é aplicado; injetável para teste em ambiente node. */
export interface AlvoTema { definir(t: Tema): void }
export function carregarTema(
  arm?: Storage | null,          // padrão: localStorage em try/catch
  mq?: MediaQueryList | null,    // padrão: matchMedia('(prefers-color-scheme: dark)')
  alvo?: AlvoTema | null         // padrão: <html data-tema> + <meta name="theme-color">
): void; // idempotente; chamar de novo troca os ouvintes, sem duplicar
export const tema: {
  readonly preferencia: PreferenciaTema;
  readonly ativo: Tema;
  escolher(p: PreferenciaTema): void;  // valor inválido: ignora; aplica em <html> e grava
};
```

## 5. Tokens obrigatórios em cada `[data-tema]`

Todos os três blocos definem **todos** os tokens abaixo. Faltar um é defeito, e o teste de contraste
falha ao não achar o valor.

| Grupo | Tokens |
|---|---|
| Superfícies | `--cor-fundo`, `--cor-superficie`, `--cor-divisor` |
| Texto | `--cor-texto`, `--cor-texto-suave`, `--cor-lei` |
| Ação | `--cor-primaria`, `--cor-primaria-texto`, `--cor-curtida` |
| Estado | `--cor-acerto`, `--cor-acerto-fundo`, `--cor-erro`, `--cor-erro-fundo`, `--cor-aviso`, `--cor-aviso-fundo`, `--cor-visto` |
| Matéria | `--cor-materia-texto`, `--materia-0` … `--materia-7` |
| Forma | `--cor-borda`, `--linha-peso`, `--sombra`, `--raio` |
| Papel | `--textura` (url de SVG em data URI, com o grão já na opacidade do tema) |
| Tipo | `--fonte-titulo` (`--fonte`, `--fonte-texto` e `--medida` são comuns aos três) |

Os tokens `--cor-azul`, `--cor-verde`, `--cor-roxo`, `--cor-laranja` e `--cor-vermelho` não são usados
por nenhum componente em `db7ef10` e saem do arquivo.

## 6. Pares de contraste verificados

O `contraste.test.ts` mede exatamente esta lista, nos três temas. Os valores propostos passaram em 2026-09-30 (ver [data-model.md](../data-model.md)).

| Mínimo 4,5:1 (texto) | Mínimo 3:1 (componente e ícone) |
|---|---|
| texto / fundo, texto / superfície | borda / fundo, borda / superfície |
| texto-suave / fundo, texto-suave / superfície | primária / fundo |
| primária-texto / primária | curtida / superfície |
| acerto / acerto-fundo, erro / erro-fundo, aviso / aviso-fundo | visto / fundo |
| lei / superfície | foco (`--cor-primaria`) / fundo |
| materia-texto / materia-N (N = 0…7) | |

## 7. Movimento

Dentro de qualquer elemento com `data-tema` começando por `kindle`, e com `prefers-reduced-motion: reduce`,
todo elemento fica com `transition: none` e `animation: none`. No Aventura, animação só como resposta a ação (nenhuma com `infinite`).
