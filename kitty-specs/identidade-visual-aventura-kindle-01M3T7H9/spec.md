# Especificação: Identidade Visual Aventura e Kindle

**Missão**: `identidade-visual-aventura-kindle-01M3T7H9` · **Tipo**: software-dev
**Criada**: 2026-09-30 · **Branch de planejamento e de merge**: `main`
**Base**: `main` depois do merge da missão `feed-estudo-cgu-01M3S6H8` (6 pacotes aprovados, não mesclada em 2026-09-30)
**Referência visual**: nota do vault `Recursos/Design/Paleta — Doodles (Hora de Aventura).md` (paleta, tokens, receita do papel e contrastes medidos)

## Visão geral

O app troca o visual genérico atual (azul, cartões brancos com sombra suave, fonte do sistema)
por uma identidade própria com **três temas**:

- **Aventura**: paleta pastel inspirada em *Doodles Character Ensemble* (@doodles), no espírito de Hora de Aventura, com contorno escuro grosso, cor chapada e sombra dura.
- **Kindle**: preto e branco no estilo da tinta eletrônica, com serifa de livro, nenhuma animação e hierarquia só pelo tamanho e pelo peso.
- **Kindle escuro**: a variante escura do Kindle, com papel quase preto e tinta cinza-clara.

Os três temas dividem a mesma base: um fundo com textura de papel (referência: *Micrographics
Variations*, @zacharywinterton), uma composição minimalista e a tipografia como o elemento visual
principal. No tema Aventura, a cor forte fica concentrada num ponto só por tela.

**Por quê**: o app é usado em sessões longas de leitura (questão, lei seca, resumo). A dona quer
um visual que não pareça "gerado por IA", e o tema Kindle é para ler sem cansar a vista.

## Decisões da dona (2026-09-30)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Alcance | O app inteiro, inclusive o feed de estudo da missão anterior |
| D2 | Temas | Aventura (cor) e Kindle (preto e branco), à escolha da pessoa |
| D3 | Estilo-base | Typographic e Minimal; fundo com textura de papel |
| D4 | Modo escuro atual | Substituído por uma variante escura no estilo Kindle |

## Cenários de uso e testes

### Cenário 1 — Primeiro acesso com o tema certo (P1)

A pessoa abre o app pela primeira vez e o tema segue a configuração do aparelho.

**Aceite**
1. **Dado** o aparelho no modo claro e nenhuma escolha salva, **quando** o app abre, **então** o tema é Aventura.
2. **Dado** o aparelho no modo escuro e nenhuma escolha salva, **quando** o app abre, **então** o tema é Kindle escuro.
3. **Dado** qualquer tema, **quando** a tela carrega, **então** não há clarão de outro tema antes do certo aparecer.

### Cenário 2 — Trocar de tema (P1)

A pessoa troca de tema para ler com menos cor.

**Aceite**
1. **Dado** o painel aberto, **quando** a pessoa usa o seletor de tema, **então** vê as três opções (Aventura, Kindle e Kindle escuro), cada uma com uma prévia, e a opção "Seguir o aparelho".
2. **Dado** um tema escolhido, **quando** a pessoa fecha e reabre o app, **então** o tema escolhido continua.
3. **Dado** "Seguir o aparelho", **quando** o aparelho muda entre claro e escuro, **então** o app acompanha sem recarregar.

### Cenário 3 — Estudar no feed no tema Aventura (P1)

**Aceite**
1. **Dado** o tema Aventura, **quando** a pessoa rola o feed, **então** os posts têm fundo de papel creme, contorno escuro grosso e sombra dura deslocada, sem sombra borrada.
2. **Dado** uma questão respondida, **quando** a correção aparece, **então** o certo e o errado se distinguem por texto e ícone além da cor.
3. **Dado** qualquer tela, **quando** ela é exibida, **então** a cor forte (chiclete, menta ou manteiga) ocupa um único elemento de destaque, e não o fundo de áreas grandes.

### Cenário 4 — Ler lei seca e resumo no tema Kindle (P1)

**Aceite**
1. **Dado** o tema Kindle ou Kindle escuro, **quando** a pessoa abre um post de lei seca ou de resumo, **então** o texto vem em serifa de livro, numa coluna de 60 a 66 caracteres por linha.
2. **Dado** o tema Kindle ou Kindle escuro, **quando** a pessoa interage (curtir, virar o flashcard, deslizar o carrossel, trocar de story), **então** a mudança é instantânea, sem transição animada.
3. **Dado** o tema Kindle, **quando** a pessoa olha qualquer tela, **então** não há cor nenhuma além da escala de cinza.

### Cenário 5 — Usar sem conexão (P2)

**Aceite**
1. **Dado** o app aberto sem conexão depois da primeira visita, **quando** a pessoa troca de tema, **então** as fontes e a textura do papel aparecem iguais às da versão online.

### Casos de borda

- Aparelho com "reduzir movimento" ativado: nenhum tema anima, nem o Aventura.
- Escolha salva corrompida ou com tema desconhecido: o app volta para "Seguir o aparelho", sem erro.
- Tela de 360 px: a textura do papel e o contorno grosso não criam rolagem horizontal.
- Texto aumentado em 200% no navegador: nada se sobrepõe e a coluna de leitura só quebra linha.
- Selo "gerado — a revisar" e etiqueta de prova: legíveis e distinguíveis nos três temas.
- Impressão da página: sai em preto sobre branco, sem textura.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | O app oferece três temas, Aventura, Kindle e Kindle escuro, e a opção "Seguir o aparelho". | Proposto |
| FR-002 | Sem escolha salva, o tema segue o aparelho: modo claro dá Aventura e modo escuro dá Kindle escuro. | Proposto |
| FR-003 | O painel tem um seletor de tema com prévia de cada opção, e a escolha persiste no aparelho entre sessões. | Proposto |
| FR-004 | Todas as telas (painel, feed, salvos, ferramenta "em breve", erro e estado vazio) usam as cores do tema ativo; nenhuma cor fica fixa fora da definição do tema. | Proposto |
| FR-005 | O fundo tem textura de papel nos três temas, com a intensidade do grão definida por tema (forte no Aventura, quase imperceptível nos dois Kindle). | Proposto |
| FR-006 | No tema Aventura, cartões, botões e posts têm contorno escuro grosso e sombra dura deslocada, sem sombra borrada nem degradê dentro dos componentes. | Proposto |
| FR-007 | Nos temas Kindle, textos de leitura (enunciado, artigo, resumo, flashcard) usam serifa de livro, com coluna de 60 a 66 caracteres, e a hierarquia vem só do tamanho e do peso. | Proposto |
| FR-008 | Nos temas Kindle, nenhuma interação tem transição animada; no Aventura, a animação só existe como resposta a uma ação da pessoa. | Proposto |
| FR-009 | Certo e errado, curtido e salvo, e o selo de revisão se distinguem por forma, ícone ou texto, nunca só pela cor. | Proposto |
| FR-010 | A troca de tema acontece na hora, sem recarregar a página nem perder a posição no feed. | Proposto |
| FR-011 | A página carrega já no tema certo, sem clarão de outro tema. | Proposto |
| FR-012 | O modo escuro atual (azul-marinho) deixa de existir e é substituído pelo Kindle escuro. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Contraste de texto | ≥ 4,5:1 em todo par texto/fundo nos três temas; ≥ 3:1 em contorno de componente e indicador de foco | Proposto |
| NFR-002 | Peso das fontes e da textura | ≤ 120 KB comprimidos no total, somados os arquivos de fonte e a textura | Proposto |
| NFR-003 | Troca de tema | tela toda repintada em ≤ 100 ms após o toque | Proposto |
| NFR-004 | Rolagem do feed com textura de papel | ≥ 55 quadros/s rolando 50 posts em celular médio, igual à meta NFR-002 da missão do feed | Proposto |
| NFR-005 | Acessibilidade | pontuação de acessibilidade ≥ 90 na auditoria do navegador, nos três temas; seletor de tema operável por teclado e anunciado por leitor de tela | Proposto |
| NFR-006 | Layout | sem rolagem horizontal de 360 px a 1440 px e com texto aumentado em 200% | Proposto |
| NFR-007 | Primeira exibição | nenhum quadro renderizado no tema errado na carga inicial, verificado em 10 cargas por tema | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | Fontes e textura vão empacotadas no app; nada de fonte, CDN ou imagem externa (charter, C-002 da missão do feed). | Aceita |
| C-002 | Só fontes com licença livre de redistribuição (OFL ou equivalente). Bookerly, a fonte do Kindle, não entra. | Aceita |
| C-003 | Nada da marca, dos personagens ou das ilustrações de Doodles, Hora de Aventura, Kindle ou Amazon: as referências inspiram a paleta e o clima, e os nomes dos temas são só rótulos de estilo. | Aceita |
| C-004 | Evitar os padrões de "cara de IA" listados na skill `frontend-design`: rótulo em caixa-alta acima de todo título, cartões iguais com sombra cinza suave, número 01/02/03 em conteúdo que não é sequência, e seta "→" enfeitando botão. | Aceita |
| C-005 | Não muda comportamento, dados nem conteúdo do feed e do painel; a missão é só visual. | Aceita |
| C-006 | Interface em português do Brasil. | Aceita |

## Entidades

- **Tema**: identificador (aventura, kindle, kindle-escuro), nome exibido, conjunto de cores (papel, tinta, tinta suave, destaque, realce, linha), peso da linha, intensidade do grão, família tipográfica de leitura e política de movimento.
- **Preferência de tema** (no aparelho): tema escolhido ou "seguir o aparelho".

## Critérios de sucesso

- SC-001: Em 100% das telas do app, trocar de tema muda todas as cores, sem sobrar nenhum elemento com a cor do tema anterior ou do visual antigo.
- SC-002: Depois de fechar e reabrir o app, o tema escolhido continua em 100% das tentativas.
- SC-003: Todos os pares de cor de texto dos três temas passam de 4,5:1, com a lista dos pares medidos anexada à revisão.
- SC-004: Uma sessão de 20 minutos lendo lei seca no tema Kindle não tem nenhuma animação nem nenhuma cor fora da escala de cinza.
- SC-005: Posta ao lado da tela do app antigo, a dona reconhece o app novo como "não genérico" e aprova o visual nos três temas.
- SC-006: Offline, os três temas aparecem idênticos à versão online.

## Premissas

- A missão do feed (`feed-estudo-cgu-01M3S6H8`) é mesclada em `main` antes desta começar, porque os componentes do feed são alvo desta missão.
- A paleta, a receita do papel e os contrastes da nota do vault são a fonte dos valores. Ajuste fino de tom durante a implementação é permitido, desde que o NFR-001 continue valendo e a nota seja atualizada.
- Literata é a serifa de leitura sugerida para os temas Kindle, por ter licença OFL e ter sido feita para leitura em tela. A escolha final e a fonte de título do Aventura ficam para o plano, dentro do limite do NFR-002.
- "Seguir o aparelho" vem marcado por padrão.
- Os ícones atuais continuam; só a cor e a espessura do traço acompanham o tema.

## Fora de escopo

Ilustrações ou personagens próprios no estilo Doodles; tema configurável pela pessoa (escolher
cores soltas); tema por horário do dia; mudança de estrutura de navegação ou de conteúdo;
sincronizar a preferência entre aparelhos.
