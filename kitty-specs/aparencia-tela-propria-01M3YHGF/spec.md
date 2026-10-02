# Especificação: Ajustes em Tela Própria

**Missão**: `aparencia-tela-propria-01M3YHGF` · **Tipo**: software-dev
**Criada**: 2026-10-02 · **Branch de planejamento e de merge**: `main`
**Base**: `main` depois da missão `identidade-visual-aventura-kindle-01M3T7H9` (seletor de tema entregue no WP02, hoje dentro do painel)

## Visão geral

Hoje dois blocos de configuração aparecem direto no painel: **Foco de Estudo** (cargo fixo e a
disciplina de foco, que define a ordem dos stories) e **Aparência** (Seguir o aparelho, Aventura,
Kindle e Kindle escuro). Os dois são usados raramente e ocupam espaço na tela que a dona abre
todo dia. Esta missão tira os dois blocos do painel e os reúne numa tela de **Ajustes**, aberta por
um único botão no canto do cabeçalho do painel.

**Por quê**: o painel fica com o que é de estudo (concurso, progresso, atalhos), e as
configurações continuam a um toque de distância.

## Decisões da dona (2026-10-02)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Onde fica o acesso | Botão com ícone no canto do cabeçalho do painel, abrindo tela própria com "Voltar" (opção A) |
| D2 | Foco de Estudo | Sai do painel também, pela mesma linha |
| D3 | Um botão ou dois | **Um único botão**, que abre uma tela com as duas seções: Foco de Estudo e Aparência |

## Cenários de uso e testes

### Cenário 1 — Painel sem os blocos de configuração (P1)

**Aceite**
1. **Dado** o painel aberto, **quando** a pessoa olha a tela, **então** os blocos "Foco de Estudo" e "Aparência" não aparecem.
2. **Dado** o painel aberto, **quando** a pessoa olha o cabeçalho, **então** continua vendo o cargo e a disciplina de foco atual em texto, sem seletor (o painel segue mostrando o foco, como pede o FR-014 da missão do feed).

### Cenário 2 — Abrir os Ajustes pelo painel (P1)

**Aceite**
1. **Dado** o painel aberto, **quando** a pessoa toca no botão de ajustes no canto do cabeçalho, **então** abre a tela de Ajustes com duas seções, nesta ordem: Foco de Estudo e Aparência, cada uma com os controles completos de hoje.
2. **Dado** a tela de Ajustes, **quando** a pessoa toca em "Voltar", **então** volta ao painel.

### Cenário 3 — Mudar foco e tema na tela de Ajustes (P1)

**Aceite**
1. **Dado** a tela de Ajustes, **quando** a pessoa escolhe outra disciplina de foco, **então** ao voltar o painel mostra a disciplina nova e o feed passa a abrir os stories com ela primeiro (o mesmo comportamento de hoje).
2. **Dado** a tela de Ajustes, **quando** a pessoa escolhe um tema, **então** ele vale na hora e continua depois de voltar ao painel e de reabrir o app (o mesmo comportamento de hoje).

### Cenário 4 — Acesso direto e navegação (P2)

**Aceite**
1. **Dado** o endereço da tela de Ajustes aberto direto (link ou recarga), **quando** a página carrega, **então** a tela abre, inclusive no site publicado e sem conexão depois da primeira visita.
2. **Dado** a tela de Ajustes, **quando** a pessoa olha a barra de abas, **então** a aba "Painel" aparece como a atual.
3. **Dado** a tela de Ajustes, **quando** a pessoa usa o botão voltar do aparelho ou do navegador, **então** volta ao painel.

### Casos de borda

- Leitor de tela: o botão do cabeçalho é anunciado como "Ajustes" (não só um ícone sem nome).
- Tela de 360 px: o botão não empurra nem sobrepõe o título do cabeçalho.
- Temas Kindle: o botão segue as regras do tema (sem cor e sem animação), como o resto do cabeçalho.
- Matérias ainda carregando: a seção Foco de Estudo mostra o mesmo estado "Carregando matérias…" de hoje, e o texto do foco no painel mostra a disciplina gravada.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | Os blocos "Foco de Estudo" e "Aparência" deixam de aparecer no painel. | Proposto |
| FR-002 | O cabeçalho do painel tem, no canto, um único botão com ícone e nome acessível "Ajustes" que abre a tela de Ajustes. | Proposto |
| FR-003 | A tela de Ajustes tem título, ação "Voltar" que leva ao painel e duas seções, nesta ordem: Foco de Estudo e Aparência. | Proposto |
| FR-004 | A seção Foco de Estudo tem os mesmos controles e o mesmo comportamento de hoje (cargo fixo e escolha da disciplina de foco, que define a ordem dos stories). | Proposto |
| FR-005 | A seção Aparência tem o seletor de tema completo, com o mesmo comportamento de hoje (troca na hora, persistência, Seguir o aparelho). | Proposto |
| FR-006 | O painel continua mostrando, em texto e sem seletor, o cargo e a disciplina de foco atual. | Proposto |
| FR-007 | A tela de Ajustes tem endereço próprio, abre por link direto ou recarga e funciona sem conexão depois da primeira visita. | Proposto |
| FR-008 | Na tela de Ajustes, a aba "Painel" aparece como a atual na barra de abas. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Acesso | do painel até mudar o tema ou o foco em no máximo 2 interações (abrir Ajustes, escolher) | Proposto |
| NFR-002 | Alvo de toque | botão do cabeçalho e "Voltar" com pelo menos 44 × 44 px | Proposto |
| NFR-003 | Acessibilidade | auditoria de acessibilidade ≥ 90 na tela de Ajustes e no painel, nos 3 temas; botão operável por teclado | Proposto |
| NFR-004 | Layout | sem rolagem horizontal de 360 a 1440 px nas duas telas | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | Reaproveitar o seletor de tema e o bloco de foco existentes: nenhuma mudança na lógica de tema, de foco nem nas opções. | Aceita |
| C-002 | Seguir a identidade visual em vigor (tokens dos 3 temas, contorno, sem cor fixa) e a lista anti-"cara de IA" da missão anterior. | Aceita |
| C-003 | Não mexer em código de outras missões em andamento (questões, plano). | Aceita |
| C-004 | Interface em português do Brasil. | Aceita |

## Critérios de sucesso

- SC-001: O painel abre sem os blocos de Foco de Estudo e Aparência em 100% das cargas, e mostra o foco atual em texto.
- SC-002: Do painel, a pessoa muda o tema ou o foco em até 2 interações.
- SC-003: A tela de Ajustes abre por link direto no site publicado e offline em 100% das tentativas.
- SC-004: Os testes automáticos que hoje cobrem o seletor de tema e o foco no painel passam apontando para a tela nova, sem perder nenhum caso.

## Premissas

- O ícone do botão é um dos já existentes no app ou um novo traço simples, no mesmo estilo; a escolha fica para o plano.
- O endereço da tela fica sob o painel (ex.: `/painel/ajustes`), o que já faz a aba "Painel" aparecer como atual.
- Os testes de aceite que hoje abrem o seletor de tema ou o campo "Disciplina" em `/painel` passam a abri-los na tela nova.
- O slug da missão continua `aparencia-tela-propria`, porque é identidade fixa; o nome exibido passa a ser "Ajustes em Tela Própria".

## Fora de escopo

Outras configurações na tela de Ajustes (tamanho de fonte, densidade); mudar a lógica ou as opções
de tema e de foco; mexer na barra de abas.
