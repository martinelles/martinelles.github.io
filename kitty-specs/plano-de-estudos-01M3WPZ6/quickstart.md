# Quickstart: Plano de Estudos

```bash
npm run importar            # agora também gera static/conteudo/plano.json a partir do ESTUDO.csv
npm run check && npm test && npm run build && npm run test:e2e
```

- Mudar a janela (quando o edital sair): editar `Estudo/cgu/feed-conteudo/plano.md` (`inicio`, `fim`, `horas_por_dia`, `minutos_por_tarefa`) e rodar `npm run importar`.
- Lançar o progresso no vault: painel → "Exportar progresso" → abrir o CSV e passar `questoes_feitas`, `questoes_certas`, `ultima_sessao` e `status` para as linhas do `ESTUDO.csv`; depois `python scripts/gerar_visoes_estudo.py` e `npm run importar` (tópicos que viraram `dominado` saem da fila).

Conferências: cenário 1 (números batem com a amostra à mão), cenário 3 (fechar o app com o cronômetro correndo e reabrir), cenário 4 (CSV abre no Excel com acentos certos).
