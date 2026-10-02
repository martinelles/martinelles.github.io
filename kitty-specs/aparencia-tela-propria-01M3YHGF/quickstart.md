# Quickstart: Ajustes em Tela Própria

Comandos a partir da raiz do repositório.

## Ver

```bash
npm run dev
```

Abra `/painel`, toque no ícone do canto do cabeçalho e confira a tela `/painel/ajustes`. Para testar o link direto, abra `/painel/ajustes` numa aba nova.

## Gates (charter)

```bash
npm run check && npm test && npm run build
netstat -ano | grep :4173   # tem que voltar vazio antes do e2e
CI=1 npm run test:e2e
```

O e2e roda uma lane por vez (lição da missão `identidade-visual-aventura-kindle`).

## Manual (anotar na revisão)

| Meta | Como |
|---|---|
| NFR-003 acessibilidade ≥ 90 | Lighthouse mobile em `/painel` e `/painel/ajustes`, uma vez por tema |
| Leitor de tela | o link do cabeçalho é lido como "Ajustes, link" |
