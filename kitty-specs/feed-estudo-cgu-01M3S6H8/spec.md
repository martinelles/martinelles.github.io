# Especificação: Feed de Estudo CGU

**Missão**: `feed-estudo-cgu-01M3S6H8` · **Tipo**: software-dev
**Criada**: 2026-09-30 · **Branch de planejamento e de merge**: `main`
**Base**: `main` depois do merge da missão `painel-concurso-pwa-01M3RA84` (commit `38ed888` + `d83cab1`)

## Visão geral

O app deixa de ser genérico e passa a servir **só ao concurso da CGU (AFFC/TFFC, Cebraspe,
certame 2026)**: não existe mais a tela de escolher concurso. A área principal vira um
**feed de estudo no formato do Instagram** — rolagem vertical de posts, stories no topo,
curtir, salvar e carrossel — em que todo post é conteúdo de estudo: questões de provas,
artigos de lei seca, resumos em carrossel e flashcards.

**Por quê**: estudar em momentos curtos, no celular, com o mesmo gesto de rolar uma rede
social, mas sobre o conteúdo que cai na prova. O painel continua existindo para o foco de
estudo (cargo e disciplina) e para atalhos.

**Referência anterior**: o protótipo `Documents/github/instagram-resumos` registrou três
defeitos que esta spec proíbe desde o início: feed repetindo os mesmos posts (ACH-02),
conteúdo que some ao recarregar (ACH-03) e números fixos no perfil (ACH-01).

## Decisões da dona (2026-09-30)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Missão anterior | Mesclada em `main` como base; esta missão refaz em cima dela |
| D2 | Fontes do feed | Questões do catálogo, lei seca, resumos e flashcards |
| D3 | Interações | Responder no post, curtir e salvar, carrossel, stories por matéria |
| D4 | Quais questões | CGU **e** TCU, válidas e com gabarito, cada post com a etiqueta da prova |
| D5 | Autoria de resumos e flashcards | Gerados por IA a partir do edital e da lei seca, com fonte e selo "gerado — a revisar" até a dona marcar como conferido |
| D6 | Foco de estudo | Fixo: **AFFC — TI — Ciência de Dados**. Não há seleção de cargo |
| D7 | Onde ficam resumos e flashcards gerados | No vault, em `Estudo/cgu/feed-conteudo/`, um arquivo por tópico com `conferido: false`; a dona revisa no Obsidian |

## Cenários de uso e testes

### Cenário 1 — Rolar o feed e responder uma questão (P1)

**Aceite**
1. **Dado** o app aberto, **então** a tela inicial é o feed, com a fileira de stories no topo e posts em sequência, sem nenhuma tela de escolha de concurso.
2. **Dado** um post de questão Certo/Errado, **quando** a pessoa toca "Certo" ou "Errado", **então** o post mostra na hora se acertou, o gabarito oficial e a etiqueta da prova (ex.: "CGU 2022 · AFFC TI · Q. 47"), sem sair do feed.
3. **Dado** um post de questão de múltipla escolha, **quando** a pessoa toca uma alternativa, **então** a alternativa escolhida e a correta ficam destacadas.
4. **Dado** uma questão já respondida, **quando** o post volta a aparecer ou o app é reaberto, **então** a resposta dada continua visível.
5. **Dado** o fim dos posts carregados, **quando** a pessoa rola até o fim, **então** chegam novos posts **diferentes** dos já vistos na sessão; quando o conteúdo do filtro acaba, aparece "Você viu tudo desta matéria" em vez de repetir.

### Cenário 2 — Stories por matéria (P1)

**Aceite**
1. **Dado** o topo do feed, **então** há um círculo por matéria que tem conteúdo, com o nome abreviado, e um primeiro círculo "Tudo".
2. **Dado** um story tocado, **então** o feed passa a mostrar só posts daquela matéria e o círculo fica marcado; tocar "Tudo" volta ao feed completo.
3. **Dado** a disciplina de foco (por padrão "TI: Ciência de Dados"), **então** o story dela aparece logo depois de "Tudo".
4. **Dado** uma matéria em que todos os posts já foram vistos, **então** o anel do círculo fica cinza (visto), como no Instagram.

### Cenário 3 — Lei seca, resumo em carrossel e flashcard (P1)

**Aceite**
1. **Dado** um post de lei seca, **então** ele mostra o nome da lei, o número do artigo e o texto integral do artigo; artigo com muitos incisos vira carrossel, e cada tela mostra a posição ("2/4").
2. **Dado** um post de resumo, **então** ele é um carrossel de telas curtas sobre um tópico do edital, com a fonte na última tela.
3. **Dado** um carrossel, **quando** a pessoa desliza para o lado ou toca as setas, **então** a tela muda e os pontos indicadores acompanham.
4. **Dado** um flashcard, **quando** tocado, **então** vira e mostra a resposta; tocando de novo, volta à pergunta.
5. **Dado** resumo ou flashcard ainda não conferido pela dona, **então** o post mostra o selo "gerado — a revisar" e a fonte usada.

### Cenário 4 — Curtir, salvar e rever salvos (P2)

**Aceite**
1. **Dado** qualquer post, **quando** a pessoa toca o coração ou dá dois toques no conteúdo, **então** o post fica curtido; tocar de novo desfaz.
2. **Dado** qualquer post, **quando** a pessoa toca o marcador, **então** o post vai para "Salvos"; tocar de novo tira.
3. **Dado** a aba "Salvos", **então** ela lista os posts salvos, do mais recente ao mais antigo, com as mesmas interações do feed.
4. **Dado** curtidas, salvos e respostas, **quando** o app é fechado e reaberto, **então** tudo continua como estava.

### Cenário 5 — Painel focado na CGU (P2)

**Aceite**
1. **Dado** o painel, **então** ele mostra "CGU — Auditor Federal de Finanças e Controle · TI — Ciência de Dados", banca Cebraspe, e a data da prova ou "Data a definir" enquanto não houver edital.
2. **Dado** o painel, **então** mostra números **calculados** do uso: questões respondidas, taxa de acerto e itens salvos (nada escrito fixo).
3. **Dado** o foco de estudo, **então** o cargo aparece fixo como "AFFC — TI — Ciência de Dados", sem seletor; a pessoa só pode escolher uma disciplina de foco, que começa em "TI: Ciência de Dados".
4. **Dado** os atalhos do painel "Questões Objetivas", "Resumos", "Flashcards" e "Lei seca", **quando** tocados, **então** abrem o feed filtrado por aquele tipo de post; os demais atalhos continuam na tela "em breve".
5. **Dado** a navegação inferior, **então** há três abas — Feed, Salvos, Painel — sempre visíveis.

### Casos de borda

- Questão anulada ou sem gabarito: não entra no feed.
- Questão com gabarito alterado após recurso: usa o gabarito definitivo registrado no catálogo.
- Questão com enunciado que depende de texto-base comum ("Julgue os itens a seguir…"): o texto-base aparece acima do item.
- Matéria sem nenhum post: não ganha story.
- Filtro sem nada novo: mensagem de fim, nunca repetição.
- Armazenamento indisponível (janela privada): o feed funciona; curtidas, salvos e respostas valem só na sessão, e um aviso discreto diz isso.
- Sem conexão depois da primeira visita: o feed abre com o conteúdo já baixado.
- Rota antiga `/escolher` (favoritos de quem usou a versão anterior): leva ao feed.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | O app atende só ao concurso da CGU; a escolha de concurso e a lista de outros concursos deixam de existir, e `/escolher` redireciona ao feed. | Proposto |
| FR-002 | A tela inicial é o feed de estudo, com stories no topo, posts em rolagem vertical e navegação inferior Feed / Salvos / Painel. | Proposto |
| FR-003 | O feed tem quatro tipos de post: questão, lei seca, resumo (carrossel) e flashcard. | Proposto |
| FR-004 | Posts de questão vêm do catálogo de questões da dona: provas da CGU e do TCU, só válidas e com gabarito, com etiqueta de prova, ano, cargo e número. | Proposto |
| FR-005 | Questão Certo/Errado e de múltipla escolha são respondíveis no próprio post, com correção imediata e gabarito oficial. | Proposto |
| FR-006 | Posts de lei seca trazem um artigo por post, com lei, número do artigo e texto integral; artigo longo vira carrossel. | Proposto |
| FR-007 | Resumos (carrossel) e flashcards cobrem tópicos do edital, citam a fonte e trazem o selo "gerado — a revisar" até serem marcados como conferidos na fonte do conteúdo. | Proposto |
| FR-008 | Carrossel desliza com o dedo e com setas, com pontos indicadores e contador de posição. | Proposto |
| FR-009 | Stories por matéria filtram o feed; "Tudo" desfaz o filtro; a disciplina de foco vem primeiro; matéria toda vista fica com o anel cinza. | Proposto |
| FR-010 | O feed nunca repete um post já mostrado no mesmo filtro e sessão; ao esgotar, mostra mensagem de fim. | Proposto |
| FR-011 | A ordem do feed intercala os tipos de post e muda a cada dia, sendo estável dentro do mesmo dia. | Proposto |
| FR-012 | Curtir (coração ou dois toques) e salvar (marcador) em qualquer post; aba "Salvos" lista os salvos. | Proposto |
| FR-013 | Respostas, curtidas, salvos e posts vistos persistem no aparelho entre sessões. | Proposto |
| FR-014 | O painel mostra o concurso CGU, banca, prazo da prova, o foco fixo AFFC — TI — Ciência de Dados (sem seletor de cargo), a disciplina de foco (padrão "TI: Ciência de Dados") e números calculados de uso (respondidas, taxa de acerto, salvos). | Proposto |
| FR-015 | Os atalhos Questões Objetivas, Resumos, Flashcards e Lei seca do painel abrem o feed filtrado por tipo; os demais seguem "em breve". | Proposto |
| FR-016 | O conteúdo do feed é gerado a partir das fontes da dona (catálogo de questões, leis secas, resumos/flashcards) por um passo de importação repetível, sem edição manual do resultado. | Proposto |
| FR-017 | O feed funciona sem conexão depois da primeira visita, com todo o conteúdo já importado. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Primeira tela do feed utilizável em celular médio com 4G | ≤ 2,5 s na primeira visita; ≤ 1 s nas seguintes | Proposto |
| NFR-002 | Rolagem do feed | sem travadas perceptíveis: ≥ 55 quadros/s ao rolar 50 posts em celular médio | Proposto |
| NFR-003 | Resposta ao toque (responder, curtir, salvar, virar flashcard, trocar story) | retorno visual em ≤ 100 ms | Proposto |
| NFR-004 | Carga inicial, sem o conteúdo do feed | ≤ 300 KB transferidos (comprimido) | Proposto |
| NFR-005 | Conteúdo baixado sob demanda | cada lote de posts ≤ 150 KB comprimido; conteúdo total disponível offline após a 1ª visita | Proposto |
| NFR-006 | Acessibilidade | Lighthouse acessibilidade ≥ 90; tudo operável por teclado e leitor de tela (carrossel e flashcard inclusive) | Proposto |
| NFR-007 | Layout | sem rolagem horizontal de 360 px a 1440 px; alvos de toque ≥ 44 px | Proposto |
| NFR-008 | Fidelidade do conteúdo importado | 100% das questões do feed têm gabarito igual ao do catálogo; 100% dos artigos de lei batem com o texto da fonte | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | Sem servidor próprio nem conta; tudo no aparelho (mantido do charter). | Aceita |
| C-002 | Sem rastreamento de terceiros, fontes ou CDNs externos (charter). | Aceita |
| C-003 | Nada da marca, ícones ou layout proprietário do Instagram nem do Acertei: o formato de feed é inspiração, não cópia (sem logotipo, nome ou ícones deles). | Aceita |
| C-004 | Conteúdo gerado por IA nunca aparece sem a fonte e sem o selo de revisão; nenhum resumo inventa dispositivo legal que não esteja na lei seca da dona. | Aceita |
| C-005 | As fontes de conteúdo moram no vault da dona. Catálogo de questões, leis secas e baralhos existentes são só leitura para o app e a importação. A única escrita no vault é a geração de resumos e flashcards, em pasta própria (`Estudo/cgu/feed-conteudo/`), onde a dona marca "conferido" (D7). | Aceita |
| C-006 | Interface em português do Brasil. | Aceita |
| C-007 | Revisão espaçada (agendamento tipo FSRS) dos salvos fica fora desta missão. | Aceita |

## Entidades

- **Post**: identificador estável, tipo (questão, lei, resumo, flashcard), matéria, subtópico, fonte, situação de revisão (só resumo/flashcard).
- **Questão**: prova (órgão, ano, cargo), número, texto-base, enunciado, alternativas ou C/E, gabarito definitivo.
- **Artigo de lei**: lei (nome e número), artigo, texto integral, telas do carrossel.
- **Resumo**: tópico do edital, telas (título + texto curto), fonte.
- **Flashcard**: pergunta, resposta, fonte.
- **Matéria**: nome, abreviação do story, ordem.
- **Interação** (no aparelho): resposta dada por questão, curtidas, salvos com data, posts vistos por dia.
- **Foco de estudo** (no aparelho): disciplina de foco; o cargo é fixo (AFFC — TI — Ciência de Dados).

## Critérios de sucesso

- SC-001: Ao abrir o app, a pessoa está rolando posts de estudo em ≤ 3 s, sem escolher nada antes.
- SC-002: Em 30 minutos de rolagem num mesmo filtro, nenhum post aparece duas vezes.
- SC-003: 100% das questões, artigos, resumos e flashcards importados aparecem em algum filtro do feed.
- SC-004: Depois de fechar e reabrir o app, 100% das respostas, curtidas e salvos continuam lá.
- SC-005: Com o aparelho offline após a primeira visita, o feed abre e rola em 100% das tentativas.
- SC-006: Todo resumo e flashcard mostra fonte e, se não conferido, o selo "gerado — a revisar".
- SC-007: Os números do painel mudam ao responder uma questão e batem com as interações registradas.

## Premissas

- O catálogo de questões está em `Estudo/cgu/catalogo-questoes/questoes.csv` (2.097 linhas em 2026-09-30; 1.928 não anuladas e com gabarito, das quais 1.458 da CGU) e segue sendo ampliado; a importação é rerrodada quando ele muda.
- As leis secas estão em `Estudo/cgu/leis-secas/*.md` (26 arquivos, texto do Planalto e normas da CGU).
- Resumos e flashcards da primeira leva cobrem primeiro as matérias de TI e as de maior incidência no catálogo; a quantidade por matéria é decidida no plano. Os dois baralhos já existentes da dona (LGPD e Auditoria Governamental, `Estudo/cgu/flashcards/`) entram como flashcards, com a mesma marcação de revisão.
- A data da prova CGU 2026 não existe enquanto o edital não sai (TR 64/2026): o painel mostra "Data a definir".
- O foco é fixo em AFFC — TI — Ciência de Dados (D6). O feed continua trazendo todas as matérias do catálogo, porque o conteúdo programático oficial só sai no edital (TR 64/2026, item 5.5.3.1.1); a prioridade vai para "TI: Ciência de Dados" e as demais matérias de TI na ordem dos stories e na primeira leva de resumos e flashcards.
- A marcação "conferido" é feita pela dona na fonte do conteúdo (arquivo de resumos/flashcards), não dentro do app, e a importação carrega essa marca.
- A meta "auditoria PWA ≥ 90" da missão anterior não tem mais como ser medida (Lighthouse 12+); esta missão adota a checagem de instalabilidade do navegador sem erros como critério equivalente, e a meta volta se a ferramenta voltar a medir.

## Fora de escopo

Revisão espaçada com agendamento (FSRS) dos salvos; comentários, compartilhamento e
perfil social; publicar posts pelo app (o protótipo gerava carrossel a partir de PDF — não
entra); comentário de professor nas questões; sincronização entre aparelhos; publicação
em hospedagem pública.
