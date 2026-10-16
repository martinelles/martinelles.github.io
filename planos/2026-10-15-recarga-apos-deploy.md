# Recarga depois de um deploy

Id: `2026-10-15-recarga-apos-deploy`. Decisão registrada em 2026-10-15.

## O que aconteceu

Depois do push de `6b01a84`, o app que estava aberto mostrou "Internal Error" no site publicado. Fechado e aberto de novo, voltou ao normal. Num navegador limpo o erro não se reproduziu: abri o feed e o painel das três especialidades e passei por todos os stories.

## Causa provável

O código antigo, ainda aberto, pede um pedaço da rota (`/_app/immutable/nodes/*.js`) que o deploy apagou. O SvelteKit só recarrega sozinho nesse caso quando o `/_app/version.json` já mostra a versão nova. O mesmo vale para o `beforeNavigate` do `+layout.svelte`, que depende de `updated.current`. O GitHub Pages serve esse arquivo com `Cache-Control: max-age=600`, conferido com `curl -I` em 15/10. Com isso, por até 10 minutos depois do deploy, a checagem pode ver a versão velha, e a navegação cai na página de erro.

## O que mudou

- `src/hooks.client.ts` (novo): o `handleError` reconhece a falha de carga de módulo e recarrega a página de destino. As mensagens reconhecidas são as de Chrome, Safari e Firefox (`ehFalhaDeModulo` em `src/lib/recarga.ts`).
- **Trava contra laço:** no máximo uma recarga por minuto em cada aba, gravada em `sessionStorage` na chave `painel-concurso:recarga`. Se a falha for outra coisa, a segunda vez mostra o erro de sempre.
- **Sem ouvinte de `vite:preloadError`:** ele recarregava a página atual, e não a de destino, e gastava a trava. O teste e2e mostrou isso.

## Verificação (2026-10-15)

- `tests/unit/recarga.test.ts`: as mensagens de erro, a trava de um minuto e o caso sem sessão.
- `tests/e2e/recarga.spec.ts`: com o service worker bloqueado, o primeiro pedido de `nodes/*.js` responde 404, e a navegação do feed para o Painel termina em `/painel` com o painel na tela. Sem `hooks.client.ts`, o mesmo teste falha, porque o painel não aparece.
- `npm test` (300), `npm run check` e `npx playwright test` (239) passaram.

## Limitações aceitas

- **Não cobre o erro dentro de um componente já carregado.** Só a falha de carga de módulo vira recarga. Reabrir se o "Internal Error" voltar com o app atualizado; aí a causa é outra, e é preciso saber a tela e o toque.
