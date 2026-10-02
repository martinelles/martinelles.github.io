# Pesquisa: Ajustes em Tela Própria

Levantado em `main` `5e16a61` (2026-10-02).

## Estado atual

- `src/routes/painel/+page.svelte` monta, nesta ordem: `CabecalhoPainel`, `AvisoRegistro`, `MissaoDoDia` e `ResumoPlano` (da missão do plano), `FocoEstudo`, `ProgressoEstudo`, `SeletorTema` e `GradeFerramentas`.
- `FocoEstudo` recebe `cargo`, `materias`, `disciplina` e `onescolherDisciplina`; o estado mora em `$lib/feed/foco.svelte`.
- `SeletorTema` não recebe nada; o estado mora em `$lib/tema.svelte`.
- `+layout.svelte` marca a aba Painel para `/painel*`, `/ferramenta*` e `/tarefa*`.
- O service worker responde a `req.mode === 'navigate'` com a casca, e o Pages tem `404.html` = `index.html` (workflow `pages.yml`).
- `ICONES` não tem ícone de configuração.
- Testes que dependem dos blocos no painel: `tema.spec.ts` (linhas 48–53, 78–80 e 165–166), `painel.spec.ts` (linhas 39–52) e `responsivo.spec.ts` (linhas 67–71).

## Decisões

### R1. Tela própria por rota

- **Decisão**: `/painel/ajustes`.
- **Motivo**: link direto e offline sem código extra, voltar nativo do aparelho, aba atual herdada.
- **Alternativas**: modal (sem endereço, e o voltar do Android fecharia o app); seção recolhível no próprio painel (não tira o bloco da primeira página, que é o pedido).

### R2. Link em vez de botão

- **Decisão**: `<a href="/painel/ajustes" aria-label="Ajustes">` com ícone.
- **Motivo**: é navegação. A spec diz "botão" no sentido visual; o papel acessível correto é `link`.
- **Alternativa**: `<button>` com `goto()`, que perde o "abrir em nova aba" e anuncia a ação errada.

### R3. Foco atual no cabeçalho

- **Decisão**: uma linha de texto "Foco: <nome da matéria>" no `CabecalhoPainel`.
- **Motivo**: mantém o FR-014 da missão do feed (o painel mostra o foco), sem seletor, e é o lugar onde a pessoa olha primeiro.
- **Alternativa**: um cartão próprio no painel com o foco (devolve o bloco que a missão quer tirar).

### R4. Ícone

- **Decisão**: traço `sliders-horizontal` do Lucide (ISC), já usado como fonte dos outros ícones.
- **Alternativa**: engrenagem, que é mais genérica e mais pesada visualmente ao lado do título.

## Riscos

| Risco | Efeito | Mitigação |
|---|---|---|
| Outra missão editando `painel/+page.svelte` ao mesmo tempo | Conflito no merge | Diff mínimo (só remoções) e merge da `main` antes da revisão |
| `main` com arquivos sem commit de outras sessões | Commit errado | `git add` por caminho (DIRECTIVE_033) |
| Link do cabeçalho apertando o título a 360 px | Quebra de layout | `responsivo.spec.ts` a 360 px nos 3 temas; o título quebra linha e o link fica no canto |
