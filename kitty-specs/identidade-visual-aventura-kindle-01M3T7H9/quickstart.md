# Quickstart: Identidade Visual Aventura e Kindle

Comandos a partir da raiz do repositório.

## 1. Ver os temas

```bash
npm run dev
```

Abra `/painel` e use o seletor "Aparência". Para forçar um tema sem o seletor, rode no console:
`document.documentElement.dataset.tema = 'kindle'`.

Para testar o padrão "Seguir o aparelho", apague a chave `painel-concurso:tema:v1` no DevTools
(Application › Local Storage) e alterne em Rendering › "Emulate CSS prefers-color-scheme".

## 2. Regerar as fontes (só se o corte mudar)

```bash
pip install fonttools brotli
python scripts/fontes/cortar.py      # lê os .ttf de scripts/fontes/origem/ e grava static/fontes/*.woff2
```

As fontes de origem são baixadas uma vez do repositório `google/fonts` (Literata e Grandstander,
pasta `ofl/`), e a licença vai junto em `static/fontes/OFL.txt`. Nada é baixado em runtime.

## 3. Gates (charter)

```bash
npm run check && npm test && npm run build && npm run test:e2e
```

`npm test` inclui `tests/unit/contraste.test.ts`, que imprime a tabela de contraste dos 3 temas. Essa saída vai anexada à revisão (SC-003).

## 4. Medições manuais (anotar na revisão)

| Meta | Como medir |
|---|---|
| NFR-002 fontes e textura ≤ 120 KB | `du -cb static/fontes/*.woff2` |
| NFR-003 troca ≤ 100 ms | DevTools › Performance, gravar o clique no seletor e ler a duração até o fim do Paint |
| NFR-004 ≥ 55 fps | DevTools › Performance, com a CPU 4× mais lenta, rolando 50 posts no tema Aventura |
| NFR-005 acessibilidade ≥ 90 | Lighthouse mobile em `/` e `/painel`, uma vez por tema |
| SC-005 | capturas de `/`, de um post de lei e de `/painel` nos 3 temas, ao lado do app antigo, para a dona aprovar |
