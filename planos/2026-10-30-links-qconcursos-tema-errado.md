# Correção dos links do Qconcursos com tema errado — plano de implementação

Id: `2026-10-30-links-qconcursos-tema-errado` (datado: o repositório não tem `ESTADO.csv` nem
issue tracker; o plano não tem rastro fora deste arquivo, como o de notificações).

## Visão geral

Vários links "questões ↗" abrem buscas do Qconcursos com questões nada a ver com o subitem —
ex.: E2 5.5 ("Riscos de correspondências incorretas entre pessoas ou entidades") busca
"vinculação de registros". Auditamos os 264 links, corrigimos nas fontes do vault e
regeneramos a cadeia até o app — desarmando antes a mina do `fcbbed7`, que consertou 3
subitens só no arquivo gerado.

## Estado atual (conferido)

- **A fonte é o vault, e é gerada.** `catalogo-questoes/qconcursos/links.json` (264 chaves) é
  escrito por `scripts/gerar_links_qconcursos.py` a partir de `assuntos.json` (chave →
  disciplinas/assuntos da taxonomia; 229 chaves com assunto), `termos.json` (chave → termo de
  busca, usado quando não há assunto; 35 chaves), `contagem.csv` (466 assuntos com contagem
  de questões, lida logada em 2026-10-13) e o catálogo de assuntos baixado da API pública.
  O LEIA-ME da pasta manda: "links.json é gerado: não edite"; para mudar um link, corrige-se
  `assuntos.json` ou `termos.json` e roda-se a cadeia de regeneração.
- **Onde o link aparece no app.** O importador lê o `links.json` e grava `qc`/`qcErros` em
  `missoes-<cargo>.json` ([scripts/importar/missoes.mjs:44](../../painel-concurso/scripts/importar/missoes.mjs);
  leitura em [scripts/importar/index.mjs:292](../../painel-concurso/scripts/importar/index.mjs)):
  169 links no plano `cd`, 177 no `aud`. As páginas de artefatos Prioridades e Missões embutem
  os mesmos links (792 URLs do Qconcursos em cada HTML), geradas no vault por
  `scripts/montar_artifacts.py:34`, que lê o mesmo `links.json`.
- **Mina do `fcbbed7`.** O commit corrigiu OGS-14 (E4 3.4), EAG-12 (E2 5.3) e EAG-13 (E2 5.4)
  editando só `static/conteudo/missoes-cd.json`. No vault, `assuntos.json` ainda tem os
  assuntos errados: `CD:E4-3.4 → {"d":[593],"s":[28006]}` (28006 = "Tratamento de Dados
  Pessoais", o erro apontado como LGPD) e `CD:E2-5.3`/`CD:E2-5.4 → {"d":[96],"s":[4926]}`
  (4926 = "ETL"). Os consertos do repo usam 5291 ("Inteligencia Artificial", disciplina 100)
  e 27594 ("Metadados e Metainformação", disciplina 96). Consequências: as páginas de
  artefatos ainda abrem os links errados desses 3 subitens, e o próximo `npm run importar`
  desfaz o conserto também no painel. Comparação chave a chave (comando na fase 0): exatamente
  essas 3 divergências no cargo `cd`, 0 no `aud`.
- **O caso denunciado.** E2 5.5 = cid `EAG-14`, chave `CD:E2-5.5`: sem assunto em
  `assuntos.json` (`{"d":[],"s":[]}`) → busca textual "vinculação de registros" de
  `termos.json`, escrita à mão em 2026-10-13. O termo parece certo e a busca retorna
  questões de outro tema.
- **Auditoria de resultados exige navegador.** O Qconcursos respondeu 403 a fetch sem
  navegador (Cloudflare). Precedente: `contagem.csv` foi lido logado, no navegador
  (LEIA-ME da pasta do vault). Para os 229 links por assunto, porém, a triagem é offline:
  nome do assunto × texto do subitem (ambos em dados locais: `subitens/p12.json`, `p3.json`,
  `pE.json` têm `id`, `prio`, `texto`; nomes dos assuntos em `contagem.csv`).
- **O gerador valida e restringe as correções.** Assunto novo precisa existir no catálogo,
  ter contagem em `contagem.csv` (senão o `--check` falha: "contagem.csv sem N assuntos") e
  sua disciplina precisa estar em `d` da chave. `termos.json` só vale para chave sem assunto.
  Sem opção "sem link": toda chave tem assunto ou termo. `python scripts/gerar_links_qconcursos.py
  --check` passa hoje: "264 chaves: 229 por assunto, 35 por termo". Python 3.12.10 disponível.
- **Corte e variantes.** "cobrados" leva os assuntos mais cobrados até 80% das questões;
  "amplo" leva todos; `padrao` escolhe; "erros" é o amplo com `my_questions=wrong`. Filtros
  base: Cebraspe, 2017–2026, nível superior, sem anuladas/desatualizadas.

## Estado final desejado

- Os 264 links abrem questões dentro do tema do subitem — ou o mais próximo que a taxonomia
  do Qconcursos permitir, com o compromisso registrado na tabela de aprovação.
- As fontes do vault (`assuntos.json`, `termos.json`, `contagem.csv` para assuntos novos)
  refletem todas as correções; `links.json` volta a ser gerado, não editado.
- Repo e vault concordam: regenerar não muda nada (o `missoes-<cargo>.json` e os artefatos
  saem iguais ao que está commitado).
- Painel e páginas de artefatos mostram os mesmos links corrigidos, incluindo os 3 do
  `fcbbed7`.

### Descobertas que sustentam o plano

- A cadeia de regeneração documentada no LEIA-ME do vault: corrigir `assuntos.json` ou
  `termos.json` → `python scripts/gerar_links_qconcursos.py` → `python
  scripts/montar_artifacts.py` → `npm run importar` no repo.
- O `--check` do gerador é a barreira de validação: catálogo, disciplina e contagem por
  assunto; roda antes e depois de cada edição.
- A triagem offline (assunto × subitem) elimina a maior parte dos 229 sem tocar no
  Qconcursos; o navegador entra nos 35 por termo, nos duvidosos e na contagem de assuntos
  novos — tudo numa sessão logada, como em 2026-10-13.
- Discipline/subject ids já validados pelo `fcbbed7`: 5291 (d=100), 27594 (d=96) — os
  valores que a fase 0 escreve no vault.

## O que NÃO vamos fazer

- **Não mexer em código**: `gerar_links_qconcursos.py`, `montar_artifacts.py` e o importador
  do repo ficam como estão; a correção é só dado (`assuntos.json`, `termos.json`,
  `contagem.csv`).
- **Não refazer o casamento dos 264 do zero** nem recontar os 466 assuntos do
  `contagem.csv`; contamos apenas assuntos que entrarem como proposta nova.
- **Não mudar o desenho dos links**: cortes de 80%, filtros base e variantes
  cobrados/amplo/erros permanecem.
- **Não criar link vazio**: subitem sem assunto equivalente fica com o assunto mais próximo
  (ou termo melhor), e a escolha fica registrada na tabela de aprovação.

## Abordagem

Auditar primeiro offline (barato, cobre os 229 por assunto), navegador só onde a triagem não
resolve (35 por termo + duvidosos + contagem de assuntos novos). Corrigir só nas fontes do
vault, em lote, depois de aprovação única dela; regenerar a cadeia inteira uma vez e commitar
o repo uma vez. A mina do `fcbbed7` é desarmada antes da auditoria, para que a linha de base
seja "repo == vault".

---

## Fase 0 — Desarmar a mina do fcbbed7 (só vault)

### Mudanças

**Arquivo**: `catalogo-questoes/qconcursos/assuntos.json` (vault)

- `CD:E4-3.4`: `{"d":[593],"s":[28006]}` → `{"d":[100],"s":[5291]}`
- `CD:E2-5.3`: `{"d":[96],"s":[4926]}` → `{"d":[96],"s":[27594]}`
- `CD:E2-5.4`: `{"d":[96],"s":[4926]}` → `{"d":[96],"s":[27594]}`

**Arquivo**: `catalogo-questoes/qconcursos/links.json` (vault) — regenerado, não editado:

```sh
cd "C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu"
python scripts/gerar_links_qconcursos.py --check   # valida antes
python scripts/gerar_links_qconcursos.py           # escreve links.json
```

Sem commit no repo nesta fase: `missoes-cd.json` já está correto, e os artefatos HTML são
regenerados de uma vez na fase 2.

### Critérios de aceite

#### Verificação automática
- [x] `python scripts/gerar_links_qconcursos.py --check` sem erros, com as contagens de
      sempre (264 chaves, 466 assuntos contados).
- [x] Comparação repo × vault sem divergência — no repo, com `PAINEL_VAULT` apontando para
      o vault:

```sh
node -e "
const fs=require('fs'),V=process.env.PAINEL_VAULT+'/catalogo-questoes/qconcursos/links.json';
const vault=JSON.parse(fs.readFileSync(V,'utf8'));
const cl=(c,k)=>(/^E/.test(k)?c.toUpperCase()+':':'')+k.replace(' ','-');
const pai=k=>/^(.*-\d+\.\d+)\.\d+$/.exec(k)?.[1]??null;
let divs=0;
for(const cargo of ['cd','aud']){
  const r=JSON.parse(fs.readFileSync('static/conteudo/missoes-'+cargo+'.json','utf8'));
  const cods={};
  for(const d of r.plan)for(const b of d.blocos)for(const it of b.itens||[])cods[it.cid]=it.cod;
  for(const [cid,url] of Object.entries(r.qc)){
    const ch=cl(cargo,cods[cid]||''), v=vault[ch]??vault[pai(ch)??''];
    if(url!==(v?v[v.padrao]:undefined)){divs++;console.log(cargo,cid,ch);}
  }
}
console.log(divs===0?'repo == vault':'divergências: '+divs);
"
```

#### Verificação manual
- Nenhuma mudança visível no app nesta fase (é o esperado).

---

## Fase 1 — Auditoria dos 264 e proposta de correção

### Mudanças

Nada é alterado; os entregáveis são a lista de errados com evidência e a tabela de proposta.

#### 1a. Triagem offline dos 229 por assunto

Tabela de trabalho (script descartável em `node -e`, sem arquivo novo no repo): chave | texto
do subitem (de `subitens/*.json`) | assuntos escolhidos com nome e contagem (de
`assuntos.json` × `contagem.csv`) | marcação **OK / duvidoso**. Marca duvidoso o assunto cujo
nome não cobre o tópico do subitem, e a chave em que qualquer assunto da lista destoa.

#### 1b. Navegador: 35 por termo + duvidosos da 1a

Na sessão logada dela (skill de navegador), uma URL por vez, com pausa entre elas: anotar
"Foram encontradas N questões" e os assuntos das primeiras ~8 questões. Link é **errado**
quando a maioria das questões é de outro tema. Evidência (número encontrado + assuntos
vistos) anotada por link.

#### 1c. Proposta em lote

Para cada errado, proposta de `assuntos.json` (assuntos da taxonomia, com nome e contagem) ou
de `termos.json` (termo novo), procurando primeiro assunto equivalente; termo só quando não
houver. Assuntos novos fora do `contagem.csv` têm a contagem lida no navegador na mesma
sessão (uma busca por assunto, "Foram encontradas N"). A tabela — subitem, link atual com
evidência, proposta, contagem — vai para ela aprovar em lote.

### Critérios de aceite

#### Verificação automática
- [x] As 264 chaves classificadas: OK / errado (com evidência) — a soma fecha em 264.
- [x] Toda proposta por assunto usa assunto existente no catálogo e com contagem em
      `contagem.csv` (original ou lida na 1c).

#### Verificação manual
- [ ] Ela aprova (ou ajusta) a tabela de proposta em lote.

**Pausa**: a auditoria para aqui; nada é corrigido sem a aprovação dela.

### Nota de execução (2026-10-30)

Descobertas que mudaram o detalhe da fase 1 (não o desenho):

- **A busca por palavra-chave (`q=`) é desabilitada para quem não está logado.** No navegador
  sem sessão, a caixa "Palavra chave" aparece `[disabled]`, o contador fica no total dos
  filtros (136.599) e a lista de questões é um padrão fixo — igual para qualquer `q=`. Ou
  seja: os 35 links por termo, para convidado, abrem uma lista sem filtro nenhum. Para a
  conta dela (logada) o `q=` vale — foi assim que ela viu questões fora do tema.
- **Os links por assunto funcionam para convidado** (contador e questões filtradas corretos,
  conferido com Metadados: 24 questões). Por isso a proposta favorece converter termo em
  assunto sempre que houver candidato razoável, e o termo fica só onde a taxonomia não tem
  nada (com checagem final dela, logada).
- **Contagens lidas em 2026-10-30** (convidado, mesmos filtros de base): Hardware 46/4849 =
  51; Assédio sexual 9/17346 = 4; Lei 13.531 53/27294 = 0 (descartada); Reparação do dano e
  ação regressiva 2/15995 = 65; SIG 96/1665 = 4; Redes de Computadores 46/324 = 44.
- Triagem offline: 7 links vazios (assunto certo, 0 questões), ~10 de tema fraco/trocado; os
  demais 200+ por assunto estão coerentes pelo nome do assunto × texto do subitem.

---

## Fase 2 — Correção nas fontes, regeneração em cadeia e publicação

### Mudanças

#### Vault
**Arquivo**: `catalogo-questoes/qconcursos/assuntos.json` e `termos.json`
Aplicar a tabela aprovada: trocar `s`/`d` dos assuntos corrigidos; chave que ganha assunto
sai de `termos.json` (entrada removida); chave sem assunto equivalente fica `{"d":[],"s":[]}`
com termo novo em `termos.json`.

**Arquivo**: `catalogo-questoes/qconcursos/contagem.csv`
Acrescentar linha por assunto novo (subject_id, discipline_id, nome, qtd lida na 1c,
data_conferido de hoje).

**Arquivo**: `catalogo-questoes/qconcursos/links.json` + `artifacts/_publicar/*.html`
Regenerar:

```sh
cd "C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu"
python scripts/gerar_links_qconcursos.py --check
python scripts/gerar_links_qconcursos.py
python scripts/montar_artifacts.py --check   # compara o link amplo de cada subitem com a versão publicada
python scripts/montar_artifacts.py
```

#### Repo
**Arquivo**: `static/conteudo/` (gerado)

```sh
npm run importar
git diff --stat static/conteudo   # revisar: esperados só os arquivos de links (missoes-*.json
                                 # e os HTML dos artefatos); se aparecer mudança de outro
                                 # conteúdo do vault, é movimento do vault desde 2026-10-27 —
                                 # mostrar a ela antes de commitar
```

Commit único, no estilo da casa: `fix: links do Qconcursos com o tema certo por subitem`.

### Critérios de aceite

#### Verificação automática
- [ ] `python scripts/gerar_links_qconcursos.py --check` e `python scripts/montar_artifacts.py
      --check` sem erros no vault.
- [ ] A comparação repo × vault da fase 0 imprime `repo == vault`.
- [ ] `npm test` e `npm run check` verdes.
- [ ] `npm run test:e2e` verde (inclui os testes dos artefatos e das Missões).

#### Verificação manual
- [ ] Na Missão de hoje (ou na página das Missões), o link de E2 5.5 abre questões do tema;
      os 3 do `fcbbed7` abrem o mesmo link no painel e nos artefatos.
- [ ] Abrir Prioridades num subitem corrigido: mesmo tema no link de lá.

**Pausa**: verificação manual no app antes de encerrar o plano.

## Estratégia de teste

### Automáticos
- A validação estrutural é do `--check` do gerador (catálogo × assunto × disciplina ×
  contagem) e dos testes do repo sobre o conteúdo gerado (`npm test`, `npm run test:e2e`).
- A comparação repo × vault (comando da fase 0) vira o critério de idempotência: depois da
  fase 2, regenerar de novo não muda nada.

### Manuais
1. Clicar os links corrigidos no app (painel e artefatos) e ver questões do tema.
2. Um link "erros ↗" de revisão qualquer continua logado e funcional.

## Limites conhecidos

- **Tema sem assunto equivalente**: fica o assunto mais próximo (ou termo), registrado na
  tabela de aprovação — como já era o limite de ML do LEIA-ME do vault.
- **Contagem é aproximação**: questão com dois assuntos conta duas vezes; não recontamos os
  466 assuntos existentes.
- **Sessão do navegador pode cair** no meio da auditoria: retomar da última URL anotada.
- **Deriva do vault**: o `npm run importar` publica tudo que mudou no vault desde 2026-10-27,
  não só os links — o diff é revisado antes do commit.

## Migração de dados

Nenhuma no app: links são conteúdo estático, trocados no deploy; quem usa não faz nada. O
conserto manual do `fcbbed7` em `missoes-cd.json` é superseded pela fonte correta — sai do
diff sem perder nada.

## Referências

- Plano original dos links: `planos/2026-10-13-F7-01-links-qconcursos-provas-parecidas.md`
  (vault) e o LEIA-ME de `catalogo-questoes/qconcursos/`
- Gerador: `scripts/gerar_links_qconcursos.py` (vault) — validação em `gerar()`, ramo por
  termo `if not a["s"]`
- Importador: [scripts/importar/missoes.mjs:44](../scripts/importar/missoes.mjs)
  (`linksDoPlano`), [scripts/importar/index.mjs:292](../scripts/importar/index.mjs)
- Artefatos: `scripts/montar_artifacts.py:34` (vault), `static/conteudo/artefatos/*.html`
- Commit a portar: `fcbbed7` (fix: corrige filtros Qconcursos de 3 subitens)
- Assuntos em jogo: `contagem.csv` — 5291 Inteligencia Artificial (d 100), 27594 Metadados e
  Metainformação (d 96), 28006 Tratamento de Dados Pessoais (d 593), 4926 ETL (d 96)
