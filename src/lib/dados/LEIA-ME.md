# Dados do painel

Dados ilustrativos para a casca visual; vagas, salários e datas não são oficiais.
Nomes de órgãos e bancas são fato público; nada aqui foi copiado de outro aplicativo.

- `concursos.json` — lista de concursos.
- `ferramentas.json` — as 12 ferramentas, na ordem em que aparecem.
- `config.json` — `whatsapp` (URL `https://` ou `null`, que esconde o botão) e `limiteEmAlta`.
- `tipos.ts` — forma dos dados e lista `ICONES` de nomes de ícone válidos.
- `validar.ts` — confere tudo na carga; dado malformado derruba o app com a lista de falhas no console.

## Como acrescentar um concurso

Edite só `concursos.json`: acrescente um objeto à lista com

- `id` único em kebab-case (`^[a-z0-9-]+$`), `nome`, `orgao`, `banca`, `area`;
- `situacao`: `aberto`, `previsto` ou `encerrado` (prova com data passada conta como encerrado);
- `icone` (um nome de `ICONES` em `tipos.ts`) e `cor` (`azul`, `verde`, `roxo`, `laranja`, `vermelho`);
- `cargos`: ao menos um, cada um com `id` único no concurso, `nome` e ao menos uma disciplina;
- opcionais: `emAlta`, `vagas` (inteiro ≥ 0), `salario` (texto), `dataProva` (`AAAA-MM-DD`), `edital` (`https://…`).

Campo com nome errado é recusado. Rode `npm test` para ver a falha com o caminho exato.
