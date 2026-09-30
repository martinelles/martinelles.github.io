# Dados do painel

O app atende só ao concurso da CGU (FR-001). Nomes de órgão e banca são fato público; nada
aqui foi copiado de outro aplicativo. O conteúdo de estudo do feed não mora aqui: vem de
`static/conteudo/`, gerado por `npm run importar`.

- `concursos.json` — **exatamente um** concurso: `cgu-affc-ti-cd`, CGU — Auditor Federal de
  Finanças e Controle, cargo único TI — Ciência de Dados, banca Cebraspe. Sem `dataProva` nem
  `edital` enquanto o edital de 2026 não sai: o painel mostra "Data a definir".
- `ferramentas.json` — as 12 ferramentas do painel, na ordem em que aparecem. Os ids
  `questoes-objetivas`, `resumos`, `flashcards` e `jurisprudencia` (exibido como "Lei seca")
  abrem o feed filtrado por tipo; o mapa fica em `rotaDaFerramenta`, em `index.ts`. As demais
  abrem a tela "em breve".
- `config.json` — `whatsapp` (URL `https://` ou `null`, que esconde o botão) e `limiteEmAlta`
  (sem uso desde que a tela de escolha saiu; mantido porque o tipo `Config` ainda o exige).
- `tipos.ts` — forma dos dados e lista `ICONES` de nomes de ícone válidos.
- `validar.ts` — confere tudo na carga; dado malformado derruba o app com a lista de falhas no console.

## Quando o edital sair

Edite só `concursos.json`: acrescente `dataProva` (`AAAA-MM-DD`), `edital` (`https://…`),
`vagas` (inteiro ≥ 0) e `salario` (texto), e troque `situacao` para `aberto`. Campo com nome
errado é recusado. Rode `npm test` para ver a falha com o caminho exato.
