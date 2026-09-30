# Quickstart: Feed de Estudo CGU

Pasta: `C:\Users\martinelle.santos\Documents\github\painel-concurso`. Node 24.

```bash
npm install
npm run importar                    # lê o vault e regrava static/conteudo/ (PAINEL_VAULT sobrescreve o caminho)
git diff --stat static/conteudo     # conferir o que mudou antes de commitar
npm run check && npm test && npm run build
npm run test:e2e                    # 2 workers (playwright.config.ts)
npm run preview                     # http://localhost:4173
```

## Quando rodar a importação

- O catálogo de questões ganhou provas (`catalogo-questoes/questoes.csv`).
- Uma lei seca foi atualizada.
- Você marcou resumos/flashcards como `conferido: true` em `Estudo/cgu/feed-conteudo/`.

O relatório no fim mostra contagens por tipo e matéria e cada descarte com motivo. Número do
relatório tem de bater com o índice (SC-003).

## Conferências manuais

1. **Feed** (SC-001): abrir `/`, rolar 30 posts, responder uma C/E e uma de múltipla escolha.
2. **Sem repetição** (SC-002): no story "Dados", rolar até "Você viu tudo"; nenhum post duas vezes.
3. **Persistência** (SC-004): curtir, salvar, responder; fechar e reabrir; conferir Salvos e painel.
4. **Offline** (SC-005): preview aberto uma vez, esperar o conteúdo baixar (DevTools → Application → Cache Storage mostra `lote-*`), ficar offline e rolar.
5. **Selo** (SC-006): todo resumo/flashcard mostra fonte; os não conferidos mostram "gerado — a revisar".
6. **Medições**: peso do shell e dos lotes (gzip), Lighthouse mobile, fps de rolagem (DevTools → Performance, 50 posts) em `kitty-specs/feed-estudo-cgu-01M3S6H8/medicoes.md`.
