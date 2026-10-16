# Tópico da missão marcado à parte

Id: `2026-10-15-topico-da-missao`. Decisão registrada em 2026-10-15.

## O que mudou

Na Missão de hoje do `/painel`, um bloco com mais de um subitem passa a ter uma caixa por subitem, além da bolha do bloco. O caso típico é o estudo novo com dois tópicos. Com isso, dá para registrar que um dos tópicos foi estudado e o outro ainda não.

- **Chave:** `<cargo>~<data>~<bloco>~<cid>`, gravada na mesma chave `missoes-cgu-2026` das bolhas, e por isso sobe para a conta como elas (`chaveItem` em `src/lib/missoes/calculos.ts`).
- **Regras** (`mudancasDoItem` e `mudancasDoBloco`):
  - quando a última caixa do bloco é marcada, o bloco também se marca;
  - com o bloco marcado, todas as caixas dele aparecem marcadas;
  - desmarcar uma caixa de um bloco marcado desmarca o bloco e mantém as outras caixas;
  - desmarcar o bloco apaga as caixas dele.
- **Gravação:** o subitem e o bloco são gravados juntos (`marcasMissoes.aplicar`). A pendência do login guarda essas mudanças já calculadas (`{ acao: 'missao', mudancas }` em `src/lib/feed/pedidoLogin.svelte.ts`), não mais uma chave só.
- **Contagem:** as contas (blocos feitos, dias cumpridos e horas) continuam lendo só a chave do bloco. Um tópico marcado sozinho não conta como bloco feito.
- **Layout:** a caixa tem 44 px e fica embaixo da bolha do bloco, para sobrar largura ao texto em 360 px. O subitem marcado aparece riscado.

## Limitações aceitas

- **A página das Missões não mostra as caixas.** A `missoes.html` vem do vault e só lê a chave do bloco. As chaves dos subitens ficam gravadas e voltam intactas quando ela salva, porque `lerMarcas` mantém toda chave com `~`. Quando a última caixa marca o bloco, a página mostra o bloco marcado. Reabrir se ela passar a marcar pela página e sentir falta dos tópicos lá; aí a mudança é no `plano.py`/HTML do vault.
- **Bloco com um subitem só não ganha caixa:** a bolha do bloco já é a do tópico.
- **Desmarcar o bloco não tem volta.** As caixas que estavam marcadas nele são apagadas.

## Verificação (2026-10-15)

- `npm test`: 297 testes passando, 5 deles novos em `tests/unit/missoes/missoes.test.ts`.
- `npm run check` sem erro.
- `npx playwright test`: 237 testes passando. O teste novo em `missao.spec.ts` marca um tópico, marca o segundo e vê o bloco se marcar, e desmarca o bloco.
- `artefatos.spec.ts:18` falha, mas falha também no `main` sem esta mudança, conferido com `git stash`.

## Atualização de 2026-10-15: as caixas também na página das Missões

O primeiro item das limitações deixou de valer. A página das Missões (`missoes.html`) também ganhou uma caixa por subitem nos blocos com mais de um, com a mesma chave e as mesmas regras do painel.

- **No vault** (`artifacts/missoes/script.html`):
  - a caixa é `input.sub`, com `data-i` (a chave do subitem) e `data-b` (a do bloco);
  - `mudBloco` e `mudItem` repetem `mudancasDoBloco` e `mudancasDoItem` de `src/lib/missoes/calculos.ts`, e `aplicarMud` grava as mudanças;
  - `refletir()` atualiza bolhas e caixas sem refazer a lista, e com isso o foco do teclado não se perde;
  - o pedido de login guarda `{ mud }`, e `aplicarPendente` ainda lê o formato antigo `{ k, on }`.
- **Estilo** (`template.html`):
  - a caixa é quadrada, com 20 px e área de toque ampliada;
  - o subitem marcado fica riscado;
  - nos blocos com caixas, "questões: … ↗" pode quebrar linha. Sem isso, a página vazava 1 px na horizontal a 390 px.
- **Publicação:** do mesmo jeito das outras atualizações da página, com backup em `backup/missoes-*.2026-10-15c`.
- **Teste:** em `tests/e2e/missao.spec.ts`, marcar um subitem na página, marcar o segundo e ver o bloco marcado, abrir o painel com as mesmas marcas e desmarcar o bloco limpando os subitens. O `npx playwright test` passou com 242.
