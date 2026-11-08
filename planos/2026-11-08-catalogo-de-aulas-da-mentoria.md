# Catálogo de aulas da mentoria: plano de implementação

Id: `2026-11-08-catalogo-de-aulas-da-mentoria` (datado, sem rastro fora do arquivo). Depende de
sessão logada na plataforma; pode rodar antes ou depois do plano
`2026-11-08-qconcursos-fora-do-painel.md` (independentes entre si).

## Visão geral

Coletar, com a sessão logada na plataforma da mentoria, o catálogo das aulas do curso "Resumo
Completo - CGU" (título, URL, e o link do TEC Concursos que cada aula-PDF traz no fim), mapear
cada aula aos subitens do edital que cobre e publicar em `src/lib/dados/mentoria.json`, para o
atalho "Aula da mentoria ↗" apontar a aula certa em vez da playlist da disciplina, e o link do
TEC virar o atalho de questões por aula.

## Estado atual (conferido)

- `src/lib/dados/mentoria.json` tem o curso e 22 playlists por disciplina (B1–B4, C1–C5,
  CD:E1–4, AUD:E1–5, INFRA:E1–4), validado por `validarMentoria` e resolvido por
  `aulaDaMentoria(cargo, cod)` ([index.ts](../src/lib/dados/index.ts)): granularidade
  disciplina.
- A plataforma (mentoria.plataformatutory.com.br, Next.js + NextAuth) exige login: `/dash/…`
  cai no formulário "Pietro Viecili · Login" (conferido em 2026-11-08). Na inspeção de
  2026-11-03 (plano `2026-11-03-aulas-da-mentoria-no-painel.md`): 26 playlists, 143 aulas, cada
  aula um PDF paginado no leitor da plataforma, URLs estáveis por UUID. Esses números são da
  inspeção de 5 dias atrás: a coleta da fase 1 atualiza e vale o que ela trouxer.
- Os subitens com texto e prioridade vivem no vault: `catalogo-questoes/qconcursos/subitens/`
  (`p12.json`, `p3.json`, `pE.json`), lidos por `artifacts/missoes/plano.py:14-15`; o guia também
  discorre sobre cada subitem (`GUIA CGU 2026 AFFC *.md` no vault).
- Licença: material marcado com nome e CPF dela, individual. O painel só linka; aqui também só
  títulos e URLs entram no repo, nenhum conteúdo de aula.

## Estado final desejado

- `mentoria.json` com o catálogo: para cada aula, disciplina, título, URL da aula no leitor da
  plataforma, link do TEC Concursos do fim do PDF (quando houver) e a lista de subitens que
  cobre (chave no formato atual, ex.: `CD:E2-5.2`); as 22 playlists continuam como destino de
  queda (fallback de subitem sem aula mapeada).
- O atalho "Aula da mentoria ↗" da Missão de hoje abre a aula mapeada do subitem; subitem sem
  mapeamento continua na playlist da disciplina (comportamento de hoje).
- Todo subitem de B/C/E dos dois cargos tem uma aula principal mapeada, ou está registrado na
  tabela de aprovação como sem aula equivalente.
- Mapeamento aprovado por ela em lote antes de entrar no repo.

## O que NÃO vamos fazer

- Copiar conteúdo de aula (PDF, páginas, texto): só títulos e links, pela licença.
- Tocar no plano das Missões (isso é o plano `2026-11-08-missoes-por-aula-da-mentoria.md`,
  que consome este catálogo).
- Coletar as playlists fora do app (Desenvolvimento de Sistemas e afins): o app não tem a
  especialidade; se a coleta as trouxer de graça, ficam de fora do JSON publicado.
- Login automático: a sessão é dela, aberta por ela; o roteiro de coleta nunca digita credenciais.

## Abordagem

Coleta navegada (uma sessão, retomável), mapeamento proposto por similaridade título × subitem
e aprovado em lote, publicação como dado de configuração do app (o precedente das playlists,
plano 2026-11-03: URLs estáveis moram em `src/lib/dados/`, sem tocar no pipeline de import).

---

## Fase 1 — Coleta no navegador (exige a sessão logada)

### Mudanças

Nada no repo; entregável é o catálogo bruto (título, disciplina, URL da aula, link TEC), salvo
em arquivo de trabalho fora do repo (`%TEMP%/mentoria-aulas.json`), com progresso retomável.

Roteiro (skill de navegador, sessão dela já logada; pausa curta entre aulas):

1. Abrir o curso `d3ef2108-…` e listar as playlists; confirmar a contagem (eram 26) e a de
   aulas (eram 143).
2. Em cada playlist das 22 usadas pelo app, para cada aula: título e URL (padrão
   `/dash/cursos/<curso>/playlists/<playlist>/aulas/<uuid>`, confirmar na navegação).
3. Abrir a última página do PDF da aula e capturar o link do TEC Concursos
   (`https://…teconcursos.com/…`), quando existir.
4. Anotar aulas sem link TEC e playlists com aulas novas desde 03/11 (a mentoria pode publicar
   até a prova).

### Critérios de aceite

#### Verificação automática
- [ ] Catálogo com uma linha por aula das 22 playlists; contagem por playlist soma o total
      coletado; nenhum campo vazio além de `tec` (quando a aula não tem o link).

#### Verificação manual
- [ ] Amostra de 3 aulas de disciplinas diferentes: URL abre a aula certa; o link TEC da última
      página é o mesmo do catálogo.

**Pausa**: se a sessão cair no meio, retomar da última aula anotada; nada é refeito.

---

### Nota de execução (2026-11-08, fase 1)

A sessão já estava ativa no navegador integrado (login não precisou ser refeito). A coleta
mudou de rota em relação ao roteiro original e ficou muito mais barata:

- **A contagem atualizada é 30 playlists e 147 aulas** (eram 26/143 em 03/11). As 4 novas são
  as "Curadoria de Discursivas" (uma por especialidade) + o total inclui 5 playlists de
  Desenvolvimento de Sistemas (fora do app). Do interesse do painel: **25 playlists, 127
  aulas** (9 B, 25 C, 33 AUD, 23 CD, 22 INFRA, contando as 3 curadorias).
- **6 aulas agendadas** ainda sem URL na plataforma (3 de B1, e a última de AUD:E2, AUD:E3 e
  AUD:E5; liberam em 08 e 09/11): no catálogo com `agendada` e sem `url`; completar depois.
- **O PDF de cada aula é público no S3 com URL determinística**:
  `https://tutory-membros.s3.amazonaws.com/13483/materiais/aulas/<uuid-da-aula>`
  (descoberto monitorando o fetch do leitor). Isso eliminou a navegação aula a aula: a coleta
  virou script local ([scripts/coleta-mentoria/coletar.mjs](../scripts/coleta-mentoria/coletar.mjs))
  que baixa e extrai as anotações `/URI` do PDF (cruas e em streams FlateDecode). O leitor
  (react-pdf) demora 1–2 min por aula para montar, o que teria inviabilizado a coleta por
  navegação.
- Validado cruzando com o leitor: a aula 1 de B1 tem exatamente o mesmo link
  (`…/s/Q4pAiW`) no PDF e na página "Cadernos do TEC" do leitor.
- **Nem toda aula tem caderno TEC**: 77 das 121 liberadas têm ao menos 1 link (210 links, 189
  únicos); 44 não têm a seção no PDF (verificado: têm só links de fontes, como planalto/TCU;
  o professor vem adicionando cadernos aos poucos). O atalho TEC por aula fica condicional, e
  a coleta valendo ser reexecutada (as que faltam podem aparecer).
- **As 3 curadorias de discursivas dão 403 no S3** (material fora desse padrão de URL): ficam
  sem TEC no catálogo; se precisar delas depois, coleta pelo leitor.
- Catálogo consolidado em [scripts/coleta-mentoria/aulas.json](../scripts/coleta-mentoria/aulas.json)
  (título, URL, agenda, páginas, bytes e links TEC por aula; e as 30 playlists com bloco).

## Fase 2 — Mapeamento aula × subitem (proposta e aprovação)

### Mudanças

Nada alterado ainda; entregáveis são a proposta de mapeamento e a tabela para aprovação.

1. Proposta semi-automática: título da aula × texto dos subitens (`p12.json`, `p3.json`,
   `pE.json` do vault), com o guia (`GUIA CGU 2026 AFFC *.md`) como desempate nos casos de
   título genérico.
2. Regras: cada subitem mapeia a uma aula principal (1:1; a aula pode cobrir vários subitens);
   aula sem subitem equivalente fica sem mapeamento (ex.: aula introdutória); subitem sem aula
   equivalente fica com o fallback da playlist e consta na tabela.
3. Tabela para ela aprovar em lote: subitem | aula proposta (título) | marcação
   (mapeado / sem aula / dúvida). Dúvidas resolvidas uma a uma com ela antes da publicação.

### Critérios de aceite

#### Verificação automática
- [x] Tabela com uma linha por aula das 25 playlists de interesse; a soma fecha em 127, e todo
      subitem dos dois cargos aparece exatamente uma vez (94 de p12 + 81 de p3 + 89 de pE; a
      verificação "subitens sem aula" devolveu 0).
- [x] Nenhuma aula mapeada a subitens de outra disciplina (o mapeamento é por prefixo da
      própria disciplina).

#### Verificação manual
- [x] Ela aprova (ou ajusta) a tabela em lote. (2026-11-08: "ok", sem ajustes.)

**Pausa**: nada é publicado sem a aprovação.

### Nota de execução (2026-11-08, fase 2: proposta)

A regra estrutural resolveu o mapeamento sem trabalho manual: a aula **N** da playlist cobre
os subitens do **item N** da disciplina (as playlists seguem a numeração do edital). Para B,
C, CD e AUD o fechamento é exato nos dois sentidos (toda aula tem subitens; todo subitem tem
aula). A tabela para aprovação está em
[scripts/coleta-mentoria/mapeamento-proposta.md](../scripts/coleta-mentoria/mapeamento-proposta.md)
(gerada por [gerar-mapeamento.mjs](../scripts/coleta-mentoria/gerar-mapeamento.mjs), que lê o
catálogo da fase 1 e os subitens do vault), com prioridade da aula (máxima dos subitens) e nº
de cadernos TEC por aula. As aulas de INFRA ficam sem mapeamento enquanto a P3 de Infra não
voltar ao vault (deriva registrada no plano dos links); as 3 curadorias de discursivas ficam
sem subitem por natureza.

---

## Fase 3 — Publicação no app (repo)

### Mudanças

**Arquivo**: `src/lib/dados/mentoria.json`
**Mudança**: ganha `aulas` mantendo `playlists`:

```json
{
	"curso": "Resumo Completo - CGU (Pietro Viecili, Plataforma Tutory)",
	"playlists": { "B1": "…", "CD:E1": "…" },
	"aulas": [
		{
			"id": "3f0c…",
			"disciplina": "CD:E2",
			"titulo": "Governança de dados",
			"url": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-…/playlists/a73ca465-…/aulas/3f0c…",
			"tec": "https://www.teconcursos.com/…",
			"subitens": ["CD:E2-1.1", "CD:E2-1.2"]
		}
	]
}
```

`id` é o UUID da aula na URL (estável); `tec` omitido quando a aula não tem.

**Arquivo**: `src/lib/dados/tipos.ts`, `src/lib/dados/validar.ts`
**Mudança**: `Mentoria` ganha `aulas?` (`{ id, disciplina, titulo, url, tec?, subitens: string[] }`);
`validarMentoria` valida: `id` único, `disciplina` entre as chaves de `playlists`, `url` https da
plataforma, `tec` https do TEC quando presente, `subitens` com chave
`^(B[1-4]|C[1-5]|(CD|AUD|INFRA):E[1-5])-\d+\.\d+$` dentro da disciplina declarada.

**Arquivo**: `src/lib/dados/index.ts`
**Mudança**: `aulaDaMentoria(cargo, cod)` passa a resolver em duas quedas: a aula cujos
`subitens` contêm a chave do subitem (ou a do pai, como hoje); sem aula, a playlist da
disciplina. Nova exportação `aulasPorDisciplina(cargo)` para uso futuro (plano de missões por
aula).

**Arquivo**: `src/lib/componentes/missoes/MissaoDeHoje.svelte`
**Mudança**: nenhuma obrigatória (o atalho continua "Aula da mentoria ↗", agora com a URL da
aula). Se o plano do Qconcursos já tiver rodado, o atalho de questões do TEC por aula entra
aqui como "Questões no TEC ↗" (mesmo padrão dos atalhos, `tec` da aula resolvida); senão fica
para o plano de missões por aula.

**Arquivo**: `tests/unit/dados/mentoria.test.ts`, `tests/e2e/missao.spec.ts`
**Mudança**: unitário da resolução em duas quedas (aula específica, pai, fallback playlist) e da
validação (chave torta, URL http recusada, `tec` de outro domínio recusado, `id` repetido);
e2e: no dia fixo, um subitem mapeado abre a URL da aula e um sem mapeamento abre a playlist.

### Critérios de aceite

#### Verificação automática
- [x] `npm run check` (0 erros, 0 avisos) e `npm test` (350 passaram).
- [x] `npm run test:e2e`: 254 passaram; as 2 falhas são conhecidas e alheias a esta mudança
      (a deriva de Infra do vault, sem commit por decisão dela, e o kindle de
      `responsivo.spec.ts`, flaky na suíte cheia e verde isolado).
- [x] Cruzamento com o plano: todo subitem com aula no JSON existe em `missoes-<cargo>.json`,
      exceto 4 subitens de prio baixa cortados do plano pelo `CUT` do gerador (B2-1.1, B2-3.1,
      C1-5.2, C2-5.3; a aula que os cobre fica no catálogo, inofensiva: o atalho só aparece em
      subitem que está no plano).

#### Verificação manual
- [ ] No celular, 3 subitens de disciplinas diferentes: "Aula da mentoria ↗" abre a aula certa
      (logada).

### Nota de execução (2026-11-08, fase 3)

- Publicado `mentoria.json` com **22 playlists + 118 aulas** (gerado por
  [gerar-mentoria.mjs](../scripts/coleta-mentoria/gerar-mentoria.mjs)): 77 com caderno
  principal do TEC e 50 com cadernos extras; **243 subitens mapeados** (os 21 restantes do
  edital são os itens das 6 aulas ainda agendadas na plataforma; esses subitens caem no
  fallback da playlist). O UUID de B4, truncado na coleta de 03/11, saiu corrigido.
- **Descoberta que mudou o formato**: os múltiplos links do TEC numa aula não são um por
  subitem: são o **caderno do tópico** (principal) + **cadernos extras** por grupos de
  assuntos. O campo `tec` guarda o principal e `tecExtras` a lista; rótulos e contagens ficam
  no catálogo cru. Um segundo processamento com pdf.js local
  ([enriquecer-tecs.mjs](../scripts/coleta-mentoria/enriquecer-tecs.mjs); `npm install
  pdfjs-dist --no-save`) extraiu páginas exatas e cadernos rotulados na ordem das páginas.
- O leitor da plataforma exige clicar "Iniciar" na primeira abertura de cada aula e demora
  1–2 min por montagem: validação pelo leitor foi feita só na aula 1 de B1 (cruzamento com o
  PDF) e o resto saiu do binário.
- `aulaDaMentoria` resolve em duas quedas (aula do subitem, aula do pai, playlist); nova
  exportação `aulaPorId(id)` (em vez da `aulasPorDisciplina` prevista: o consumidor seguinte,
  o plano das Missões por aula, referencia a aula pelo `cid` = UUID). 3 curadorias de
  discursivas e as 6 aulas agendadas ficaram fora do JSON publicado (sem caderno/URL);
  completar é reexecutar `coletar.mjs` + `enriquecer-tecs.mjs` + `gerar-mentoria.mjs`.

## Estratégia de teste

### Unitários
- Resolução: subitem com aula própria, subitem coberto pela aula do pai, fallback playlist,
  subitem de disciplina sem playlist (nenhum atalho).
- Validação: cada regra do `validarMentoria` com um contraexemplo.

### Manuais
1. Amostragem de 3 aulas de disciplinas distintas, na Missão de hoje e na página das Missões
   (quando o artefato consumir o catálogo, no plano seguinte).

## Migração de dados

Nenhuma: dado novo de configuração, sem consumidor antigo quebrado (o fallback preserva o
comportamento atual para subitem sem mapeamento).

## Limites conhecidos

- A mentoria pode publicar aulas novas até a prova: o catálogo é retrato da coleta; atualizar é
  refazer a fase 1 (roteiro retomável) e a fase 3.
- Aula que revisa várias disciplinas: fica na disciplina majoritária dos subitens mapeados;
  casos duvidosos resolvidos na aprovação.

## Referências

- Inspeção original da plataforma e coleta das 22 playlists:
  `planos/2026-11-03-aulas-da-mentoria-no-painel.md`.
- Subitens e prioridades: `catalogo-questoes/qconcursos/subitens/` (vault) e
  `artifacts/missoes/plano.py:14-19`.
- Consumidor seguinte: `planos/2026-11-08-missoes-por-aula-da-mentoria.md`.
