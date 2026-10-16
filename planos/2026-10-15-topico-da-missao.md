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
