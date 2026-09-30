# Modelo de dados: Identidade Visual Aventura e Kindle

## Entidades

### Tema

| Campo | Tipo | Regra |
|---|---|---|
| id | `'aventura' \| 'kindle' \| 'kindle-escuro'` | valor do atributo `data-tema` |
| nome | texto | "Aventura", "Kindle", "Kindle escuro" (rótulo do seletor) |
| tokens | conjunto fixo | todos os tokens de [contracts/tema.md §5](contracts/tema.md) |
| movimento | `'responde-a-acao' \| 'nenhum'` | Aventura: responde a ação; Kindle e Kindle escuro: nenhum |

Não é dado gravado: os temas são fixos no código (CSS mais a lista `TEMAS`).

### PreferenciaTema (no aparelho)

| Campo | Tipo | Regra |
|---|---|---|
| tema | `'sistema' \| Tema` | padrão `sistema`; inválido ⇒ `sistema` |

Chave `painel-concurso:tema:v1`. Estados: `sistema` ⇄ tema fixo, por `escolher()`. Não há histórico nem migração: não existia preferência de tema antes.

## Valores propostos dos tokens de cor

Contraste conferido em 2026-09-30 com a fórmula WCAG 2.x (o `contraste.test.ts` reconfere a cada build).
Fonte da paleta: nota do vault `Recursos/Design/Paleta — Doodles (Hora de Aventura).md`.

| Token | Aventura | Kindle | Kindle escuro |
|---|---|---|---|
| `--cor-fundo` | `#FEFBE4` | `#EDEBE6` | `#161615` |
| `--cor-superficie` | `#FFFEF6` | `#F6F5F1` | `#1F1F1D` |
| `--cor-divisor` | `#E4DCEB` | `#D6D3CC` | `#3A3935` |
| `--cor-texto` | `#1A0C0C` | `#1C1C1C` | `#D9D6CF` |
| `--cor-texto-suave` | `#5C4B6E` | `#5A5A5A` | `#A3A09A` |
| `--cor-borda` | `#1A0C0C` | `#7A7872` | `#77746E` |
| `--cor-primaria` | `#6C50C3` | `#1C1C1C` | `#D9D6CF` |
| `--cor-primaria-texto` | `#FFFEF6` | `#F6F5F1` | `#161615` |
| `--cor-acerto` / `-fundo` | `#0B5E4E` / `#D2F5EE` | `#1C1C1C` / `#D6D3CC` | `#D9D6CF` / `#3A3935` |
| `--cor-erro` / `-fundo` | `#9E1F5C` / `#FCE1EC` | `#1C1C1C` / `#F6F5F1` | `#D9D6CF` / `#1F1F1D` |
| `--cor-aviso` / `-fundo` | `#1A0C0C` / `#FDE792` | `#1C1C1C` / `#D6D3CC` | `#D9D6CF` / `#3A3935` |
| `--cor-curtida` | `#C2257F` | `#1C1C1C` | `#D9D6CF` |
| `--cor-lei` | `#6C50C3` | `#1C1C1C` | `#D9D6CF` |
| `--cor-visto` | `#8C8296` | `#83817C` | `#6E6C67` |
| `--cor-materia-texto` | `#1A0C0C` | `#1C1C1C` | `#D9D6CF` |
| `--materia-0…7` | `#B265CE` `#F082CA` `#FCC2AA` `#FDE792` `#63E0CA` `#7BB0FF` `#8174ED` `#EF99BE` | todos `#D6D3CC` | todos `#3A3935` |
| `--linha-peso` | `2.5px` | `1px` | `1px` |
| `--sombra` | `4px 4px 0 var(--cor-texto)` | `none` | `none` |
| `--raio` | `18px` (cartão) | `4px` | `4px` |
| grão (`--textura`) | opacidade 0,18, ruído escuro | 0,06, ruído escuro | 0,04, ruído claro |

Piores pares medidos: Aventura, materia-texto sobre `#8174ED` com 5,12:1; Kindle, visto/fundo com 3,27:1
(o `#8A8882` inicial dava 2,98 e foi trocado); Kindle escuro, visto/fundo com 3,45:1.

No Kindle, acerto e erro têm a mesma cor de texto. A diferença vem do ícone, do texto ("Você acertou" ou
"Você errou — gabarito: …", já em `CorpoQuestao.svelte`) e do fundo: realce no acerto, superfície com
borda tracejada no erro.
