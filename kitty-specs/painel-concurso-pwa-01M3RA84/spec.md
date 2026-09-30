# Especificação: Painel de Concurso PWA

**Missão**: `painel-concurso-pwa-01M3RA84` · **Tipo**: software-dev
**Criada**: 2026-09-30 · **Branch de planejamento e de merge**: `main`
**Referência observada**: https://acertei.web.app/start-new (rota `start-new`, módulo `StartNewPage`, lido do bundle público em 2026-09-30)

## Visão geral

Aplicativo instalável no celular e no computador que reproduz a experiência de entrada do
Acertei Concursos: a pessoa escolhe o concurso "dos seus sonhos" numa lista pesquisável e
cai num "Painel de Estudos" que mostra o concurso escolhido, o foco de estudo e a grade de
ferramentas. Esta primeira missão entrega **só a casca visual**: as duas telas, a navegação
entre elas e a grade de ferramentas, com dados de exemplo. As ferramentas abrem uma tela
"em breve".

**Por quê**: ter a estrutura navegável e instalável pronta para, nas missões seguintes,
ligar ferramentas reais ao catálogo de questões próprio (CGU), sem depender de um serviço
de terceiros.

## Cenários de uso e testes

### Cenário 1 — Escolher o concurso (prioridade P1)

A pessoa abre o app pela primeira vez, vê a saudação e a pergunta "Qual o concurso dos seus
sonhos?", digita parte do nome e escolhe um concurso da lista.

**Aceite**
1. **Dado** o primeiro acesso, **quando** o app abre, **então** aparece a tela de escolha
   com o campo de busca e as seções "Abertos em alta", "Autorizados ou Previstos",
   "Por Área" e "Encerrados".
2. **Dado** a tela de escolha, **quando** a pessoa digita "cgu", **então** só ficam
   visíveis os concursos cujo nome, órgão, banca ou cargo contém o termo, sem diferenciar
   maiúsculas nem acentos.
3. **Dado** uma busca sem resultado, **quando** a lista esvazia, **então** aparece
   'Poxa, não encontramos "<termo>"' com a oferta "A gente adiciona para você!" e os
   caminhos alternativos "Estudar por Disciplina" e "Pedir no WhatsApp".
4. **Dado** a seção "Abertos em alta" com mais itens que o limite inicial, **quando** a
   pessoa toca "Ver mais", **então** a lista se expande, e "Ver menos" a recolhe.
5. **Dado** as seções "Autorizados ou Previstos", "Por Área" e "Encerrados", **quando** a
   pessoa toca o cabeçalho, **então** a seção abre ou fecha.
6. **Dado** um cartão de concurso, **quando** tocado, **então** a escolha fica registrada
   no aparelho e o app vai para o Painel de Estudos.

### Cenário 2 — Ver o Painel de Estudos (prioridade P1)

**Aceite**
1. **Dado** um concurso escolhido, **quando** o painel abre, **então** mostra nome do
   concurso, banca, vagas, dias até a prova (ou "data a definir") e o botão do edital.
2. **Dado** o painel, **quando** a pessoa escolhe um cargo em "Foco de Estudo", **então**
   a lista de disciplinas passa a ser a desse cargo, e a disciplina escolhida persiste.
3. **Dado** o painel, **então** a grade mostra as ferramentas agrupadas em
   "Material Teórico" (Aulas Digitais, Resumos, Mapas Mentais, PDFs) e
   "Prática & Revisão" (Questões Objetivas, Questões Discursivas, Desafios Diários,
   Flashcards, Simulados, Jurisprudência) e os atalhos "Estudo por Disciplina" e
   "Meu Plano de Estudos".
4. **Dado** qualquer ferramenta, **quando** tocada, **então** abre uma tela "em breve"
   com o nome da ferramenta e um botão de voltar ao painel.
5. **Dado** o painel, **quando** a pessoa toca "trocar concurso", **então** volta à tela
   de escolha.

### Cenário 3 — Reabrir e usar sem internet (prioridade P2)

**Aceite**
1. **Dado** um concurso já escolhido, **quando** o app é reaberto, **então** vai direto
   ao painel desse concurso.
2. **Dado** o app aberto uma vez com internet, **quando** o aparelho fica sem conexão,
   **então** as duas telas e a tela "em breve" continuam abrindo.
3. **Dado** um navegador compatível, **então** o app oferece instalação na tela inicial
   com nome, ícone e cor próprios.

### Casos de borda

- Concurso sem data de prova: mostra "data a definir" em vez de número de dias.
- Data de prova já passada: o concurso aparece em "Encerrados" e o painel mostra "prova realizada".
- Concurso com um único cargo: o seletor de cargo já vem preenchido.
- Concurso salvo que sumiu dos dados de exemplo: volta à tela de escolha sem erro.
- Armazenamento do navegador indisponível (janela privada): o app funciona, só não lembra a escolha.
- Tela estreita (360 px): nada rola na horizontal.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | A tela de escolha exibe saudação, a pergunta "Qual o concurso dos seus sonhos?" e o texto "Vamos personalizar a inteligência do aplicativo para o seu objetivo." | Proposto |
| FR-002 | A busca filtra os concursos por nome, órgão, banca e cargo, ignorando maiúsculas e acentos, a cada tecla. | Proposto |
| FR-003 | Os concursos aparecem em quatro seções: "Abertos em alta", "Autorizados ou Previstos", "Por Área" e "Encerrados", conforme a situação registrada em cada um. | Proposto |
| FR-004 | "Abertos em alta" mostra até 5 cartões e tem "Ver mais"/"Ver menos"; as outras três seções abrem e fecham pelo cabeçalho. | Proposto |
| FR-005 | Cada cartão mostra ícone, nome, banca, cargo principal, etiqueta de situação e salário. | Proposto |
| FR-006 | Busca sem resultado mostra a mensagem 'Poxa, não encontramos "<termo>"', a oferta "A gente adiciona para você!" e os caminhos "Estudar por Disciplina" e "Pedir no WhatsApp" (este abre um link configurável). | Proposto |
| FR-007 | Tocar um cartão grava o concurso escolhido no aparelho e abre o Painel de Estudos. | Proposto |
| FR-008 | O painel mostra o título "Seu Painel de Estudos", nome, banca, vagas, dias para a prova e botão do edital (abre o link do edital em nova aba quando existir). | Proposto |
| FR-009 | "Foco de Estudo" permite escolher cargo e disciplina; as disciplinas dependem do cargo; as escolhas persistem no aparelho. | Proposto |
| FR-010 | O painel exibe a grade de ferramentas nos grupos "Material Teórico" e "Prática & Revisão", mais "Estudo por Disciplina" e "Meu Plano de Estudos", cada item com ícone, título e subtítulo. | Proposto |
| FR-011 | Toda ferramenta abre uma tela "em breve" com o nome dela e botão de voltar. | Proposto |
| FR-012 | O painel tem ação para trocar de concurso, que volta à tela de escolha. | Proposto |
| FR-013 | Ao abrir, o app vai direto ao painel se houver concurso salvo e válido; senão, à tela de escolha. | Proposto |
| FR-014 | Os concursos, cargos, disciplinas e ferramentas vêm de um arquivo de dados de exemplo editável, separado das telas. | Proposto |
| FR-015 | O app pode ser instalado na tela inicial e abre as telas já visitadas sem conexão. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Tempo até a tela de escolha ficar utilizável em celular médio com 4G | ≤ 2,5 s na primeira visita; ≤ 1 s nas seguintes | Proposto |
| NFR-002 | Resposta da busca | lista atualizada em ≤ 100 ms por tecla com 500 concursos | Proposto |
| NFR-003 | Pontuação de auditoria de PWA e de acessibilidade do navegador | ≥ 90 em cada | Proposto |
| NFR-004 | Layout responsivo | sem rolagem horizontal de 360 px a 1440 px de largura | Proposto |
| NFR-005 | Contraste de texto | ≥ 4,5:1 para texto normal, nos temas claro e escuro | Proposto |
| NFR-006 | Peso da carga inicial | ≤ 300 KB transferidos, sem contar ícones | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | Sem servidor próprio nem conta de usuário: tudo roda no aparelho. | Aceita |
| C-002 | Não copiar marca, logotipo, fontes licenciadas, textos longos nem dados do Acertei; o que se replica é o fluxo e a disposição das telas. Nome do app: "Painel de Concurso". | Aceita |
| C-003 | Sem rastreamento de terceiros (analytics, pixel). | Aceita |
| C-004 | Interface em português do Brasil. | Aceita |
| C-005 | Ferramentas de estudo reais, login, assinatura e jogos ficam fora desta missão. | Aceita |

## Entidades

- **Concurso**: nome, órgão, banca, área, situação (aberto em alta, autorizado/previsto, encerrado), vagas, salário, data da prova (opcional), link do edital (opcional), ícone e cor, cargos.
- **Cargo**: nome, disciplinas.
- **Disciplina**: nome.
- **Ferramenta**: identificador, título, subtítulo, ícone, grupo.
- **Preferência**: concurso escolhido, cargo e disciplina de foco (guardados no aparelho).

## Critérios de sucesso

- SC-001: Uma pessoa sem instrução prévia escolhe um concurso e chega ao painel em menos de 30 s.
- SC-002: 100% das 12 entradas da grade abrem a tela "em breve" e voltam ao painel.
- SC-003: Depois da primeira visita, o app abre as duas telas sem conexão em 100% das tentativas.
- SC-004: O app é instalável na tela inicial no Android e no Windows, nos navegadores que oferecem instalação.
- SC-005: Acrescentar um concurso novo exige editar só o arquivo de dados, sem tocar nas telas.

## Premissas

- Os dados de exemplo trazem ao menos 12 concursos distribuídos pelas quatro seções, incluindo CGU (Cebraspe) e TCU.
- "Pedir no WhatsApp" aponta para um link configurável no arquivo de dados; sem link, o botão não aparece.
- Saudação usa "Olá!" sem nome, porque não há login.
- Tema segue claro/escuro do sistema.

## Fora de escopo

Banco de questões, correção de respostas, flashcards, simulados e cronograma funcionais;
login, assinatura e pagamento; jogos e desafios; sincronização entre aparelhos; importação
do catálogo de questões da CGU (fica para a missão seguinte).
