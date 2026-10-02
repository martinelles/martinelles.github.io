# Especificação: Aparência em Tela Própria

**Missão**: `aparencia-tela-propria-01M3YHGF` · **Tipo**: software-dev
**Criada**: 2026-10-02 · **Branch de planejamento e de merge**: `main`
**Base**: `main` depois da missão `identidade-visual-aventura-kindle-01M3T7H9` (seletor de tema entregue no WP02, hoje dentro do painel)

## Visão geral

Hoje o seletor de tema (bloco "Aparência", com Seguir o aparelho, Aventura, Kindle e Kindle escuro)
aparece direto no painel, entre o progresso e a grade de ferramentas. Ele é usado raramente e ocupa
espaço na tela que a dona abre todo dia. Esta missão tira o bloco do painel e o põe numa tela
própria, aberta por um botão no cabeçalho do painel.

**Por quê**: o painel fica com o que é de estudo (concurso, foco, progresso, atalhos), e a
configuração visual continua a um toque de distância.

## Decisões da dona (2026-10-02)

| # | Pergunta | Resposta |
|---|---|---|
| D1 | Onde fica o acesso | Botão com ícone no canto do cabeçalho do painel, abrindo tela própria com "Voltar" (opção A) |

## Cenários de uso e testes

### Cenário 1 — Abrir a Aparência pelo painel (P1)

**Aceite**
1. **Dado** o painel aberto, **quando** a pessoa olha a tela, **então** o bloco "Aparência" não aparece no painel.
2. **Dado** o painel aberto, **quando** a pessoa toca no botão de aparência no canto do cabeçalho, **então** abre a tela de Aparência com o seletor completo (as mesmas 4 opções e prévias de hoje).
3. **Dado** a tela de Aparência, **quando** a pessoa toca em "Voltar", **então** volta ao painel.

### Cenário 2 — Trocar o tema na tela própria (P1)

**Aceite**
1. **Dado** a tela de Aparência, **quando** a pessoa escolhe um tema, **então** ele vale na hora e continua depois de voltar ao painel e de reabrir o app (o mesmo comportamento de hoje).

### Cenário 3 — Acesso direto e navegação (P2)

**Aceite**
1. **Dado** o endereço da tela de Aparência aberto direto (link ou recarga), **quando** a página carrega, **então** a tela abre, inclusive no site publicado e sem conexão depois da primeira visita.
2. **Dado** a tela de Aparência, **quando** a pessoa olha a barra de abas, **então** a aba "Painel" aparece como a atual.
3. **Dado** a tela de Aparência, **quando** a pessoa usa o botão voltar do aparelho ou do navegador, **então** volta ao painel.

### Casos de borda

- Leitor de tela: o botão do cabeçalho é anunciado como "Aparência" (não só um ícone sem nome).
- Tela de 360 px: o botão não empurra nem sobrepõe o título do cabeçalho.
- Temas Kindle: o botão segue as regras do tema (sem cor e sem animação), como o resto do cabeçalho.

## Requisitos

### Funcionais

| ID | Requisito | Status |
|---|---|---|
| FR-001 | O bloco "Aparência" deixa de aparecer no painel. | Proposto |
| FR-002 | O cabeçalho do painel tem, no canto, um botão com ícone e nome acessível "Aparência" que abre a tela de Aparência. | Proposto |
| FR-003 | A tela de Aparência mostra o seletor de tema completo, com o mesmo comportamento atual (troca na hora, persistência, Seguir o aparelho). | Proposto |
| FR-004 | A tela de Aparência tem um título e uma ação "Voltar" que leva ao painel. | Proposto |
| FR-005 | A tela de Aparência tem endereço próprio, abre por link direto ou recarga e funciona sem conexão depois da primeira visita. | Proposto |
| FR-006 | Na tela de Aparência, a aba "Painel" aparece como a atual na barra de abas. | Proposto |

### Não funcionais

| ID | Requisito | Limite mensurável | Status |
|---|---|---|---|
| NFR-001 | Acesso | do painel até a troca de tema em no máximo 2 toques (abrir Aparência, escolher tema) | Proposto |
| NFR-002 | Alvo de toque | botão do cabeçalho e "Voltar" com pelo menos 44 × 44 px | Proposto |
| NFR-003 | Acessibilidade | auditoria de acessibilidade ≥ 90 na tela de Aparência e no painel, nos 3 temas; botão operável por teclado | Proposto |
| NFR-004 | Layout | sem rolagem horizontal de 360 a 1440 px nas duas telas | Proposto |

### Restrições

| ID | Restrição | Status |
|---|---|---|
| C-001 | Reaproveitar o seletor existente: nenhuma mudança na lógica de tema nem nas opções e prévias. | Aceita |
| C-002 | Seguir a identidade visual em vigor (tokens dos 3 temas, contorno, sem cor fixa) e a lista anti-"cara de IA" da missão anterior. | Aceita |
| C-003 | Não mexer em código de outras missões em andamento (questões, plano). | Aceita |
| C-004 | Interface em português do Brasil. | Aceita |

## Critérios de sucesso

- SC-001: O painel abre sem o bloco de Aparência em 100% das cargas.
- SC-002: Do painel, a pessoa troca de tema em até 2 toques.
- SC-003: A tela de Aparência abre por link direto no site publicado e offline em 100% das tentativas.
- SC-004: Os testes automáticos que hoje cobrem o seletor no painel passam apontando para a tela nova, sem perder nenhum caso.

## Premissas

- O ícone do botão é um dos já existentes no app ou um novo traço simples, no mesmo estilo; a escolha fica para o plano.
- O endereço da tela fica sob o painel (ex.: `/painel/aparencia`), o que já faz a aba "Painel" aparecer como atual.
- Os testes de aceite da missão anterior que abrem o seletor em `/painel` passam a abri-lo na tela nova.

## Fora de escopo

Outras configurações na tela de Aparência (tamanho de fonte, densidade); mudar a lógica ou as
opções de tema; mexer na barra de abas.
