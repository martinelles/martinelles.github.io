# CGU 2026 · AFFC TI – Ciência de Dados · P3 item a item

**Concurso:** CGU 2026, Edital nº 1/2026 (DOU de 9/10/2026), banca Cebraspe.
**Cargo:** 2, Auditor Federal de Finanças e Controle, especialidade Tecnologia da Informação – Ciência de Dados.
**Escopo:** Conhecimentos Específicos do Cargo 2 (15.2.4), que formam a P3 (90 itens Certo/Errado, ±2 cada) e a Q2 da discursiva (situação-problema, 60 linhas, 70 pontos). P1 e P2 ficam fora: são as mesmas provas para todas as especialidades e estão analisadas no `GUIA CGU 2026 AFFC Auditoria.pdf`.
**Formato de cada subitem:** (A) texto original do edital · (B) o que estudar · (C) fontes · (D) como a banca erra o item · (E) prioridade com justificativa.

| Disciplinas analisadas | Subitens analisados | Referências na lista consolidada |
|---:|---:|---:|
| 4 | 81 | 184 |

Pesquisa feita em 13/10/2026. Edital publicado em 9/10/2026. Prova em 13/12/2026, daqui a 61 dias.

## Sumário

1. [Método e leitura do edital](#método-e-leitura-do-edital)
2. [Critérios e quadro de prioridades](#critérios-e-quadro-de-prioridades)
3. [Núcleo duro: os 20 temas](#núcleo-duro-os-20-temas)
4. [Temas transversais](#temas-transversais)
5. [Pontes com a P2](#pontes-com-a-p2)
6. [A CGU e o governo federal em dados e IA](#a-cgu-e-o-governo-federal-em-dados-e-ia)
7. [Análise subitem a subitem](#análise-subitem-a-subitem)
   - [E1 Estatística, programação e análise de dados](#e1-estatística-programação-e-análise-de-dados)
   - [E2 Engenharia, arquitetura e governança de dados](#e2-engenharia-arquitetura-e-governança-de-dados)
   - [E3 Aprendizado de máquina e inteligência artificial](#e3-aprendizado-de-máquina-e-inteligência-artificial)
   - [E4 Operação, governança e gestão de soluções de dados e IA](#e4-operação-governança-e-gestão-de-soluções-de-dados-e-ia)
8. [Discursiva Q2](#discursiva-q2)
9. [Lista consolidada de normas, referenciais e obras](#lista-consolidada-de-normas-referenciais-e-obras)
10. [Pontos de atenção e limites da pesquisa](#pontos-de-atenção-e-limites-da-pesquisa)

## Método e leitura do edital

### Objetivo e escopo

Este relatório analisa, subitem por subitem, os 81 subitens numerados do 15.2.4 para o Cargo 2: 7 em E1, 19 em E2, 27 em E3 e 28 em E4. A contagem foi refeita sobre o texto do edital e bate com a de [analises/2026-10-09-edital-cgu-2026.md](analises/2026-10-09-edital-cgu-2026.md). O edital não tem subnível `N.x.y` na P3.

A estrutura da prova, os mínimos e a nota final estão nessa análise e não se repetem aqui. Para esta parte, o que importa é: a P3 vale 180 dos 260 pontos objetivos, é o primeiro critério de desempate e é o tema da Q2. Como a discursiva pesa o mesmo que as 170 objetivas somadas, um subitem com cara de situação-problema conta duas vezes.

Regras do edital sobre o que pode ser cobrado:

- alteração de legislação em vigor até a publicação do edital pode cair mesmo sem estar citada (14.32);
- norma que não está em vigor só entra se o conteúdo a citar, e como contexto (14.33). O PL 2.338/2023 (marco da IA) está nesse caso;
- jurisprudência de tribunal superior publicada até 30 dias antes da prova pode ser considerada (14.33.1).

A incidência citada nos subitens vem do catálogo do projeto ([catalogo-questoes/INCIDENCIA.md](catalogo-questoes/INCIDENCIA.md)), coluna Cebraspe 2015-2026 (cadernos TCU2015-BAS, TCU2015-TI e TCU2026-AUFC-TI). Cada número vem com os ids que o geram. Itens da FGV aparecem só como apoio, identificados como tal.

### Como ler a P3

A hipótese do Guia de Auditoria, de que os blocos comuns foram escritos pelo corpo técnico da CGU, vale para a P3 com uma diferença de estilo que muda o jeito de estudar.

**1. Competências, não ferramentas.** O edital pede "versionamento de dados, código e modelos", e não Git ou DVC; "processamento distribuído", e não Spark; "expressões de tabela comuns e funções de janela", e não um SGBD. Só uma ferramenta tem nome: **Python 3** (E1 4.1). E a forma do pedido é "leitura, análise e depuração de rotinas de manipulação de dados", ou seja, ler código pronto e achar o defeito.

> **Consequência:** estude conceito e comportamento, não sintaxe de produto. Em Python, treine prever a saída e achar o erro de trechos curtos (mutabilidade, cópia, exceções, `groupby`, `merge`). Em SQL, o padrão ISO basta. Em Spark, só o conceito (shuffle, broadcast, skew, avaliação preguiçosa).

**2. Nenhuma "distinção", muito "limite".** Nenhum dos 81 subitens usa a palavra "distinção", que o Guia de Auditoria contou em 25 subitens dos blocos que analisou (P1, P2 e Específicos de Auditoria). O vocabulário da P3 é de julgamento: "limites" (E1 1.1, E3 1.1, 3.5, 6.4, E4 3.5), "custo" (E2 4.2, E3 3.2, 4.4, E4 2.3, 5.2), "consistência" (E1 5.1, E2 1.1, 3.1, 4.4, 5.2), "proteção" (E2 6.5, E3 6.3, E4 2.4, 3.3, 5.5), "comparação" (E1 1.1, E3 1.2, 2.6, E4 5.3), "incerteza" (E1 2.2, E3 3.3, E4 4.6), "viés" ou "discriminação" (E3 2.4, 3.3, E4 3.4).

> **Consequência:** o item típico não pergunta "o que é X", mas "X serve para isto?" ou "a conclusão Y se sustenta?". As distinções continuam lá, só que implícitas: são elas que separam o uso adequado do inadequado. As mais rentáveis estão na tabela abaixo.

| Distinção | Onde aparece |
|---|---|
| Associação × predição × causalidade | E1 3.2; E3 3.5 |
| Significância estatística × relevância prática | E1 2.2, 3.1 |
| Precisão × sensibilidade × especificidade × acurácia (com classe rara) | E3 3.1, 3.2 |
| Discriminação (ordenar) × calibração (acertar a probabilidade) | E3 3.1, 3.5 |
| Paridade demográfica × igualdade de oportunidades × equalized odds | E3 3.3; E4 3.4 |
| Vazamento de alvo × contaminação treino-teste × vazamento temporal | E1 5.1; E3 2.3 |
| Interpretabilidade intrínseca × explicabilidade pós-hoc | E3 3.4; E4 3.2 |
| Triagem para revisão × decisão automatizada | E3 3.5; E4 3.2, 3.5 |
| Revisão de decisão automatizada (LGPD art. 20) × revisão por pessoa natural (§ 3º vetado) | E4 3.2 |
| Data warehouse × data lake × lakehouse × data mesh | E2 1.2 |
| ETL × ELT; lote × fluxo; completo × incremental | E2 3.1 |
| COUNT(*) × COUNT(col); NOT IN × NOT EXISTS com NULL | E2 2.2 |
| Deduplicação × vinculação de registros; falso pareamento × falso não pareamento | E2 5.3, 5.5 |
| Anonimização × pseudonimização | E2 6.3; E4 3.3 |
| Engenharia de prompt × RAG × ajuste fino | E3 4.5, 5.4 |
| Fidelidade à fonte × correção factual | E3 5.5 |
| Injeção de instruções direta × indireta | E3 6.3 |
| Humano no circuito × sobre o circuito × fora do circuito | E3 6.2, 6.4; E4 3.2 |
| Mudança de covariável × deriva de conceito × mudança de prior | E4 1.6 |
| Pagamento por resultado × homem-hora × UST | E4 5.6 |
| Estratégia Nacional (Decreto 12.069/2024) × Federal (Decreto 12.198/2024) de Governo Digital | E4 4.5 |

**3. Delimitadores de profundidade.** São poucos, mas claros: "noções e limites" de semissupervisionado e reforço (E3 1.1); otimização e retropropagação "em nível conceitual e de interpretação de resultados" (E3 4.2); probabilidade "em aplicações" (E1 2.1); Python em "leitura, análise e depuração" (E1 4.1).

> **Consequência:** nesses subitens, não gaste tempo com derivação de gradiente, demonstração de teorema ou cálculo longo de distribuição. Saiba o que o resultado significa e quando ele engana.

**4. Vocabulário de documentos.** Várias expressões só fazem sentido para quem conhece o documento de origem.

| Expressão do edital | Documento de origem provável |
|---|---|
| "proteção contra instruções maliciosas em conteúdo externo" (E3 6.3) | OWASP Top 10 for LLM Applications 2025 (LLM01, injeção indireta); NIST AI 100-2 E2025 |
| "autorização, rastreabilidade e supervisão" (E3 6.2) | Deliberação CCCI nº 03/2025 (Portaria CGU nº 3.113/2025), uso de IA pelas unidades de auditoria interna |
| "revisão humana e contestação" (E4 3.2) | LGPD art. 20 e o veto ao § 3º (Lei 13.853/2019) |
| "articulação com PDTIC, plano de transformação digital e plano de dados abertos" (E4 4.5) | Decreto 12.198/2024, art. 6º (PTD, PDTIC e PDA) |
| "estudo técnico preliminar e termo de referência" (E4 5.1) | Lei 14.133/2021, art. 6º XX e XXIII; IN SGD/ME 94/2022; IN SEGES/ME 58/2022 |
| "comparação entre desenvolvimento próprio, contratação e serviços de nuvem" (E4 5.3) | Portaria SGD/MGI 5.950/2023 (modelo de software e nuvem) |
| "fiscalização e pagamento por entregas verificáveis" (E4 5.6) | IN SGD/ME 94/2022; Portaria SGD/MGI 750/2023; Acórdãos TCU 2.362/2015 e 1.508/2020 |
| "publicação, reutilização e compartilhamento controlados" (E2 6.4) | Decreto 10.046/2019 (compartilhamento amplo, restrito e específico); LAI |
| "anonimização, pseudonimização e reidentificação" (E2 6.3) | LGPD arts. 5º III e XI, 12 e 13; guia da ANPD (em consulta) |
| "produtos de dados, responsabilidade por domínios, autosserviço e governança federada" (E2 1.2) | os quatro princípios de data mesh (Dehghani, 2022) |
| "riscos de correspondências incorretas entre pessoas ou entidades" (E2 5.5) | literatura de vinculação de registros (Fellegi-Sunter); cruzamentos de bases da CGU |

> **Consequência:** nesses subitens, leia o documento na fonte. O texto do edital é quase uma paráfrase dele, e o Cebraspe costuma trocar uma palavra da norma para montar o item errado.

**5. Normas e referenciais muito recentes, e o que os materiais antigos erram.**

- **Lei 15.352/2026:** o texto compilado da LGPD no Planalto já traz a ANPD como "Agência Nacional de Proteção de Dados". Material anterior usa "Autoridade". Ementa e demais efeitos da lei não foram conferidos (ver Pontos de atenção).
- **Decreto 12.198/2024** (Estratégia Federal de Governo Digital 2024-2027 e Infraestrutura Nacional de Dados) × **Decreto 12.069/2024** (Estratégia Nacional). Quem obriga cada órgão federal a ter PTD, PDTIC e PDA é o 12.198.
- **Deliberação CCCI 03/2025:** foi publicada pela Portaria CGU nº **3.113**/2025 (conferida no DOU). O número 3.313 que circula em notícias está errado.
- **Guia de IA generativa da CGU:** aprovado pela Portaria Normativa CGU nº 193/2025. A Portaria Normativa CGU 116/2024, às vezes citada junto, é o regulamento das ouvidorias e só interessa pela pseudonimização do denunciante.
- **Alice:** a ferramenta é da CGU (2015), compartilhada com o TCU em 2016. Não é do TCU.
- **Guia de anonimização e pseudonimização da ANPD** e **Guia CGU/ANPD de transparência e proteção de dados:** até 13/10/2026, só versões de consulta pública. Não cite como vigentes.
- **PL 2.338/2023:** aprovado no Senado em dezembro de 2024 e em tramitação. Pela regra 14.33, só como contexto.
- **Portarias SGD/MGI de 2026** (4.777/2026, modelo de software; 5.921/2026, uso de IA pela contratada): conhecidas por fontes secundárias. Valem pela regra 14.32 se estavam em vigor em 9/10/2026.

> **Consequência:** confira a vigência antes de decorar. Questões de 2023 e 2024 do Cebraspe podem ter gabarito que já não vale.

### Ferramentas e linguagens

O edital nomeia só o Python 3. A leitura mais provável é Python com a biblioteca padrão e pandas para manipulação, e SQL padrão para consultas, que é o que o Cebraspe usa em órgão de controle. R não aparece no edital, embora a FGV o tenha cobrado em 2022 (TCU2022-AUFC-CE-70).

O formato de cobrança de código pelo Cebraspe está num único item recente: o TCU2026-AUFC-TI-126 trazia a descrição de um código com `ProcessPoolExecutor` e a saída impressa, e pedia o julgamento de uma afirmação sobre o tempo de execução. O item foi anulado. Espere o mesmo formato: código ou saída no enunciado e uma interpretação para julgar. A FGV cobrou leitura de código três vezes (CGU2022-AFFC-TI-45, TCU2022-AUFC-CE-61 e 62).

## Critérios e quadro de prioridades

- **Alta:** tema central para o trabalho de dados da CGU **e** de alta probabilidade de cobrança: citado nominalmente, repetido em mais de um bloco ou na P2, objeto de norma ou referencial recente, frequente nas provas do Cebraspe, ou com perfil de situação-problema para a Q2.
- **Média:** tema relevante, com cobrança esperada de 1 ou 2 itens, ou coberto com mais profundidade em outro subitem.
- **Baixa:** tema amplo ou genérico, com baixa relação custo-benefício, ou cuja essência já está em outro subitem.
- **Incidência:** para E1 a E3, a coluna Cebraspe do catálogo é evidência. O prompt previa que E4 não teria histórico, mas tem: DevOps e CI/CD, métodos ágeis e contratações de TI aparecem em TCU2015-TI e TCU2026-AUFC-TI, e os subitens de E4 citam esses itens.

| Cód. | Disciplina | Alta | Média | Baixa | Total |
|---|---|---:|---:|---:|---:|
| E1 | Estatística, programação e análise de dados | 3 | 4 | 0 | 7 |
| E2 | Engenharia, arquitetura e governança de dados | 9 | 8 | 2 | 19 |
| E3 | Aprendizado de máquina e inteligência artificial | 12 | 13 | 2 | 27 |
| E4 | Operação, governança e gestão de soluções de dados e IA | 12 | 12 | 4 | 28 |
| | **Total** | **36** | **37** | **8** | **81** |

Os totais conferem com a soma dos títulos dos subitens.

Como os 90 itens da P3 se espalham por 81 subitens, cada subitem rende em média 1,1 item. Mas a distribuição não deve ser uniforme: E3 e E4 têm 55 dos 81 subitens (68%) e concentram os temas de discursiva. No TCU 2026, o caderno de TI do Cebraspe dedicou blocos de 3 a 5 itens seguidos a um mesmo assunto (MLOps, ética de IA, contratações), o que sugere que um subitem "alto" pode render mais de um item.

## Núcleo duro: os 20 temas

Os 36 subitens de prioridade alta, agrupados por assunto. Comece por eles.

1. **Métricas de classificação com classe rara e escolha de limiar:** precisão, sensibilidade, especificidade, F1, curva PR × ROC, calibração, custo de falso positivo e falso negativo (E3 3.1, 3.2; E1 2.2).
2. **Limites de escores para priorizar fiscalização:** viés de seleção nos rótulos de auditorias passadas, ciclo de retroalimentação, triagem × decisão (E3 3.5; E4 3.5).
3. **Vazamento de informação e validação temporal** (E3 2.3, 2.2; E1 5.1).
4. **Equidade por grupos e discriminação:** métricas de equidade, impossibilidade de satisfazer todas com taxas-base diferentes, uso fora da finalidade (E3 3.3; E4 3.4).
5. **Explicabilidade, revisão humana e contestação:** SHAP, LIME, LGPD art. 20 e o veto ao § 3º (E3 3.4; E4 3.2).
6. **Exploração e causalidade em dados administrativos:** anomalia × irregularidade, limites da fonte, confusão, seleção (E1 1.1, 3.2).
7. **Python 3: leitura e depuração de rotinas,** com mutabilidade, cópias, exceções e pandas (E1 4.1).
8. **Modelos supervisionados e não supervisionados, regularização, ensembles** e comparação com solução simples (E3 1.2).
9. **Modelos de dados, transações e arquiteturas analíticas:** relacional, NoSQL, vetorial, ACID; DW, lake, lakehouse, mesh (E2 1.1, 1.2).
10. **SQL analítico:** junções, CTE, funções de janela, NULL e duplicações (E2 2.1, 2.2).
11. **Ingestão e integração:** ETL × ELT, incremental, idempotência, contratos de dados, Parquet (E2 3.1).
12. **Vinculação de registros e falso pareamento entre pessoas** (E2 5.3, 5.5).
13. **Anonimização, pseudonimização, reidentificação e equilíbrio entre utilidade e proteção** (E2 6.3, 6.5).
14. **PLN e embeddings:** pré-processamento, classificação de textos, similaridade de cosseno (E3 5.1, 5.2).
15. **RAG e avaliação de respostas:** recuperação, citação, alucinação, LLM como juiz (E3 5.4, 5.5).
16. **Agentes de IA:** autorização, rastreabilidade, supervisão e injeção indireta de instruções (E3 6.2, 6.3).
17. **MLOps:** CI/CD/CT e monitoramento de drift (E4 1.3, 1.6).
18. **Governança de IA:** papéis, riscos e evidências; NIST AI RMF, ISO/IEC 42001 e 23894; Deliberação CCCI 03/2025 (E4 3.1).
19. **Gestão de produto de dados:** Scrum, Kanban e articulação com PTD, PDTIC e PDA (E4 4.4, 4.5).
20. **Contratação de solução de dados e IA:** ETP e TR, próprio × contratado × nuvem, fiscalização por entregas verificáveis, propriedade intelectual e plano de saída (E4 5.1, 5.3, 5.6, 5.7).

## Temas transversais

| Tema | Onde aparece |
|---|---|
| Qualidade de dados | E1 1.1, 5.1; E2 3.1, 5.1 a 5.5; E3 2.5; E4 1.4 |
| Privacidade e proteção de dados pessoais | E2 6.1 a 6.5; E3 6.3; E4 2.4, 3.3, 5.5 |
| Viés, equidade e discriminação | E1 3.2; E3 2.4, 3.3, 3.5; E4 3.4 |
| Rastreabilidade, linhagem e reprodutibilidade | E1 4.1; E2 5.1; E3 6.2; E4 1.1, 1.2, 1.4, 3.2 |
| Vazamento de informação | E1 5.1; E3 2.3; E2 6.3 (reidentificação) |
| Incerteza e sua comunicação | E1 2.1, 2.2; E3 3.3, 5.5; E4 4.6 |
| Custo e dimensionamento | E2 4.2; E3 3.2, 4.4; E4 2.2, 2.3, 5.2 |
| Segurança de IA e de dados | E2 6.1; E3 6.3; E4 2.4 |
| Limites da automação e revisão humana | E3 3.5, 6.4; E4 3.2, 3.5 |
| Contratação e dependência de fornecedor | E4 2.1, 5.1 a 5.7 |

## Pontes com a P2

Códigos da P2, na ordem do 15.2.3: C1 Governança, riscos e integridade; C2 Transparência, ouvidoria e participação social; C3 Direito público aplicado, controle e responsabilização; C4 Evidências, dados e IA; C5 Auditoria governamental e atuação integrada da CGU.

| Subitem da P3 | Subitem da P2 | O que o estudo da P3 já cobre |
|---|---|---|
| E1 1.1 | P2 C4 2.1 | Medidas descritivas, proporções, denominadores e comparabilidade entre grupos e períodos |
| E1 2.2 | P2 C4 3.1 | Incerteza e erros de inferência; a P2 cobra o mesmo em nível conceitual |
| E1 3.2 | P2 C4 3.1, 3.2 | Associação e causalidade, seleção, representatividade, explicações alternativas e falácia ecológica em dados administrativos |
| E1 1.1 | P2 C4 2.2; P2 C1 5.3 | Limites das fontes: denúncia e detecção não medem ocorrência; subnotificação; baixa ocorrência não é o mesmo que baixa detecção |
| E3 3.2 | P2 C4 3.2; P2 C5 3.2 | Custos de falsos positivos e falsos negativos; diferença entre sinal de risco (alerta da Alice), evidência e conclusão |
| E3 3.5 | P2 C5 2.2, 3.2 | Limites de escores para priorizar trabalhos por risco e materialidade; o escore não é achado |
| E3 3.3; E4 3.4 | P2 C4 5.2; P2 C1 3.2 | Viés, efeitos sobre grupos e prevenção de discriminação |
| E3 5.5 | P2 C4 5.2, 5.3 | Alucinação, conteúdo não sustentado e verificação de fontes |
| E3 6.2; E4 3.2 | P2 C4 5.2; P2 C3 1.2 | Rastreabilidade, revisão humana e contestação; dever de fundamentar decisões que afetam direitos (LGPD, art. 20) |
| E4 3.5 | P2 C4 5.1, 5.3 | Escolha entre IA, solução simples e revisão humana; limites da automação de decisões |
| E2 6.3 | P2 C2 2.2; P2 C4 4.2 | Anonimização, pseudonimização, tarjamento e risco de reidentificação ou de identificação indireta |
| E2 6.4, 6.5 | P2 C2 2.1; P2 C3 3.4 | Equilíbrio entre acesso à informação e proteção de dados; compartilhamento lícito (Decreto 10.046/2019) |
| E2 6.4; E4 4.5 | P2 C2 4.3 | Dados abertos e Portal da Transparência: qualidade, atualização, cobertura e limites |
| E2 5.1, 5.2 | P2 C4 4.1; P2 C5 3.1 | Linhagem, metadados e dimensões de qualidade como base de confiabilidade e rastreabilidade da evidência |
| E2 5.5 | P2 C3 4.1 | Falsa correspondência entre pessoas ou empresas: indício não é irregularidade nem responsabilidade |
| E4 4.6 | P2 C4 4.1; P2 C5 4.1 | Comunicação proporcional de resultados e incertezas |
| E3 5.1 | P2 C2 4.2; P2 C5 5.1 | Classificação de manifestações e recorrências como sinal de risco (Fala.BR, LAION) |

## A CGU e o governo federal em dados e IA

O edital da P3 não cita a CGU nem nenhuma norma pelo número. A cobrança institucional chega de forma indireta: a banca descreve uma situação da CGU (uma trilha de auditoria, um escore de risco, um painel, uma contratação de IA) e espera que a candidata reconheça o arcabouço por trás. Esta seção reúne só o que a P3 usa: quem na CGU produz e usa dados e IA, quais soluções existem de fato e quais normas sustentam cada subitem. Data de referência: 13/10/2026.

### Unidades da CGU que produzem, governam e usam dados e IA

Base: Decreto 11.330/2023 (Estrutura Regimental), com alterações dos Decretos 11.389/2023, 11.824/2023, 11.951/2024, 12.219/2024, 12.522/2025 e 12.776/2025. O texto compilado no Planalto, consultado em 13/10/2026, não registra decreto de 2026 que o altere. Na estrutura vigente não existem unidades com o nome "Observatório da Despesa Pública" nem "laboratório de IA". O ODP foi o nome histórico da área de monitoramento do gasto, hoje dentro da competência da Diretoria de Pesquisas e Informações Estratégicas. O CGULab existe, mas é laboratório de inovação, não unidade regimental.

| Unidade | Base | O que faz com dados e IA | Itens do edital |
|---|---|---|---|
| Diretoria de Pesquisas e Informações Estratégicas (DIE), da Secretaria-Executiva | Decreto 11.330, art. 3º, I, f, 3 e art. 11 | Inteligência de dados e gestão de "ambiente centralizado de dados" (I e IX); requisição de dados a quem gere recurso federal (III); "monitoramento contínuo dos gastos públicos" por técnicas aplicadas a bases governamentais (IV); análise da evolução patrimonial dos agentes do Executivo, nos termos do Decreto 10.571/2020 (V); soluções de tecnologia para pesquisa e investigação (VIII); intercâmbio com o Coaf (X) | E2 1.2, 3.1, 5.3, 5.4, 5.5; E3 1.2, 3.5; E4 3.1 |
| Diretoria de Tecnologia da Informação (DTI), da Secretaria-Executiva | art. 10 | Governança e gestão de TI; contratações de soluções de TI; segurança da informação; articulação com o órgão central do Sisp. Disponibiliza a plataforma LIA (Guia de IA da CGU, item 2.1) | E4 2.1 a 2.4, 5.1 a 5.7 |
| Diretoria de Planejamento, Inovação e Sustentabilidade (DIPLAN), da Secretaria-Executiva | art. 11-A (incluído pelo Decreto 12.219/2024) | Coordena a proteção de dados pessoais dentro da CGU (VII), as iniciativas de inovação (X) e os indicadores estratégicos (IX). Mantém o Guia de IA generativa (PN CGU 193/2025, art. 2º). O CGULab (Laboratório de Inovação e Pesquisa) é coordenado pelo diretor da DIPLAN, segundo a página do laboratório | E4 3.1, 3.3, 4.1, 4.2 |
| Secretaria Federal de Controle Interno (SFC) e suas seis diretorias de auditoria | art. 3º, II, a | Auditoria interna governamental. Em seus trabalhos usa Alice, CGU-Insight e AuditPesquisa. É a principal usuária das trilhas e dos escores de risco | E3 3.2, 3.5; E4 3.5 |
| Diretoria de Investigações e Operações, da SFC | art. 14-A (incluído pelo Decreto 11.824/2023) | Ações investigativas e operações especiais em conjunto com órgãos de defesa do Estado, sob sigilo | E2 5.5, 6.1 |
| Comissão de Coordenação de Controle Interno (CCCI) | Lei 10.180/2001, art. 23; Decreto 11.330, art. 3º, IV | Edita deliberações para as unidades de auditoria interna (UAIG). Entre elas a Deliberação 03/2025, sobre uso de IA | E3 6.2, 6.4; E4 3.1, 3.2 |
| Secretaria Nacional de Transparência e Acesso à Informação, com a Diretoria de Governo Aberto e Transparência | arts. 29 e 31-A (redação e inclusão pelo Decreto 12.522/2025) | Gere o Portal da Transparência e o Portal Brasileiro de Dados Abertos (art. 31-A, I); gere a Política de Dados Abertos do Decreto 8.777/2016 (VIII) e a Política Nacional de Governo Aberto (IX). É a instância recursal da LAI | E2 6.4, 6.5; E4 4.5 |
| Ouvidoria-Geral da União (OGU) | art. 15 | Órgão central do SisOuv e gestora do Fala.BR. A pseudonimização do denunciante segue a PN CGU 116/2024 | E2 6.3; E3 5.1 |
| Corregedoria-Geral da União (CRG) | art. 3º, II, c | Sistema ePAD, com o assistente Eva; painel Correição em Dados | E3 5.4 |
| Secretaria de Integridade Pública (SIP), com a Diretoria de Prevenção a Conflito de Interesses | art. 3º, II, e (redação do Decreto 12.522/2025) | Usa o SeCI e o Buscador Inteligente de Precedentes (BIP) | E3 5.2, 5.4 |

Antes de 2025, o Portal da Transparência e o dados.gov.br ficavam com a Diretoria de Governo Aberto e Transparência da SIP (antigo art. 27). O Decreto 12.522/2025 transferiu essa diretoria para a Secretaria Nacional de Transparência e Acesso à Informação. Material anterior a junho de 2025 traz a vinculação antiga.

### Plataformas, painéis e soluções analíticas confirmadas

| Solução | Tipo | Responsável | O que faz | Fonte | Itens |
|---|---|---|---|---|---|
| Alice (Analisador de Licitações, Contratos e Editais) | Mineração de textos e IA sobre compras | CGU | Analisa diariamente compras do Compras.gov.br, do Licitações-e, das Licitações Caixa e dispensas e inexigibilidades publicadas no DOU. Emite alertas de risco (direcionamento, sobrepreço, desnecessidade da contratação). Em 2024 examinou mais de 161 mil processos. Estados e municípios podem aderir | [Página da Alice na CGU](https://www.gov.br/cgu/pt-br/alice); [OCDE/OPSI](https://oecd-opsi.org/innovations/robot-alice-bid-contract-and-notice-analyser) | E3 3.2, 3.5, 5.1; E2 3.1 |
| LIA | Plataforma interna de IA generativa | DTI | Ambiente seguro e governado de acesso a LLMs. Serve de base para BIP e Busca LAI | Guia de IA da CGU, item 2.1; [Cadernos Técnicos da CGU, v. 6, 2025](https://revista.cgu.gov.br/Cadernos_CGU/article/view/882) | E3 5.3, 5.4; E4 2.1, 2.4 |
| CGU-Insight | Aplicação web com IA para auditoria | CGU | Análise de documentos e geração de insights para trabalhos de auditoria | Guia de IA da CGU, item 2.2 | E3 5.3, 5.5 |
| AuditPesquisa | Perguntas e respostas com RAG (geração aumentada por recuperação) | CGU | Responde perguntas sobre relatórios de auditoria da CGU, buscando no acervo e gerando a resposta com LLM | Guia de IA da CGU, item 2.3 | E3 5.4, 5.5 |
| Eva | Assistente baseado em GPT | CRG (ePAD) | Orienta comissões de processo disciplinar | Guia de IA da CGU, item 2.4 | E3 5.3 |
| LAION | Assistente de IA no Fala.BR | Secretaria Nacional de Transparência e Acesso à Informação | Quatro módulos: recomendação de enunciados, pedidos similares (até 10), alerta de dados pessoais em texto e anexos, sumarização (só para recursos de 3ª instância) | Notícia CGU de set./out. 2025 (página gov.br restrita no período eleitoral; conteúdo conforme fontes secundárias) | E3 5.1, 5.2; E2 6.5 |
| Buscador Inteligente de Precedentes em Conflito de Interesses (BIP) | Busca semântica sobre a LIA | SIP | Acervo de mais de 1.610 processos analisados. Indica o trecho do documento original que sustenta cada resposta | [Notícia CGU, abr. 2026](https://www.gov.br/cgu/pt-br/assuntos/noticias/2026/04/cgu-lanca-buscador-inteligente-de-precedentes-para-agilizar-analise-de-conflitos-de-interesses) | E3 5.2, 5.4, 5.5 |
| Busca LAI | Busca de pedidos e decisões recursais | CGU | Relançada em fev. 2026, com recursos de IA implementados pela LIA | [Notícia CGU, fev. 2026](https://www.gov.br/cgu/pt-br/assuntos/noticias/2026/02/busca-lai-e-relancada-com-nova-interface-filtros-inteligentes-e-integracao-com-decisoes-recursais) | E3 5.2 |
| Portal da Transparência e Portal Brasileiro de Dados Abertos | Publicação de dados | Diretoria de Governo Aberto e Transparência | Transparência ativa e catálogo federal de dados abertos | Decreto 11.330, art. 31-A, I | E2 6.4, 6.5; E4 4.5 |
| Fala.BR | Plataforma de ouvidoria e acesso à informação | OGU e Secretaria Nacional de Transparência | Manifestações e pedidos de LAI. É a fonte do texto que LAION e classificadores usam | Decreto 11.330, art. 15 | E3 5.1 |
| e-Aud | Sistema de gestão da auditoria interna | SFC | Registro de trabalhos e monitoramento de recomendações (Deliberação CCCI 01/2023) | Guia de Auditoria do projeto; não conferido em página própria | E4 1.2, 3.2 |
| Central de Painéis | Painéis públicos | Várias unidades | Lista em 13/10/2026: Pacto Brasil, Pró-Ética, Acordos de Leniência e seu monitoramento, Dados Abertos, Conflito de Interesses, Resolveu? (ouvidoria), InfoAgendas, Correição em Dados, Lei de Acesso à Informação, Recomendações de Foros Internacionais, Bolsa Família, Economia da Inovação nas IFES, Benefícios Previdenciários, Lei Anticorrupção e Integridade Privada em Dados | [Central de Painéis](https://www.gov.br/cgu/pt-br/centrais-de-conteudo/paineis) | E1 1.1; E4 4.6 |
| Portfólio do CGULab | Projetos de inovação | DIPLAN | Lista nominal na página do laboratório: LLM2GOV, e-Patri, Primus (riscos de integridade em municípios), Malha fina Ancine, reconhecimento de entidades no clipping de notícias, apoio a recursos de LAI, trilhas da Alice (sobrepreço, concorrência improvável, conluio, conformidade genérica), Mineração de Processos, CGUDATA | [CGULab](https://www.gov.br/cgu/pt-br/cgulab) | E2 5.3; E3 1.2, 5.1 |

Atenção à Alice. A ferramenta é da CGU: foi criada em 2015 e compartilhada com o TCU em 2016. O TCU passou a desenvolver e usar sua própria versão, e em 2018 a CGU incorporou essas melhorias e retomou o desenvolvimento (OCDE/OPSI). A página oficial da CGU diz "ferramenta desenvolvida pela CGU". Afirmar que a Alice é do TCU, e não da CGU, está errado. O certo é dizer que os dois órgãos a usam e que a origem é da CGU. A mesma página do CGULab expande a sigla como "Análise de Licitação e Contratos". O nome oficial é o da página da Alice: Analisador de Licitações, Contratos e Editais.

### Normativos e documentos por área

**(a) Dados e IA na CGU e no controle interno**

| Documento | Conteúdo | Itens do edital |
|---|---|---|
| [Deliberação CCCI 03/2025](https://www.in.gov.br/web/dou/-/portaria-n-3.113-de-19-de-setembro-de-2025-657183391), publicada pela Portaria CGU 3.113, de 19/9/2025, e aprovada na sessão de 20/8/2025 | Dez diretrizes (a a j) para o uso de IA pelas UAIG. Uso estratégico e responsável (a). Viabilidade e riscos antes da adoção (c). Todo uso de IA cujo resultado entra em produto da UAIG deve ser identificado nos papéis de trabalho (d). Revisão crítica pelo auditor, inclusive de vieses e de direitos autorais (e). O auditor explica, justifica e responde pelo resultado (f). A responsabilidade final é do chefe da auditoria interna, e a IA complementa o julgamento profissional, sem substituí-lo (g). O auditor responde pelo que insere na ferramenta, com observância da LGPD e do sigilo do art. 25, § 3º, da Lei 10.180, incluindo tratamento mínimo, anonimização e avaliação de impacto (h). Cada UAIG define regras próprias antes de adotar (i). Capacitação contínua (j). Atenção: a Portaria é a 3.113. Notícias secundárias citam "3.313", número errado | E3 3.5, 5.5, 6.2, 6.4; E4 3.1, 3.2, 3.3, 3.5; E2 6.1, 6.3; P2 C4 5.1 a 5.3; P2 C5 3.1 |
| Deliberação CCCI 02/2024 (Portaria CGU 2.821/2024) | Gestão de competências. Determina que as UAIG desenvolvam conhecimentos e fomentem o uso de IA nos serviços de auditoria (citada nos considerandos da 03/2025) | E4 3.1 |
| Referencial Técnico da AIG (IN SFC 3/2017), itens 56, 62, 65, 150 e 156 | Sigilo; proficiência em riscos de TI e em técnicas de auditoria baseadas em tecnologia; zelo profissional; documentação em papéis de trabalho; supervisão. São os fundamentos citados pela Deliberação 03/2025 | E4 1.2, 1.4, 3.2; P2 C5 3.1 |
| Portaria Normativa CGU 193, de 6/1/2025, que aprova o [Guia de Uso Responsável de Ferramentas de IA Generativa da CGU](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf) (DIPLAN, mar. 2025) | Vale para servidores, estagiários e terceirizados. Diretrizes (item 3): prevalência humana, responsabilidade do usuário, vedação de dado protegido em IA pública, transparência do uso. Usos recomendados (4.1: redação, resumo, classificação, consulta a normas, processamento em massa para padrões e anomalias). Usos não recomendados (4.2: predição de cenários, planejamento e otimização, "inteligência decisória"). Riscos (6.1: alucinação, viés de resultado, desatualização). Critérios de avaliação de resposta (6.5). Segurança (7: credencial institucional, agregação de informação, links, dados pessoais). Glossário com LIA, CGU-Insight, AuditPesquisa, Eva e RAG | E3 5.3, 5.4, 5.5, 6.3; E4 3.3, 3.5; E2 6.1; P2 C4 5.1 a 5.3 |
| Portaria Normativa CGU 116/2024 | Correção da premissa da tarefa: esta portaria é o regulamento das ouvidorias do Executivo federal (substituiu a Portaria 581/2021). Não é norma de IA. Interessa à P3 pela pseudonimização do denunciante antes do envio às áreas de apuração (arts. 39 a 43) e pela lista de elementos a suprimir (art. 42, que inclui a narrativa em primeira pessoa). Artigos conforme o Guia de Auditoria do projeto; conferir no DOU | E2 6.3, 6.5; E4 3.3; P2 C2 3.2; P2 C4 4.2 |
| [Decreto 11.330/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/D11330.htm), arts. 10, 11, 11-A, 14-A e 31-A | Competências da DTI, da DIE, da DIPLAN, da Diretoria de Investigações e Operações e da Diretoria de Governo Aberto e Transparência (ver quadro de unidades) | E2 1.2, 5.4; E4 4.5 |
| Decreto 10.571/2020 | Declaração e análise da evolução patrimonial dos agentes do Executivo federal, executada pela DIE (Decreto 11.330, art. 11, V) | E2 5.3, 5.5 |
| Decreto 11.529/2023 | Sistema de Integridade, Transparência e Acesso à Informação e Política de Transparência e Acesso à Informação. Base do Portal da Transparência | E2 6.4; E4 4.5 |

**(b) Governo federal: governança de dados, governo digital e IA**

| Documento | Conteúdo | Itens do edital |
|---|---|---|
| [Decreto 10.046/2019](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/D10046.htm) (alterado pelos Decretos 10.332/2020, 10.403/2020, 11.266/2022 e 11.574/2023) | Governança no compartilhamento de dados entre órgãos federais e com os demais Poderes da União (art. 1º). Níveis de compartilhamento amplo, restrito e específico; Cadastro Base do Cidadão; Comitê Central de Governança de Dados. O STF deu interpretação conforme à LGPD na ADI 6.649 e na ADPF 695 (2022): compartilhamento só com finalidade legítima, específica e explícita, e com o mínimo necessário | E2 3.1, 6.1, 6.4, 6.5; E4 3.3, 3.4 |
| [Decreto 12.198/2024](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/D12198.htm) | Institui a Estratégia Federal de Governo Digital 2024-2027 e a Infraestrutura Nacional de Dados (IND). Art. 5º: comitê de governança digital. Art. 6º: três instrumentos obrigatórios. O Plano de Transformação Digital deve conter governança e gestão de dados e segurança e privacidade. O PDTIC deve conter inventário de necessidades priorizado, metas, pessoas, orçamento e riscos. O terceiro é o Plano de Dados Abertos. Os três são aprovados pelo comitê. Art. 7º: a IND é um "conjunto de normas, políticas, arquiteturas, padrões, ferramentas tecnológicas e ativos de informação", coordenado pela SGD. Revogou os arts. 1º a 6º-A e 13 do Decreto 10.332/2020 | E4 4.5, 4.1; E2 1.2, 3.1, 5.1 |
| Portarias SGD/MGI 6.618/2024 e 473/2026 | Iniciativas da Estratégia Federal de Governo Digital, entre elas as de IA (plataforma de infraestrutura para modelos de IA; núcleo de estruturação de projetos de IA) | E4 2.1, 4.5 |
| [Lei 14.129/2021](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14129.htm) (Lei do Governo Digital) | Princípios e instrumentos do governo digital, interoperabilidade, dados abertos e laboratórios de inovação. O art. 16 fundamenta a Estratégia Federal de Governo Digital | E2 3.1, 6.4; E4 4.5 |
| [Decreto 8.777/2016](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/D8777.htm) (alterado pelos Decretos 9.903/2019 e 10.554/2020) | Política de Dados Abertos do Executivo federal e Plano de Dados Abertos (PDA). A gestão da política é da CGU (Decreto 11.330, art. 31-A, VIII) | E4 4.5; E2 6.4, 5.1 |
| Plano Brasileiro de Inteligência Artificial (PBIA) 2024-2028, "IA para o Bem de Todos" (MCTI) | Lançado em julho de 2024. Previsão de cerca de R$ 23 bilhões até 2028. Cinco eixos: infraestrutura, formação, inovação, governança e internacionalização, além de ações imediatas que incluem o setor público. A gestão cabe ao GT-PBIA (Portaria CITDigital 8/2025, conforme fontes secundárias). Não se confirmou decreto presidencial que o institua | E4 4.1; E3 1.1 |
| Estratégia Brasileira de Inteligência Artificial (EBIA), Portaria MCTI 4.617/2021, com anexo substituído pela Portaria MCTI 4.979/2021 | Nove eixos temáticos. O TCU criticou a falta de objetivos mensuráveis, indicadores e metas (Acórdão 1.139/2022-Plenário) | E4 4.2, 3.1 |
| Núcleo de IA (NIA) da SGD/MGI: GuIA unificado de IA para o setor público, Guia de IA generativa no serviço público, Guia de introdução ao RAG, Framework para Autoavaliação de Impacto Ético em IA (AIE) e Matriz de Competências | Orientação federal para uso e governança de IA. O AIE oferece questionário de risco ético, recomendações e plano de ação. Dados de 2025: 182 soluções de IA em operação no Executivo; 41 órgãos com diretrizes de IA | E3 5.4, 5.5; E4 3.2, 3.4 |
| [Portaria SGD/MGI 5.950/2023](https://cogead.fiocruz.br/files/2023_10_31_PORTARIA_SGD_MGI_5950.pdf) (computação em nuvem) | Modelo de contratação de software e de serviços em nuvem para o Sisp, obrigatório desde 30/4/2024. Segue a IN 94/2022 e veda métrica de remuneração não verificável. Dados em data centers no território nacional, conforme fontes secundárias | E4 2.1, 5.3, 5.6, 5.7 |
| Portaria SGD/MGI 5.921/2026 | Novo modelo de contratação de serviços de operação de infraestrutura, com regras de governança de IA no termo de referência ou na política de IA do órgão. Vigência a partir de 1/9/2026. Conforme notícia do MGI; conferir no DOU | E4 5.1, 5.5 |

**(c) Proteção de dados**

| Documento | Conteúdo | Itens do edital |
|---|---|---|
| [LGPD, Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm) | Dado anonimizado e pseudonimização (arts. 5º, III e XI; 12; 13, § 4º); princípios da finalidade, necessidade e não discriminação (art. 6º); bases legais (arts. 7º e 11); revisão de decisão automatizada (art. 20); tratamento pelo poder público (arts. 23 a 30); relatório de impacto (arts. 5º, XVII, e 38); segurança e incidentes (arts. 46 a 48); término do tratamento e eliminação (arts. 15 e 16) | E2 6.1 a 6.5; E3 3.4; E4 3.2, 3.3 |
| Lei 15.352/2026 | Conversão da MP 1.317/2025: a ANPD passa a autarquia de natureza especial no regime das agências reguladoras (Lei 13.848/2019). Conforme fontes secundárias; conferir no Planalto | E4 3.3 |
| [ANPD, Guia orientativo para definições dos agentes de tratamento e do encarregado, v. 2.0 (2022)](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes) | Controlador, operador e encarregado. Na administração pública, o órgão atua como controlador em nome da pessoa jurídica de direito público | E4 3.1, 5.7 |
| ANPD, Guia orientativo de tratamento de dados pessoais pelo poder público | Bases legais da administração, compartilhamento e transparência | E2 6.4, 6.5 |
| Resolução CD/ANPD 15/2024 (Regulamento de Comunicação de Incidente de Segurança) | Comunicação à ANPD e aos titulares em 3 dias úteis a partir do conhecimento de incidente com risco ou dano relevante. Registro do incidente por no mínimo 5 anos. Prazos conforme fontes secundárias; conferir artigos no DOU | E4 2.4, 3.3 |
| ANPD, Guia de anonimização e pseudonimização | Minuta em consulta de 30/1 a 28/2/2024. Abordagem por risco: nenhuma técnica garante anonimização plena. A versão final não aparece na lista de guias da ANPD em 13/10/2026; tratar como documento em consulta | E2 6.3 |
| Guia CGU/ANPD de Transparência e Proteção de Dados Pessoais | Orienta a análise de pedidos de LAI que envolvam dados pessoais e a divulgação de dados pessoais em transparência ativa e passiva. Consulta pública de 9/6 a 24/7/2026, com 171 contribuições ([Nota Técnica Conjunta CGU/ANPD 5/2026](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/audiencias-e-consultas-publicas/consultas-publicas/nota-tecnica-conjunta-cgu-anpd-no-5-2026.pdf/@@display-file/file)). Versão final não localizada até 13/10/2026 | E2 6.4, 6.5; P2 C2 2.1, 2.2 |

**(d) Contratação de soluções de TIC**

| Documento | Conteúdo | Itens do edital |
|---|---|---|
| [Lei 14.133/2021](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm) | ETP e TR (art. 6º, XX e XXIII); fase preparatória (art. 18); valor estimado e pesquisa de preços (art. 23); cessão de direitos patrimoniais sobre software e projetos (art. 93); fiscalização (art. 117); recebimento provisório e definitivo (art. 140) | E4 5.1, 5.2, 5.4, 5.6, 5.7 |
| IN SGD/ME 94/2022 | Processo de contratação de soluções de TIC no Sisp: planejamento (ETP, mapa de riscos, TR), seleção e gestão do contrato com papéis de fiscal técnico, requisitante e administrativo. Segue vigente; a IN SGD/MGI 86/2025 alterou a IN SGD/MGI 6/2023 (alçadas), não a 94 (fontes secundárias) | E4 5.1 a 5.7 |
| IN SEGES/ME 58/2022 | Elaboração do ETP no sistema ETP Digital | E4 5.1, 5.2 |
| IN SEGES/ME 81/2022 | Elaboração do termo de referência | E4 5.1, 5.5 |
| IN SEGES/ME 65/2021 | Pesquisa de preços para bens e serviços em geral. Segue citada como vigente em 2026; não se localizou norma substituta | E4 5.4 |
| Portaria SGD/MGI 5.950/2023 | Nuvem (ver área b) | E4 5.3, 5.7 |

**(e) TCU: IA e auditoria de algoritmos**

| Documento | Conteúdo | Itens do edital |
|---|---|---|
| [Auditing AI Systems: A guide for public auditors](https://www.auditingalgorithms.net/) (19/12/2025) | Elaborado pelas EFS do Brasil (o TCU), Finlândia, Alemanha, Países Baixos, Noruega e Reino Unido. O site é mantido pela EFS da Noruega. Traz um catálogo de auditoria por fase do ciclo de vida: governança do projeto e avaliação de risco; dados (inclusive LLM e RAG; privacidade); desenvolvimento do modelo; avaliação antes da implantação (desempenho, explicabilidade, equidade, segurança, impacto ambiental); implantação e gestão de mudanças; produção (riscos e controles esperados). Anexos sobre medidas de equidade em classificação e papéis. Acompanha a planilha Audit Helper Tool | E3 2.6, 3.1, 3.3, 3.4; E4 1.6, 3.1, 3.2, 3.4; E2 5.1 |
| Acórdão 1.139/2022-Plenário, rel. Aroldo Cedraz ([sumário do levantamento](https://portal.tcu.gov.br/data/files/D0/C3/BC/DA/EF17781046756058F18818A8/Utilizacao%20de%20Inteligencia%20Artificial%20na%20Administracao%20Publica.pdf)) | Levantamento sobre IA na administração federal, com 263 organizações. Cerca de 28% já usavam IA; 38% estavam no nível zero de maturidade. Avaliou a EBIA e apontou falta de metas e indicadores e governança não institucionalizada. Riscos e necessidade de auditar algoritmos | E4 3.1, 4.2; E3 3.3 |
| [Guia de uso de IA generativa no TCU (2024)](https://portal.tcu.gov.br/data/files/42/F7/91/4B/B59019105E366F09E18818A8/Guia%20de%20uso%20de%20IA%20generativa%20no%20TCU.pdf) | Norma interna do TCU. É uma das referências do guia da CGU | E3 5.3, 5.5 |
| Acórdão 1.913/2024-Plenário (levantamento iESGo) | Incluiu questões sobre IA, sem compor índice (conforme fontes secundárias) | E4 3.1 |

### Onde a P3 pede a inserção institucional da CGU

Nenhum subitem da P3 cita a CGU, e a P3 não cobra a estrutura do órgão em si: competência, organograma e papel do controle interno estão na P2 (C3 3.1 e C5 1.3 e 5.1). A inserção aparece como contexto de aplicação em cinco pontos. E4 4.5 cobra a articulação com PDTIC, plano de transformação digital e plano de dados abertos, e a CGU gere a Política de Dados Abertos e o PDA. E2 6.4 e 6.5 tratam de publicação e de abertura com proteção, que é o ofício do Portal da Transparência e do futuro guia CGU/ANPD. E3 3.2 e 3.5, sobre custos de erro e limites de escores para priorização, correspondem ao uso da Alice e das trilhas da SFC e da DIE. E2 5.4 e 5.5, conciliação de fontes e correspondência incorreta entre pessoas, são o dia a dia do ambiente centralizado de dados da DIE e da análise patrimonial. E4 3.1 a 3.5, junto com E3 6.2 e 6.4, recebem a Deliberação CCCI 03/2025 quase literalmente: registro em papéis de trabalho, revisão humana, responsabilidade do auditor e limites da automação. Na Q2 da discursiva, a situação-problema tende a juntar dois desses blocos, por exemplo contratar ou avaliar uma solução de IA para priorizar denúncias ou compras.

## Análise subitem a subitem

### E1 Estatística, programação e análise de dados

**Visão geral.** É a base das outras três disciplinas: descrever dados, medir incerteza, relacionar variáveis, escrever e ler código Python e preparar a base para um modelo. O edital não pede cálculo pesado. Pede julgamento: o que a média esconde, quando o p-valor não basta, por que correlação em dado administrativo não prova efeito, por que imputar antes de separar treino e teste contamina a avaliação. O Cebraspe tende a cobrar isso em itens C/E conceituais com uma tabela, um número ou um trecho de código, e o mesmo raciocínio serve à Q2 da discursiva, que costuma pedir que se conclua algo a partir de dados com limites. Liga-se a E2 5.x (qualidade, deduplicação e vinculação), a E3 2.x e 3.x (vazamento, validação, métricas) e a E4 1.4 (reprodutibilidade), e repete na P2 o bloco de evidências (P2 C4 2.1 a 3.2).

**Estratégia:**
- Estude por armadilha, não por fórmula: média × mediana com assimetria, significância × relevância, associação × causa, acurácia com classe rara, imputação antes da divisão. É onde o item C/E vira Errado.
- Guarde poucas fórmulas e saiba usá-las de cabeça: variância amostral (n−1), erro padrão σ/√n, IC da média, tamanho de amostra para proporção, MQO matricial, variância da soma e da diferença de normais independentes, razão de chances e seu erro padrão. Os itens do TCU 2015 (TCU2015-BAS-91 a 95) cobraram exatamente isso.
- Python: treine leitura de código, linha a linha, prevendo a saída antes de rodar. Mutabilidade, escopo, geradores, `try/finally` e `groupby`/`merge` do pandas são o núcleo.
- Leve 3.2 e 1.1 para a discursiva: são o tipo de situação-problema em que se pede para separar sinal de risco de conclusão, apontar viés de seleção e propor um desenho de comparação.
- Não duplique esforço com E3: em 5.1 basta saber o que contamina a avaliação e por quê; métricas e validação ficam em E3 2.x e 3.x.

**Mapa rápido**

| Item | Tema (início do texto do edital) | Prioridade | Incidência Cebraspe |
|---|---|---|---|
| 1.1 | Tipos de dados e variáveis; distribuições de frequências… | Alta | 0 direta (4 de mineração de dados, TCU2015-BAS-82 a 85) |
| 2.1 | Probabilidade e distribuições em aplicações; amostragem… | Média | 3 (TCU2015-BAS-93 a 95) |
| 2.2 | Pressupostos, incerteza e erros de inferência… | Média | 0 direta |
| 3.1 | Correlação, regressão e análise de variância… | Média | 2 (TCU2015-BAS-91 e 92) |
| 3.2 | Associação, predição e causalidade… | Alta | 0 |
| 4.1 | Python 3: estruturas de dados, controle de fluxo… | Alta | 1, anulada (TCU2026-AUFC-TI-126) |
| 5.1 | Valores ausentes, inconsistências, duplicações… | Média | 0 |

**1 Exploração e descrição**

#### E1 · 1.1 — Prioridade alta

**(A) Texto original do edital.** Tipos de dados e variáveis; distribuições de frequências, medidas de posição e dispersão; exploração e visualização; comparação de grupos e períodos; identificação de padrões, anomalias e limites das fontes.

**(B) O que estudar.**
- Tipos de variável: qualitativa nominal (UF, CNAE) e ordinal (faixa de risco); quantitativa discreta (número de contratos) e contínua (valor pago). Código numérico não torna a variável quantitativa: CPF, CEP e código de município são nominais, média deles não tem sentido.
- Escalas: nominal, ordinal, intervalar (zero arbitrário, como temperatura em °C) e razão (zero absoluto, como valor em reais). Razão entre valores só faz sentido na escala de razão.
- Distribuição de frequências: absoluta, relativa, acumulada; classes de mesma amplitude; histograma (área proporcional à frequência) × gráfico de barras (categorias).
- Posição: média (sensível a extremos), mediana (robusta), moda; quartis, percentis. Assimetria à direita (valores de contrato, renda): média > mediana. Média ponderada e a armadilha de tirar média de médias ou de taxas com denominadores diferentes.
- Dispersão: amplitude, variância amostral s² = Σ(xᵢ − x̄)²/(n − 1), desvio padrão, coeficiente de variação CV = s/x̄ (só em escala de razão), amplitude interquartil IQR = Q3 − Q1, desvio absoluto mediano (MAD). Somar constante não muda a dispersão; multiplicar por c multiplica o desvio padrão por |c| e a variância por c².
- Exploração: boxplot (cerca de Tukey em Q1 − 1,5·IQR e Q3 + 1,5·IQR), diagrama de dispersão, série no tempo, tabela cruzada. Escore z = (x − x̄)/s; |z| > 3 como regra prática só vale para distribuição próxima da normal. Desigualdade de Chebyshev: ao menos 1 − 1/k² dos dados a até k desvios da média, qualquer distribuição.
- Visualização honesta: eixo que não começa em zero em barras, escala logarítmica não sinalizada, área de pizza, dois eixos verticais. Escolha do gráfico pelo tipo de variável.
- Comparação de grupos e períodos: comparar taxas, não contagens (denominador); valores nominais × reais (deflacionar); sazonalidade (comparar com o mesmo mês do ano anterior); mudança de definição ou de cobertura do registro no meio da série; paradoxo de Simpson (a relação se inverte quando se estratifica).
- Padrões e anomalias: valor extremo, concentração atípica (um fornecedor com 80% de um órgão), frequência de dígitos (Lei de Benford, útil como triagem e inútil para valores com teto, piso ou atribuídos), valores redondos, datas em fim de semana, sequências. Anomalia é sinal de risco a investigar, não prova de irregularidade (P2 C5 3.2).
- Limites das fontes: dado administrativo registra o que o processo mandou registrar; cobertura, atraso de atualização, campo de preenchimento livre, mudanças de sistema. "Ausência de registro" ≠ "ausência do fato" (P2 C4 2.2, subnotificação).
- No trabalho da CGU: perfilar uma base de pagamentos antes de cruzá-la, achar concentração de fornecedores, comparar gastos por UF e período em valores reais e por habitante, montar trilha de auditoria por regras simples de anomalia e explicar na comunicação o que a base não permite afirmar.
- Ponte: E2 5.2 e 5.3 (dimensões de qualidade e perfilamento) e E3 1.2 (detecção de anomalias por modelo).

**(C) Fontes.**
- Livros-texto: Bussab, W. O.; Morettin, P. A. *Estatística Básica*. 10ª ed. São Paulo: Saraiva, 2024, Parte I (análise de dados uni e bidimensionais) (edição conforme livraria, conferir na editora). Tukey, J. W. *Exploratory Data Analysis*. Addison-Wesley, 1977 (origem do boxplot). Nigrini, M. *Benford's Law: Applications for Forensic Accounting, Auditing, and Fraud Detection*. Wiley, 2012.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em distribuição assimétrica à direita, como a de valores de contratos, a média é medida de tendência central mais representativa que a mediana, por considerar todos os valores. → *Certo:* a média é puxada pelos valores extremos e fica acima da mediana; a mediana representa melhor o contrato típico.
- *Afirmação errada:* Um valor fora das cercas do boxplot deve ser excluído da análise, por se tratar de erro de registro. → *Certo:* a cerca de Tukey só sinaliza o valor; ele pode ser erro, caso legítimo ou exatamente o achado de auditoria, e a decisão depende de verificação.

**(E) Prioridade alta.** Fundamento de todo o trabalho analítico da CGU e terreno natural da discursiva (ler uma tabela, achar o padrão e dizer o limite da fonte); repete em P2 C4 2.1. Incidência Cebraspe direta nula; os itens próximos são de mineração de dados (TCU2015-BAS-82 a 85) e um de estatística descritiva da FGV (TCU2022-AUFC-CE-54).

**2 Probabilidade e inferência**

#### E1 · 2.1 — Prioridade média

**(A) Texto original do edital.** Probabilidade e distribuições em aplicações; amostragem, estimação, intervalos de confiança e testes de hipóteses.

**(B) O que estudar.**
- Probabilidade: P(A∪B) = P(A) + P(B) − P(A∩B); condicional P(A|B) = P(A∩B)/P(B); independência P(A∩B) = P(A)P(B); eventos mutuamente exclusivos com probabilidade positiva não são independentes.
- Teorema de Bayes aplicado à triagem: com prevalência baixa, mesmo teste bom gera mais falsos positivos que verdadeiros. Ex.: prevalência 1%, sensibilidade 90%, especificidade 95% → P(irregular | alerta) = 0,009/(0,009 + 0,0495) ≈ 15%. É o argumento contra tratar alerta de trilha como conclusão.
- Distribuições: Bernoulli e binomial (E = np, Var = np(1 − p)); Poisson (contagem de eventos raros, E = Var = λ); normal; exponencial (sem memória); t de Student, qui-quadrado e F como distribuições amostrais. Se X e Y são independentes, Var(X ± Y) = Var(X) + Var(Y) (a diferença de duas normais padrão tem variância 2).
- Teorema central do limite: a média amostral tende à normal com média μ e erro padrão σ/√n, qualquer que seja a forma da população, para n grande. Lei dos grandes números ≠ TCL.
- Amostragem probabilística: aleatória simples, sistemática, estratificada (reduz variância quando estratos são homogêneos por dentro), por conglomerados (barata, em geral menos precisa), com probabilidade proporcional ao tamanho (base da amostragem por unidade monetária em auditoria). Não probabilística (conveniência, julgamento, cotas): não permite inferência com margem de erro calculada.
- Estimação: estimador não viesado, consistente, eficiente; máxima verossimilhança (na binomial com m tentativas, p̂ = x̄/m); s² com n − 1 é não viesado.
- Intervalo de confiança da média: x̄ ± z·σ/√n (σ conhecido) ou x̄ ± t(n−1)·s/√n. Para proporção: p̂ ± z·√(p̂(1 − p̂)/n). Tamanho de amostra para proporção: n = z²·p(1 − p)/E², máximo com p = 0,5; com população finita, corrigir n₀/(1 + (n₀ − 1)/N). Dobrar a precisão (E/2) quadruplica n.
- Interpretação do IC de 95%: 95% dos intervalos construídos pelo procedimento conteriam o parâmetro; não é "95% de probabilidade de o parâmetro estar neste intervalo" (leitura frequentista).
- Testes: H₀ e H₁; estatística de teste; nível α; p-valor = probabilidade, sob H₀, de resultado tão ou mais extremo que o observado. Testes z e t (uma amostra, duas amostras independentes, pareado), qui-quadrado de independência e de aderência, teste de proporções. Bilateral × unilateral. Dualidade: rejeitar H₀ bilateral a α equivale a o IC de 1 − α não conter o valor de H₀.
- Tabela 2×2: razão de chances OR = (a·d)/(b·c); erro padrão de ln(OR) = √(1/a + 1/b + 1/c + 1/d). Célula pequena infla o erro padrão.
- Fora do texto, mas já cobrado: AR(1) Xₜ = c + φXₜ₋₁ + aₜ estacionário tem média c/(1 − φ) e variância σ²/(1 − φ²) (TCU2015-BAS-92 está catalogado como séries temporais; o edital atual não cita séries).
- No trabalho da CGU: dimensionar amostra de processos a examinar, estimar taxa de irregularidade com margem de erro, comparar proporção de alertas entre órgãos, e explicar por que alerta de trilha não é achado (Bayes).

**(C) Fontes.**
- Livros-texto: Bussab e Morettin, *Estatística Básica*, 10ª ed., 2024, Partes II (probabilidade) e III (inferência). Montgomery, D. C.; Runger, G. C. *Applied Statistics and Probability for Engineers*. 7ª ed. Wiley, 2018, caps. 2 a 9 (há tradução da LTC, *Estatística Aplicada e Probabilidade para Engenheiros*; conferir a edição em português disponível).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Um intervalo de 95% de confiança para a média significa que há 95% de probabilidade de a média populacional estar entre os limites calculados com a amostra obtida. → *Certo:* o parâmetro é fixo; 95% é a taxa de acerto do procedimento em amostras repetidas.
- *Afirmação errada:* Para reduzir pela metade a margem de erro de uma estimativa de proporção, basta dobrar o tamanho da amostra. → *Certo:* a margem cai com √n; é preciso quadruplicar a amostra.

**(E) Prioridade média.** Cobrança esperada de 1 ou 2 itens, em geral com cálculo curto; o Cebraspe de 2015 cobrou 3 itens desse tipo (TCU2015-BAS-93, 94 e 95; também FGV TCU2022-AUFC-CE-52, 53, 55 e 56). A parte conceitual que mais rende (interpretação de IC e de p-valor) está em 2.2.

#### E1 · 2.2 — Prioridade média

**(A) Texto original do edital.** Pressupostos, incerteza e erros de inferência; significância estatística e relevância prática.

**(B) O que estudar.**
- Pressupostos: amostra aleatória e observações independentes (o mais violado em dado administrativo: registros do mesmo órgão, do mesmo servidor, do mesmo mês são correlacionados); normalidade da média (ou da população, para n pequeno no teste t); homogeneidade de variâncias (teste t de Welch dispensa); tamanho mínimo esperado por célula no qui-quadrado (regra prática de 5).
- Erros: tipo I (rejeitar H₀ verdadeira, probabilidade α); tipo II (não rejeitar H₀ falsa, probabilidade β); poder = 1 − β. Poder cresce com n, com o tamanho do efeito e com α. Fixado n, reduzir α aumenta β.
- "Não rejeitar H₀" não prova H₀: pode ser falta de poder. Ausência de evidência ≠ evidência de ausência.
- p-valor não é a probabilidade de H₀ ser verdadeira, nem a probabilidade de o resultado ser acaso, nem mede o tamanho ou a importância do efeito (Declaração da ASA, 2016).
- Significância × relevância: com n muito grande (bases administrativas com milhões de linhas), diferenças irrelevantes ficam "significativas". Reportar tamanho de efeito (diferença de médias com IC, d de Cohen, razão de chances, R²) e julgar se a magnitude importa para a decisão.
- Comparações múltiplas: com m testes a α = 5%, a chance de ao menos um falso positivo é 1 − 0,95ᵐ (m = 20 → ≈ 64%). Correções: Bonferroni (α/m), controle da taxa de falsas descobertas (Benjamini-Hochberg). Variante prática: rodar dezenas de trilhas e relatar só as que "deram".
- Outras fontes de erro além do amostral: viés de seleção, erro de medida, não resposta, dado faltante não aleatório. Margem de erro só cobre o erro amostral.
- Incerteza: erro padrão × desvio padrão (o primeiro mede a precisão da estimativa, o segundo a variação dos dados); comunicar intervalo, não só ponto.
- Quando a base é o censo (todos os pagamentos do ano), não há erro amostral; teste de hipótese só faz sentido se a pergunta for sobre um processo gerador ou sobre o futuro.
- No trabalho da CGU: relatório que afirma "diferença significativa" entre órgãos deve dizer de quanto é a diferença e se ela muda a recomendação; e trilhas múltiplas precisam de controle de falso positivo antes de virar lista de casos.
- Ponte: E3 3.3 (incerteza e desempenho por grupo), P2 C4 3.2 (falsos positivos e falsos negativos) e P2 C5 3.1 (suficiência da evidência).

**(C) Fontes.**
- Referenciais técnicos: Wasserstein, R. L.; Lazar, N. A. "The ASA Statement on p-Values: Context, Process, and Purpose". *The American Statistician*, 70(2), 2016, p. 129-133 ([doi](https://doi.org/10.1080/00031305.2016.1154108)).
- Livros-texto: Bussab e Morettin, *Estatística Básica*, 10ª ed., 2024, cap. de testes de hipóteses. Montgomery e Runger, *Applied Statistics and Probability for Engineers*, 7ª ed., 2018, cap. 9.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Um p-valor de 0,001 indica que o efeito observado é grande e que há 0,1% de probabilidade de a hipótese nula ser verdadeira. → *Certo:* o p-valor é calculado supondo H₀ verdadeira; não mede a probabilidade de H₀ nem o tamanho do efeito, e com n enorme efeitos ínfimos produzem p-valores muito pequenos.
- *Afirmação errada:* Se o teste não rejeita H₀ ao nível de 5%, fica demonstrado que não há diferença entre os grupos. → *Certo:* pode faltar poder; conclui-se apenas que os dados não trouxeram evidência suficiente.

**(E) Prioridade média.** Tema clássico de item conceitual do Cebraspe e muito útil na discursiva, mas sem incidência direta no catálogo; parte do conteúdo se repete em P2 C4 3.2 e E3 3.3, o que reduz o custo marginal.

**3 Relações entre variáveis**

#### E1 · 3.1 — Prioridade média

**(A) Texto original do edital.** Correlação, regressão e análise de variância; pressupostos, tamanho de efeito e interpretação de resultados.

**(B) O que estudar.**
- Covariância (depende da unidade) × correlação de Pearson r = cov(X,Y)/(sₓ·sᵧ), adimensional, entre −1 e 1, mede só associação linear. r = 0 não implica independência (relação em U). Sensível a outliers. Spearman (postos) capta relação monotônica e é robusta. Correlação não muda com transformação linear positiva das variáveis.
- Regressão linear simples: β̂₁ = cov(X,Y)/var(X) = r·sᵧ/sₓ; β̂₀ = ȳ − β̂₁x̄; a reta passa por (x̄, ȳ). Em regressão simples, R² = r².
- Regressão múltipla, forma matricial: β̂ = (X'X)⁻¹X'y (MQO); coeficiente βⱼ é o efeito associado a xⱼ mantidas as demais constantes. Variável categórica com k níveis entra com k − 1 indicadoras (com k e intercepto, colinearidade perfeita). Interpretação de log: log(y) em x → 100·β ≈ variação percentual em y; log-log → elasticidade.
- Pressupostos (Gauss-Markov): linearidade nos parâmetros, amostra aleatória, sem colinearidade perfeita, média condicional do erro zero (exogeneidade; é o que dá interpretação causal), homocedasticidade. Com eles, MQO é o melhor estimador linear não viesado; normalidade dos erros é necessária para inferência exata em amostras pequenas. Diagnóstico pelos resíduos: padrão em funil (heterocedasticidade, usar erros padrão robustos), curvatura (não linearidade), autocorrelação em séries.
- Multicolinearidade alta não vicia os coeficientes, mas infla seus erros padrão (VIF).
- R² sempre aumenta ao incluir variável; R² ajustado penaliza. R² alto não prova modelo correto nem causalidade; R² baixo não invalida coeficiente significativo.
- Teste F global; teste t de cada coeficiente.
- ANOVA de um fator: decompõe a soma de quadrados total em entre grupos e dentro; F = QM entre/QM dentro, com (k − 1, n − k) graus de liberdade. H₀: todas as médias iguais. Rejeitar H₀ não diz quais diferem: comparações post hoc (Tukey, Bonferroni). Pressupostos: independência, normalidade dos resíduos, variâncias homogêneas. ANOVA é caso particular de regressão com variáveis indicadoras.
- Tamanho de efeito: r e R²; η² = SQ entre/SQ total na ANOVA; d de Cohen para duas médias; coeficiente em unidades do problema ("cada 10 pontos a mais no índice associam-se a R$ 5 mil a menos").
- No trabalho da CGU: explicar o custo de obras por variáveis de porte e região para achar contratos acima do esperado (o resíduo vira sinal de risco), comparar médias de prazo entre unidades com ANOVA e ler criticamente regressão apresentada por gestor ou por consultoria.

**(C) Fontes.**
- Livros-texto: Wooldridge, J. M. *Introductory Econometrics: A Modern Approach*. 7ª ed. Boston: Cengage, 2020, caps. 2 a 8 (há 8ª ed. de 2025 em catálogos; tradução brasileira *Introdução à Econometria*, conferir edição). Montgomery e Runger, *Applied Statistics and Probability for Engineers*, 7ª ed., 2018, caps. 11 a 13. Bussab e Morettin, *Estatística Básica*, 10ª ed., 2024 (inclui introdução à regressão múltipla).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Coeficiente de correlação de Pearson igual a zero entre duas variáveis indica que elas são independentes. → *Certo:* indica ausência de relação linear; pode haver relação não linear forte.
- *Afirmação errada:* Na ANOVA de um fator, a rejeição da hipótese nula indica que todas as médias dos grupos são diferentes entre si. → *Certo:* indica que ao menos uma difere; quais diferem exige comparações múltiplas.

**(E) Prioridade média.** Conteúdo clássico, cobrança provável de 1 ou 2 itens; o Cebraspe cobrou MQO matricial (TCU2015-BAS-91) e AR(1) (TCU2015-BAS-92); a FGV, regressão (TCU2022-AUFC-CE-51). O uso causal fica em 3.2.

#### E1 · 3.2 — Prioridade alta

**(A) Texto original do edital.** Associação, predição e causalidade; seleção, representatividade e explicações alternativas em dados administrativos.

**(B) O que estudar.**
- Três perguntas distintas: associação (X e Y variam juntos?), predição (dado X, qual o melhor palpite de Y?) e causalidade (se eu mudar X, Y muda?). Um modelo preditivo excelente pode usar variáveis sem nenhum efeito causal; importância de atributo não é efeito.
- Explicações alternativas para uma associação: confusão (variável que causa X e Y, como porte do município), causalidade reversa, acaso (ver 2.2), viés de seleção, viés de colisor (condicionar em consequência comum cria associação espúria), regressão à média (unidades escolhidas por resultado extremo melhoram "sozinhas"), viés de sobrevivência, falácia ecológica (relação entre agregados não vale para indivíduos).
- Seleção em dados administrativos: o registro existe porque alguém foi atendido, denunciado ou fiscalizado. A taxa de irregularidade em órgãos auditados não estima a dos não auditados quando a escolha foi por risco. Mais denúncias podem significar mais confiança no canal, não mais corrupção (P2 C4 2.2). Representatividade: cobertura do cadastro, população-alvo × população registrada.
- Contrafactual: efeito causal = diferença entre o resultado com e sem a intervenção para a mesma unidade, que nunca se observa ao mesmo tempo. Desenhos para aproximá-lo:
  - experimento aleatorizado (padrão-ouro; elimina confusão em média);
  - diferenças em diferenças (exige tendências paralelas antes da intervenção);
  - regressão descontínua (corte em regra de elegibilidade, efeito local em torno do corte);
  - variáveis instrumentais (instrumento relevante e que só afeta Y via X);
  - pareamento e escore de propensão, efeitos fixos (controlam só confusores observados ou fixos no tempo).
- Controlar mais variáveis não é sempre melhor: incluir mediador ou colisor introduz viés.
- Dado observacional com regressão controlada só permite leitura causal se a hipótese de exogeneidade for defensável; a linguagem do relatório deve acompanhar ("está associado a", não "causa").
- No trabalho da CGU: avaliar se um programa reduziu fraude comparando municípios aderentes com não aderentes (seleção), interpretar queda de achados após auditoria (regressão à média, mudança de registro), e usar escores de risco sabendo que predizem sem explicar.
- Ponte: P2 C4 3.1 e 3.2 (mesmo tema em nível introdutório), E3 3.3 e 3.5 (escores e grupos), E2 5.5 (vinculação errada cria associação falsa).

**(C) Fontes.**
- Livros-texto: Angrist, J. D.; Pischke, J.-S. *Mostly Harmless Econometrics: An Empiricist's Companion*. Princeton University Press, 2009; e *Mastering 'Metrics: The Path from Cause to Effect*. Princeton University Press, 2015. Wooldridge, *Introductory Econometrics*, 7ª ed., 2020, caps. 3 (viés de variável omitida), 13 (diferenças em diferenças) e 15 (variáveis instrumentais).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se um modelo preditivo treinado com dados administrativos atribui grande importância a determinada variável, essa variável é causa do comportamento previsto e intervir sobre ela altera o resultado. → *Certo:* importância preditiva mede associação útil para prever; efeito causal exige desenho que afaste confusão e seleção.
- *Afirmação errada:* Como os municípios auditados apresentaram taxa de irregularidade de 30%, estima-se a mesma taxa para o conjunto dos municípios do país. → *Certo:* se a seleção foi por risco, a amostra não é representativa e a taxa superestima a do conjunto.

**(E) Prioridade alta.** Núcleo do julgamento que o auditor de dados exerce, repetido na P2 (C4 3.1) e com perfil forte de situação-problema para a Q2; sem incidência no catálogo, mas o texto do edital, novo e detalhado, indica cobrança conceitual.

**4 Programação para análise**

#### E1 · 4.1 — Prioridade alta

**(A) Texto original do edital.** Python 3: estruturas de dados, controle de fluxo, funções, módulos, arquivos e exceções; leitura, análise e depuração de rotinas de manipulação de dados; organização modular, testes e reprodutibilidade de análises.

**(B) O que estudar.**
- Como o Cebraspe cobra: no TCU 2026 o item TCU2026-AUFC-TI-126 (anulado) trouxe a descrição de um código com `ProcessPoolExecutor` e a saída impressa, e pediu que se julgasse uma afirmação sobre o tempo total de execução, ou seja, código ou saída no enunciado e julgamento C/E de uma interpretação.
- Mutáveis × imutáveis: `list`, `dict`, `set` são mutáveis; `int`, `float`, `str`, `tuple`, `frozenset` são imutáveis. Atribuição cria nome para o mesmo objeto (aliasing), não cópia; `copy.copy` é rasa, `copy.deepcopy` é profunda. Tupla imutável pode conter lista mutável. Só imutáveis (hasheáveis) servem de chave de `dict` ou elemento de `set`. `is` compara identidade, `==` compara valor.
- Estruturas: `list` ordenada, indexável, fatiamento `s[i:j:k]` (`s[::-1]` inverte); `tuple` idem, imutável; `dict` preserva ordem de inserção desde o 3.7, chave repetida sobrescreve; `set` sem ordem e sem repetição. `[[0]*2]*2` repete a mesma lista interna.
- Controle de fluxo: `for` sobre iteráveis, `range(a, b)` exclui `b`; `break`, `continue`, `else` de laço (roda se não houve `break`); `while`. Operadores: `//` arredonda para baixo (−7 // 2 = −4), `%` acompanha o sinal do divisor, `0.1 + 0.2 == 0.3` é `False`, `round(2.5)` é 2 (arredonda para o par).
- Compreensões: `[f(x) for x in it if cond]`, `{k: v ...}`, `{x ...}`; expressão geradora `(x for x in it)` é preguiçosa e se esgota após um consumo; `yield` cria função geradora.
- Funções: parâmetros posicionais, nomeados, `*args`, `**kwargs`; `lambda`; funções são objetos. Argumento padrão é avaliado uma vez, na definição: padrão mutável acumula entre chamadas (idioma correto: `acc=None` e criar a lista dentro).
- Escopo LEGB (local, envolvente, global, embutido). Atribuir a um nome dentro da função o torna local em toda a função: ler antes de atribuir gera `UnboundLocalError`. `global` e `nonlocal` mudam isso.
- Exceções: `try/except/else/finally`; `else` roda só se não houve exceção; `finally` roda sempre, mesmo com `return`; capturar a exceção específica, não `except:` nu; `raise` para relançar; hierarquia (`ZeroDivisionError` é `ArithmeticError` é `Exception`).
- Arquivos: `with open(caminho, encoding="utf-8") as f:` fecha o arquivo mesmo com erro (gerenciador de contexto); modos `r`, `w` (trunca), `a`, `b`; módulo `csv`, `json`, `pathlib`.
- Módulos e pacotes: `import m`, `from m import f`, `import m as x`; `if __name__ == "__main__":` separa código importável de execução; ambiente virtual (`venv`) e dependências fixadas.
- Rotina pandas (leitura de código): `read_csv` com `dtype`, `sep`, `encoding`; `groupby(...).agg(...)` descarta chave nula por padrão (`dropna=True`) e `count` ignora NaN enquanto `size` conta linhas; `isna()/notna()`, `dropna()` (por padrão remove a linha com qualquer NaN; `how="all"`, `subset`), `fillna()`; `merge` com `how` (`inner`, `left`, `right`, `outer`), chave duplicada nos dois lados multiplica linhas, `validate="one_to_one"` e `indicator=True` para conferir; `drop_duplicates`; `loc` (rótulo) × `iloc` (posição). Média do pandas ignora NaN por padrão.
- Cópia × view: atribuição encadeada `df[filtro]["col"] = v` não altera `df`; use `df.loc[filtro, "col"] = v`. Desde o pandas 3.0 o Copy-on-Write é o comportamento padrão: todo resultado de indexação se comporta como cópia e o aviso antigo `SettingWithCopyWarning` deu lugar ao `ChainedAssignmentError` (o livro de McKinney, de 2022, descreve o comportamento anterior).
- Depuração: ler o traceback de baixo para cima, `print`/`logging`, `pdb`/`breakpoint()`, conferir `shape`, `dtypes` e contagens antes e depois de cada junção.
- Organização modular e testes: funções pequenas e puras, sem dependência de estado global; `assert`; `unittest` (biblioteca padrão) e `pytest`; teste de regressão com base pequena de resultado conhecido; `doctest`.
- Reprodutibilidade: semente fixa (`random.seed`, `numpy.random.default_rng(42)`), versões fixadas (`requirements.txt`/lock), dados brutos imutáveis e transformações em código, controle de versão, notebook executado de cima a baixo sem estado oculto. Ponte com E4 1.1 a 1.4.
- Trechos verificados (Python 3.12, pandas 3.0.1):

```python
def add(x, acc=[]):
    acc.append(x)
    return acc
print(add(1))   # [1]
print(add(2))   # [1, 2]  o padrão foi criado uma vez só

def f(x):
    try:
        r = 10 / x
    except ZeroDivisionError:
        return "erro"
    else:
        return r
    finally:
        print("fim")
print(f(0))     # imprime "fim" e depois "erro"
print(f(5))     # imprime "fim" e depois 2.0
```

```python
import pandas as pd
df = pd.DataFrame({"uf": ["DF", "DF", "SP", None], "valor": [10, None, 5, 7]})
print(df.groupby("uf")["valor"].agg(["count", "size", "sum"]))
#     count  size   sum
# uf
# DF      1     2  10.0
# SP      1     1   5.0     a linha com uf nula some; NaN não entra em count nem em sum

e = pd.DataFrame({"k": [1, 1, 2], "x": [1, 2, 3]})
d = pd.DataFrame({"k": [1, 1], "y": [9, 8]})
print(len(e.merge(d, on="k")), len(e.merge(d, on="k", how="left")))   # 4 5
```

- No trabalho da CGU: ler e revisar o script de outra equipe ou de fornecedor, achar a junção que duplicou pagamentos, transformar análise de notebook em rotina testada e reexecutável para a trilha mensal.

**(C) Fontes.**
- Documentação oficial: Python Software Foundation, [The Python Tutorial](https://docs.python.org/3/tutorial/), seções 3 a 9 (estruturas, controle de fluxo, módulos, entrada e saída, erros e exceções, classes); [Execution model, escopo](https://docs.python.org/3/reference/executionmodel.html); [unittest](https://docs.python.org/3/library/unittest.html); [venv](https://docs.python.org/3/library/venv.html). pandas, [Copy-on-Write](https://pandas.pydata.org/docs/user_guide/copy_on_write.html) e [Merge, join, concatenate](https://pandas.pydata.org/docs/user_guide/merging.html).
- Livros-texto: McKinney, W. *Python for Data Analysis*. 3ª ed. O'Reilly, 2022 ([acesso aberto](https://wesmckinney.com/book/)), caps. 3 (estruturas, funções, arquivos), 5, 7, 8 e 10 (pandas, limpeza, junção, agregação).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Por ser a tupla um tipo imutável, nenhuma operação pode alterar o conteúdo de `t = (1, [2])`. → *Certo:* a tupla não pode trocar seus elementos, mas a lista contida nela é mutável: `t[1].append(3)` resulta em `(1, [2, 3])`.
- *Afirmação errada:* Em `try/except/finally`, se o bloco `except` executa `return`, o bloco `finally` não é executado. → *Certo:* `finally` executa sempre, antes de a função efetivamente retornar.

**(E) Prioridade alta.** Única linguagem citada pelo nome no edital, com perfil de item de leitura de código que o Cebraspe usou no TCU 2026 (TCU2026-AUFC-TI-126, anulado) e a FGV usou três vezes (CGU2022-AFFC-TI-45, TCU2022-AUFC-CE-61 e 62); é também a ferramenta de trabalho diário do cargo.

**5 Preparação e transformação**

#### E1 · 5.1 — Prioridade média

**(A) Texto original do edital.** Valores ausentes, inconsistências, duplicações, outliers e desbalanceamento; transformação, codificação, normalização e padronização; engenharia e seleção de atributos; prevenção de vazamento de informação na preparação dos dados.

**(B) O que estudar.**
- Ausentes, mecanismos de Rubin: MCAR (completamente ao acaso; exclusão não vicia, só perde poder), MAR (depende de variáveis observadas; imputação condicional funciona), MNAR (depende do próprio valor; nenhuma técnica resolve só com os dados). Exclusão de linhas, imputação por média ou mediana (reduz a variância e atenua correlações), por modelo, múltipla; incluir indicador de ausência, porque o fato de faltar pode ser informativo. Zero, vazio, "não informado" e nulo não são a mesma coisa.
- Inconsistências: formatos (datas, CPF com e sem máscara), unidades, regras de negócio violadas (data de pagamento anterior ao empenho), categorias grafadas de vários jeitos.
- Duplicações: exatas × aproximadas (mesmo fornecedor com grafias diferentes); duplicata gerada por junção; decidir a chave de unicidade antes de deduplicar. Ponte com E2 5.3 e 5.5.
- Outliers: distinguir erro de registro, caso legítimo extremo e caso de interesse (em auditoria o extremo pode ser o achado). Tratamentos: corrigir, winsorizar, transformar (log), usar método robusto; nunca excluir só por estar fora da cerca.
- Desbalanceamento: com 1% de positivos, classificar tudo como negativo dá 99% de acurácia; usar precisão, sensibilidade, curva precisão-revocação; pesos de classe, subamostragem, sobreamostragem, SMOTE, sempre aplicados só no treino. Ponte com E3 3.1 e 3.2.
- Transformações: log para assimetria e relações multiplicativas; discretização em faixas; datas em componentes (dia da semana, fim de mês).
- Codificação: one-hot para nominal (em modelo linear com intercepto, k − 1 colunas); ordinal só quando há ordem; target encoding (média do alvo por categoria) vaza se não for feito fora da dobra; categorias raras agrupadas; categoria nova no teste (`handle_unknown`).
- Escalonamento: normalização min-max para [0, 1] (sensível a extremos) × padronização z = (x − μ)/σ (média 0, desvio 1, não limita o intervalo) × escalonamento robusto (mediana e IQR). Necessário para KNN, SVM, k-médias, PCA, redes neurais e modelos com regularização; dispensável para árvores e seus ensembles.
- Engenharia de atributos: razões e taxas (valor por habitante), agregações por entidade e janela de tempo, contagens, defasagens, flags de regra de negócio.
- Seleção de atributos: filtro (correlação, informação mútua, qui-quadrado), wrapper (seleção recursiva), embutida (Lasso zera coeficientes, importância em árvores). Seleção feita com a base inteira antes da validação também é vazamento.
- Vazamento na preparação: ajustar imputador, escalonador, codificador ou seletor com treino e teste juntos; deduplicar só depois de dividir (cópias em treino e teste); usar atributo que só existe depois do evento previsto (ex.: "processo de ressarcimento aberto" para prever irregularidade); divisão aleatória em dado temporal. Remédio: dividir primeiro e encapsular a preparação num `Pipeline` ajustado só no treino, dentro de cada dobra. Ponte com E3 2.3, onde o tema é tratado do lado da validação.
- No trabalho da CGU: preparar base de convênios para um modelo de risco, decidir o que fazer com CNPJ nulo e valores negativos, padronizar nomes antes de cruzar com sanções e auditar o pipeline de um fornecedor procurando vazamento que infla a métrica reportada.

**(C) Fontes.**
- Documentação de ferramenta: scikit-learn, [Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls.html) (vazamento na preparação e uso de `Pipeline`) e [Preprocessing data](https://scikit-learn.org/stable/modules/preprocessing.html).
- Livros-texto: McKinney, *Python for Data Analysis*, 3ª ed., 2022, cap. 7 (limpeza e preparação). Little, R. J. A.; Rubin, D. B. *Statistical Analysis with Missing Data*. 3ª ed. Wiley, 2019 (mecanismos MCAR, MAR, MNAR).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Para evitar diferenças de escala entre treino e teste, recomenda-se padronizar o conjunto completo de dados antes de separá-lo. → *Certo:* média e desvio do escalonador devem ser calculados só no treino e aplicados ao teste; calcular com tudo é vazamento.
- *Afirmação errada:* A normalização min-max transforma a variável para média zero e desvio padrão um, o que a torna robusta a outliers. → *Certo:* isso é a padronização z; a min-max leva ao intervalo [0, 1] e é muito sensível a extremos.

**(E) Prioridade média.** Conteúdo cobrável e prático, mas a parte de qualidade e deduplicação tem mais profundidade em E2 5.2 a 5.5 e o vazamento em E3 2.3; sem incidência Cebraspe no catálogo (o item mais próximo é FGV, OneHotEncoder em TCU2022-AUFC-CE-62).

### E2 Engenharia, arquitetura e governança de dados

**Visão geral.** É a disciplina do dado antes do modelo: como ele é guardado (modelos de banco, DW, lake, lakehouse, mesh), consultado (SQL analítico), trazido de fora (ETL/ELT, APIs, formatos), processado em escala (Spark e afins), conferido (qualidade, linhagem, vinculação de registros) e protegido (LGPD, LAI, Decreto 10.046/2019). O Cebraspe cobra a parte clássica (modelo relacional, normalização, ACID, DW e OLAP, SQL) com itens conceituais curtos e, na prova do TCU 2026, já levou data mesh, ETL, CSV, REST e governança de dados para a mesma bateria. A redação do edital da CGU é mais operacional que a de provas anteriores: fala em "erros de interpretação em consultas", "resultados inconsistentes", "correspondências incorretas entre pessoas". Isso aponta para itens que descrevem uma situação e pedem o diagnóstico, e para a Q2 da discursiva, onde cruzamento de bases com dado pessoal é cenário natural. Conversa com E1 5.1 (preparação: ausentes, duplicações), E3 5.2 (embeddings e busca vetorial), E4 1.x (versionamento e pipelines), E4 2.x (custo e sustentação) e E4 3.3 (dados pessoais).

**Estratégia:**
- Comece por SQL (E2 2.1 e 2.2) e pelas armadilhas de NULL e de junção: é o conteúdo com mais chance de item "pegadinha" e o que mais se usa no trabalho.
- Estude E2 5.2, 5.3 e 5.5 juntos, como um único fluxo de cruzamento de bases (perfilar, padronizar, bloquear, comparar, classificar, revisar, medir erro). É o tema com maior perfil de discursiva.
- Leia a LGPD nos artigos 5º (III, XI), 6º, 12, 13, 15, 16, 23 e 26, a LAI no art. 31 e o Decreto 10.046/2019 nos arts. 3º e 4º. Texto literal, porque o Cebraspe troca uma palavra ("exclusivamente", "com esforços razoáveis").
- Para DW, lake, lakehouse e mesh, decore as distinções em tabela (esquema na escrita × na leitura, dado tratado × bruto, centralizado × por domínio) e os quatro princípios de Dehghani.
- Processamento distribuído (E2 4.x) é conceitual: shuffle, broadcast, skew, avaliação preguiçosa. Não gaste tempo com sintaxe de PySpark.

**Mapa rápido**

| Item | Tema (início do texto do edital) | Prioridade | Incidência Cebraspe |
|---|---|---|---|
| 1.1 | Modelos relacional, documental, chave-valor, multidimensional e vetorial… | Alta | 8 (modelo relacional, ACID, NoSQL) |
| 1.2 | Data warehouse, data mart, data lake e lakehouse… | Alta | 9 (7 DW/lake/mesh + 2 governança de dados) |
| 2.1 | Definição e manipulação de dados, controle de acesso e transações… | Alta | 2 |
| 2.2 | Índices, planos de execução e desempenho; valores nulos… | Alta | 1 |
| 3.1 | ETL e ELT; processamento em lote e fluxo… | Alta | 3 (+1 ETL em 1.2) |
| 4.1 | Particionamento, paralelismo, movimentação de dados… | Média | 1 |
| 4.2 | Escalabilidade, tolerância a falhas e custo | Média | 1 |
| 4.3 | Planos de execução | Baixa | 0 |
| 4.4 | Assimetria entre partições e resultados inconsistentes | Média | 0 |
| 5.1 | Metadados, catálogo e linhagem | Média | 0 |
| 5.2 | Completude, consistência, validade, unicidade, acurácia e atualidade | Média | 0 |
| 5.3 | Perfilamento, deduplicação, vinculação de registros e enriquecimento | Alta | 0 |
| 5.4 | Conciliação de fontes | Média | 0 |
| 5.5 | Riscos de correspondências incorretas entre pessoas ou entidades | Alta | 0 |
| 6.1 | Minimização, segregação de ambientes e privilégios | Média | 1 |
| 6.2 | Retenção e descarte | Baixa | 0 |
| 6.3 | Anonimização, pseudonimização e reidentificação | Alta | 0 (1 FGV) |
| 6.4 | Publicação, reutilização e compartilhamento controlados | Média | 0 |
| 6.5 | Proteção de dados pessoais e equilíbrio entre utilidade analítica… | Alta | 0 |

**1 Modelagem e arquiteturas**

#### E2 · 1.1 — Prioridade alta

**(A) Texto original do edital.** Modelos relacional, documental, chave-valor, multidimensional e vetorial; normalização e integridade; transações e consistência.

**(B) O que estudar.**
- Relacional (Codd): relação = tabela; tupla = linha; atributo = coluna; domínio; esquema × instância. Três componentes: estruturas (relações), operadores (álgebra relacional: seleção σ, projeção π, produto cartesiano, junção, união, diferença) e restrições de integridade.
- Chaves: superchave, candidata (mínima), primária (escolhida, não nula, única), alternativa, estrangeira (referencia PK de outra relação ou da mesma). Integridade de entidade (PK não nula), referencial (FK aponta para PK existente ou é nula), de domínio. Ações referenciais: `ON DELETE CASCADE | SET NULL | RESTRICT | NO ACTION`.
- Normalização: 1FN (valores atômicos, sem grupos repetidos); 2FN (1FN + nenhum atributo não chave depende de parte de chave composta); 3FN (2FN + sem dependência transitiva entre não chaves); FNBC (todo determinante é superchave). 4FN trata dependência multivalorada. Objetivo: evitar anomalias de inserção, atualização e exclusão. Desnormalização é escolha consciente em DW (consulta mais rápida, redundância controlada).
- Documental (MongoDB): documentos JSON/BSON, esquema flexível, aninhamento evita junção; bom para agregado lido inteiro. MongoDB guarda BSON (JSON binário), não XML. Chave-valor (Redis, DynamoDB): acesso só pela chave, latência baixa, sem consulta por conteúdo do valor; DHT (tabela hash distribuída) é técnica típica de chave-valor, não de documental. Família de colunas (Cassandra, HBase) e grafo (Neo4j) completam o quadro NoSQL.
- Multidimensional: fato (medidas numéricas, granularidade definida) e dimensões (contexto: tempo, órgão, favorecido). Esquema estrela (dimensões desnormalizadas) × floco de neve (dimensões normalizadas). A PK da fato costuma ser composta pelas FKs das dimensões; a PK da dimensão (chave substituta) é que vai como FK para a fato. Operações OLAP: drill-down/roll-up (na hierarquia), slice, dice, pivot, drill-across, drill-through (vai ao detalhe na fonte ou entre dimensões sem hierarquia, conforme gabarito TCU2015-TI-141). Dimensões de mudança lenta (SCD tipo 1 sobrescreve, tipo 2 nova linha com vigência).
- Vetorial: guarda embeddings (vetores densos) e responde busca por similaridade (cosseno, produto interno, euclidiana) com índices aproximados (ANN: HNSW, IVF). Troca exatidão por velocidade (recall < 100%). Usado em RAG. Ver E3 5.2 e E3 5.4.
- Transações ACID: atomicidade (tudo ou nada), consistência (de um estado válido a outro, respeitando restrições), isolamento (efeito como se fossem seriais, conforme o nível), durabilidade (confirmado sobrevive a falha; log de transações). Níveis de isolamento ANSI e anomalias: READ UNCOMMITTED (leitura suja), READ COMMITTED (impede leitura suja), REPEATABLE READ (impede leitura não repetível), SERIALIZABLE (impede fantasma). Controle de concorrência: bloqueio binário × bloqueio de modo múltiplo (compartilhado para leitura, exclusivo para escrita), 2PL, MVCC.
- Consistência em sistemas distribuídos: teorema CAP (sob partição de rede, escolher consistência ou disponibilidade); BASE (basicamente disponível, estado flexível, consistência eventual). "Consistência" do ACID (regras de integridade) não é a mesma "consistência" do CAP (todas as réplicas devolvem o último valor escrito).
- No trabalho da CGU: ler o modelo de dados de um sistema auditado (SIAFI, folha, convênios) para saber a granularidade antes de somar; identificar se um "valor duplicado" é erro ou efeito de junção 1:N; avaliar se a solução contratada usa banco vetorial para RAG e com que índice.

**(C) Fontes.** Elmasri e Navathe, *Sistemas de Banco de Dados*, 7ª ed., Pearson, 2018 (caps. 5, 14, 15, 20 a 22); Silberschatz, Korth e Sudarshan, *Database System Concepts*, 7ª ed., McGraw-Hill, 2019; Kimball e Ross, *The Data Warehouse Toolkit*, 3ª ed., Wiley, 2013; Kleppmann, *Designing Data-Intensive Applications*, O'Reilly, 2017 (caps. 2, 7 e 9); ISO/IEC 9075 (SQL, níveis de isolamento; texto pago, conferido pelo sumário).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Bancos relacionais usam tabelas bidimensionais, e o MongoDB representa os dados em JSON ou XML. → *Certo:* o MongoDB usa documentos BSON (representação binária de JSON); XML não é formato nativo dele (gabarito E em TCU2026-AUFC-TI-115).
- *Afirmação errada:* Uma relação na 3FN está necessariamente na FNBC. → *Certo:* é o contrário; toda relação na FNBC está na 3FN, mas a 3FN admite determinante que não é superchave quando o atributo determinado é primo.

**(E) Prioridade alta.** É a base de tudo o que vem depois e tem a maior série de itens Cebraspe da disciplina: 8 itens (TCU2015-BAS-86, 87, 88; TCU2015-TI-126, 157, 159, 160; TCU2026-AUFC-TI-115).

#### E2 · 1.2 — Prioridade alta

**(A) Texto original do edital.** Data warehouse, data mart, data lake e lakehouse; produtos de dados, responsabilidade por domínios, autosserviço e governança federada em data mesh.

**(B) O que estudar.**
- Data warehouse (Inmon): orientado por assunto, integrado, variante no tempo, não volátil (carga e consulta, sem atualização transacional). Esquema na escrita (*schema-on-write*): o dado entra tratado. Por isso o ETL concentra o tratamento antes da carga (gabarito C em TCU2026-AUFC-TI-117).
- Inmon × Kimball: Inmon parte de um DW corporativo normalizado (3FN) e deriva data marts (*top-down*); Kimball constrói data marts dimensionais ligados por dimensões conformadas no barramento (*bottom-up*). Data mart: recorte por assunto ou área; dependente (alimentado pelo DW) ou independente.
- Data lake: repositório de dado bruto, em formato original, estruturado ou não, barato (armazenamento de objetos), esquema na leitura (*schema-on-read*). Risco: virar "pântano" sem catálogo e sem qualidade. O DW não guarda dado em formato original; dizer que "ambos guardam no formato original" está errado (TCU2026-AUFC-TI-120).
- Lakehouse: armazenamento de lake (arquivos abertos, como Parquet) com camada de tabela transacional (Delta Lake, Apache Iceberg, Apache Hudi) que dá ACID, versionamento (*time travel*), evolução de esquema e desempenho de DW sobre o mesmo dado. Arquitetura medalhão (bronze bruto, prata limpo e conformado, ouro agregado para consumo) é padrão de mercado, não norma.
- Data mesh (Zhamak Dehghani): abordagem sociotécnica, não produto. Quatro princípios: (1) propriedade por domínio (cada domínio de negócio responde pelos seus dados analíticos); (2) dado como produto (descobrível, endereçável, confiável, autodescritivo, interoperável, seguro, com dono e nível de serviço); (3) plataforma de dados de autosserviço (infraestrutura comum que reduz o custo de cada domínio publicar e consumir produtos); (4) governança computacional federada (regras definidas em conjunto pelos domínios e pela plataforma, aplicadas automaticamente por código: políticas de acesso, classificação, padrões de interoperabilidade). Mesh não elimina DW nem lake; muda quem é dono e como se governa.
- Governança de dados (DAMA-DMBOK 2): exercício de autoridade e controle sobre a gestão de dados; separa quem define política (comitê ou conselho de governança, com patrocínio da alta administração) de quem executa (gestores de dados, *data stewards*, custodiantes técnicos). Atua também na prevenção de risco e na correção de incidentes recorrentes (gabarito C em TCU2026-AUFC-TI-121). Item que atribui à alta administração a distribuição de papéis e à equipe de governança só a política foi dado como errado (TCU2026-AUFC-TI-123).
- No setor público federal: Decreto 12.198/2024 institui a Infraestrutura Nacional de Dados (IND), "conjunto de normas, políticas, arquiteturas, padrões, ferramentas tecnológicas e ativos de informação" para "promover o uso estratégico dos dados" (art. 7º), coordenada pela Secretaria de Governo Digital. É a moldura federal mais próxima de uma plataforma comum com governança federada.
- No trabalho da CGU: as trilhas de auditoria cruzam bases de vários órgãos; a pergunta de arquitetura é se cada base chega como produto com dono, dicionário e frequência conhecidos (mesh) ou como extração avulsa num lake sem catálogo. Isso decide quanto da trilha é reprodutível.

**(C) Fontes.** [Decreto 12.198/2024, art. 7º](https://www2.camara.leg.br/legin/fed/decret/2024/decreto-12198-24-setembro-2024-796286-publicacaooriginal-173095-pe.html) (ementa e art. 7º conferidos no texto da Câmara; Planalto fora do ar na consulta); DAMA International, *DAMA-DMBOK: Data Management Body of Knowledge*, 2ª ed., Technics, 2017 (revisão de 2024), caps. 3 (governança) e 11 (DW e BI) (texto pago, conferido por fontes secundárias); Inmon, *Building the Data Warehouse*, 4ª ed., Wiley, 2005; Kimball e Ross, *The Data Warehouse Toolkit*, 3ª ed., Wiley, 2013; Dehghani, *Data Mesh: Delivering Data-Driven Value at Scale*, O'Reilly, 2022; Armbrust et al., "Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics", CIDR 2021.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Data warehouse e data lake armazenam dados no formato original, e só o lake acessa bases externas. → *Certo:* só o lake guarda dado bruto em formato original; o DW guarda dado integrado e tratado, e ambos podem receber dados de fora da organização (TCU2026-AUFC-TI-120, gabarito E).
- *Afirmação errada:* No data mesh, a governança é centralizada numa equipe única de dados, que padroniza e publica os produtos de todos os domínios. → *Certo:* a governança é federada e computacional; a publicação é responsabilidade de cada domínio, apoiada por plataforma de autosserviço.

**(E) Prioridade alta.** Citado nominalmente com os quatro princípios do mesh e cobrado em três provas: 7 itens Cebraspe (TCU2015-TI-138 a 141; TCU2026-AUFC-TI-117, 118, 120) e 2 de governança de dados (TCU2026-AUFC-TI-121, 123).

**2 SQL e consultas analíticas**

#### E2 · 2.1 — Prioridade alta

**(A) Texto original do edital.** Definição e manipulação de dados, controle de acesso e transações; filtros, junções, agregações, subconsultas, expressões de tabela comuns e funções de janela.

**(B) O que estudar.**
- Sublinguagens: DDL (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`), DML (`INSERT`, `UPDATE`, `DELETE`, `MERGE`; `SELECT` às vezes separado como DQL), DCL (`GRANT`, `REVOKE`), controle de transação (`COMMIT`, `ROLLBACK`, `SAVEPOINT`, `ROLLBACK TO`). `DELETE` sem `WHERE` apaga linhas e pode ser desfeito na transação; `TRUNCATE` esvazia a tabela e, em vários SGBDs, faz *commit* implícito. `GRANT ... WITH GRANT OPTION` permite repassar o privilégio.
- Ordem lógica de avaliação: `FROM`/`JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` (aqui rodam as funções de janela) → `DISTINCT` → `ORDER BY` → `OFFSET/FETCH`. Consequências: `WHERE` não enxerga apelido do `SELECT`; `WHERE` não filtra agregado (use `HAVING`); função de janela não entra em `WHERE` (use CTE ou subconsulta).
- Junções: `INNER`, `LEFT/RIGHT/FULL OUTER`, `CROSS` (produto cartesiano), autojunção, semijunção (`EXISTS`), antijunção (`NOT EXISTS`). Junção 1:N multiplica linhas do lado 1 (ver E2 2.2).
- Subconsultas: escalar, de linha, de tabela; correlacionada (reexecutada por linha externa) × não correlacionada; `IN`, `EXISTS`, `ANY/SOME`, `ALL`.
- CTE (`WITH`): nomeia um resultado intermediário; `WITH RECURSIVE` percorre hierarquias (organograma, cadeia societária).
- Funções de janela: `função() OVER (PARTITION BY ... ORDER BY ... [moldura])`. Não reduzem linhas, ao contrário do `GROUP BY`. Classificação: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `NTILE`; deslocamento: `LAG`, `LEAD`, `FIRST_VALUE`; agregadas: `SUM`, `AVG`, `COUNT` com `OVER`. Com `ORDER BY` e sem moldura explícita, o padrão é `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` (empates entram juntos no acumulado).
- Exemplo 1 (CTE + `ROW_NUMBER`): último pagamento de cada CPF.

```sql
WITH ordenado AS (
  SELECT cpf, orgao, valor, data_pgto,
         ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY data_pgto DESC) AS rn
  FROM pagamento
)
SELECT cpf, orgao, valor, data_pgto
FROM ordenado
WHERE rn = 1;
```

- Exemplo 2 (`RANK` × `DENSE_RANK`): valores 500, 500, 300 recebem `ROW_NUMBER` 1, 2, 3; `RANK` 1, 1, 3 (pula); `DENSE_RANK` 1, 1, 2 (não pula). Com empate, `ROW_NUMBER` escolhe de forma arbitrária se o `ORDER BY` não desempatar (ver E2 4.4).

```sql
SELECT orgao, favorecido, valor,
       RANK()       OVER (PARTITION BY orgao ORDER BY valor DESC) AS rk,
       DENSE_RANK() OVER (PARTITION BY orgao ORDER BY valor DESC) AS drk
FROM contrato;
```

- Exemplo 3 (`SUM OVER PARTITION`): participação de cada contrato no total do órgão e acumulado no tempo, sem perder o detalhe.

```sql
SELECT orgao, contrato, data_assinatura, valor,
       SUM(valor) OVER (PARTITION BY orgao) AS total_orgao,
       valor / SUM(valor) OVER (PARTITION BY orgao) AS participacao,
       SUM(valor) OVER (PARTITION BY orgao ORDER BY data_assinatura
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acumulado
FROM contrato;
```

- Transações em SQL: `SAVEPOINT s; ... ROLLBACK TO s;` desfaz só o que veio depois do ponto de salvamento, sem encerrar a transação; o `COMMIT` final ainda é necessário.
- No trabalho da CGU: trilha de auditoria é, quase sempre, um `SELECT` com junções entre bases e uma regra de exceção (`NOT EXISTS`, janela com `LAG` para fracionamento de despesa, `RANK` para concentração de fornecedores). O auditor precisa ler o SQL de terceiro e dizer se ele mede o que afirma medir.

**(C) Fontes.** ISO/IEC 9075:2023 (SQL; texto pago, conferido pelo sumário); Elmasri e Navathe, *Sistemas de Banco de Dados*, 7ª ed., caps. 6 e 7; Molinaro e de Graaf, *SQL Cookbook*, 2ª ed., O'Reilly, 2020 (funções de janela); documentação do PostgreSQL, "Window Functions" ([link](https://www.postgresql.org/docs/current/tutorial-window.html)), como referência de comportamento padrão.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Para listar só o primeiro colocado de cada grupo, basta escrever `WHERE ROW_NUMBER() OVER (PARTITION BY orgao ORDER BY valor DESC) = 1`. → *Certo:* funções de janela são avaliadas depois do `WHERE`; é preciso calcular a janela numa CTE ou subconsulta e filtrar fora.
- *Afirmação errada:* `ROLLBACK TO nome_point` desfaz toda a transação e a encerra. → *Certo:* desfaz só as instruções posteriores ao `SAVEPOINT`, e a transação continua aberta (tema de TCU2015-TI-125).

**(E) Prioridade alta.** SQL é ferramenta diária do auditor de dados e o edital nomeia CTE e funções de janela, que o Cebraspe ainda não explorou (espaço para item novo). 2 itens Cebraspe: TCU2015-TI-125 e 127; 6 da ESAF e 3 da FGV nas provas anteriores.

#### E2 · 2.2 — Prioridade alta

**(A) Texto original do edital.** Índices, planos de execução e desempenho; valores nulos, duplicações e erros de interpretação em consultas.

**(B) O que estudar.**
- Índices: árvore B+ (igualdade e intervalo, ordenação), hash (só igualdade), bitmap (baixa cardinalidade, comum em DW). Primário (sobre a chave de ordenação do arquivo, esparso, com ancoragem de bloco) × secundário (sobre campo não ordenado, denso, sem ancoragem); agrupado (*clustered*, define a ordem física, um por tabela) × não agrupado. Índice de cobertura responde a consulta sem ler a tabela. Índice composto serve ao prefixo mais à esquerda.
- Índice custa: ocupa espaço e torna `INSERT/UPDATE/DELETE` mais lentos. Baixa seletividade (coluna `sexo`) costuma levar o otimizador a ignorar o índice.
- Consultas que impedem o uso de índice (não "sargáveis"): função sobre a coluna (`WHERE UPPER(nome) = ...`, `WHERE EXTRACT(YEAR FROM data) = 2025`), `LIKE '%texto'`, conversão implícita de tipo. Reescrever como intervalo: `WHERE data >= DATE '2025-01-01' AND data < DATE '2026-01-01'`.
- Plano de execução: `EXPLAIN` mostra o plano estimado; `EXPLAIN ANALYZE` (PostgreSQL) executa e mostra o real. Ler: varredura completa × busca por índice; algoritmo de junção (laço aninhado para tabela externa pequena, *hash join* para grandes sem ordem, *merge join* para entradas ordenadas); cardinalidade estimada × real. Estatísticas desatualizadas geram estimativa ruim e plano ruim.
- Armadilhas de NULL (lógica de três valores: TRUE, FALSE, UNKNOWN; o `WHERE` só mantém TRUE):
  - `NULL = NULL` dá UNKNOWN, não TRUE. Use `IS NULL` ou `IS NOT DISTINCT FROM`. Pelo mesmo motivo, junção por coluna nula não casa.
  - `COUNT(*)` conta linhas; `COUNT(col)` ignora nulos; `AVG(col)` divide pela contagem de não nulos, não pelo total de linhas. `SUM` sobre conjunto vazio devolve NULL, não zero (use `COALESCE`).
  - `NOT IN` com subconsulta que contém um NULL não devolve linha nenhuma, porque `x <> NULL` é UNKNOWN. Use `NOT EXISTS`.

```sql
-- Servidores sem nenhum pagamento: errado se pagamento.cpf tiver NULL
SELECT s.cpf FROM servidor s
WHERE s.cpf NOT IN (SELECT p.cpf FROM pagamento p);

-- Correto
SELECT s.cpf FROM servidor s
WHERE NOT EXISTS (SELECT 1 FROM pagamento p WHERE p.cpf = s.cpf);
```

  - `LEFT JOIN` com filtro sobre a tabela da direita no `WHERE` elimina as linhas sem correspondência (as colunas da direita vêm NULL) e transforma a junção em interna. O filtro vai no `ON`.

```sql
-- Vira junção interna: some quem não tem pagamento em 2025
SELECT s.cpf, p.valor
FROM servidor s LEFT JOIN pagamento p ON p.cpf = s.cpf
WHERE p.ano = 2025;

-- Mantém todos os servidores
SELECT s.cpf, p.valor
FROM servidor s LEFT JOIN pagamento p ON p.cpf = s.cpf AND p.ano = 2025;
```

  - `GROUP BY` e `DISTINCT` tratam todos os NULL como um só grupo; restrição `UNIQUE` aceita vários NULL na maioria dos SGBDs.
- Duplicações e erros de interpretação: junção 1:N antes de somar infla o total (somar o valor do contrato depois de juntar com os aditivos conta o contrato uma vez por aditivo); `DISTINCT` usado para "esconder" duplicata mascara erro de chave; `COUNT(DISTINCT cpf)` × `COUNT(*)` respondem perguntas diferentes (pessoas × vínculos); média de médias não é a média geral; `UNION` remove duplicatas, `UNION ALL` não.
- No trabalho da CGU: um achado do tipo "R$ X pagos a falecidos" depende de a junção não ter inflado o valor e de NULL na data de óbito não ter sido lido como "vivo" ou "morto" sem critério. Revisar SQL de achado é conferir granularidade, chave de junção e tratamento de NULL. Ponte com E1 5.1 (ausentes e duplicações na preparação).

**(C) Fontes.** Elmasri e Navathe, *Sistemas de Banco de Dados*, 7ª ed., caps. 17 a 19 (índices e processamento de consultas); Winand, *SQL Performance Explained*, 2012 (versão aberta em [use-the-index-luke.com](https://use-the-index-luke.com/)); documentação do PostgreSQL, "Using EXPLAIN" ([link](https://www.postgresql.org/docs/current/using-explain.html)); ISO/IEC 9075 (semântica de NULL; texto pago, conferido pelo sumário).

**(D) Como a banca erra o item.**
- *Afirmação errada:* `SELECT COUNT(email) FROM pessoa` devolve o número de linhas da tabela `pessoa`. → *Certo:* devolve o número de linhas com `email` não nulo; o total de linhas vem de `COUNT(*)`.
- *Afirmação errada:* Criar índice em todas as colunas consultadas melhora o desempenho geral do banco. → *Certo:* cada índice acelera algumas leituras e encarece todas as escritas, além de ocupar espaço; o otimizador também pode ignorá-lo se a seletividade for baixa.

**(E) Prioridade alta.** O edital pede explicitamente "erros de interpretação em consultas", formato ideal para item de situação e para a revisão de achado na discursiva. 1 item Cebraspe sobre índices (TCU2015-TI-158).

**3 Ingestão e integração**

#### E2 · 3.1 — Prioridade alta

**(A) Texto original do edital.** ETL e ELT; processamento em lote e fluxo, completo e incremental; APIs e contratos de dados; formatos CSV, JSON, XML e Parquet; interoperabilidade semântica e técnica; falhas, repetição de processamento e consistência.

**(B) O que estudar.**
- ETL (extrai, transforma em área de preparação, carrega no destino tratado; típico de DW) × ELT (carrega bruto no destino e transforma lá dentro, aproveitando a capacidade de processamento do DW em nuvem ou lakehouse; preserva o bruto para reprocessar). Paralelismo é característica desejável de ferramenta de ETL (TCU2015-TI-139, gabarito C).
- Lote (janela periódica, alta vazão, latência alta) × fluxo (*streaming*, evento a evento ou micro-lote, latência baixa; Kafka, Spark Structured Streaming, Flink). Arquiteturas Lambda (camadas lote e fluxo separadas) e Kappa (só fluxo, reprocessamento por reexecução do log).
- Completo (recarrega tudo; simples, caro, pega exclusões) × incremental (só o que mudou, por coluna de controle tipo `data_atualizacao` ou por CDC, captura de mudança de dados a partir do log do banco). Risco do incremental por data: perder exclusões físicas e registros alterados com relógio errado; usar marca d'água com folga.
- APIs: REST é sem estado (*stateless*): cada requisição traz tudo o que o servidor precisa; o servidor não guarda sessão do cliente (TCU2026-AUFC-TI-114, gabarito E para a afirmação contrária). Verbos HTTP (GET seguro e idempotente; PUT e DELETE idempotentes; POST não idempotente), códigos (2xx sucesso, 4xx erro do cliente, 429 excesso de requisições, 5xx erro do servidor), paginação, limite de taxa, autenticação (OAuth 2.0, chave de API).
- Contrato de dados: acordo explícito e versionado entre produtor e consumidor sobre esquema, semântica, qualidade, nível de serviço (atualidade, disponibilidade), dono e regras de mudança. Quebra de contrato deve ser detectada no pipeline, não no painel. Referência de mercado: Open Data Contract Standard (Bitol, Linux Foundation).
- Formatos: CSV (texto tabular, linha de cabeçalho opcional com nomes de colunas, sem tipos nem esquema; RFC 4180 trata aspas e separador; armadilhas: separador `;` com vírgula decimal, codificação Latin-1 × UTF-8, zeros à esquerda de CPF perdidos ao abrir em planilha); JSON (hierárquico, tipos básicos, RFC 8259); XML (hierárquico, verboso, validável por XSD, namespaces); Parquet (colunar, binário, com esquema e tipos, compressão por coluna, estatísticas por bloco que permitem pular dados, leitura só das colunas pedidas; ideal para análise, ruim para atualização linha a linha). CSV representa tabela com rótulos de coluna (TCU2026-AUFC-TI-113, gabarito C).
- Interoperabilidade técnica (protocolos, formatos, APIs: os sistemas trocam bits) × semântica (os dois lados entendem o mesmo significado: vocabulários, ontologias, tabelas de referência, códigos comuns como CPF, CNPJ, código IBGE de município). Há ainda a organizacional e a legal. No governo federal, a referência histórica é a e-PING (conferir versão vigente) e o Decreto 10.046/2019 (Cadastro Base do Cidadão como base de referência).
- Falhas e reprocessamento: entregas "no máximo uma vez", "pelo menos uma vez" (pode duplicar) e "exatamente uma vez" (exige idempotência ou transação ponta a ponta). Pipeline idempotente: reexecutar com a mesma entrada produz o mesmo resultado (carga por `MERGE`/*upsert* em chave natural, sobrescrita de partição em vez de `INSERT` acumulado). *Retry* com recuo exponencial, fila de mensagens mortas (*dead letter queue*), *checkpoint*, *backfill*.
- Virtualização de dados: PolyBase (SQL Server) consulta fontes externas como se fossem locais (TCU2026-AUFC-TI-116, gabarito C).
- No trabalho da CGU: ingestão de bases recebidas de outros órgãos por API ou arquivo; o CSV que chega com CPF sem zero à esquerda ou CNPJ alfanumérico (emissão a partir de julho de 2026, conforme fontes secundárias) quebra a junção sem erro aparente. Contrato de dados com o órgão fornecedor reduz retrabalho e dá base para a fiscalização (ponte com E4 5.5).

**(C) Fontes.** Reis e Housley, *Fundamentals of Data Engineering*, O'Reilly, 2022 (caps. 5 a 8); Kleppmann, *Designing Data-Intensive Applications*, O'Reilly, 2017 (caps. 4, 10 e 11); [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) (CSV); [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) (JSON); [Apache Parquet, documentação](https://parquet.apache.org/docs/); Fielding, *Architectural Styles and the Design of Network-based Software Architectures*, tese, UC Irvine, 2000 (REST); [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/).

**(D) Como a banca erra o item.**
- *Afirmação errada:* No serviço REST, o servidor precisa guardar o estado da sessão do cliente entre as requisições. → *Certo:* REST é sem estado; o estado da aplicação viaja na requisição (TCU2026-AUFC-TI-114).
- *Afirmação errada:* Reexecutar um pipeline incremental que falhou no meio não traz risco, porque a carga apenas acrescenta linhas. → *Certo:* acrescentar sem chave gera duplicidade; reprocessamento seguro exige carga idempotente (`MERGE` por chave ou sobrescrita da partição).

**(E) Prioridade alta.** Tema de três itens Cebraspe recentes (TCU2026-AUFC-TI-113, 114, 116) e de mais um sobre ETL (TCU2015-TI-139); a incidência mapeia "integração CSV e APIs" como assunto novo da banca, e o subitem fala de reprocessamento e consistência, com perfil de situação-problema.

**4 Processamento distribuído**

#### E2 · 4.1 — Prioridade média

**(A) Texto original do edital.** Particionamento, paralelismo, movimentação de dados e execução distribuída de transformações e junções.

**(B) O que estudar.**
- Partição: fatia do conjunto de dados processada por uma tarefa num executor. Paralelismo efetivo é limitado pelo número de partições e de núcleos. Poucas partições subutilizam o cluster; partições demais geram sobrecarga de agendamento e muitos arquivos pequenos.
- Particionamento físico em disco (por data, por UF) permite *partition pruning*: a consulta lê só as pastas necessárias. Particionar por coluna de alta cardinalidade (CPF) gera milhões de arquivos pequenos.
- Transformações estreitas (cada partição de saída depende de uma de entrada: `filter`, `map`, `select`) × largas (dependem de várias: `groupBy`, `join`, `distinct`, `orderBy`), que exigem *shuffle*.
- *Shuffle*: redistribuição dos dados pela rede para reunir as mesmas chaves no mesmo executor. É a operação mais cara (disco, rede, serialização) e o limite entre estágios.
- Estratégias de junção distribuída: *broadcast hash join* (copia a tabela pequena para todos os executores e evita *shuffle* da grande; no Spark vale abaixo de `spark.sql.autoBroadcastJoinThreshold`, 10 MB por padrão); *shuffle hash join*; *sort-merge join* (padrão para duas tabelas grandes: embaralha e ordena ambas pela chave). Pré-particionar ou *bucketizar* pela chave de junção evita *shuffle* repetido.
- Reduzir antes de mover: filtrar e projetar colunas antes do *shuffle*; agregação parcial no lado do mapa (combinador).
- No trabalho da CGU: cruzar folha de pagamento federal com base de óbitos ou de benefícios é junção entre tabelas grandes; a tabela de referência pequena (órgãos, municípios) deve ir por *broadcast*.

**(C) Fontes.** Chambers e Zaharia, *Spark: The Definitive Guide*, O'Reilly, 2018 (partes II e IV); Damji et al., *Learning Spark*, 2ª ed., O'Reilly, 2020 (caps. 3, 7 e 12); [documentação do Apache Spark, "Performance Tuning"](https://spark.apache.org/docs/latest/sql-performance-tuning.html); Dean e Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters", OSDI 2004.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em junção distribuída entre uma tabela grande e uma tabela de referência pequena, a estratégia mais eficiente é redistribuir as duas pela chave de junção. → *Certo:* o mais eficiente em geral é transmitir (*broadcast*) a pequena a todos os nós e evitar o *shuffle* da grande.
- *Afirmação errada:* `filter` e `groupBy` têm o mesmo custo de movimentação de dados, porque ambos percorrem todas as partições. → *Certo:* `filter` é transformação estreita, sem movimentação; `groupBy` é larga e exige *shuffle*.

**(E) Prioridade média.** Conceito cobrável em 1 ou 2 itens; o Cebraspe só tocou em paralelismo de ETL (TCU2015-TI-139). Base para E2 4.3 e 4.4.

#### E2 · 4.2 — Prioridade média

**(A) Texto original do edital.** Escalabilidade, tolerância a falhas e custo.

**(B) O que estudar.**
- Escala vertical (máquina maior; limite físico, ponto único de falha) × horizontal (mais máquinas; exige particionamento e coordenação). Elasticidade: ajustar recursos à carga, para cima e para baixo. Lei de Amdahl: a parte serial limita o ganho do paralelismo.
- Tolerância a falhas: replicação de dados (HDFS replica blocos, 3 cópias por padrão); recomputação pela linhagem (o Spark refaz só as partições perdidas a partir do grafo de transformações); *checkpoint* para cortar linhagens longas; reexecução especulativa de tarefas lentas; *retry* de tarefa. Driver do Spark é ponto único de falha da aplicação.
- Custo: em nuvem, paga-se computação por tempo, armazenamento por volume e transferência de saída; separar armazenamento de computação permite desligar o cluster. Instâncias preemptivas/*spot* são baratas e podem ser retomadas pelo provedor (exigem tolerância a falha). Formato colunar e particionamento reduzem dado lido e, logo, custo em serviços cobrados por volume varrido.
- Computação em nuvem é viável e usual para big data (TCU2015-BAS-81, gabarito E para a afirmação contrária).
- No trabalho da CGU: avaliar se a solução contratada dimensionou cluster permanente para carga que roda uma vez por mês; ponte com E4 2.1 a 2.3 (serviço gerenciado × operação própria, custo e observabilidade) e E4 5.2 (custo total de propriedade).

**(C) Fontes.** Kleppmann, *Designing Data-Intensive Applications*, O'Reilly, 2017 (caps. 1, 5, 6 e 8); Zaharia et al., "Resilient Distributed Datasets", NSDI 2012; Chambers e Zaharia, *Spark: The Definitive Guide*, O'Reilly, 2018; [NIST SP 800-145](https://csrc.nist.gov/pubs/sp/800/145/final) (definição de nuvem e elasticidade).

**(D) Como a banca erra o item.**
- *Afirmação errada:* No Spark, a perda de um executor obriga a reiniciar todo o processamento desde a leitura dos dados. → *Certo:* só as partições perdidas são recalculadas, a partir da linhagem registrada.
- *Afirmação errada:* Dobrar o número de nós de um cluster reduz o tempo de qualquer tarefa à metade. → *Certo:* partes seriais, *shuffle* e assimetria limitam o ganho (Amdahl).

**(E) Prioridade média.** Conceitual e ligado a custo, que o edital repete em E4; 1 item Cebraspe (TCU2015-BAS-81).

#### E2 · 4.3 — Prioridade baixa

**(A) Texto original do edital.** Planos de execução.

**(B) O que estudar.**
- Avaliação preguiçosa (*lazy evaluation*): transformações só montam o plano; nada executa até uma ação (`count`, `collect`, `write`). Permite ao otimizador ver a consulta inteira.
- Etapas no Spark SQL (otimizador Catalyst): plano lógico não resolvido → plano lógico analisado (resolve nomes e tipos no catálogo) → plano lógico otimizado (empurrar filtro para a fonte, *predicate pushdown*; podar colunas, *column pruning*; dobrar constantes) → um ou mais planos físicos, escolhidos por custo (estratégia de junção) → geração de código.
- Plano físico se lê de baixo para cima; cada `Exchange` é um *shuffle* e marca fronteira de estágio; `BroadcastExchange` indica junção por *broadcast*. `explain()` mostra o plano; a interface web mostra o DAG de estágios e tarefas executadas.
- Execução adaptativa de consultas (AQE, Spark 3.x): reotimiza em tempo de execução com estatísticas reais, juntando partições pequenas, trocando *sort-merge* por *broadcast* e dividindo partições assimétricas.
- Mesma ideia de E2 2.2 (plano estimado × real), em escala distribuída.
- No trabalho da CGU: diagnosticar por que uma trilha demora horas: o plano mostra *shuffle* desnecessário, filtro aplicado depois da junção ou leitura de todas as colunas de um Parquet.

**(C) Fontes.** Armbrust et al., "Spark SQL: Relational Data Processing in Spark", SIGMOD 2015; [documentação do Apache Spark, "Adaptive Query Execution"](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution); Damji et al., *Learning Spark*, 2ª ed., O'Reilly, 2020 (cap. 3).

**(D) Como a banca erra o item.**
- *Afirmação errada:* No Spark, cada transformação aplicada a um DataFrame é executada imediatamente, e o resultado intermediário fica materializado em memória. → *Certo:* transformações são preguiçosas; a execução só ocorre na ação, e nada é guardado em memória sem `cache`/`persist`.

**(E) Prioridade baixa.** Subitem de três palavras que repete E2 2.2 em outro motor; cobre-se com o conceito de avaliação preguiçosa e leitura de `Exchange`. Sem incidência.

#### E2 · 4.4 — Prioridade média

**(A) Texto original do edital.** Assimetria entre partições e resultados inconsistentes.

**(B) O que estudar.**
- Assimetria (*skew*): poucas chaves concentram a maior parte das linhas (CNPJ de um grande fornecedor, município de São Paulo, CPF nulo ou "00000000000"). Após o *shuffle*, uma partição fica enorme; a tarefa dela demora muito mais que as outras (o estágio espera a mais lenta) ou estoura memória.
- Sintomas: quase todas as tarefas terminam e uma fica rodando; *spill* para disco; erro de memória num executor só.
- Remédios: *salting* (acrescentar sufixo aleatório 0..n à chave quente no lado grande e replicar a linha correspondente n vezes no lado pequeno; depois agregar em dois passos); *broadcast* da tabela menor; tratar à parte as chaves quentes; filtrar nulos e valores-sentinela antes da junção (eles casam entre si em alguns motores ou acumulam numa partição); AQE com divisão automática de partições assimétricas.
- Resultados inconsistentes (leitura mais provável: execuções diferentes do mesmo código dão respostas diferentes, ou a resposta não bate com a fonte): ordem não garantida sem `ORDER BY` (o `take(10)` muda a cada execução); `ROW_NUMBER` com empate no `ORDER BY` escolhe linha arbitrária na deduplicação; soma de ponto flutuante depende da ordem de agregação entre partições; tarefa reexecutada após falha com efeito colateral não idempotente (grava duas vezes); leitura de fonte que mudou entre estágios; consistência eventual em réplicas; *dropDuplicates* sem critério de qual registro manter.
- Remédios: desempate determinístico (`ORDER BY data DESC, id_registro`), escrita idempotente, *snapshot* versionado da entrada (lakehouse com *time travel*), tipo decimal para valores monetários, testes de reconciliação de totais (E2 5.4).
- No trabalho da CGU: a mesma trilha rodada em dois dias não pode dar listas diferentes de "irregulares" sem que a fonte tenha mudado; isso compromete a evidência de auditoria. Ponte com E4 1.4 (reprodutibilidade).

**(C) Fontes.** Chambers e Zaharia, *Spark: The Definitive Guide*, O'Reilly, 2018 (cap. 19, desempenho); [documentação do Apache Spark, "Optimizing Skew Join"](https://spark.apache.org/docs/latest/sql-performance-tuning.html#optimizing-skew-join); Kleppmann, *Designing Data-Intensive Applications*, O'Reilly, 2017 (caps. 5, 9 e 11).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Aumentar o número de partições resolve a assimetria, porque distribui as chaves de forma mais equilibrada. → *Certo:* todas as linhas de uma mesma chave continuam indo para a mesma partição; com chave quente, é preciso *salting*, *broadcast* ou tratamento separado.
- *Afirmação errada:* Deduplicar com `ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY data)` e manter `rn = 1` produz sempre o mesmo registro. → *Certo:* se houver empate na data, a escolha é arbitrária e pode mudar entre execuções; é preciso critério de desempate.

**(E) Prioridade média.** Nomeado no edital e com perfil de item de situação, mas nunca cobrado pelo Cebraspe; o conteúdo é curto.

**5 Qualidade e rastreabilidade**

#### E2 · 5.1 — Prioridade média

**(A) Texto original do edital.** Metadados, catálogo e linhagem.

**(B) O que estudar.**
- Tipos de metadado (DMBOK 2, cap. 12): de negócio (definição, regra, dono, glossário), técnicos (esquema, tipos, tabelas, jobs, linhagem técnica) e operacionais (execuções, volumes, horários, erros, acessos).
- Dicionário de dados (descrição técnica de campos) × glossário de negócio (termos e definições acordadas) × catálogo de dados (inventário pesquisável de ativos, com metadado, dono, classificação, qualidade e linhagem; ex.: DataHub, OpenMetadata, Apache Atlas, Unity Catalog).
- Linhagem: de onde o dado veio e por quais transformações passou até o relatório. Granularidade de tabela ou de coluna. Usos: análise de impacto (o que quebra se a coluna mudar), causa-raiz de erro, conformidade (onde está o dado pessoal), confiança no indicador. Proveniência ≈ linhagem com histórico de execução e versões.
- Padrão aberto: OpenLineage (eventos de linhagem emitidos pelos pipelines).
- Dados mestres (entidades centrais compartilhadas: pessoa, órgão, fornecedor) e de referência (listas de códigos: municípios IBGE, CNAE, natureza de despesa) têm governança própria (DMBOK 2, cap. 10).
- No setor público: catálogo de dados abertos no Portal Brasileiro de Dados Abertos ([dados.gov.br](https://dados.gov.br)); dados de compartilhamento amplo devem ser catalogados (Decreto 10.046/2019, art. 11, § 5º).
- No trabalho da CGU: um achado precisa mostrar de qual extração, de qual data e por qual regra saiu; linhagem é o que permite responder ao gestor que contesta o número. Ponte com E4 1.1 (versionamento de dados) e E4 3.2 (rastreabilidade).

**(C) Fontes.** DAMA-DMBOK 2, caps. 10 e 12 (texto pago, conferido por fontes secundárias); [Decreto 10.046/2019, art. 11](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10046.htm); [OpenLineage](https://openlineage.io/); ISO/IEC 11179 (registro de metadados; texto pago, conferido pelo sumário).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Linhagem de dados é o registro dos usuários que acessaram cada tabela, usado para auditoria de segurança. → *Certo:* isso é trilha de acesso (metadado operacional); linhagem descreve a origem e as transformações do dado até o destino.

**(E) Prioridade média.** Conceitual e definitório; espera-se 1 item. Sem incidência Cebraspe; FGV cobrou dados mestres e de referência (TCU2022-AUFC-CE-72).

#### E2 · 5.2 — Prioridade média

**(A) Texto original do edital.** Completude, consistência, validade, unicidade, acurácia e atualidade.

**(B) O que estudar.**
- A lista do edital é a das seis dimensões centrais do relatório do DAMA UK (2013), reproduzidas no DMBOK 2, cap. 13, ao lado de outros quadros (Strong e Wang, Redman, English). Definições operacionais:
  - Completude: proporção de valores obrigatórios preenchidos (no campo, no registro, na população esperada). Campo vazio pode ser "não se aplica", e isso não é incompletude.
  - Consistência: ausência de contradição entre representações do mesmo fato (mesmo CPF com datas de nascimento diferentes em duas bases) ou entre campos (data de óbito anterior à data de pagamento).
  - Validade: conformidade com formato, tipo, domínio e regra (CPF com dígitos verificadores corretos, UF dentro da lista, data possível).
  - Unicidade: cada entidade do mundo real registrada uma só vez.
  - Acurácia: grau em que o valor representa corretamente a realidade; mede-se contra fonte de referência confiável. CPF válido de outra pessoa é válido e não acurado.
  - Atualidade (*timeliness*): o dado está disponível e representa a realidade no momento em que é usado (defasagem entre o fato e o registro).
- Métrica: regra → contagem de conformes / total avaliado, com limiar de aceitação e tendência no tempo. Qualidade é "adequação ao uso": o mesmo dado pode servir para estatística agregada e não servir para notificar uma pessoa.
- Ciclo de melhoria (DMBOK 2): definir, medir, analisar, melhorar, controlar; tratar na origem, não só corrigir no destino.
- Outros referenciais: ISO/IEC 25012 (modelo de qualidade de dados, 15 características, inerentes e dependentes de sistema); ISO 8000 (qualidade de dados mestres).
- LGPD, art. 6º, V (princípio da qualidade dos dados): "exatidão, clareza, relevância e atualização".
- No trabalho da CGU: antes de concluir que há pagamento indevido, medir validade do CPF, completude da data de óbito e atualidade da base de óbitos; achado sobre dado de baixa qualidade vira recomendação de qualidade, não de ressarcimento. Ponte com E1 5.1.

**(C) Fontes.** DAMA-DMBOK 2, cap. 13 (texto pago, conferido por fontes secundárias); DAMA UK, *The Six Primary Dimensions for Data Quality Assessment*, 2013; ISO/IEC 25012:2008 (texto pago, conferido pelo sumário); [LGPD, art. 6º, V](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm); Batini e Scannapieco, *Data and Information Quality*, Springer, 2016.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Um registro cujo CPF passa na verificação dos dígitos verificadores atende à dimensão de acurácia. → *Certo:* atende à validade; acurácia exige que o CPF seja o da pessoa correta, o que só se confere contra fonte de referência.
- *Afirmação errada:* Consistência e unicidade são a mesma dimensão, pois ambas tratam de registros repetidos. → *Certo:* unicidade trata de duplicidade da entidade; consistência trata de contradição entre representações ou campos.

**(E) Prioridade média.** Lista literal de definições, cobrável em 1 ou 2 itens de troca de conceito; o uso aplicado está em E2 5.3 e 5.5. Sem incidência Cebraspe.

#### E2 · 5.3 — Prioridade alta

**(A) Texto original do edital.** Perfilamento, deduplicação, vinculação de registros e enriquecimento.

**(B) O que estudar.**
- Perfilamento (*profiling*): estatísticas por coluna (nulos, distintos, mínimo, máximo, distribuição de tamanhos e padrões, valores mais frequentes, sentinelas como "99999"), entre colunas (dependências funcionais) e entre tabelas (candidatas a chave, sobreposição de chaves, órfãos de FK). É o primeiro passo de qualquer cruzamento.
- Padronização prévia: maiúsculas, remoção de acentos e pontuação, separação de partes do nome, tratamento de partículas ("DA", "DOS"), normalização de endereço e datas.
- Vinculação de registros (*record linkage*): identificar registros da mesma entidade em bases diferentes; deduplicação é a mesma tarefa dentro de uma base. Etapas: padronizar → bloquear (*blocking*: comparar só pares que compartilham uma chave de bloco, como ano de nascimento + município, para evitar n² comparações; bloco mal escolhido perde pares verdadeiros) → comparar campos (igualdade, Jaro-Winkler, Levenshtein, códigos fonéticos) → classificar → revisão humana dos casos duvidosos → avaliar.
- Determinística: regra exata sobre chave ou combinação (CPF igual; ou nome + data de nascimento + nome da mãe iguais). Simples e auditável; falha com erro de digitação e campo faltante (falso negativo) e com chave compartilhada ou reutilizada (falso positivo).
- Probabilística (Fellegi e Sunter, 1969): para cada campo, m = P(concorda | par verdadeiro) e u = P(concorda | não par). Peso de concordância log2(m/u); de discordância log2((1−m)/(1−u)). Soma dos pesos dá o escore do par. Dois limiares: acima do superior, par; abaixo do inferior, não par; entre eles, revisão manual. Concordância em campo raro (sobrenome incomum) pesa mais que em campo comum (u alto, como "SILVA" ou sexo). m e u estimados por amostra rotulada ou pelo algoritmo EM.
- Avaliação: precisão (pares aceitos que são verdadeiros), revocação (pares verdadeiros encontrados), taxa de falso pareamento; medir por amostra revisada manualmente. Fechamento transitivo em deduplicação (A=B e B=C ⇒ A=C) pode encadear erros e juntar pessoas diferentes num só grupo.
- Enriquecimento: acrescentar atributos de fonte externa (CNAE e data de abertura do CNPJ, georreferência, situação cadastral). Herda a qualidade e o risco de vinculação da fonte usada; registrar fonte e data.
- No trabalho da CGU: é o núcleo das trilhas que cruzam folha, benefícios sociais, óbitos, sócios de empresas e fornecedores. Ferramentas usuais em pesquisa no Brasil (Splink, fastLink, RecordLinkage) aplicam Fellegi-Sunter; a escolha entre regra determinística e probabilística deve vir documentada com a taxa de erro estimada.

**(C) Fontes.** Fellegi e Sunter, "A Theory for Record Linkage", *Journal of the American Statistical Association*, 64(328), 1969, p. 1183-1210; Christen, *Data Matching*, Springer, 2012; Herzog, Scheuren e Winkler, *Data Quality and Record Linkage Techniques*, Springer, 2007; DAMA-DMBOK 2, caps. 10 e 13 (texto pago, conferido por fontes secundárias).

**(D) Como a banca erra o item.**
- *Afirmação errada:* No modelo de Fellegi-Sunter, a concordância em qualquer campo tem o mesmo peso no escore do par, o que torna o método neutro quanto à frequência dos valores. → *Certo:* o peso depende de m e u; concordar num valor raro dá mais evidência que concordar num valor comum.
- *Afirmação errada:* A blocagem aumenta a revocação da vinculação, porque organiza os registros em grupos homogêneos. → *Certo:* a blocagem reduz o custo computacional e pode reduzir a revocação, já que pares verdadeiros em blocos diferentes nunca são comparados.

**(E) Prioridade alta.** É o tema mais próximo do trabalho de cruzamento de bases da CGU, nomeado com quatro técnicas, e base natural da Q2. Sem incidência no catálogo, o que indica espaço novo.

#### E2 · 5.4 — Prioridade média

**(A) Texto original do edital.** Conciliação de fontes.

**(B) O que estudar.**
- Conciliação: confrontar duas ou mais fontes que deveriam concordar e explicar cada diferença. Níveis: contagem de registros, totais de controle (soma de valores, *hash totals*), conferência registro a registro por chave, conferência campo a campo.
- Saída típica: casados e iguais; casados com divergência de valor; presentes só em A; presentes só em B. Cada classe tem causa provável (defasagem temporal, regra de corte diferente, duplicidade, erro de vinculação, tratamento de NULL).
- Em pipeline: conciliar origem × destino após cada carga (contagens e somas por partição) detecta perda e duplicação silenciosas (ligação com E2 3.1 e 4.4).
- Fonte de verdade (*system of record*) e precedência: definir qual fonte prevalece por atributo e registrar por quê. Sem regra, a conciliação vira escolha caso a caso.
- Em SQL: `FULL OUTER JOIN` por chave com classificação por `CASE`, ou `EXCEPT` nos dois sentidos.
- No trabalho da CGU: conferir o valor pago no SIAFI contra o informado pelo órgão no sistema de convênios, ou a folha contra o cadastro de servidores; a diferença não explicada é o achado, e a explicada evita falso achado.

**(C) Fontes.** DAMA-DMBOK 2, caps. 8 (integração) e 13 (qualidade) (texto pago, conferido por fontes secundárias); Reis e Housley, *Fundamentals of Data Engineering*, O'Reilly, 2022 (testes de qualidade em pipeline); IIA, *Normas Globais de Auditoria Interna*, 2024 (evidência suficiente e confiável) ([link](https://www.theiia.org/en/standards/2024-standards/global-internal-audit-standards/)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se os totais de controle de origem e destino coincidem, a carga está correta registro a registro. → *Certo:* totais iguais podem esconder erros que se compensam (registro duplicado e outro perdido de mesmo valor); a conferência por chave é que confirma.

**(E) Prioridade média.** Tema operacional com 1 item provável; o conteúdo conversa com auditoria (P2) e com E2 5.3. Sem incidência.

#### E2 · 5.5 — Prioridade alta

**(A) Texto original do edital.** Riscos de correspondências incorretas entre pessoas ou entidades.

**(B) O que estudar.**
- Dois erros: falso pareamento (duas pessoas diferentes tratadas como uma; falso positivo) e falso não pareamento (a mesma pessoa não reconhecida; falso negativo). Para auditoria que aponta irregularidade, o falso pareamento é o mais grave: imputa a alguém um fato que não é dele.
- Homônimos: nomes comuns ("MARIA DA SILVA", "JOSE DOS SANTOS") se repetem às dezenas de milhares no país. Mesmo nome + data de nascimento ainda colide em população grande (paradoxo do aniversário: com milhares de homônimos, coincidência de data é esperada). Nome da mãe reduz, sem zerar, o risco.
- Outras fontes de erro: CPF digitado errado que pertence a outra pessoa; CPF de responsável lançado no lugar do beneficiário; CPF ou CNPJ sentinela ("00000000000") que casa com todos; filial × matriz de CNPJ (8 primeiros dígitos = raiz); empresas com mesmo nome fantasia; mudança de nome após casamento; transliteração e abreviação; fechamento transitivo em deduplicação; vinculação feita com base desatualizada (CPF cancelado, óbito não registrado).
- Controles: preferir chave forte e validada; exigir concordância em mais de um atributo independente; limiar conservador com faixa de revisão manual; amostra de validação com estimativa de precisão; tratar o resultado como indício, não prova, até confirmação documental; registrar a regra, a versão das bases e a taxa de erro estimada no papel de trabalho; contraditório antes de qualquer consequência.
- Efeito sobre métricas: a taxa de falsos positivos cresce com o tamanho das bases cruzadas mesmo com regra boa (muitos pares candidatos); estimar o erro esperado antes de divulgar o número de "irregulares". Ponte com E3 3.2 (custos de falso positivo e falso negativo) e E3 3.3 (desempenho por grupos: nomes comuns concentram-se em certos grupos sociais).
- Dimensão legal: dado pessoal inexato tratado pelo poder público fere o princípio da qualidade (LGPD, art. 6º, V) e o titular tem direito de correção (art. 18, III).
- No trabalho da CGU: trilhas de acúmulo de cargos, servidores sócios de fornecedores, beneficiários falecidos. Uma lista divulgada com homônimos expõe pessoas inocentes e enfraquece o trabalho inteiro.

**(C) Fontes.** Fellegi e Sunter (1969), citado em E2 5.3; Christen, *Data Matching*, Springer, 2012 (caps. 6 e 7, qualidade da vinculação); Herzog, Scheuren e Winkler, *Data Quality and Record Linkage Techniques*, Springer, 2007; [LGPD, arts. 6º, V, e 18, III](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na ausência de CPF, a coincidência de nome completo e data de nascimento é suficiente para afirmar que dois registros se referem à mesma pessoa. → *Certo:* em bases nacionais essa combinação colide entre homônimos; é preciso atributo adicional independente e validação do resultado.
- *Afirmação errada:* Elevar o limiar de aceitação da vinculação probabilística reduz ao mesmo tempo os falsos pareamentos e os falsos não pareamentos. → *Certo:* há troca: limiar mais alto reduz falsos pareamentos e aumenta os não pareamentos perdidos.

**(E) Prioridade alta.** Redação singular do edital, que descreve risco típico das trilhas da CGU; forte candidato a item de situação e à Q2. Sem incidência no catálogo.

**6 Compartilhamento e proteção**

#### E2 · 6.1 — Prioridade média

**(A) Texto original do edital.** Minimização, segregação de ambientes e privilégios.

**(B) O que estudar.**
- Minimização: princípio da necessidade, LGPD art. 6º, III: "limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos". Na prática: pedir só as colunas e o período necessários; agregar quando o detalhe não for preciso; preferir dado pseudonimizado no ambiente de análise. O Decreto 10.046/2019, art. 3º, IX (incluído pelo Decreto 11.266/2022), aplica o mesmo limite ao compartilhamento entre órgãos.
- Privacidade por padrão: a configuração inicial deve coletar e expor o mínimo; não se justifica coleta ampliada só porque a segurança está ativada (TCU2026-AUFC-TI-139, gabarito E).
- Segregação de ambientes: desenvolvimento, homologação e produção separados; dado de produção com dado pessoal não deve ir para desenvolvimento sem mascaramento ou dado sintético. Separar também ambiente de exploração analítica (*sandbox*) do ambiente que publica resultados.
- Privilégios: menor privilégio; separação de funções (quem desenvolve o pipeline não aprova o próprio acesso a dado sensível); acesso baseado em papéis (RBAC) ou em atributos (ABAC); segurança em nível de linha e de coluna; mascaramento dinâmico; contas de serviço com segredo guardado em cofre; revisão periódica de acessos; registro de acesso.
- No trabalho da CGU: a CGU recebe bases de outros órgãos sob termo de compartilhamento; o auditor de dados deve trabalhar com o recorte necessário à ação de controle e sem copiar o dado bruto para fora do ambiente controlado. Ponte com E4 2.4 (controle de acesso e segredos) e E4 3.3.

**(C) Fontes.** [LGPD, arts. 6º, III, e 46](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm); [Decreto 10.046/2019, art. 3º, IX](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10046.htm); ABNT NBR ISO/IEC 27002:2022 (controles 5.15 controle de acesso, 8.2 direitos de acesso privilegiado, 8.31 separação de ambientes; texto pago, conferido pelo sumário); ABNT NBR ISO/IEC 27701 (gestão de privacidade; texto pago).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Desde que os mecanismos de segurança estejam habilitados, a privacidade por padrão admite configurações iniciais que ampliem a coleta de dados. → *Certo:* privacidade por padrão exige configuração inicial de coleta e exposição mínimas; segurança não compensa coleta excessiva (TCU2026-AUFC-TI-139).

**(E) Prioridade média.** Princípios conhecidos, de 1 item provável; o conteúdo de LGPD se aprofunda em E2 6.5. 1 item Cebraspe (TCU2026-AUFC-TI-139, catalogado em Segurança da Informação).

#### E2 · 6.2 — Prioridade baixa

**(A) Texto original do edital.** Retenção e descarte.

**(B) O que estudar.**
- LGPD, art. 15: término do tratamento quando a finalidade é alcançada, termina o período, o titular comunica (inclusive revogando consentimento, "resguardado o interesse público") ou a ANPD determina.
- LGPD, art. 16: eliminação após o término, com conservação autorizada para: I obrigação legal ou regulatória; II estudo por órgão de pesquisa, "garantida, sempre que possível, a anonimização"; III transferência a terceiro, respeitados os requisitos da lei; IV uso exclusivo do controlador, "vedado seu acesso por terceiro, e desde que anonimizados os dados".
- No setor público, documento de arquivo segue a tabela de temporalidade e o procedimento de eliminação do sistema de arquivos (Lei 8.159/1991 e normas do Conarq); dado de sistema que integra documento não se apaga por decisão técnica isolada.
- Política de retenção: prazo por categoria, gatilho de início, forma de descarte (exclusão lógica × física, sobrescrita, destruição de mídia, eliminação criptográfica pela destruição da chave), cópias de segurança e réplicas incluídas, registro do descarte.
- Tensão com reprodutibilidade (E4 1.4): reter base de análise para refazer o achado × eliminar quando a finalidade acaba. Saída comum: reter versão anonimizada ou só os agregados e o código.
- No trabalho da CGU: bases recebidas para uma ação de controle têm finalidade delimitada; o termo de compartilhamento deve dizer por quanto tempo ficam e como são descartadas.

**(C) Fontes.** [LGPD, arts. 15 e 16](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) (redação conferida no texto compilado do Planalto); [Lei 8.159/1991](https://www.planalto.gov.br/ccivil_03/leis/l8159.htm) (política nacional de arquivos; não conferida nesta pesquisa); NIST SP 800-88 Rev. 2, *Guidelines for Media Sanitization* ([link](https://csrc.nist.gov/pubs/sp/800/88/r2/final)), de 26/9/2025, que substituiu a Rev. 1 (2014).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Encerrado o tratamento, a LGPD permite ao controlador conservar os dados pessoais para seu uso exclusivo, sem outras condições. → *Certo:* o uso exclusivo do controlador só permite a conservação se os dados forem anonimizados e vedado o acesso de terceiros (art. 16, IV).

**(E) Prioridade baixa.** Cabe em dois artigos da LGPD; cobrança provável só como detalhe de E2 6.5. Sem incidência.

#### E2 · 6.3 — Prioridade alta

**(A) Texto original do edital.** Anonimização, pseudonimização e reidentificação.

**(B) O que estudar.**
- LGPD, art. 5º, III: dado anonimizado é o "relativo a titular que não possa ser identificado, considerando a utilização de meios técnicos razoáveis e disponíveis na ocasião de seu tratamento". Art. 5º, XI: anonimização é a "utilização de meios técnicos razoáveis e disponíveis no momento do tratamento, por meio dos quais um dado perde a possibilidade de associação, direta ou indireta, a um indivíduo".
- LGPD, art. 12: dado anonimizado não é dado pessoal, "salvo quando o processo de anonimização ao qual foram submetidos for revertido, utilizando exclusivamente meios próprios, ou quando, com esforços razoáveis, puder ser revertido". § 1º: razoabilidade por fatores objetivos (custo, tempo, tecnologia disponível, uso exclusivo de meios próprios). § 2º: dados usados para perfil comportamental de pessoa identificada podem ser dados pessoais. § 3º: a autoridade nacional pode dispor sobre padrões e técnicas de anonimização.
- LGPD, art. 13, § 4º: pseudonimização é o tratamento pelo qual o dado perde a possibilidade de associação a um indivíduo "senão pelo uso de informação adicional mantida separadamente pelo controlador em ambiente controlado e seguro". A definição está no artigo dos estudos em saúde pública, mas é a única da lei. Dado pseudonimizado continua sendo dado pessoal.
- Diferença central: anonimização é irreversível por meios razoáveis e tira o dado do alcance da LGPD; pseudonimização é reversível por quem tem a chave e só reduz risco.
- Técnicas: supressão, generalização (idade em faixas, CEP com 5 dígitos), mascaramento, perturbação (ruído), troca (*swapping*), agregação, dados sintéticos; *hash* de CPF sem sal é pseudonimização fraca (há só 10⁹ CPFs possíveis, logo o *hash* é quebrado por força bruta); *hash* com chave secreta (HMAC) ou tokenização com tabela guardada à parte são pseudonimização.
- Modelos formais: k-anonimato (cada combinação de quase-identificadores aparece em pelo menos k registros; Sweeney, 2002); l-diversidade (cada grupo tem ao menos l valores distintos do atributo sensível, contra ataque de homogeneidade); t-proximidade (distribuição do sensível no grupo próxima da geral); privacidade diferencial (ruído calibrado por ε; o resultado quase não muda com a presença ou ausência de um indivíduo; Dwork, 2006).
- Classes de atributos: identificadores diretos (CPF, nome), quase-identificadores (data de nascimento, sexo, CEP, município: combinados identificam), atributos sensíveis (saúde, filiação partidária, origem racial; LGPD art. 5º, II).
- Reidentificação: ataque de ligação com base externa por quase-identificadores (Sweeney mostrou que CEP + data de nascimento + sexo identificam a maioria dos norte-americanos); caso Netflix Prize (Narayanan e Shmatikov, 2008); ataques de singularização, ligação e inferência (Grupo do Artigo 29, Parecer 05/2014). O risco cresce com o número de bases públicas disponíveis; anonimização se reavalia no tempo ("na ocasião de seu tratamento").
- Guia da ANPD: minuta de *Guia de Anonimização e Pseudonimização para Proteção de Dados Pessoais* submetida a consulta pública de 30/1/2024 a 28/2/2024 (prorrogação até 14/3/2024 conforme fontes secundárias). Publicação da versão final não confirmada até 13/10/2026. A Lei 15.352/2026 passou a nomear a ANPD como "Agência Nacional de Proteção de Dados" (art. 5º, VIII, conferido no texto compilado).
- No trabalho da CGU: publicar resultado de trilha ou base de estudo sem expor pessoas; avaliar se a base "anonimizada" entregue por terceiro resiste a ligação com o Portal da Transparência. Ponte com E4 3.3.

**(C) Fontes.** [LGPD, arts. 5º, III e XI, 12 e 13](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) (redação conferida no texto compilado do Planalto, com alterações até a Lei 15.352/2026); [ANPD, consulta pública do guia de anonimização e pseudonimização](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-abre-consulta-a-sociedade-sobre-o-guia-de-anonimizacao-e-pseudonimizacao) (versão final não confirmada); ISO/IEC 20889:2018, *Privacy enhancing data de-identification terminology and classification of techniques* (texto pago, conferido pelo sumário); Grupo de Trabalho do Artigo 29, *Parecer 05/2014 sobre técnicas de anonimização*; Sweeney, "k-Anonymity: A Model for Protecting Privacy", 2002; Dwork, "Differential Privacy", ICALP 2006; Narayanan e Shmatikov, "Robust De-anonymization of Large Sparse Datasets", IEEE S&P 2008.

**(D) Como a banca erra o item.**
- *Afirmação errada:* O dado pseudonimizado deixa de ser dado pessoal para os fins da LGPD, pois perde a possibilidade de associação direta ao titular. → *Certo:* a informação adicional mantida pelo controlador permite a reassociação; o dado continua pessoal. Só o anonimizado sai do alcance da lei (art. 12).
- *Afirmação errada:* Substituir o CPF por seu *hash* SHA-256 anonimiza a base. → *Certo:* o espaço de CPFs é pequeno e o *hash* sem chave é revertido por força bruta; trata-se, no máximo, de pseudonimização fraca.

**(E) Prioridade alta.** Definições literais da LGPD, distinção clássica de prova e risco técnico real (reidentificação). Sem item Cebraspe; FGV cobrou classes de identificadores (TCU2022-AUFC-CE-73).

#### E2 · 6.4 — Prioridade média

**(A) Texto original do edital.** Publicação, reutilização e compartilhamento controlados.

**(B) O que estudar.**
- Decreto 10.046/2019 (governança no compartilhamento entre órgãos federais; institui o Cadastro Base do Cidadão e o Comitê Central de Governança de Dados). Art. 4º, três níveis por confidencialidade: amplo (dados públicos sem restrição de acesso, divulgação garantida a qualquer interessado); restrito (dados protegidos por sigilo, acesso a todos os órgãos do art. 1º para execução de políticas públicas, regras simplificadas fixadas pelo Comitê Central); específico (dados sob sigilo, acesso a órgãos determinados, nas hipóteses e fins previstos em lei, regras definidas pelo gestor de dados). A categorização é feita pelo gestor de dados (§ 1º). Compartilhamento amplo dispensa autorização prévia (art. 11).
- Alterações: Decreto 11.266/2022 (incluiu no art. 3º os incisos VII a IX: finalidade, adequação, mínimo necessário; reformulou o Comitê, que passou a ter assento da CGU, art. 22, IV, e duas vagas da sociedade civil) e Decreto 11.574/2023 (ajustes de órgãos). Nenhuma alteração posterior aparece no texto compilado do Planalto consultado em 13/10/2026.
- STF, ADI 6649 e ADPF 695 (julgamento em 15/9/2022): interpretação conforme; compartilhamento exige finalidade legítima, específica e explícita, mínimo necessário, publicidade (LGPD art. 23, I) e observância da LGPD; inconstitucionalidade, com efeitos diferidos, da composição do Comitê Central (art. 22), que motivou o Decreto 11.266/2022 (conforme fontes secundárias; acórdão não lido).
- LGPD, art. 26: uso compartilhado pelo poder público deve atender a finalidades específicas de execução de políticas públicas e atribuição legal, respeitados os princípios do art. 6º.
- LAI (Lei 12.527/2011): informação pessoal é "aquela relacionada à pessoa natural identificada ou identificável" (art. 4º, IV); acesso restrito por até 100 anos a agentes autorizados e ao titular (art. 31, § 1º, I); dispensa de consentimento para estatísticas e pesquisas de interesse público, "sendo vedada a identificação da pessoa" (art. 31, § 3º, II); a restrição não pode ser usada para prejudicar apuração de irregularidades (art. 31, § 4º); acesso parcial com ocultação da parte sigilosa (art. 7º, § 2º); transparência ativa em formatos abertos, estruturados e legíveis por máquina (art. 8º, § 3º, III). A Lei 15.141/2025 incluiu os arts. 8º-A e 8º-B (transparência de remuneração em serviços sociais autônomos e conselhos profissionais).
- Dados abertos: Política de Dados Abertos do Executivo federal (Decreto 8.777/2016) e Planos de Dados Abertos dos órgãos; Lei 14.129/2021 (Governo Digital) trata de dados abertos e interoperabilidade; Decreto 12.198/2024 (Estratégia Federal de Governo Digital 2024-2027 e IND).
- Controles de reutilização: termo de compartilhamento com finalidade, prazo, vedação de repasse; licença de uso em dado aberto; ambiente controlado (*sala segura* ou *trusted research environment*) em que o pesquisador roda código sem baixar o dado; controle de saída (*output checking*) para impedir célula com poucos indivíduos; supressão de células pequenas em tabelas publicadas.
- No trabalho da CGU: a CGU é gestora de bases de compartilhamento amplo (Portal da Transparência) e recebe bases restritas e específicas. Publicar remuneração nominal de servidor é transparência ativa admitida; publicar CPF completo e endereço não é.

**(C) Fontes.** [Decreto 10.046/2019, compilado](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10046.htm) (arts. 3º, 4º, 11 e 22 conferidos); [Lei 12.527/2011](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm) (arts. 4º, 7º, 8º e 31 conferidos); [LGPD, arts. 23 e 26](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm); [Decreto 8.777/2016](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8777.htm) (redação vigente não conferida); [Lei 14.129/2021](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14129.htm) (não conferida nesta pesquisa); [Decreto 12.198/2024](https://www2.camara.leg.br/legin/fed/decret/2024/decreto-12198-24-setembro-2024-796286-publicacaooriginal-173095-pe.html); STF, ADI 6649 e ADPF 695, rel. Min. Gilmar Mendes, j. 15/9/2022 (conforme fontes secundárias).

**(D) Como a banca erra o item.**
- *Afirmação errada:* No compartilhamento restrito previsto no Decreto 10.046/2019, as regras são definidas caso a caso pelo gestor de dados, para órgãos específicos previstos em lei. → *Certo:* essa é a descrição do compartilhamento específico; no restrito, o acesso é dado a todos os órgãos do art. 1º com regras simplificadas fixadas pelo Comitê Central de Governança de Dados.
- *Afirmação errada:* A LAI impede o acesso a informações pessoais de agente público mesmo quando necessárias à apuração de irregularidades em que ele esteja envolvido. → *Certo:* o art. 31, § 4º, proíbe invocar a restrição para prejudicar a apuração.

**(E) Prioridade média.** O Decreto 10.046/2019 e a LAI são legislação em vigor cobrável (edital 14.32) e próximos do trabalho da CGU, mas a cobrança esperada é de 1 ou 2 itens; a parte de LAI pode ser explorada também na P2. Sem incidência Cebraspe neste bloco.

#### E2 · 6.5 — Prioridade alta

**(A) Texto original do edital.** Proteção de dados pessoais e equilíbrio entre utilidade analítica, abertura e proteção de pessoas.

**(B) O que estudar.**
- LGPD, art. 6º: boa-fé e dez princípios: finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação, responsabilização e prestação de contas. Saber a definição curta de cada um e não confundir necessidade (mínimo necessário) com adequação (compatibilidade com a finalidade informada).
- Poder público: tratamento para atender sua finalidade pública, na persecução do interesse público, com o objetivo de executar competências legais (art. 23, caput), com publicidade das hipóteses de tratamento (art. 23, I); base legal típica é execução de políticas públicas ou cumprimento de obrigação legal (art. 7º, II e III; art. 11, II, "a" e "b" para sensíveis), não o consentimento. Uso compartilhado: art. 26. Relatório de impacto pode ser exigido pela ANPD (art. 32 para o poder público; art. 38).
- Pesquisa: art. 7º, IV e art. 11, II, "c" (órgão de pesquisa, com anonimização sempre que possível); art. 13 para saúde pública (ambiente controlado, sem revelar dado pessoal na divulgação, sem transferência a terceiro).
- Equilíbrio utilidade × proteção: toda técnica de proteção reduz utilidade (generalização apaga detalhe, ruído enviesa contagem pequena, supressão cria ausência não aleatória). Escolher pelo uso: análise interna em ambiente controlado com pseudonimização; publicação agregada com supressão de células pequenas ou privacidade diferencial; base aberta só com anonimização avaliada contra ligação. Avaliar risco de reidentificação e utilidade residual lado a lado.
- Abertura × proteção: a LAI torna regra a publicidade e a LGPD não a revoga; dados de remuneração e despesas públicas nominais são publicados por interesse público, com ocultação de identificadores desnecessários (CPF parcialmente mascarado no Portal da Transparência é exemplo de prática; conferir o padrão vigente).
- Relação com IA: dado pessoal usado para treinar ou alimentar modelo segue os mesmos princípios; finalidade e minimização limitam reaproveitamento de base para outro fim. Ponte com E4 3.3 e E4 3.4 (uso fora da finalidade).
- No trabalho da CGU: a Q2 pode pedir que se proponha o desenho de uma análise que cruze bases com dados pessoais e publique resultado: base legal, minimização, pseudonimização no ambiente de trabalho, controle de acesso, critério de publicação, revisão humana dos casos, prazo de retenção.

**(C) Fontes.** [LGPD, arts. 6º, 7º, 11, 23, 26, 32 e 38](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) (arts. 5º, 6º, 12, 13, 15, 16, 23 e 26 conferidos no compilado; demais conforme conhecimento prévio); [Lei 12.527/2011, art. 31](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm); ANPD, *Guia orientativo: tratamento de dados pessoais pelo Poder Público* ([página de guias da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes); versão vigente não conferida); OCDE, *Recommendation of the Council concerning Guidelines Governing the Protection of Privacy and Transborder Flows of Personal Data*, revisão de 2013 ([link](https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0188)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* O tratamento de dados pessoais por órgão público para execução de políticas públicas depende do consentimento do titular. → *Certo:* a LGPD prevê base legal própria para a execução de políticas públicas (art. 7º, III) e para o cumprimento de obrigação legal; consentimento não é a base típica do poder público.
- *Afirmação errada:* Pelo princípio da adequação, o tratamento deve limitar-se ao mínimo necessário para a finalidade. → *Certo:* esse é o princípio da necessidade (art. 6º, III); adequação é a compatibilidade do tratamento com as finalidades informadas (art. 6º, II).

**(E) Prioridade alta.** Fecha o bloco com a LGPD, legislação em vigor de cobrança quase certa, e descreve exatamente o dilema de uma discursiva sobre cruzamento e publicação de dados. Sem item Cebraspe no bloco (1 FGV: TCU2022-AUFC-CE-73).

### E3 Aprendizado de máquina e inteligência artificial

**Visão geral.** A disciplina vai do modelo clássico (tópicos 1 a 3) às redes neurais (4), à linguagem natural e aos modelos generativos (5) e aos agentes com ferramentas (6). O fio que amarra os seis tópicos não é o algoritmo, é o juízo sobre o modelo: o edital pede "comparação com soluções simples", "adequação ao uso pretendido", "efeitos das decisões", "limites de escores", "limites de autonomia". É a pergunta de quem audita um modelo, não de quem o constrói. Espere itens C/E que trocam um conceito pelo vizinho (supervisionado × reforço, precisão × sensibilidade, explicabilidade × interpretabilidade), contas curtas de matriz de confusão e situações em que um modelo foi validado do jeito errado. A disciplina conversa com E1 (vazamento e desbalanceamento em E1 5.1, causalidade e seleção em E1 3.2, incerteza em E1 2.2) e com E4, que recebe o modelo pronto: monitoramento de deriva (E4 1.6), revisão humana e contestação (E4 3.2), discriminação (E4 3.4) e limites da automação (E4 3.5). Os tópicos 3, 5 e 6 têm o perfil da Q2 da discursiva.

**Estratégia:**
- Estude 2 e 3 como um bloco só: como se separa o dado, como se mede e o que a medida autoriza a decidir. Faça à mão, com papel, uma matriz de confusão completa (precisão, sensibilidade, especificidade, F1, acurácia) até sair em dois minutos; FGV e Cebraspe já cobraram a conta.
- Para 3.3 a 3.5 e 6.2 a 6.4, prepare argumentos prontos para a discursiva: viés de seleção nos rótulos, ciclo de retroalimentação, revisão humana, rastreabilidade e autorização de ferramentas. Leia junto com E4 3.
- Tópico 4 é "em nível conceitual e de interpretação de resultados": saber ler curva de perda de treino × validação, reconhecer sobreajuste e escolher a correção (parada antecipada, dropout, regularização) vale mais que derivar a retropropagação.
- Tópicos 5 e 6 são a parte nova do edital (LLM, recuperação de informação para geração de respostas, injeção de instruções, agentes). Os guias de IA generativa da CGU (2025) e do TCU (2024) mostram como os órgãos de controle tratam o tema e são fonte provável de situação-problema.
- Na véspera, revise só a tabela de distinções da seção de método e as afirmações erradas de cada subitem: o Cebraspe erra o item trocando um termo.

**Mapa rápido**

| Item | Tema (início do texto do edital) | Prioridade | Incidência Cebraspe |
|---|---|---|---|
| 1.1 | Aprendizado supervisionado e não supervisionado; noções e limites… | Média | 2 (TCU2026-AUFC-TI-174, 175) |
| 1.2 | Regressão, classificação, agrupamento, redução de dimensionalidade… | Alta | 4 genéricos de mineração (TCU2015-BAS-82 a 85); FGV 4 |
| 2.1 | Separação de treino, validação e teste | Média | 1 (TCU2026-AUFC-TI-176); FGV 2 |
| 2.2 | Validação cruzada e temporal | Média | 0 |
| 2.3 | Vazamento de informação | Alta | 0 |
| 2.4 | Viés e variância | Média | 0; FGV 1 |
| 2.5 | Generalização e estabilidade dos resultados | Baixa | 0 |
| 2.6 | Comparação de modelos e adequação ao uso pretendido | Média | 0 |
| 3.1 | Precisão, sensibilidade, especificidade, calibração e métricas de regressão | Alta | 0; FGV 1 |
| 3.2 | Custos dos falsos positivos e falsos negativos | Média | 0 |
| 3.3 | Desempenho por grupos, discriminação e incerteza | Alta | 1 (TCU2026-AUFC-TI-164) |
| 3.4 | Explicabilidade e interpretabilidade | Alta | 2 (TCU2026-AUFC-TI-163; 165 anulado) |
| 3.5 | Limites do uso de escores para priorização e tomada de decisão | Alta | 0 |
| 4.1 | Perceptron e redes multicamadas | Média | 0 (1 item FGV: TCU2022-AUFC-CE-67) |
| 4.2 | Funções de ativação e perda, otimização, retropropagação… | Média | 0 |
| 4.3 | Redes convolucionais, recorrentes e transformers | Média | 1 (TCU2026-AUFC-TI-168, indireto) |
| 4.4 | Adequação ao tipo de dado, custo, limitações e alternativas | Média | 0 |
| 4.5 | Transferência de aprendizado e ajuste de modelos | Baixa | 0 |
| 5.1 | Pré-processamento e classificação de textos | Alta | 2 (TCU2026-AUFC-TI-167, 168) |
| 5.2 | Representações vetoriais, embeddings e similaridade semântica | Alta | 1 (TCU2026-AUFC-TI-170) |
| 5.3 | Modelos de linguagem e LLMs | Média | 1 (TCU2026-AUFC-TI-168) |
| 5.4 | Prompts, recuperação de informação para geração de respostas… | Alta | 0 |
| 5.5 | Avaliação de respostas, fontes, alucinações e limitações | Alta | 0 (3 itens vizinhos de ética: TCU2026-AUFC-TI-163 a 165) |
| 6.1 | Agentes de IA e integração com ferramentas e fontes | Média | 2 (TCU2026-AUFC-TI-166, 169, sistemas multiagentes) |
| 6.2 | Autorização, rastreabilidade e supervisão | Alta | 0 |
| 6.3 | Proteção contra instruções maliciosas em conteúdo externo… | Alta | 0 |
| 6.4 | Avaliação dos resultados e limites de autonomia | Média | 0 |

**1 Seleção e construção de modelos**

#### E3 · 1.1 — Prioridade média

**(A) Texto original do edital.** Aprendizado supervisionado e não supervisionado; noções e limites de abordagens semissupervisionadas e por reforço.

**(B) O que estudar.**
- Supervisionado: aprende f(x) → y a partir de exemplos rotulados. Classificação (y categórico) e regressão (y numérico). O rótulo define o que o modelo aprende; rótulo ruim, modelo ruim.
- Não supervisionado: sem rótulo; busca estrutura nos dados. Agrupamento, redução de dimensionalidade, detecção de anomalias, regras de associação. Não há "acerto" objetivo; a validação é interna (silhueta, inércia) ou por especialista.
- Semissupervisionado: poucos rótulos e muitos dados sem rótulo. Técnicas: autotreinamento (pseudorrótulos), propagação de rótulos, coaprendizado. Só ajuda se valerem as hipóteses de suavidade, de agrupamento ou de variedade (pontos próximos têm o mesmo rótulo). Limites: se as hipóteses falham, os dados sem rótulo pioram o modelo; o autotreinamento reforça os próprios erros (viés de confirmação); se os poucos rótulos não são amostra aleatória, o viés se propaga.
- Autossupervisionado (base dos LLMs, E3 5.3): o rótulo sai do próprio dado (prever a palavra seguinte). Não confundir com semissupervisionado.
- Reforço: agente, ambiente, estado, ação, recompensa, política. O agente aprende por tentativa e erro, maximizando recompensa acumulada (com desconto). Formalização: processo de decisão de Markov. Conceitos: exploração × aproveitamento, função de valor, Q-learning. O sinal é avaliativo (quão boa foi a ação), não instrutivo (qual era a ação certa): é a diferença para o supervisionado, cobrada em TCU2026-AUFC-TI-175.
- Limites do reforço: exige muita interação ou um simulador; recompensa mal especificada é explorada pelo agente ("reward hacking"); difícil de auditar; aprender em produção significa errar com gente de verdade. Com dados históricos fixos, o mais próximo é bandido contextual ou aprendizado por reforço offline, ainda frágeis.
- Rótulo não é dado da natureza: em auditoria, o rótulo "irregular" só existe para o que foi auditado. Isso vira problema de seleção (E3 3.5).
- No trabalho da CGU: classificar processos com histórico de achados é supervisionado; agrupar municípios ou fornecedores por perfil de gasto é não supervisionado; com poucos casos confirmados de fraude, a tentação é o semissupervisionado, e a cautela é o viés dos rótulos que existem.

**(C) Fontes.** James, Witten, Hastie, Tibshirani e Taylor, *An Introduction to Statistical Learning with Applications in Python* (Springer, 2023), cap. 1, 2 e 12 ([statlearning.com](https://www.statlearning.com/)); Hastie, Tibshirani e Friedman, *The Elements of Statistical Learning*, 2ª ed. (Springer, 2009), cap. 14; Géron, *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow*, 3ª ed. (O'Reilly, 2022), cap. 1 e 18; Sutton e Barto, *Reinforcement Learning: An Introduction*, 2ª ed. (MIT Press, 2018), cap. 1 e 3 ([incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* O aprendizado por reforço é uma forma de aprendizado não supervisionado, porque busca padrões ocultos sem rótulos, e a recompensa é critério secundário. → *Certo:* Reforço é um terceiro paradigma; a recompensa é o objetivo central, e o agente aprende uma política de ações, não grupos (TCU2026-AUFC-TI-174, gabarito E).
- *Afirmação errada:* Acrescentar dados não rotulados a um modelo semissupervisionado sempre melhora o desempenho. → *Certo:* Só melhora se as hipóteses sobre a estrutura dos dados valerem; caso contrário pode piorar.

**(E) Prioridade média.** Conceito de definição, rápido de estudar, mas o Cebraspe já o cobrou: 2 itens Cebraspe (TCU2026-AUFC-TI-174 e 175) e 1 FGV (CGU2022-AFFC-TI-41). O texto "noções e limites" limita a profundidade.

#### E3 · 1.2 — Prioridade alta

**(A) Texto original do edital.** Regressão, classificação, agrupamento, redução de dimensionalidade e detecção de anomalias; regularização, ensembles, sobreajuste e subajuste; comparação com soluções simples.

**(B) O que estudar.**
- Regressão: linear (mínimos quadrados), com interação e termos polinomiais; árvores de regressão. Classificação: regressão logística (saída é probabilidade), k vizinhos mais próximos, Naive Bayes, árvores de decisão (critério Gini ou entropia), SVM (hiperparâmetros C e gama/sigma), redes neurais.
- Agrupamento: k-médias (k fixado antes, grupos esféricos, sensível a escala e a outliers, depende da inicialização); hierárquico (dendrograma, ligação simples, completa, média, Ward); DBSCAN (densidade, acha formas arbitrárias e marca ruído, não precisa de k). Escolha de k: cotovelo, silhueta.
- Redução de dimensionalidade: PCA (combinações lineares ortogonais que maximizam variância; padronizar antes; não usa o rótulo); t-SNE e UMAP só para visualização, distâncias globais não são confiáveis. Seleção de atributos (escolhe colunas) × extração (cria novas).
- Detecção de anomalias: estatística (escore z, intervalo interquartil, lei de Benford em valores contábeis), floresta de isolamento (anomalia é isolada com poucos cortes), LOF (densidade local), SVM de uma classe, autoencoder (erro de reconstrução). Anomalia não é irregularidade: é indício que precisa de verificação.
- Regularização: penaliza complexidade. Ridge (L2, encolhe coeficientes, não zera), Lasso (L1, zera coeficientes, faz seleção de atributos), elastic net (mistura). Exige atributos padronizados. Em árvores: profundidade máxima, folhas mínimas, poda. Em redes: dropout, parada antecipada.
- Ensembles: bagging (amostras bootstrap, média dos votos, reduz variância; floresta aleatória acrescenta sorteio de atributos); boosting (modelos fracos em sequência, cada um corrige o erro do anterior, reduz viés; AdaBoost, gradient boosting, XGBoost, LightGBM); stacking (um metamodelo combina as saídas).
- Sobreajuste: erro de treino baixo e de teste alto; o modelo decorou ruído. Subajuste: erro alto nos dois; modelo simples demais. Correções: sobreajuste pede mais dados, regularização, modelo mais simples; subajuste pede modelo mais flexível ou atributos melhores.
- Comparação com soluções simples: todo modelo precisa de uma linha de base. Classe majoritária, média histórica, regra de negócio usada hoje, regressão logística. Se o gradient boosting ganha 0,01 de AUC sobre a regra atual, o custo de opacidade e manutenção talvez não se pague.
- No trabalho da CGU: floresta de isolamento sobre notas fiscais e pagamentos, agrupamento de fornecedores com padrão de lance parecido, regressão para preço de referência, e a pergunta obrigatória ao avaliar modelo de terceiro: "quanto ele ganha da regra que já usamos?".

**(C) Fontes.** James et al., *An Introduction to Statistical Learning*, 2ª ed. (Springer, 2021) e edição em Python (2023), cap. 3, 4, 6, 8 e 12; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., cap. 3, 10, 14, 15 e 16 ([hastie.su.domains/ElemStatLearn](https://hastie.su.domains/ElemStatLearn/)); Géron, *Hands-On Machine Learning*, 3ª ed., cap. 4 a 9.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Bagging reduz principalmente o viés do modelo, e boosting reduz principalmente a variância. → *Certo:* É o contrário: bagging reduz variância; boosting reduz viés (e pode sobreajustar se houver iterações demais).
- *Afirmação errada:* A regressão Lasso encolhe os coeficientes sem nunca anulá-los, por isso não serve para seleção de atributos. → *Certo:* Isso descreve a Ridge (L2). A Lasso (L1) zera coeficientes e faz seleção.

**(E) Prioridade alta.** Núcleo técnico da disciplina e base para quase todo o resto. Cebraspe: 4 itens genéricos de mineração de dados (TCU2015-BAS-82 a 85); FGV: 4 (CGU2022-AFFC-TI-41, CGU2022-AFFC-TI-47, TCU2022-AUFC-CE-65 e 66).

**2 Validação e generalização**

#### E3 · 2.1 — Prioridade média

**(A) Texto original do edital.** Separação de treino, validação e teste.

**(B) O que estudar.**
- Treino: ajusta os parâmetros. Validação: escolhe hiperparâmetros e modelo. Teste: estimativa final, usada uma vez, no fim. Usar o teste para escolher qualquer coisa contamina a estimativa (ela fica otimista).
- Proporções comuns (60/20/20, 70/15/15, 80/20 com validação cruzada no treino) não são regra. Com poucos dados, prefira validação cruzada dentro do treino e teste separado.
- Estratificação: preserva a proporção das classes em cada parte; essencial com classe rara.
- Separação por grupo: todos os registros de uma mesma entidade (CNPJ, município, servidor) ficam do mesmo lado. Senão o modelo reconhece a entidade, não o padrão.
- Separação temporal: quando o modelo vai prever o futuro, o teste deve ser posterior ao treino (E3 2.2).
- O erro de treino não estima o desempenho real (TCU2026-AUFC-TI-176).
- Toda transformação aprendida dos dados (média para imputar, escala, codificação por alvo, sobreamostragem) é ajustada só no treino e aplicada às outras partes (E3 2.3, E1 5.1).
- No trabalho da CGU: ao receber um modelo de fornecedor, pedir o desenho da separação (aleatória, por entidade, por data) e o desempenho no teste, não no treino. Se o teste veio do mesmo período e dos mesmos órgãos do treino, a métrica não diz nada sobre o ano que vem.

**(C) Fontes.** James et al., *ISL*, 2ª ed. e *ISLP* (2023), cap. 5; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 7.2; Géron, *Hands-On Machine Learning*, 3ª ed., cap. 1 e 2.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Modelos preditivos dispensam validação em conjunto separado, porque a acurácia no treino já representa a capacidade de prever eventos futuros. → *Certo:* O erro de treino é otimista; a capacidade de generalizar só se estima em dados não vistos (TCU2026-AUFC-TI-176, gabarito E).
- *Afirmação errada:* O conjunto de validação e o de teste têm a mesma função e podem ser usados de forma intercambiável. → *Certo:* A validação orienta escolhas; o teste só mede, uma vez, no fim.

**(E) Prioridade média.** Conceito básico e já cobrado: 1 item Cebraspe (TCU2026-AUFC-TI-176) e 2 FGV (TCU2022-AUFC-CE-68 e 75). A parte que gera item difícil está em 2.2 e 2.3.

#### E3 · 2.2 — Prioridade média

**(A) Texto original do edital.** Validação cruzada e temporal.

**(B) O que estudar.**
- k-fold: divide em k partes; treina em k−1 e avalia na restante, k vezes; reporta média e desvio. k = 5 ou 10 é o usual. Leave-one-out: k = n, viés baixo, variância alta e custo alto.
- Variações: estratificada (proporção de classes), por grupo (GroupKFold: entidade inteira num só lado), repetida (vários sorteios), aninhada (laço interno escolhe hiperparâmetros, laço externo estima o erro; sem ela, escolher e medir no mesmo laço superestima o desempenho).
- Validação temporal: o treino vem sempre antes do teste. Janela expansiva (treino cresce) ou deslizante (treino de tamanho fixo). Intervalo (gap) entre treino e teste quando o rótulo demora a amadurecer ou há autocorrelação. Também chamada de backtesting ou walk-forward.
- Por que embaralhar é errado com tempo: o modelo vê o "futuro" no treino, aprende padrões que ainda não existiam e a métrica fica otimista. É vazamento temporal (E3 2.3).
- Rótulo que amadurece: uma irregularidade de 2025 pode só virar achado em 2027. O teste do período mais recente tem rótulos incompletos; é preciso cortar a janela pelo tempo de maturação.
- Exemplo que roda (scikit-learn): pré-processamento dentro do pipeline e divisão temporal com intervalo.

```python
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import TimeSeriesSplit, cross_val_score

rng = np.random.default_rng(0)
X = rng.normal(size=(500, 4))          # linhas já ordenadas por data
y = (X[:, 0] + rng.normal(size=500) > 1).astype(int)

modelo = make_pipeline(StandardScaler(), LogisticRegression())
cv = TimeSeriesSplit(n_splits=5, gap=10)   # treino sempre antes do teste
print(cross_val_score(modelo, X, y, cv=cv, scoring="average_precision").round(2))
```

- No trabalho da CGU: prever risco em contratos, convênios ou benefícios é sempre prever o futuro com o passado. Um modelo de risco de fraude validado com k-fold embaralhado sobre cinco anos de contratos tem métrica inflada. Ligação direta com E1 5.1 (prevenção de vazamento na preparação).

**(C) Fontes.** James et al., *ISL*, 2ª ed. e *ISLP*, cap. 5; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 7.10 (inclui o "jeito errado e o jeito certo" de fazer validação cruzada com seleção de atributos); Hyndman e Athanasopoulos, *Forecasting: Principles and Practice*, 3ª ed., seção 5.10 ([otexts.com/fpp3](https://otexts.com/fpp3/)); documentação do scikit-learn, "Cross-validation" ([scikit-learn.org](https://scikit-learn.org/stable/modules/cross_validation.html)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em séries temporais, a validação cruzada k-fold com embaralhamento é a mais indicada, por usar todos os dados para treino e teste. → *Certo:* Embaralhar coloca o futuro no treino; usa-se divisão temporal, com o teste sempre posterior ao treino.
- *Afirmação errada:* Selecionar os atributos mais correlacionados com o alvo na base inteira e depois rodar validação cruzada dá estimativa não viesada. → *Certo:* A seleção tem de ser refeita dentro de cada dobra; feita antes, vaza informação do teste (ESL, seção 7.10.2).

**(E) Prioridade média.** Sem incidência no catálogo, mas a parte temporal é decisiva para o trabalho da CGU e alimenta 2.3 (alta); estude as duas juntas.

#### E3 · 2.3 — Prioridade alta

**(A) Texto original do edital.** Vazamento de informação.

**(B) O que estudar.**
- Vazamento: o modelo usa no treino informação que não estará disponível na hora da previsão. Resultado: desempenho ótimo na validação e fracasso em produção.
- Vazamento de alvo: atributo que é consequência do rótulo ou registrado depois dele. Exemplos: "valor da multa aplicada" para prever irregularidade; "data de instauração do processo" para prever se haverá processo; "situação = cancelado" para prever cancelamento.
- Contaminação treino-teste: imputação, padronização, seleção de atributos, codificação por alvo (target encoding) ou sobreamostragem (SMOTE) ajustadas na base inteira antes de dividir. Solução: tudo dentro de um pipeline ajustado só no treino de cada dobra.
- Vazamento por duplicata ou por entidade: o mesmo registro (ou o mesmo CNPJ) aparece no treino e no teste. Solução: deduplicar antes (E2 5.3) e separar por grupo.
- Vazamento temporal: dado futuro no treino; atributo agregado com janela que inclui o futuro (média móvel centrada, "total de contratos do fornecedor no ano" calculado com o ano inteiro).
- Sinais de alarme: desempenho bom demais (AUC 0,99 em problema difícil), um atributo com importância muito acima dos outros, queda brusca entre validação e produção.
- Teste prático: para cada atributo, perguntar "eu saberia este valor no momento em que o modelo tem de decidir?".
- No trabalho da CGU: ao avaliar modelo de seleção de amostra para auditoria, conferir se algum atributo vem do próprio resultado de auditorias passadas (nota de risco atribuída depois da fiscalização, código de achado). Ligação com E1 5.1, que pede a "prevenção de vazamento de informação na preparação dos dados".

**(C) Fontes.** Kaufman, Rosset, Perlich e Stitelman, "Leakage in Data Mining: Formulation, Detection, and Avoidance", *ACM Transactions on Knowledge Discovery from Data* 6(4), 2012; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 7.10.2; Géron, *Hands-On Machine Learning*, 3ª ed., cap. 2 (pipelines); documentação do scikit-learn, "Common pitfalls and recommended practices" ([scikit-learn.org](https://scikit-learn.org/stable/common_pitfalls.html)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Padronizar os atributos com média e desvio da base completa antes de separar treino e teste não afeta a avaliação, pois a padronização não usa o rótulo. → *Certo:* Mesmo sem o rótulo, as estatísticas do teste entram no treino; o correto é ajustar o padronizador só no treino.
- *Afirmação errada:* Um atributo com importância muito superior aos demais indica que o modelo encontrou o melhor preditor e deve ser mantido. → *Certo:* É sinal clássico de vazamento de alvo; tem de ser verificado antes.

**(E) Prioridade alta.** Repetido em dois blocos (E1 5.1 e E3 2.3), erro frequente em modelo de terceiro e ótimo material para item C/E de situação. Sem incidência no catálogo.

#### E3 · 2.4 — Prioridade média

**(A) Texto original do edital.** Viés e variância.

**(B) O que estudar.**
- Decomposição do erro quadrático esperado num ponto: E[(y − f̂(x))²] = viés[f̂(x)]² + Var[f̂(x)] + σ². O último termo é o erro irredutível (ruído).
- Viés: erro sistemático por hipótese simples demais (reta para relação curva). Variância: sensibilidade do modelo à amostra de treino (árvore profunda muda muito com outra amostra).
- Compromisso: mais flexibilidade reduz viés e aumenta variância. Curva do erro de teste em U contra a complexidade.
- Diagnóstico pela curva de aprendizado: viés alto = erro de treino e de validação altos e próximos (subajuste); variância alta = treino baixo, validação alta, grande distância entre eles (sobreajuste). Mais dados ajudam a variância, não o viés.
- Ferramentas: regularização e bagging reduzem variância; boosting e atributos melhores reduzem viés; k pequeno no k-NN = variância alta.
- Não confundir com viés no sentido de equidade (E3 3.3) nem com viés de seleção (E1 3.2). A banca usa a palavra nos três sentidos.
- Nota: em redes muito grandes observa-se a "dupla descida" (o erro de teste volta a cair depois do ponto de interpolação); é contexto, não contradiz a decomposição.
- No trabalho da CGU: um modelo de risco que acerta 99% no treino e 70% no teste de outro órgão está com variância alta; pedir regularização ou modelo mais simples antes de pedir mais complexidade.

**(C) Fontes.** James et al., *ISL*, 2ª ed. e *ISLP*, seção 2.2.2; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seções 2.9 e 7.3; Géron, *Hands-On Machine Learning*, 3ª ed., cap. 4 (curvas de aprendizado).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se o erro de treino e o de validação são ambos altos e próximos, o modelo tem variância alta, e a solução é coletar mais dados. → *Certo:* É viés alto (subajuste); mais dados pouco ajudam; aumenta-se a flexibilidade do modelo ou melhoram-se os atributos.
- *Afirmação errada:* Com modelo suficientemente complexo é possível zerar o erro de teste. → *Certo:* O erro irredutível σ² permanece qualquer que seja o modelo.

**(E) Prioridade média.** Clássico de prova, 1 item FGV (CGU2022-AFFC-TI-44), mas curto: domina-se com a fórmula e a leitura das curvas.

#### E3 · 2.5 — Prioridade baixa

**(A) Texto original do edital.** Generalização e estabilidade dos resultados.

**(B) O que estudar.**
- Generalização: desempenho em dados novos da mesma distribuição. Generalizar para outra população, outro órgão ou outro período é outra pergunta (validade externa, mudança de distribuição).
- Estabilidade: o resultado se mantém se mudarem a semente aleatória, a amostra de treino (bootstrap), a dobra da validação cruzada, um hiperparâmetro próximo? Reportar média e desvio entre dobras ou intervalo por bootstrap, não um número só.
- Estabilidade das explicações: importância de atributos e lista dos "mais arriscados" também podem mudar muito entre execuções. Se o top 100 da lista de fiscalização troca metade dos nomes com outra semente, a lista não sustenta decisão individual.
- Efeito Rashomon: vários modelos com desempenho quase igual dão previsões e explicações diferentes para o mesmo caso.
- Mudança de distribuição: deriva de covariáveis (muda P(x)), de rótulo (muda P(y)) e de conceito (muda P(y|x)). O monitoramento é E4 1.6.
- No trabalho da CGU: modelo treinado com convênios de 2019 a 2022 pode não valer depois de mudança de regra de transferência; pedir desempenho por ano e reavaliação periódica.

**(C) Fontes.** Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., cap. 7 e seção 8.7 (bagging e estabilidade); Breiman, "Statistical Modeling: The Two Cultures", *Statistical Science* 16(3), 2001 (efeito Rashomon); Molnar, *Interpretable Machine Learning*, 3ª ed. (2025) ([christophm.github.io](https://christophm.github.io/interpretable-ml-book/)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se dois modelos têm a mesma acurácia no teste, eles produzem as mesmas previsões para cada caso e as mesmas explicações. → *Certo:* Desempenho agregado igual não implica previsões nem explicações iguais (efeito Rashomon).

**(E) Prioridade baixa.** Tema genérico, sem incidência, e a essência está em 2.2, 2.4 e E4 1.6.

#### E3 · 2.6 — Prioridade média

**(A) Texto original do edital.** Comparação de modelos e adequação ao uso pretendido.

**(B) O que estudar.**
- Comparar no mesmo teste, com a mesma separação e a mesma métrica, escolhida pelo uso (E3 3.1 e 3.2), sempre contra uma linha de base simples (E3 1.2).
- Diferença real ou acaso: intervalo de confiança por bootstrap da diferença; teste de McNemar para dois classificadores no mesmo teste; teste t corrigido para validação cruzada (as dobras não são independentes, o t comum é otimista).
- Critérios além da métrica: custo de operação, latência, interpretabilidade exigida, estabilidade, desempenho por grupo (E3 3.3), facilidade de monitorar e de contestar.
- Adequação ao uso pretendido: o modelo foi validado para a população, o período e a decisão em que será usado? Um modelo de triagem (sugere o que olhar) pode ser aceitável onde um modelo de decisão automática (nega um benefício) não é. Mesma métrica, usos diferentes, exigências diferentes.
- Critério de seleção por parcimônia: regra de um desvio-padrão (escolher o modelo mais simples dentro de um erro-padrão do melhor).
- O NIST AI RMF 1.0 trata isso como característica "válido e confiável" e liga a validação ao contexto de uso (função Map); a Recomendação da OCDE pede robustez e segurança ao longo do ciclo de vida.
- No trabalho da CGU: em contratação de solução de IA, o critério de aceite deve dizer métrica, base de teste, linha de base e uso (E4 5.5 e 5.6). "Acurácia de 95%" sem isso não é critério verificável.

**(C) Fontes.** NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, jan. 2023, seção 3.1 e função Map ([doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1)); OCDE, *Recommendation of the Council on Artificial Intelligence*, OECD/LEGAL/0449, adotada em 2019 e revisada em 2023 e em 3 maio 2024, princípio 1.4 ([legalinstruments.oecd.org](https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449)); Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 7.10 (regra de um desvio-padrão); Dietterich, "Approximate Statistical Tests for Comparing Supervised Classification Learning Algorithms", *Neural Computation* 10(7), 1998; Nadeau e Bengio, "Inference for the Generalization Error", *Machine Learning* 52, 2003.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Entre dois modelos, deve-se escolher sempre o de maior métrica no teste, pois a diferença, por menor que seja, reflete superioridade. → *Certo:* Diferenças pequenas podem ser ruído amostral; testa-se a significância e pesam-se custo, interpretabilidade e adequação ao uso.
- *Afirmação errada:* Um modelo validado com bom desempenho pode ser usado em qualquer finalidade correlata sem nova validação. → *Certo:* A validação vale para a população, o período e a decisão em que foi feita; uso novo pede validação nova.

**(E) Prioridade média.** Sem incidência, mas sustenta argumentos de discursiva sobre contratação e aceite de modelos; cobrança esperada de 1 ou 2 itens.

**3 Métricas e efeitos das decisões**

#### E3 · 3.1 — Prioridade alta

**(A) Texto original do edital.** Precisão, sensibilidade, especificidade, calibração e métricas de regressão.

**(B) O que estudar.**
- Matriz de confusão: VP (positivo previsto e real), FP (alarme falso, erro tipo I), FN (caso perdido, erro tipo II), VN.
- Precisão = VP / (VP + FP): dos que o modelo apontou, quantos eram mesmo positivos. Também valor preditivo positivo.
- Sensibilidade (recall, revocação, taxa de verdadeiros positivos) = VP / (VP + FN): dos positivos reais, quantos o modelo achou.
- Especificidade = VN / (VN + FP): dos negativos reais, quantos o modelo deixou passar corretamente. Taxa de falsos positivos = 1 − especificidade.
- Acurácia = (VP + VN) / total. F1 = 2 · precisão · sensibilidade / (precisão + sensibilidade), média harmônica, ignora VN. Fβ dá peso β à sensibilidade.
- "Precisão" no edital é precision. Não confundir com acurácia nem com o sentido coloquial de "exatidão".
- Exemplo calculado e conferido: 1.000 contratos, 100 irregulares (prevalência 10%). O modelo aponta 120; acerta 60.

| | Irregular real | Regular real | Total |
|---|---|---|---|
| Apontado irregular | VP = 60 | FP = 60 | 120 |
| Apontado regular | FN = 40 | VN = 840 | 880 |
| Total | 100 | 900 | 1.000 |

  - Precisão = 60/120 = 0,50. Sensibilidade = 60/100 = 0,60. Especificidade = 840/900 ≈ 0,933. Taxa de falsos positivos = 60/900 ≈ 0,067.
  - Acurácia = (60 + 840)/1.000 = 0,90. F1 = 2 · 0,5 · 0,6 / 1,1 ≈ 0,545. Acurácia balanceada = (0,60 + 0,933)/2 ≈ 0,767.
  - Lição: um "modelo" que declara todos regulares também tem acurácia 0,90 e sensibilidade zero. Com classe rara, acurácia não informa.
- Curva ROC: sensibilidade × taxa de falsos positivos para todos os limiares. AUC-ROC = probabilidade de um positivo sorteado receber escore maior que um negativo sorteado; 0,5 é acaso. Não depende da prevalência, e é por isso que engana com classe rara: com 1% de positivos, uma taxa de falsos positivos de 5% gera cinco alarmes falsos para cada positivo verdadeiro, e a AUC continua bonita.
- Curva precisão-sensibilidade (PR) e precisão média (average precision): a linha de base é a prevalência, não 0,5. É a curva informativa quando a classe positiva é rara e o que importa é a qualidade da lista de apontados. Na prática de fiscalização: precisão no topo k (dos k casos que cabem na capacidade de auditoria, quantos acertam).
- Calibração: um escore é calibrado se, entre os casos com escore 0,2, cerca de 20% são positivos. Curva de confiabilidade: agrupar por faixa de escore e plotar média prevista × frequência observada; a diagonal é a calibração perfeita. Brier = (1/N) Σ (pᵢ − yᵢ)², menor é melhor; mistura calibração e discriminação. Exemplo: p = (0,9; 0,8; 0,3; 0,2; 0,1), y = (1; 0; 1; 0; 0) → Brier = (0,01 + 0,64 + 0,49 + 0,04 + 0,01)/5 = 0,238. Perda logarítmica (log loss) é a alternativa que pune mais a confiança errada.
- Discriminação ≠ calibração: a AUC não muda com qualquer transformação monotônica do escore, então um modelo pode ordenar bem (AUC alta) e ter probabilidades erradas. Corrige-se com escalonamento de Platt ou regressão isotônica, ajustados em dados de validação. Árvores com boosting, SVM e Naive Bayes costumam sair descalibrados; reamostragem para balancear classes também descalibra.
- Regressão: MAE = (1/n) Σ |yᵢ − ŷᵢ| (na unidade do dado, robusto a erros grandes); RMSE = √[(1/n) Σ (yᵢ − ŷᵢ)²] (pune erros grandes; RMSE ≥ MAE sempre); R² = 1 − SQres/SQtot (fração da variância explicada; fora da amostra pode ser negativo, quando o modelo é pior que prever a média). MAPE explode com valores perto de zero. Exemplo: y = (10, 12, 8, 15), ŷ = (11, 12, 10, 12) → MAE = 1,5; RMSE = √3,5 ≈ 1,87; R² = 1 − 14/26,75 ≈ 0,48.
- No trabalho da CGU: lista de risco de licitações, de benefícios ou de pagamentos é problema de classe rara com capacidade limitada; a métrica que conversa com o gestor é a precisão no topo e a sensibilidade estimada, não a acurácia. Para preço de referência, MAE em reais é mais comunicável que R².

**(C) Fontes.** James et al., *ISL*, 2ª ed. e *ISLP*, seções 3.1, 4.4 (matriz de confusão e ROC); Géron, *Hands-On Machine Learning*, 3ª ed., cap. 3 (métricas de classificação); Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 9.2.5; Saito e Rehmsmeier, "The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets", *PLOS ONE* 10(3), 2015; Niculescu-Mizil e Caruana, "Predicting Good Probabilities with Supervised Learning", *ICML* 2005; documentação do scikit-learn, "Probability calibration" ([scikit-learn.org](https://scikit-learn.org/stable/modules/calibration.html)).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em base com 1% de fraudes, um classificador com acurácia de 99% demonstra bom desempenho na detecção de fraudes. → *Certo:* Prever "não fraude" para todos dá 99%; com classe rara usam-se sensibilidade, precisão e curva PR.
- *Afirmação errada:* Um modelo com AUC-ROC elevada produz probabilidades bem calibradas. → *Certo:* A AUC mede só ordenação; calibração se verifica à parte (curva de confiabilidade, Brier).

**(E) Prioridade alta.** Conta certa em prova, citada nominalmente no edital e base de 3.2 a 3.5. 1 item FGV (CGU2022-AFFC-TI-42: VP 200, FP 40, FN 20 → precisão 200/240 ≈ 0,83 e sensibilidade 200/220 ≈ 0,91).

#### E3 · 3.2 — Prioridade média

**(A) Texto original do edital.** Custos dos falsos positivos e falsos negativos.

**(B) O que estudar.**
- Cada erro custa diferente. Em fiscalização: FP = auditoria gasta à toa e ônus ao fiscalizado inocente; FN = dano ao erário não detectado. Em benefício social com bloqueio automático: FP = cidadão elegível perde o benefício.
- O limiar padrão de 0,5 não tem nada de especial. Com probabilidades calibradas, o limiar que minimiza o custo esperado é p* = C_FP / (C_FP + C_FN). Exemplo: C_FP = 5 e C_FN = 50 → p* = 5/55 ≈ 0,09; aponta-se o caso se a probabilidade passar de 9%.
- O limiar move o ponto na curva ROC/PR: limiar menor aumenta sensibilidade e reduz precisão. Escolher o limiar é decisão de gestão, não do algoritmo; deve ser registrada e justificada.
- Com capacidade fixa (só cabem 50 auditorias por ano), o limiar vira "os 50 maiores escores", e a métrica que importa é precisão no topo k e dano recuperado esperado, não F1.
- Aprendizado sensível a custo: pesos por classe no treino, matriz de custo, reamostragem. Reamostrar muda as probabilidades: recalibrar depois.
- Custos assimétricos fora do dinheiro: dano reputacional, efeito sobre direitos (LGPD art. 20, decisão automatizada), carga sobre o cidadão. Esses custos entram em E3 3.5 e E4 3.5.
- No trabalho da CGU: avaliar se o limiar de um modelo de terceiro foi escolhido com base no custo do uso real ou se é o padrão da biblioteca.

**(C) Fontes.** Elkan, "The Foundations of Cost-Sensitive Learning", *IJCAI* 2001; Hastie, Tibshirani e Friedman, *ESL*, 2ª ed., seção 9.2.5 (matriz de perda); Géron, *Hands-On Machine Learning*, 3ª ed., cap. 3 (troca entre precisão e sensibilidade).

**(D) Como a banca erra o item.**
- *Afirmação errada:* O limiar de decisão de um classificador probabilístico deve ser 0,5, pois corresponde ao ponto de menor erro em qualquer aplicação. → *Certo:* 0,5 minimiza erros só se os custos forem iguais e o modelo calibrado; com custos diferentes o limiar ótimo é C_FP/(C_FP + C_FN).
- *Afirmação errada:* Reduzir o limiar de classificação aumenta a precisão e a sensibilidade simultaneamente. → *Certo:* Em regra aumenta a sensibilidade e reduz a precisão.

**(E) Prioridade média.** Cobrança esperada de 1 ou 2 itens; o raciocínio já sai de 3.1 e reaparece em 3.5, onde rende mais.

#### E3 · 3.3 — Prioridade alta

**(A) Texto original do edital.** Desempenho por grupos, discriminação e incerteza.

**(B) O que estudar.**
- Desempenho por grupo: calcular as métricas de 3.1 separadas por região, porte do município, sexo, raça, faixa etária. Média boa esconde grupo ruim.
- Critérios (A = grupo, Ŷ = decisão, Y = verdade):
  - Paridade demográfica (independência): P(Ŷ=1 | A=a) igual entre grupos. Mesma taxa de apontamento. Regra dos quatro quintos (razão ≥ 0,8) é critério prático norte-americano.
  - Igualdade de oportunidades: sensibilidade (TPR) igual entre grupos.
  - Equalized odds (chances equalizadas, separação): TPR e taxa de falsos positivos iguais entre grupos.
  - Paridade preditiva e calibração por grupo (suficiência): precisão (VPP) igual, ou o mesmo escore significa o mesmo risco em todos os grupos.
- Impossibilidade: quando as taxas-base (prevalência) diferem entre grupos e o modelo não é perfeito, não dá para ter ao mesmo tempo calibração por grupo e igualdade das taxas de erro (Kleinberg, Mullainathan e Raghavan; Chouldechova). Identidade de Chouldechova: FPR = [p/(1−p)] · [(1−VPP)/VPP] · (1−FNR). Exemplo: VPP = 0,5 e FNR = 0,4 nos dois grupos; prevalência 10% dá FPR ≈ 6,7%; prevalência 30% dá FPR ≈ 25,7%. Escolher o critério é decisão normativa, que deve ser explícita.
- Remover o atributo sensível não resolve: CEP, município, escola e renda funcionam como proxies. A discriminação pode vir do rótulo histórico, da representação desigual nos dados ou da medida usada como alvo.
- Discriminação algorítmica (definição cobrada em TCU2026-AUFC-TI-164, gabarito C): uso, sem justificativa válida, do pertencimento a grupo (ou de proxies) gerando desvantagem sistemática onde esse critério não deveria influenciar. LGPD art. 6º, IX: princípio da não discriminação, vedado tratamento para fins discriminatórios ilícitos ou abusivos.
- Incerteza: intervalo de confiança da métrica por grupo (grupo pequeno = métrica instável; diferença pode ser ruído); incerteza da previsão individual (intervalo de predição, predição conformal). Comunicar a incerteza é E4 4.6.
- No trabalho da CGU: modelo de risco de convênios que aponta proporcionalmente mais municípios pequenos do Norte e Nordeste pode refletir onde se auditou no passado, não onde há mais irregularidade. Avaliar desempenho por região antes de usar. Ligação com E4 3.4.

**(C) Fontes.** Lei nº 13.709/2018 (LGPD), art. 6º, IX ([planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)); NIST AI RMF 1.0, característica "justo, com vieses nocivos gerenciados" ([doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1)); OCDE, OECD/LEGAL/0449, princípio 1.2 (direitos humanos, valores democráticos, equidade e privacidade); ISO/IEC TR 24027:2021, *Bias in AI systems and AI aided decision making* (texto pago, não lido; citado pelo título); Barocas, Hardt e Narayanan, *Fairness and Machine Learning: Limitations and Opportunities* (MIT Press, 2023), cap. 3 ([fairmlbook.org](https://fairmlbook.org/)); Kleinberg, Mullainathan e Raghavan, "Inherent Trade-Offs in the Fair Determination of Risk Scores", *ITCS* 2017; Chouldechova, "Fair Prediction with Disparate Impact", *Big Data* 5(2), 2017; Hardt, Price e Srebro, "Equality of Opportunity in Supervised Learning", *NeurIPS* 2016.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Excluir do modelo os atributos sensíveis, como raça e sexo, garante que ele não produza discriminação. → *Certo:* Outros atributos funcionam como proxies, e o rótulo histórico pode carregar o viés; exclusão não garante equidade.
- *Afirmação errada:* Um modelo bem calibrado em cada grupo também terá as mesmas taxas de falsos positivos e falsos negativos entre grupos. → *Certo:* Com taxas-base diferentes e modelo imperfeito, calibração por grupo e igualdade de taxas de erro são incompatíveis.

**(E) Prioridade alta.** Objeto de referencial recente (NIST, OCDE), tema de E4 3.4 e perfil de discursiva. 1 item Cebraspe (TCU2026-AUFC-TI-164).

#### E3 · 3.4 — Prioridade alta

**(A) Texto original do edital.** Explicabilidade e interpretabilidade.

**(B) O que estudar.**
- Uso mais comum dos termos: interpretabilidade = o quanto um humano entende o funcionamento do modelo por si (intrínseca); explicabilidade = capacidade de gerar explicação para o modelo ou para uma decisão, em geral com técnica pós-hoc. Os autores não concordam (Molnar usa quase como sinônimos), e o Cebraspe anulou um item que atribuía à explicabilidade "as propriedades internas do modelo" (TCU2026-AUFC-TI-165). Na prova, aceite a ideia geral (entender por que o modelo decide) e desconfie de definição rígida.
- Intrínseca: regressão linear e logística (coeficientes), árvore rasa, listas de regras, modelos aditivos generalizados (GAM). Pós-hoc: aplicada depois a qualquer modelo, inclusive caixa-preta.
- Global (como o modelo se comporta em geral) × local (por que este caso recebeu este escore).
- Importância por permutação: embaralha um atributo no conjunto de teste e mede a queda da métrica. Agnóstica ao modelo e global. Problema: com atributos correlacionados, gera combinações irreais e divide a importância. A importância por impureza (MDI) das árvores favorece atributos com muitos valores distintos.
- PDP e ICE: efeito médio (PDP) e por caso (ICE) de variar um atributo. Também sofrem com correlação.
- LIME: ajusta um modelo simples (linear) em torno do caso, com amostras perturbadas. Local; instável (resultado muda com a amostragem e a largura da vizinhança).
- SHAP: valores de Shapley da teoria dos jogos; distribui a diferença entre a previsão do caso e a previsão média entre os atributos; a soma das contribuições fecha exatamente essa diferença (aditividade). Local, agregável em global. TreeSHAP é exato e rápido para árvores. Custoso no caso geral; correlação também atrapalha.
- Limites: explicação pós-hoc é aproximação do modelo, não o modelo; não mostra causalidade (atributo importante ≠ causa, E1 3.2); pode ser manipulada; explicação boa de modelo com vazamento continua errada. Argumento de Rudin: em decisão de alto impacto, prefira modelo interpretável a explicar caixa-preta, se o desempenho for parecido.
- Direito à explicação: LGPD art. 20: revisão de decisão tomada unicamente com base em tratamento automatizado que afete interesses do titular; § 1º, informações claras sobre critérios e procedimentos, respeitado segredo comercial e industrial; § 2º, auditoria da ANPD para verificar aspectos discriminatórios. A exigência de revisão por pessoa natural foi vetada na Lei 13.853/2019 (conforme fontes secundárias; conferir no Planalto).
- No trabalho da CGU: ao auditar modelo de terceiro, pedir explicação global (o que pesa) e local (por que este caso), e testar se a explicação é estável; ao usar modelo próprio para selecionar fiscalizações, a explicação local vira parte da motivação do ato.

**(C) Fontes.** Lei nº 13.709/2018 (LGPD), art. 20 ([planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)); NIST AI RMF 1.0, característica "explicável e interpretável" (distingue explicabilidade, "como" a decisão foi tomada, de interpretabilidade, "por que" e o que significa); OCDE, OECD/LEGAL/0449, princípio 1.3 (transparência e explicabilidade); Molnar, *Interpretable Machine Learning*, 3ª ed. (2025) ([christophm.github.io/interpretable-ml-book](https://christophm.github.io/interpretable-ml-book/)); Lundberg e Lee, "A Unified Approach to Interpreting Model Predictions", *NeurIPS* 2017; Ribeiro, Singh e Guestrin, "Why Should I Trust You?", *KDD* 2016; Breiman, "Random Forests", *Machine Learning* 45, 2001; Rudin, "Stop Explaining Black Box Machine Learning Models for High Stakes Decisions", *Nature Machine Intelligence* 1, 2019.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Os valores SHAP indicam a relação causal entre cada atributo e o resultado previsto. → *Certo:* Indicam a contribuição do atributo para a previsão do modelo, não causalidade no mundo real.
- *Afirmação errada:* O LIME produz explicação global do modelo, válida para todas as previsões. → *Certo:* O LIME é local: aproxima o modelo na vizinhança de um caso.

**(E) Prioridade alta.** Cobrado pelo Cebraspe em 2026 (TCU2026-AUFC-TI-163, gabarito C; TCU2026-AUFC-TI-165, anulado), com base legal (LGPD art. 20) e peso na discursiva.

#### E3 · 3.5 — Prioridade alta

**(A) Texto original do edital.** Limites do uso de escores para priorização e tomada de decisão.

**(B) O que estudar.**
- Forte candidato à Q2 da discursiva: a situação "a CGU quer usar um escore de risco para escolher o que fiscalizar" pede exatamente os argumentos abaixo.
- Escore prioriza; não prova. Escore alto é indício para selecionar, não fundamento para sancionar. Triagem (humano examina o apontado) × decisão automatizada (o escore decide). Quanto mais direto o efeito sobre direitos, maior a exigência de revisão humana, explicação e contestação (LGPD art. 20; E4 3.2).
- Viés de seleção nos rótulos: o rótulo "irregular" só existe para o que foi auditado, e o que foi auditado foi escolhido por critério (materialidade, denúncia, sorteio, faro do auditor). O modelo aprende "o que costumávamos auditar e achar", não "onde há irregularidade". Os não auditados não são negativos; são desconhecidos. Ligação com E1 3.2.
- Ciclo de retroalimentação: o modelo aponta o grupo A, a CGU fiscaliza mais A, acha mais em A (porque procurou), os novos rótulos reforçam A. O modelo confirma a si mesmo e o resto fica sem olhar. É o caso estudado em policiamento preditivo.
- Mitigações: reservar parte das fiscalizações para seleção aleatória (dá rótulos não viesados e permite medir o desempenho real); registrar por que cada caso foi escolhido; reavaliar o modelo com os resultados da amostra aleatória; métodos de correção de seleção (ponderação pela probabilidade inversa de ter sido auditado) quando houver dados.
- Lei de Goodhart e comportamento estratégico: se os critérios do escore viram públicos, o fiscalizado se adapta; atributos fáceis de manipular perdem valor.
- Viés de automação: o humano tende a aceitar a recomendação do sistema; revisão humana de fachada não é controle. Também o contrário: o auditor descarta o escore sem registrar por quê.
- Escore como ordenação × probabilidade: lista ordenada só exige discriminação; usar o valor ("risco de 80%") exige calibração (E3 3.1). Escore relativo muda quando a população muda.
- Agregação esconde: escore bom na média pode ser ruim num grupo (E3 3.3); incerteza individual alta em casos raros.
- Governança: documentar finalidade, dados, rótulo, métricas, limitações e responsáveis (fichas de modelo, avaliação de impacto, E4 3.1 e 3.2). Proibir uso fora da finalidade (E4 3.4).
- No trabalho da CGU: priorização de auditorias, de processos correcionais, de benefícios para verificação e de fornecedores para cruzamento de bases. A posição defensável é: escore organiza a fila; humano decide com registro; parte da fila é aleatória; o modelo é revisado com os resultados.

**(C) Fontes.** Lei nº 13.709/2018 (LGPD), arts. 6º, IX, e 20; TCU, Acórdão 1.139/2022-Plenário (levantamento sobre uso de IA na administração pública federal; conforme fontes secundárias e resumo do TCU, [portal.tcu.gov.br](https://portal.tcu.gov.br/data/files/D0/C3/BC/DA/EF17781046756058F18818A8/Utilizacao%20de%20Inteligencia%20Artificial%20na%20Administracao%20Publica.pdf)); NIST AI RMF 1.0, funções Map e Manage e discussão de viés humano-cognitivo; OCDE, OECD/LEGAL/0449, princípios 1.2 (salvaguardas, inclusive capacidade de intervenção humana) e 1.5 (responsabilização); Barocas, Hardt e Narayanan, *Fairness and Machine Learning* (MIT Press, 2023), cap. 1 e 2 (medição, rótulos e retroalimentação); Ensign, Friedler, Neville, Scheidegger e Venkatasubramanian, "Runaway Feedback Loops in Predictive Policing", *FAT\** 2018; Lum e Isaac, "To Predict and Serve?", *Significance* 13(5), 2016. Contexto, sem força normativa (14.33 do edital): PL 2.338/2023 (marco da IA), em tramitação.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Treinar o modelo de risco com os resultados das auditorias anteriores produz estimativa não viesada da probabilidade de irregularidade em toda a população fiscalizável. → *Certo:* Os rótulos só existem para os casos selecionados no passado; há viés de seleção, e os não auditados não são negativos.
- *Afirmação errada:* A presença de um servidor que confirma as recomendações do sistema basta para afastar os riscos da decisão automatizada. → *Certo:* Sem condição real de divergir (tempo, informação, registro do motivo), a revisão é formal e sujeita a viés de automação.

**(E) Prioridade alta.** Sem incidência no catálogo, mas é o tema do bloco com maior perfil de situação-problema para a Q2, liga E1 3.2, E3 3.1 a 3.4 e E4 3.

**4 Redes neurais**

#### E3 · 4.1 — Prioridade média

**(A) Texto original do edital.** Perceptron e redes multicamadas.

**(B) O que estudar.**
- Neurônio artificial: soma ponderada z = w·x + b, seguida de uma função de ativação. O viés b desloca a fronteira; sem ele, a fronteira passa pela origem.
- Perceptron (Rosenblatt, 1958): uma camada, ativação degrau ou sinal, classificador linear. A fronteira de decisão é o hiperplano w·x + b = 0. Regra de atualização: w ← w + η(y − ŷ)x, só quando erra.
- Teorema de convergência: se as classes forem linearmente separáveis, o perceptron converge em número finito de passos. Se não forem, oscila para sempre.
- Problema do XOR: os pontos (0,1) e (1,0) de uma classe e (0,0) e (1,1) da outra não se separam por uma reta. Minsky e Papert (1969) usaram o caso para mostrar o limite do perceptron de uma camada. AND e OR são separáveis; XOR não.
- Rede multicamadas (MLP): camadas ocultas com ativação não linear compõem fronteiras não lineares. Uma camada oculta com dois neurônios já resolve o XOR.
- Sem não linearidade, empilhar camadas não adianta: composição de funções lineares é linear. Essa é a pegadinha mais comum.
- Teorema da aproximação universal: uma MLP com uma camada oculta suficientemente larga e ativação não linear aproxima qualquer função contínua num domínio compacto. Diz que a representação existe, não que o treino a encontra nem quantos neurônios são precisos.
- Rede densa (totalmente conectada, feedforward): cada neurônio liga-se a todos da camada seguinte; informação flui num sentido, sem ciclos (ciclos são da rede recorrente, E3 4.3).
- Leitura de fronteira (estilo do TCU2022-AUFC-CE-67): com w1 = 2, w2 = 3, b = 1, a reta 2x1 + 3x2 + 1 = 0 corta os eixos em x1 = −1/2 e x2 = −1/3; pontos acima da reta dão z > 0 e são classificados como +1.
- Exemplo que roda em Python 3:

```python
# Perceptron com degrau aprende AND, mas não XOR
def treina(dados, epocas=20, taxa=1.0):
    w = [0.0, 0.0]; b = 0.0
    for _ in range(epocas):
        for (x1, x2), y in dados:
            pred = 1 if w[0] * x1 + w[1] * x2 + b > 0 else 0
            erro = y - pred
            w[0] += taxa * erro * x1; w[1] += taxa * erro * x2; b += taxa * erro
    return [1 if w[0] * x1 + w[1] * x2 + b > 0 else 0 for (x1, x2), _ in dados]

pontos = [(0, 0), (0, 1), (1, 0), (1, 1)]
AND = list(zip(pontos, [0, 0, 0, 1]))
XOR = list(zip(pontos, [0, 1, 1, 0]))
print(treina(AND))  # [0, 0, 0, 1]
print(treina(XOR))  # nunca acerta os quatro
```

- No trabalho da CGU: entender que um modelo "de rede neural" entregue por fornecedor pode ser só uma regressão logística disfarçada (uma camada com sigmoide) ou algo muito mais opaco; a pergunta de auditoria é se a complexidade se paga diante da alternativa simples (E3 1.2, E3 4.4).

**(C) Fontes.**
- Goodfellow, I.; Bengio, Y.; Courville, A. *Deep Learning*. MIT Press, 2016, cap. 6 (Deep Feedforward Networks, inclui o exemplo do XOR). [deeplearningbook.org](https://www.deeplearningbook.org/)
- Haykin, S. *Redes Neurais: princípios e prática*. 2. ed. Bookman, 2001, caps. 3 e 4.
- Géron, A. *Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow*. 3. ed. O'Reilly, 2022, cap. 10.
- Minsky, M.; Papert, S. *Perceptrons*. MIT Press, 1969 (contexto histórico).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Uma rede com várias camadas ocultas que usam apenas ativação linear consegue resolver o problema do XOR. → *Certo:* a composição de camadas lineares equivale a uma única transformação linear; é a não linearidade da ativação que permite a fronteira não linear.
- *Afirmação errada:* O perceptron de camada única converge para uma solução qualquer que seja o conjunto de treino. → *Certo:* a convergência só é garantida para classes linearmente separáveis.

**(E) Prioridade média.** Conceito clássico, fácil de cobrar em um item de cálculo ou de conceito (XOR, linearidade), mas sem incidência Cebraspe no catálogo; a única questão é FGV (TCU2022-AUFC-CE-67).

#### E3 · 4.2 — Prioridade média

**(A) Texto original do edital.** Funções de ativação e perda, otimização, retropropagação e regularização em nível conceitual e de interpretação de resultados.

**(B) O que estudar.**
- O edital diz "em nível conceitual e de interpretação de resultados": espere leitura de curva de treino e validação, e não derivação de gradiente.
- Ativações e o que cada uma resolve:
  - degrau/sinal: perceptron; não diferenciável, não serve para retropropagação;
  - sigmoide σ(z) = 1/(1 + e^−z): saída em (0, 1), lida como probabilidade na saída de classificação binária; satura nos extremos (derivada máxima 0,25), o que alimenta o desaparecimento do gradiente; não centrada em zero;
  - tanh: saída em (−1, 1), centrada em zero, também satura;
  - ReLU max(0, z): barata, não satura para z > 0, acelerou o treino de redes profundas; problema do "neurônio morto" (saída sempre zero); variantes Leaky ReLU, GELU (usada em transformers);
  - softmax: transforma um vetor de escores (logits) em distribuição de probabilidade que soma 1; usada na saída multiclasse e na atenção (E3 4.3).
- Perdas:
  - MSE (erro quadrático médio): regressão; penaliza muito erros grandes, sensível a outlier; MAE é mais robusta;
  - entropia cruzada (log loss): classificação; −Σ y log ŷ; binária com sigmoide, categórica com softmax; pune forte a previsão confiante e errada. Minimizar entropia cruzada equivale a maximizar a verossimilhança.
- Otimização:
  - gradiente descendente: w ← w − η ∇L; taxa de aprendizado η alta diverge ou oscila, baixa demora e pode parar em platô;
  - lote completo × estocástico (SGD, um exemplo) × minilote (o usual); época = uma passagem por todo o treino;
  - momento acumula a direção dos passos anteriores; Adam (Kingma e Ba, 2015) combina momento com taxa adaptativa por parâmetro (média móvel do gradiente e do seu quadrado). Adam não garante mínimo global;
  - a perda de rede profunda não é convexa: há mínimos locais e pontos de sela; o resultado depende da inicialização e da semente aleatória (ligação com E3 2.5, estabilidade).
- Retropropagação (Rumelhart, Hinton e Williams, 1986): aplica a regra da cadeia de trás para frente para obter o gradiente da perda em relação a cada peso. Calcula o gradiente; quem atualiza os pesos é o otimizador. A pegadinha é confundir as duas coisas.
- Desaparecimento do gradiente: em redes profundas ou recorrentes, o produto de muitas derivadas menores que 1 leva o gradiente a zero nas primeiras camadas, que deixam de aprender. Remédios: ReLU, inicialização adequada (Xavier/He), normalização em lote, conexões residuais, LSTM/GRU nas recorrentes. Explosão do gradiente é o inverso; remédio clássico: recorte do gradiente (gradient clipping).
- Regularização:
  - weight decay (penalidade L2 nos pesos);
  - dropout (Srivastava et al., 2014): desliga neurônios ao acaso no treino; na inferência todos ficam ativos (com reescala);
  - early stopping: parar quando a perda de validação para de cair; exige conjunto de validação separado do teste (E3 2.1);
  - aumento de dados (data augmentation) e normalização em lote também ajudam.
- Leitura de curvas: perda de treino caindo e de validação subindo = sobreajuste; ambas altas = subajuste ou taxa de aprendizado ruim; perda oscilando muito = taxa alta ou lote pequeno.
- Exemplo que roda em Python 3 (softmax com temperatura, ligação com E3 5.3):

```python
import math

def softmax(logits, temperatura=1.0):
    z = [v / temperatura for v in logits]
    m = max(z)
    e = [math.exp(v - m) for v in z]
    s = sum(e)
    return [round(v / s, 3) for v in e]

logits = [2.0, 1.0, 0.1]
print(softmax(logits, 1.0))   # [0.659, 0.242, 0.099]
print(softmax(logits, 0.5))   # [0.864, 0.117, 0.019] mais concentrada
print(softmax(logits, 2.0))   # [0.502, 0.304, 0.194] mais espalhada
```

- No trabalho da CGU: ao avaliar modelo de terceiro, pedir as curvas de treino e validação, a perda usada e o critério de parada; perda de validação monitorada no conjunto de teste é vazamento (E3 2.3).

**(C) Fontes.**
- Goodfellow, Bengio e Courville, *Deep Learning*, 2016, caps. 6 (ativações e perdas), 7 (regularização: dropout, early stopping, weight decay) e 8 (otimização). [deeplearningbook.org](https://www.deeplearningbook.org/)
- Géron, *Hands-On Machine Learning*, 3. ed., 2022, caps. 10 e 11 (desaparecimento do gradiente, otimizadores, regularização).
- Kingma, D.; Ba, J. Adam: A Method for Stochastic Optimization. ICLR, 2015. [arXiv:1412.6980](https://arxiv.org/abs/1412.6980)
- Srivastava, N. et al. Dropout. *Journal of Machine Learning Research*, 15, 2014. [jmlr.org](https://jmlr.org/papers/v15/srivastava14a.html)

**(D) Como a banca erra o item.**
- *Afirmação errada:* A retropropagação é o algoritmo de otimização que atualiza os pesos da rede, alternativo ao gradiente descendente. → *Certo:* a retropropagação calcula os gradientes; o gradiente descendente (ou Adam etc.) usa esses gradientes para atualizar os pesos. Eles trabalham juntos.
- *Afirmação errada:* A função sigmoide nas camadas ocultas reduz o desaparecimento do gradiente em redes profundas, por isso substituiu a ReLU. → *Certo:* é o contrário: a sigmoide satura e agrava o problema; a ReLU passou a ser o padrão nas camadas ocultas.

**(E) Prioridade média.** Muitos conceitos curtos e fáceis de transformar em item C/E (sigmoide × ReLU, dropout na inferência, retropropagação × otimizador), mas sem incidência no catálogo e com o edital limitando a profundidade.

#### E3 · 4.3 — Prioridade média

**(A) Texto original do edital.** Redes convolucionais, recorrentes e transformers.

**(B) O que estudar.**
- CNN (rede convolucional): filtros pequenos deslizam sobre a entrada e compartilham pesos; explora estrutura local e espacial (imagem, também sinal e texto curto). Pooling reduz dimensão e dá alguma invariância a translação. Menos parâmetros que uma rede densa equivalente. Uso: imagem, documento digitalizado, OCR, detecção de objeto.
- RNN (rede recorrente): processa sequência passo a passo com estado oculto que carrega o passado; pesos compartilhados no tempo; treino por retropropagação no tempo. Sofre desaparecimento do gradiente em sequências longas e é sequencial (difícil de paralelizar).
- LSTM (Hochreiter e Schmidhuber, 1997) e GRU: portas (esquecimento, entrada, saída) e estado de célula controlam o fluxo de informação e mitigam o desaparecimento do gradiente. Mitigam, não eliminam.
- Transformer (Vaswani et al., 2017, "Attention Is All You Need"):
  - abandona a recorrência e usa autoatenção: cada token calcula pesos sobre todos os outros (consultas Q, chaves K, valores V; Attention = softmax(QKᵀ/√d_k)V);
  - processa os tokens da sequência em paralelo no treino, o que permitiu treinar com muito mais dados em GPU;
  - como não há ordem implícita, usa codificação posicional;
  - atenção com múltiplas cabeças (multi-head) captura relações diferentes ao mesmo tempo;
  - custo da autoatenção cresce com o quadrado do comprimento da sequência: é a origem do limite da janela de contexto (E3 5.3);
  - arquiteturas: só codificador (BERT, bom para classificação e embeddings), só decodificador (GPT e a maioria dos LLMs, geração autorregressiva), codificador-decodificador (T5, tradução e resumo).
- Paralelismo: no treino, o transformer é paralelo na sequência; na geração, o decodificador ainda gera um token por vez (autorregressivo). Item que diz "transformer gera todo o texto de uma vez" está errado.
- Atenção não é explicação: pesos de atenção não são, por si, explicação confiável da decisão do modelo (ligação com E3 3.4).
- No trabalho da CGU: CNN para leitura de nota fiscal digitalizada ou imagem de obra; LSTM ou transformer para séries de pagamento e texto de edital; o transformer é a base dos LLMs usados em ferramentas internas de apoio à auditoria.

**(C) Fontes.**
- Vaswani, A. et al. Attention Is All You Need. NeurIPS, 2017. [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)
- Goodfellow, Bengio e Courville, *Deep Learning*, 2016, caps. 9 (convolucionais) e 10 (recorrentes, LSTM).
- Jurafsky, D.; Martin, J. H. *Speech and Language Processing*. 3. ed. (rascunho on-line), caps. sobre RNN/LSTM e transformers. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)
- Hochreiter, S.; Schmidhuber, J. Long Short-Term Memory. *Neural Computation*, 9(8), 1997.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Os transformers, assim como as redes recorrentes, processam os tokens estritamente em sequência, o que os torna mais lentos de treinar que as LSTMs. → *Certo:* a autoatenção dispensa a recorrência e permite processar todos os tokens da sequência em paralelo durante o treino; essa foi a principal vantagem sobre RNN/LSTM.
- *Afirmação errada:* As LSTMs eliminam por completo o problema do desaparecimento do gradiente. → *Certo:* as portas mitigam o problema e ampliam a memória de longo prazo, mas não o eliminam em sequências muito longas.

**(E) Prioridade média.** O transformer é base dos tópicos 5 e 6 e o Cebraspe já cobrou transformer em PLN (TCU2026-AUFC-TI-168); a parte de CNN e RNN rende 1 item no máximo.

#### E3 · 4.4 — Prioridade média

**(A) Texto original do edital.** Adequação ao tipo de dado, custo, limitações e alternativas.

**(B) O que estudar.**
- Casamento entre arquitetura e dado: tabular → árvores e ensembles de gradient boosting costumam vencer redes neurais em dados tabulares de tamanho médio; imagem → CNN ou transformer de visão; sequência e texto → transformer (antes RNN/LSTM); grafo → redes de grafos.
- Custos: dados rotulados em volume (redes profundas têm muitos parâmetros e sobreajustam com pouco dado), computação de treino e de inferência (GPU, energia, E4 2.2), latência, manutenção e reprodutibilidade (sementes, versões, E4 1.4).
- Limitações: opacidade (caixa-preta, E3 3.4), instabilidade entre execuções, sensibilidade a exemplos adversariais, calibração ruim de probabilidades sem ajuste (E3 3.1), mudança de distribuição (E4 1.6), dificuldade de contestação por quem é afetado (E4 3.2).
- Alternativas: regra de negócio, regressão logística, árvore de decisão, gradient boosting, modelo pré-treinado (E3 4.5), ou nenhum modelo. "Comparação com soluções simples" já está em E3 1.2: a linha de base mais simples define se o ganho da rede compensa.
- Leitura provável: itens de julgamento, como "rede neural é sempre preferível", "mais camadas sempre melhoram", "deep learning dispensa engenharia de atributos e qualquer preparação". Todos errados pelo exagero.
- Interpretabilidade como requisito: quando a decisão afeta direitos, modelo interpretável pode ser exigência e não preferência (LGPD, art. 20, direito de revisão de decisão automatizada; E4 3.2).
- No trabalho da CGU: na contratação (E4 5.1, 5.2), o estudo técnico preliminar deve justificar por que uma rede profunda e não uma solução simples; na auditoria de modelo em produção, perguntar qual linha de base foi comparada e quanto custa a inferência por mês.

**(C) Fontes.**
- Lei nº 13.709/2018 (LGPD), art. 20. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- Géron, *Hands-On Machine Learning*, 3. ed., 2022, caps. 2 e 10.
- Goodfellow, Bengio e Courville, *Deep Learning*, 2016, cap. 11 (Practical Methodology: linha de base, quando coletar mais dado).
- Grinsztajn, L.; Oyallon, E.; Varoquaux, G. Why do tree-based models still outperform deep learning on typical tabular data? NeurIPS Datasets and Benchmarks, 2022. [arXiv:2207.08815](https://arxiv.org/abs/2207.08815)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em dados tabulares de cadastros administrativos, redes neurais profundas superam sistematicamente modelos baseados em árvores, razão pela qual devem ser a primeira escolha. → *Certo:* em dados tabulares, ensembles de árvores costumam igualar ou superar redes profundas com menor custo; a escolha deve partir de comparação com linha de base simples.
- *Afirmação errada:* Como aprendem representações automaticamente, as redes profundas dispensam preparação dos dados. → *Certo:* reduzem a engenharia manual de atributos, mas continuam exigindo tratamento de ausentes, normalização, prevenção de vazamento e dados de qualidade (E1 5.1).

**(E) Prioridade média.** Tema de julgamento, adequado ao estilo Cebraspe e à Q2 (escolha de solução), mas sem incidência no catálogo e com núcleo repetido em E3 1.2 e E4 5.3.

#### E3 · 4.5 — Prioridade baixa

**(A) Texto original do edital.** Transferência de aprendizado e ajuste de modelos.

**(B) O que estudar.**
- Transferência de aprendizado (transfer learning): reaproveitar um modelo pré-treinado em tarefa ou domínio grande para outra tarefa, com menos dados e menos custo. As primeiras camadas aprendem padrões genéricos; as últimas, específicos da tarefa.
- Modos: extração de atributos (congela o modelo e treina só uma cabeça nova) × ajuste fino (fine-tuning, descongela parte ou todo o modelo e continua o treino com taxa de aprendizado baixa).
- Riscos do ajuste fino: esquecimento catastrófico do que o modelo sabia; sobreajuste com pouco dado; herança de vieses e de problemas de licença do modelo base; vazamento de dado pessoal memorizado.
- Ajuste fino eficiente em parâmetros (PEFT): LoRA (Hu et al., 2021) congela os pesos originais e treina matrizes de baixo posto somadas a eles; treina uma fração pequena dos parâmetros, o adaptador ocupa pouco espaço e pode ser trocado. Nível conceitual: "adapta com poucos parâmetros treináveis, sem alterar os pesos originais".
- Ajuste de LLMs: ajuste supervisionado com instruções (instruction tuning) e alinhamento por preferência humana (RLHF, ligação com aprendizado por reforço em E3 1.1). Ajuste fino muda comportamento, estilo e formato; não é o melhor meio de inserir fato novo e atualizável (isso é RAG, E3 5.4).
- "Ajuste de modelos" também pode ser lido como ajuste de hiperparâmetros (busca em grade, aleatória, bayesiana, sempre na validação, E3 2.1). Leitura mais provável aqui, pelo contexto de redes neurais: ajuste fino de modelo pré-treinado.
- No trabalho da CGU: classificar textos de achados de auditoria ou de denúncias com um BERT em português ajustado com poucos milhares de exemplos rotulados; na contratação, saber de quem é o modelo ajustado e os pesos (E4 5.7).

**(C) Fontes.**
- Hu, E. J. et al. LoRA: Low-Rank Adaptation of Large Language Models. ICLR, 2022. [arXiv:2106.09685](https://arxiv.org/abs/2106.09685)
- Goodfellow, Bengio e Courville, *Deep Learning*, 2016, seção 15.2 (transfer learning and domain adaptation).
- Géron, *Hands-On Machine Learning*, 3. ed., 2022, caps. 11 e 14 (reuso de camadas pré-treinadas).
- Devlin, J. et al. BERT. NAACL, 2019. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na técnica LoRA, todos os pesos do modelo pré-treinado são atualizados, mas com taxa de aprendizado reduzida. → *Certo:* a LoRA congela os pesos originais e treina apenas matrizes adicionais de baixo posto, o que reduz muito o número de parâmetros treináveis.
- *Afirmação errada:* A transferência de aprendizado exige que a tarefa de destino seja idêntica à de origem. → *Certo:* ela serve justamente para tarefas ou domínios diferentes, desde que relacionados o bastante para que as representações aprendidas sejam úteis.

**(E) Prioridade baixa.** Conceitual e curto; a decisão relevante (ajuste fino × RAG × prompt) é cobrada em E3 5.4.

**5 Linguagem natural e modelos generativos**

#### E3 · 5.1 — Prioridade alta

**(A) Texto original do edital.** Pré-processamento e classificação de textos.

**(B) O que estudar.**
- Pré-processamento clássico: normalização (minúsculas, acentos, números), tokenização, remoção de stopwords, stemização (corta sufixos por regra: "auditorias" → "auditor") × lematização (forma canônica com dicionário e análise morfológica: "fizeram" → "fazer"), n-gramas, expressões regulares para limpar ruído.
- Tokenização em LLMs: subpalavras (BPE, WordPiece, SentencePiece) resolvem palavra fora do vocabulário quebrando-a em pedaços. Token não é palavra; em português uma palavra costuma virar mais de um token. Custo e janela de contexto são medidos em tokens.
- O pré-processamento depende do modelo: para TF-IDF e Naive Bayes, stopwords e stemização ajudam; para transformers, remover stopwords ou fazer stemização costuma piorar, porque o modelo usa o contexto. Mas transformers ainda exigem tokenização, truncamento e limpeza (TCU2026-AUFC-TI-168: item errado ao dizer que eliminam o pré-processamento).
- Representação para classificação: saco de palavras (bag of words, contagem), TF-IDF (ver E3 5.2), embeddings.
- Classificadores: Naive Bayes multinomial (supõe independência condicional das palavras dada a classe; estimativa por contagem, com suavização de Laplace para evitar probabilidade zero; ver CGU2022-AFFC-TI-46), regressão logística, SVM linear, gradient boosting, transformer ajustado (E3 4.5), classificação zero-shot por LLM.
- Tarefas de PLN: classificação de documentos e de sentimento; reconhecimento de entidades nomeadas (NER: pessoa, organização, local, valor, data), que no modo supervisionado exige corpus anotado (TCU2026-AUFC-TI-167, certo); modelagem de tópicos (LDA: cada documento é mistura de tópicos e cada tópico é distribuição sobre palavras, não supervisionado; TCU2022-AUFC-CE-69); extração de informação; sumarização; tradução.
- Avaliação: precisão, revocação e F1 por classe (E3 3.1); classes raras exigem cuidado com acurácia (E1 5.1, desbalanceamento); macro × micro média.
- Vazamento em texto: ajustar o vocabulário ou o IDF no conjunto inteiro antes de separar treino e teste; documentos quase duplicados em treino e teste (E3 2.3).
- No trabalho da CGU: triagem de manifestações de ouvidoria e denúncias, classificação de objeto de licitação e de empenho, NER para extrair CNPJ, nomes e valores de contratos e diários oficiais, agrupamento de achados de auditoria por tema.

**(C) Fontes.**
- Jurafsky, D.; Martin, J. H. *Speech and Language Processing*. 3. ed. (rascunho on-line), caps. 2 (normalização, tokenização, BPE), 4 (Naive Bayes e classificação de sentimento) e 17 (NER, na numeração atual do rascunho; conferir). [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)
- Manning, C.; Raghavan, P.; Schütze, H. *Introduction to Information Retrieval*. Cambridge University Press, 2008, caps. 2 e 13. [nlp.stanford.edu/IR-book](https://nlp.stanford.edu/IR-book/)
- Blei, D.; Ng, A.; Jordan, M. Latent Dirichlet Allocation. *JMLR*, 3, 2003.

**(D) Como a banca erra o item.**
- *Afirmação errada:* A lematização reduz as palavras ao radical por meio do corte de sufixos segundo regras fixas, sem considerar o contexto morfológico. → *Certo:* isso descreve a stemização; a lematização busca a forma canônica (lema) com apoio de dicionário e análise morfológica.
- *Afirmação errada:* Modelos supervisionados de NER aprendem a identificar entidades a partir de textos sem qualquer anotação prévia. → *Certo:* o modo supervisionado depende de textos anotados com as categorias de entidade (TCU2026-AUFC-TI-167).

**(E) Prioridade alta.** É o bloco de PLN com mais incidência: 2 itens Cebraspe recentes (TCU2026-AUFC-TI-167, 168) e 5 FGV na linha "PLN" do INCIDENCIA.md; aplicação direta em ouvidoria e denúncias.

#### E3 · 5.2 — Prioridade alta

**(A) Texto original do edital.** Representações vetoriais, embeddings e similaridade semântica.

**(B) O que estudar.**
- One-hot e saco de palavras: vetores esparsos, dimensão do vocabulário, sem noção de semelhança entre palavras.
- TF-IDF: tf(t, d) × idf(t), com idf(t) = log(N / df(t)), N = nº de documentos e df(t) = nº de documentos que contêm t. Termo presente em todos os documentos tem idf = log 1 = 0. No TCU2022-AUFC-CE-71, com dois documentos de 11 termos, "rosas" aparece nos dois (TF-IDF 0) e "choram" só em A (1/11 × log 2). Variantes de tf (contagem bruta ou frequência relativa) e de base do log mudam o número, não a lógica.
- Embeddings densos: vetores de poucas centenas de dimensões aprendidos de modo que palavras em contextos parecidos fiquem próximas (hipótese distribucional).
  - Word2Vec (Mikolov et al., 2013): rede rasa (uma camada oculta, sem atenção), arquiteturas CBOW e skip-gram; GloVe (coocorrência global); FastText (subpalavras, lida com palavras fora do vocabulário). São estáticos: um vetor por palavra, independentemente do contexto, e por isso cabem num cache de vocabulário (TCU2022-AUFC-CE-74). O TCU2026-AUFC-TI-170 deu errado ao descrever Word2Vec como rede profunda com atenção.
  - Contextuais: BERT e LLMs geram um vetor diferente para cada ocorrência ("banco" de sentar × "banco" financeiro).
  - Embeddings de frase e documento (sentence embeddings): base da busca semântica e do RAG (E3 5.4).
- Similaridade de cosseno: cos(a, b) = a·b / (‖a‖ ‖b‖), entre −1 e 1; mede o ângulo e ignora o tamanho do vetor. Distância euclidiana mede magnitude também; com vetores normalizados, as duas ordenam igual. Produto escalar = cosseno quando a norma é 1.
- Analogias vetoriais (rei − homem + mulher ≈ rainha) mostram estrutura semântica e também vieses do corpus (estereótipos de gênero nos vetores).
- Busca vetorial: vizinhos mais próximos aproximados (ANN, índices como HNSW) em bancos vetoriais (E2 1.1, modelo vetorial). Aproximado troca exatidão por velocidade.
- Busca lexical (BM25, TF-IDF) acha termo exato, sigla e número de processo; busca semântica acha sinônimo e paráfrase. Busca híbrida combina as duas.
- Exemplo que roda em Python 3:

```python
import math

def cosseno(a, b):
    prod = sum(x * y for x, y in zip(a, b))
    norma = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return prod / norma

print(round(cosseno([1, 2, 0], [2, 4, 0]), 3))   # 1.0: mesma direção, escalas diferentes
print(round(cosseno([1, 0, 0], [0, 1, 0]), 3))   # 0.0: ortogonais
print(round(cosseno([1, 1], [-1, -1]), 3))       # -1.0: opostos
```

- No trabalho da CGU: achar objetos de contrato equivalentes descritos com palavras diferentes (sobrepreço por comparação), detectar textos de proposta quase idênticos entre licitantes (indício de conluio), vincular denúncias ao mesmo fato. Similaridade alta é sinal de risco, não prova (P2 C5 3.2).

**(C) Fontes.**
- Jurafsky e Martin, *Speech and Language Processing*, 3. ed. (rascunho), cap. 6 (Vector Semantics and Embeddings: TF-IDF, cosseno, Word2Vec, viés em embeddings). [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)
- Manning, Raghavan e Schütze, *Introduction to Information Retrieval*, 2008, cap. 6 (tf-idf e modelo de espaço vetorial). [nlp.stanford.edu/IR-book](https://nlp.stanford.edu/IR-book/)
- Mikolov, T. et al. Efficient Estimation of Word Representations in Vector Space, 2013. [arXiv:1301.3781](https://arxiv.org/abs/1301.3781)

**(D) Como a banca erra o item.**
- *Afirmação errada:* O Word2Vec gera representações contextuais, de modo que a mesma palavra recebe vetores diferentes conforme a frase em que aparece. → *Certo:* o Word2Vec é estático, um vetor por palavra; representações contextuais vêm de modelos como BERT e demais transformers.
- *Afirmação errada:* Na ponderação TF-IDF, termos que aparecem em todos os documentos da coleção recebem o maior peso, por serem os mais representativos. → *Certo:* recebem idf = log(N/N) = 0, ou seja, peso nulo, porque não discriminam documentos.

**(E) Prioridade alta.** Três itens no catálogo (TCU2026-AUFC-TI-170 Cebraspe; TCU2022-AUFC-CE-71 e 74 FGV), cálculo de TF-IDF e cosseno é cobrável em C/E, e é a base técnica do RAG.

#### E3 · 5.3 — Prioridade média

**(A) Texto original do edital.** Modelos de linguagem e LLMs.

**(B) O que estudar.**
- Modelo de linguagem: atribui probabilidade a sequências e prevê o próximo token. N-gramas (contagem, hipótese de Markov) → redes neurais → transformers.
- LLM (large language model): transformer só decodificador, pré-treinado em corpus enorme para prever o próximo token (autossupervisionado), depois ajustado por instruções e alinhado por preferência humana (RLHF ou similar). O pré-treino é que dá conhecimento geral; o ajuste dá o comportamento de assistente.
- Geração autorregressiva: produz um token por vez, cada um condicionado aos anteriores.
- Decodificação: gulosa (sempre o mais provável), amostragem, top-k, top-p (nucleus). Temperatura divide os logits antes da softmax: baixa concentra a probabilidade (respostas mais previsíveis), alta espalha (mais variadas). Temperatura zero aproxima a escolha gulosa, mas não garante resposta correta nem, em todos os serviços, saída idêntica entre execuções.
- Janela de contexto: número máximo de tokens que o modelo considera de uma vez (instrução, histórico, documentos e resposta). O que fica fora não é visto. Janela grande não garante uso igual de todo o conteúdo: o desempenho tende a cair para informação no meio de contextos longos (Liu et al., 2023, "Lost in the Middle").
- Data de corte do conhecimento: o modelo não sabe de fatos posteriores ao pré-treino; daí o RAG (E3 5.4) e a orientação do guia da CGU sobre desatualização.
- Limitações estruturais: alucinação (E3 5.5), sensibilidade à formulação do prompt, vieses do corpus, dificuldade com cálculo exato e contagem, não determinismo, memorização de dados de treino (risco de vazamento de dado pessoal).
- Modelos abertos (pesos disponíveis) × fechados (acesso por API): afeta privacidade, custo, portabilidade e dependência de fornecedor (E4 5.3, 5.7). Modelo de pesos abertos pode rodar em infraestrutura própria, sem enviar dado a terceiro.
- Multimodais: aceitam imagem, áudio; modelos de raciocínio gastam tokens "pensando" antes de responder (mais custo e latência).
- No trabalho da CGU: o *Guia de Uso Responsável de Ferramentas de IA Generativa* da CGU (2025) cita a plataforma interna LIA e os sistemas CGU-Insight e AuditPesquisa (este com RAG sobre relatórios de auditoria) e não recomenda IA generativa para predição de cenários, planejamento e otimização ou inteligência decisória.

**(C) Fontes.**
- Controladoria-Geral da União. *Guia de Uso Responsável de Ferramentas de Inteligência Artificial Generativa da CGU*. Brasília, mar. 2025 (aprovado pela Portaria Normativa CGU nº 193, de 6/1/2025, conforme fontes secundárias; conferir no DOU), itens 2, 4.2 e 6. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- Secretaria de Governo Digital (MGI) e Serpro. *IA Generativa no Serviço Público* (página "Guia de IA generativa no Serviço Público"), 2025. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/cartilha-ia-generativa)
- Jurafsky e Martin, *Speech and Language Processing*, 3. ed. (rascunho), caps. 3 (n-gramas) e capítulos de LLMs e transformers. [web.stanford.edu/~jurafsky/slp3](https://web.stanford.edu/~jurafsky/slp3/)
- Liu, N. F. et al. Lost in the Middle: How Language Models Use Long Contexts. *TACL*, 2024. [arXiv:2307.03172](https://arxiv.org/abs/2307.03172)

**(D) Como a banca erra o item.**
- *Afirmação errada:* A redução da temperatura de um LLM para valor próximo de zero elimina as alucinações, pois o modelo passa a escolher sempre o token correto. → *Certo:* temperatura baixa torna a saída mais previsível (escolhe o token mais provável), mas o token mais provável pode ser falso; alucinação não depende só da aleatoriedade.
- *Afirmação errada:* Todo o conteúdo inserido na janela de contexto é aproveitado pelo modelo com a mesma eficácia, independentemente da posição. → *Certo:* há perda de desempenho para informação no meio de contextos longos; e o que excede a janela é descartado ou truncado.

**(E) Prioridade média.** Conceitos de base exigidos para 5.4, 5.5 e 6.x; o Cebraspe tocou o tema por TCU2026-AUFC-TI-168, mas os itens de maior valor (RAG, avaliação, segurança) estão nos subitens seguintes.

#### E3 · 5.4 — Prioridade alta

**(A) Texto original do edital.** Prompts, recuperação de informação para geração de respostas e ajuste de modelos.

**(B) O que estudar.**
- Engenharia de prompt: instrução clara, papel (persona), contexto, exemplos (few-shot) × nenhum exemplo (zero-shot), formato de saída definido, decomposição em etapas, pedir citação do texto de referência. O guia da CGU (item 5.13) recomenda detalhar a consulta, pedir persona, pedir citação ou texto de referência, limitar o tamanho e dividir a consulta em etapas.
- Prompt de sistema (instrução do desenvolvedor) × prompt do usuário. O prompt de sistema não é controle de segurança: pode vazar (OWASP LLM07:2025, System Prompt Leakage) e pode ser contornado (E3 6.3).
- RAG (Retrieval-Augmented Generation, geração aumentada por recuperação; Lewis et al., 2020): recupera trechos de uma base e os insere no prompt para o modelo responder com base neles. Etapas:
  1. ingestão e fragmentação (chunking): dividir documentos em trechos; tamanho e sobreposição afetam o resultado (trecho pequeno perde contexto, grande dilui a relevância e consome janela); respeitar estrutura (artigo, seção);
  2. indexação: embeddings de cada trecho em banco vetorial, muitas vezes com índice lexical junto (busca híbrida) e metadados (data, vigência, nível de sigilo);
  3. recuperação: busca dos k trechos mais similares à pergunta;
  4. reordenação (reranking): um modelo mais caro (em geral cross-encoder) reavalia os candidatos e reordena;
  5. geração fundamentada: o LLM responde a partir dos trechos, com citação da fonte (documento, página, dispositivo) para permitir conferência.
- Falhas do RAG: recuperação errada ou incompleta (o modelo responde bem sobre o trecho errado), base desatualizada ou com norma revogada, conflito entre fontes, trecho cortado no meio, permissões ignoradas (usuário recebe trecho que não poderia ver), envenenamento da base e injeção indireta via documento indexado (E3 6.3; OWASP LLM08:2025, Vector and Embedding Weaknesses). RAG reduz alucinação, não a elimina.
- Guia da SGD/MGI sobre RAG: etapas de recuperação, aumento de contexto e geração fundamentada; destaca qualidade e atualização da base, remoção de normas revogadas, riscos de exposição de dados e controle de acesso, e que "a IA não decide, ela sugere"; distingue RAG de simplesmente colar documentos no prompt.
- Ajuste de modelos (E3 4.5) × RAG × prompt, decisão:

| Necessidade | Melhor caminho |
|---|---|
| Conhecimento atualizável, citável, com controle de acesso | RAG |
| Formato, tom, tarefa específica repetitiva, vocabulário de domínio | Ajuste fino |
| Teste rápido, tarefa simples, baixo custo | Engenharia de prompt |
| Fato novo que muda toda semana | Não ajuste fino: retreinar a cada mudança é caro e não cita fonte |

- Ordem usual de tentativa: prompt → RAG → ajuste fino; combinações são comuns (modelo ajustado consultando base por RAG).
- No trabalho da CGU: o AuditPesquisa (RAG sobre relatórios de auditoria) é exemplo interno citado no guia da CGU; perguntas de auditoria sobre um RAG contratado: qual base, quem atualiza, como trata norma revogada, se respeita o perfil de acesso do usuário, se a resposta cita a fonte e se há registro de pergunta e resposta.

**(C) Fontes.**
- Secretaria de Governo Digital (MGI). *Guia de introdução ao RAG no setor público*. Portal Governo Digital, 2026 (data de publicação não consta na página; conferir). [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/guia-de-rag/)
- Secretaria de Governo Digital (MGI). *Guia prático de prompt e pesquisa com IA para servidores públicos*, 2025. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/guia-pratico-de-prompt-e-pesquisa-com-ia-para-servidores-publicos/)
- CGU, *Guia de Uso Responsável de Ferramentas de IA Generativa*, mar. 2025, itens 2.3, 2.5 e 5.13. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- OWASP GenAI Security Project. *OWASP Top 10 for LLM Applications 2025* (LLM07 e LLM08). [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- Lewis, P. et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS, 2020. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Para que um assistente responda com base em normas internas que mudam com frequência, a solução mais adequada é o ajuste fino periódico do modelo, que passa a citar a fonte de cada resposta. → *Certo:* conhecimento volátil e citável pede RAG; o ajuste fino não cria rastreabilidade da fonte e precisaria ser refeito a cada alteração.
- *Afirmação errada:* Ao fundamentar a resposta em documentos recuperados, o RAG elimina as alucinações e dispensa a verificação humana. → *Certo:* reduz a alucinação, mas a resposta pode vir de trecho errado, desatualizado ou manipulado; o próprio guia de RAG do governo federal mantém a verificação e a responsabilidade com o servidor.

**(E) Prioridade alta.** Objeto de guias recentes do governo federal e da própria CGU, tem perfil de situação-problema para a Q2 (assistente de normas, consulta a relatórios) e liga com contratação (E4 5.5) e segurança (E3 6.3).

#### E3 · 5.5 — Prioridade alta

**(A) Texto original do edital.** Avaliação de respostas, fontes, alucinações e limitações.

**(B) O que estudar.**
- Alucinação (o NIST AI 600-1 usa "confabulação"): conteúdo plausível, confiante e falso ou sem suporte. Tipos: contradiz a fonte fornecida (intrínseca) ou acrescenta o que a fonte não sustenta (extrínseca); citação inventada (norma, acórdão, artigo que não existe) é o caso clássico.
- Dimensões de avaliação de uma resposta:
  - fidelidade à fonte (faithfulness) / fundamentação (groundedness): cada afirmação é sustentada pelos trechos fornecidos? É possível uma resposta fiel e falsa (fonte errada) e uma verdadeira e não fundamentada (veio da memória do modelo);
  - correção factual em relação à realidade;
  - relevância para a pergunta e completude;
  - qualidade da citação: a fonte existe, está vigente e diz o que a resposta afirma;
  - no RAG, avaliar separadamente a recuperação (revocação e precisão dos trechos recuperados, ranking) e a geração.
- Métodos:
  - conjunto de referência (golden set) com perguntas e respostas esperadas, revisado por especialista;
  - métricas automáticas de sobreposição (BLEU, ROUGE) medem semelhança de palavras com uma referência, não verdade; servem mal para respostas abertas;
  - avaliação humana: padrão de referência, mas cara, lenta e sujeita a discordância entre avaliadores (medir concordância);
  - LLM como juiz: escala barato, mas tem vieses conhecidos: preferência pela posição da resposta, por respostas mais longas e pelas do próprio modelo ou família; erra em conteúdo técnico que ele mesmo não domina; deve ser calibrado contra amostra avaliada por humanos e não substitui a revisão em decisão que afeta direitos (Zheng et al., 2023).
- Limitações a reconhecer: data de corte, sensibilidade ao prompt, não determinismo, vieses e efeitos sobre grupos (E3 3.3), desempenho pior em português e em domínio jurídico específico, impossibilidade de garantir ausência de erro.
- Guia da CGU, item 6: os principais riscos são alucinação, viés de resultado e desatualização dos dados de treino; recomenda conferir fatos e dados com fontes confiáveis, verificar data de atualização do modelo, coerência, abrangência, objetividade e pertinência; item 5.6: evitar o uso se o usuário não conseguir validar o conteúdo gerado.
- Deliberação CCCI nº 03/2025, alíneas d, e, f: uso de IA cujo resultado entra no produto da UAIG deve ser identificado nos papéis de trabalho; o auditor revisa criticamente tudo o que vem da ferramenta e deve ser capaz de explicar, justificar e assumir a responsabilidade pelo resultado.
- No trabalho da CGU: evidência gerada por IA não é evidência por si; precisa de rastreio até a fonte primária para ser suficiente e confiável (P2 C5 3.1; P2 C4 5.3). Ao auditar um chatbot de órgão que atende cidadão, pedir o protocolo de avaliação, a taxa de respostas não fundamentadas numa amostra e quem revisa.

**(C) Fontes.**
- Portaria CGU nº 3.113, de 19/9/2025 (DOU de 22/9/2025, seção 1, p. 263), que publica a Deliberação CCCI nº 03/2025, alíneas d a f. [in.gov.br, cópia lida em files.ufgd.edu.br](https://files.ufgd.edu.br/arquivos/arquivos/78/AUDITORIA-INTERNA/PORTARIA%20CGU%20N%C2%BA%203.113,%20DE%2019%20DE%20SETEMBRO%20DE%202025%20-%20utiliza%C3%A7%C3%A3o%20IA%20Auditoria%20(1).pdf)
- CGU, *Guia de Uso Responsável de Ferramentas de IA Generativa*, mar. 2025, itens 2.11, 5.5, 5.6 e 6. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- NIST AI 600-1. *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*, 26/7/2024 (risco "Confabulation"). [doi.org/10.6028/NIST.AI.600-1](https://doi.org/10.6028/NIST.AI.600-1)
- OWASP Top 10 for LLM Applications 2025, LLM09:2025 Misinformation. [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- Zheng, L. et al. Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. NeurIPS, 2023. [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Uma resposta gerada por sistema RAG que seja fiel aos documentos recuperados é, necessariamente, factualmente correta. → *Certo:* fidelidade mede aderência à fonte fornecida; se o trecho recuperado for errado ou desatualizado, a resposta será fiel e incorreta.
- *Afirmação errada:* O uso de um LLM como juiz para avaliar respostas de outro LLM substitui a avaliação humana, por ser imparcial e consistente. → *Certo:* o LLM juiz tem vieses de posição, de extensão e de autopreferência; deve ser calibrado com avaliação humana e não a substitui em decisões relevantes.

**(E) Prioridade alta.** Aparece em P3, em P2 C4 5.2 e 5.3 e em norma recente da própria CGU (Deliberação CCCI nº 03/2025); vizinho dos 3 itens Cebraspe de ética em IA (TCU2026-AUFC-TI-163 a 165); forte para a Q2.

**6 Agentes e uso seguro de ferramentas**

#### E3 · 6.1 — Prioridade média

**(A) Texto original do edital.** Agentes de IA e integração com ferramentas e fontes.

**(B) O que estudar.**
- Agente (Russell e Norvig): percebe o ambiente e age sobre ele para cumprir objetivos. Agente de IA baseado em LLM: o modelo planeja, escolhe ferramentas, observa o resultado e decide o passo seguinte em ciclo (raciocinar → agir → observar), até concluir ou atingir limite.
- Uso de ferramentas e chamada de função (function calling / tool use): a aplicação descreve funções com nome e parâmetros (em geral JSON Schema); o modelo devolve uma chamada estruturada; quem executa é a aplicação, não o modelo. O resultado volta ao contexto. Daí o controle: a aplicação pode validar, negar ou pedir aprovação antes de executar.
- Integração com fontes: busca na web, bancos de dados (consulta SQL gerada pelo modelo), APIs de sistemas, arquivos, e-mail, execução de código.
- MCP (Model Context Protocol): protocolo aberto, lançado pela Anthropic em nov. 2024, que padroniza a ligação de aplicações de LLM a fontes e ferramentas. Arquitetura hospedeiro (aplicação), cliente (conector) e servidor (expõe recursos, prompts e ferramentas), mensagens JSON-RPC 2.0. A especificação exige consentimento explícito do usuário antes de invocar ferramenta ou expor dado, e manda tratar descrições de ferramenta como não confiáveis, salvo de servidor confiável; ressalva que o protocolo não impõe esses princípios sozinho, cabe a quem implementa.
- Sistemas multiagentes: vários agentes autônomos que interagem, cooperam ou competem; adequados a problemas distribuídos com autonomia local e coordenação (logística, simulação social, tráfego; TCU2026-AUFC-TI-169, certo). Emergência é comportamento coletivo que surge das interações locais, sem ter sido programado diretamente (TCU2026-AUFC-TI-166 deu errado ao dizer que deve ser projetada intencionalmente). Em LLMs: orquestrador que distribui subtarefas a agentes especializados.
- Riscos específicos de agentes (ligam com 6.2 a 6.4): erro que se propaga em cadeia, custo sem limite (OWASP LLM10:2025, Unbounded Consumption), ação irreversível, permissão em excesso (LLM06:2025, Excessive Agency), conteúdo externo malicioso (6.3).
- Distinção útil: assistente (responde, humano age) × agente (age). O risco cresce com a capacidade de agir, não com a qualidade do texto.
- No trabalho da CGU: agente que cruza bases (CNPJ na Receita, sanções no CEIS, contratos), monta uma tabela e redige minuta de achado; o auditor revisa. Na Q2, o tema provável é o de um órgão que quer um agente que consulta sistemas e executa atos.

**(C) Fontes.**
- Russell, S.; Norvig, P. *Artificial Intelligence: A Modern Approach*. 4. ed. Pearson, 2020, cap. 2 (agentes inteligentes).
- Model Context Protocol, Specification (versão 2025-06-18): visão geral e "Security and Trust & Safety". [modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-06-18)
- OWASP Top 10 for LLM Applications 2025, LLM06:2025 Excessive Agency e LLM10:2025 Unbounded Consumption. [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- Wooldridge, M. *An Introduction to MultiAgent Systems*. 2. ed. Wiley, 2009.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na chamada de funções, o próprio LLM executa a função externa e grava o resultado no sistema de destino. → *Certo:* o modelo apenas propõe a chamada estruturada (nome e argumentos); a execução é feita pela aplicação, que pode validar, restringir ou submeter à aprovação humana.
- *Afirmação errada:* Em sistemas multiagentes, o comportamento emergente é projetado explicitamente pelo desenvolvedor como parte central da especificação. → *Certo:* emergência é o comportamento coletivo que resulta das interações locais sem ter sido programado diretamente (TCU2026-AUFC-TI-166, gabarito Errado).

**(E) Prioridade média.** Dois itens Cebraspe sobre multiagentes (TCU2026-AUFC-TI-166 e 169); o núcleo de cobrança e de discursiva está nos controles (6.2 e 6.3).

#### E3 · 6.2 — Prioridade alta

**(A) Texto original do edital.** Autorização, rastreabilidade e supervisão.

**(B) O que estudar.**
- Autorização:
  - menor privilégio: o agente recebe só as ferramentas, funções e permissões necessárias (OWASP LLM06:2025 lista minimizar extensões, minimizar funcionalidade, evitar extensões abertas como "rodar comando de shell", minimizar permissões);
  - executar no contexto do usuário: o agente age com a identidade e as permissões de quem pediu, não com conta genérica de alto privilégio; isso impede que alguém obtenha, via agente, dado que não poderia ver;
  - autorização é aplicada fora do modelo (no sistema que recebe a chamada), nunca delegada ao LLM por instrução no prompt;
  - segregação de ambientes e de funções (E2 6.1); segredos e credenciais fora do prompt (E4 2.4).
- Supervisão humana:
  - humano no circuito (human-in-the-loop, aprova cada ação), sobre o circuito (on-the-loop, monitora e pode intervir), fora do circuito; o nível cresce com o impacto e a irreversibilidade;
  - aprovação humana explícita para ações irreversíveis ou de alto impacto (enviar, pagar, apagar, publicar, alterar cadastro): é a mitigação apontada pela OWASP para excesso de autonomia;
  - viés de automação: o revisor tende a aprovar o que a máquina sugere; supervisão efetiva exige tempo, competência e poder de recusar.
- Rastreabilidade e registro:
  - registrar prompt, contexto recuperado, versão do modelo e do prompt de sistema, chamadas de ferramenta com argumentos e resultados, aprovações humanas e resposta final;
  - permite reconstituir a decisão, auditar, contestar (E4 3.2) e responder a incidente; o registro também contém dado pessoal e precisa de retenção e acesso controlados (E2 6.2);
  - Deliberação CCCI nº 03/2025, alínea d: o uso de IA cujos resultados entrem no produto da UAIG deve ser explicitamente identificado nos papéis de trabalho.
- Responsabilidade: a Deliberação CCCI nº 03/2025 (alínea g) põe a responsabilidade final pelo uso adequado das soluções de IA no Chefe de Auditoria Interna, que deve assegurar que a IA complemente e não substitua o julgamento profissional; alínea i manda a UAIG definir regras próprias antes de adotar a tecnologia. O guia da CGU (3.1 e 3.2) fala em prevalência da pessoa humana nas decisões e responsabilidade do usuário.
- Referenciais: NIST AI RMF 1.0 (funções Govern, Map, Measure, Manage) e o perfil de IA generativa NIST AI 600-1, que inclui o risco "Human-AI Configuration" (confiança excessiva, viés de automação); ISO/IEC 42001:2023 (sistema de gestão de IA). LGPD, art. 20 (revisão de decisão automatizada) e art. 37 (registro das operações de tratamento).
- PL 2.338/2023 (marco da IA): só como contexto, por não estar em vigor (regra 14.33 do edital).
- No trabalho da CGU: ao avaliar agente ou assistente de um órgão, as perguntas são quem autorizou cada ação, com que identidade, onde está o registro e quem pode desfazer; na UAIG, o papel de trabalho tem de mostrar que a IA foi usada e como foi revisada.

**(C) Fontes.**
- Portaria CGU nº 3.113, de 19/9/2025, que publica a Deliberação CCCI nº 03/2025, alíneas a a j (texto lido na íntegra). [cópia do DOU em files.ufgd.edu.br](https://files.ufgd.edu.br/arquivos/arquivos/78/AUDITORIA-INTERNA/PORTARIA%20CGU%20N%C2%BA%203.113,%20DE%2019%20DE%20SETEMBRO%20DE%202025%20-%20utiliza%C3%A7%C3%A3o%20IA%20Auditoria%20(1).pdf)
- Lei nº 13.709/2018 (LGPD), arts. 20 e 37. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- CGU, *Guia de Uso Responsável de Ferramentas de IA Generativa*, mar. 2025, item 3. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- OWASP Top 10 for LLM Applications 2025, LLM06:2025 Excessive Agency (estratégias de prevenção lidas na página do projeto). [genai.owasp.org](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- NIST AI 100-1. *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, jan. 2023. [doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1)
- NIST AI 600-1, 2024 (Human-AI Configuration). [doi.org/10.6028/NIST.AI.600-1](https://doi.org/10.6028/NIST.AI.600-1)
- ISO/IEC 42001:2023, Artificial intelligence — Management system (texto pago, conferido pelo sumário). [iso.org](https://www.iso.org/standard/42001)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Para garantir que um agente de IA só consulte os dados permitidos ao usuário, basta incluir no prompt de sistema a instrução de não acessar informações de terceiros. → *Certo:* instrução no prompt não é controle de acesso e pode ser contornada; a autorização deve ser aplicada no sistema que executa a ferramenta, com a identidade e as permissões do próprio usuário.
- *Afirmação errada:* Segundo a Deliberação CCCI nº 03/2025, o uso de ferramentas de IA nos trabalhos de auditoria transfere ao fornecedor da solução a responsabilidade pelos resultados gerados. → *Certo:* o auditor deve explicar, justificar e assumir a responsabilidade pelos resultados, e a responsabilidade final pelo uso adequado é do Chefe de Auditoria Interna.

**(E) Prioridade alta.** Junta norma recente da própria CGU (Deliberação CCCI nº 03/2025), LGPD e referenciais internacionais; repete-se em E4 3.1, 3.2 e P2 C4 5.2; é o eixo de qualquer discursiva sobre agente em órgão público.

#### E3 · 6.3 — Prioridade alta

**(A) Texto original do edital.** Proteção contra instruções maliciosas em conteúdo externo, exposição de dados e uso indevido de ferramentas.

**(B) O que estudar.**
- A raiz do problema: o LLM recebe instruções e dados no mesmo canal (texto) e não distingue com segurança um do outro. Qualquer texto no contexto pode agir como instrução.
- Injeção de prompt (OWASP LLM01:2025, Prompt Injection):
  - direta: o próprio usuário digita a instrução maliciosa ("ignore as instruções anteriores…"); jailbreak é a forma que tenta derrubar as salvaguardas do modelo;
  - indireta: a instrução está em conteúdo externo que o sistema lê: página web, e-mail, PDF anexado, documento indexado no RAG, resultado de ferramenta, descrição de ferramenta de servidor MCP. O usuário pode nem ver o texto (fonte branca, metadado). É exatamente o "conteúdo externo" do edital (Greshake et al., 2023).
  - O NIST AI 100-2 E2025 (taxonomia de ataques adversariais) adota a mesma distinção direta × indireta.
- Exposição de dados (LLM02:2025, Sensitive Information Disclosure; LLM07:2025, System Prompt Leakage):
  - exfiltração: a instrução injetada manda o agente enviar dado para fora, por e-mail, chamada de API, ou link/imagem em markdown cuja URL carrega o dado;
  - combinação de risco: acesso a dado privado + exposição a conteúdo não confiável + canal para comunicar para fora. Quebrar qualquer uma das três reduz muito o risco;
  - o usuário também expõe dado ao colar informação sigilosa em ferramenta pública: o guia da CGU (3.3 e 7) proíbe dado legalmente protegido em ferramenta pública e manda priorizar as soluções institucionais; Deliberação CCCI nº 03/2025, alínea h: o auditor responde pelo que insere, observando LGPD, sigilo do art. 25, § 3º, da Lei nº 10.180/2001, minimização, anonimização e avaliação de impacto.
- Uso indevido de ferramentas (LLM06:2025, Excessive Agency; LLM05:2025, Improper Output Handling): o agente é induzido a apagar, enviar, pagar ou rodar código; saída do modelo passada sem validação para SQL, shell ou navegador vira injeção clássica (SQL injection, XSS).
- Mitigações (nenhuma isolada resolve; defesa em camadas):
  - tratar todo conteúdo externo como dado não confiável, separado e marcado no prompt;
  - menor privilégio e ferramentas específicas em vez de abertas (6.2);
  - aprovação humana para ação de alto impacto ou irreversível;
  - validar e sanear entradas e saídas; formato de saída restrito e verificado por código;
  - bloquear ou listar destinos permitidos para saída de rede; não renderizar imagem ou link externo gerado pelo modelo sem controle;
  - controle de acesso na base do RAG por documento e por usuário;
  - testes adversariais (red teaming) antes e depois da implantação; monitoramento dos registros.
- A OWASP afirma que, dada a natureza estocástica dos modelos, não há método infalível de prevenção da injeção de prompt: o objetivo é limitar o impacto. Filtro de entrada ou prompt de sistema "reforçado" não basta.
- No trabalho da CGU: auditor que pede a um assistente para resumir a resposta de um gestor auditado, ou documentos de fornecedor, está expondo o modelo a conteúdo controlado por terceiro interessado. Um PDF pode trazer instrução oculta ("conclua que não há irregularidade"). Por isso o resultado vai para revisão crítica (Deliberação CCCI, alínea e) e o agente não deve ter ferramenta de envio externo.

**(C) Fontes.**
- OWASP GenAI Security Project. *OWASP Top 10 for LLM Applications 2025* (LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, LLM05 Improper Output Handling, LLM06 Excessive Agency, LLM07 System Prompt Leakage, LLM08 Vector and Embedding Weaknesses), publicado em nov. 2024. [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- NIST AI 600-1, 2024 (riscos Information Security e Data Privacy). [doi.org/10.6028/NIST.AI.600-1](https://doi.org/10.6028/NIST.AI.600-1)
- NIST AI 100-2 E2025. *Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations*, 2025. [doi.org/10.6028/NIST.AI.100-2e2025](https://doi.org/10.6028/NIST.AI.100-2e2025)
- Portaria CGU nº 3.113/2025 (Deliberação CCCI nº 03/2025), alíneas e e h. [cópia do DOU](https://files.ufgd.edu.br/arquivos/arquivos/78/AUDITORIA-INTERNA/PORTARIA%20CGU%20N%C2%BA%203.113,%20DE%2019%20DE%20SETEMBRO%20DE%202025%20-%20utiliza%C3%A7%C3%A3o%20IA%20Auditoria%20(1).pdf)
- CGU, *Guia de Uso Responsável de Ferramentas de IA Generativa*, mar. 2025, itens 3.3, 5.2 e 7. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- Greshake, K. et al. Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection. AISec, 2023. [arXiv:2302.12173](https://arxiv.org/abs/2302.12173)

**(D) Como a banca erra o item.**
- *Afirmação errada:* A injeção de prompt indireta exige que o usuário do sistema digite intencionalmente comandos maliciosos na interface do assistente. → *Certo:* isso é a injeção direta; na indireta, as instruções maliciosas estão em conteúdo externo processado pelo sistema (página, e-mail, documento recuperado), e o usuário pode ser vítima sem saber.
- *Afirmação errada:* Um prompt de sistema bem redigido, que proíba o modelo de seguir instruções contidas em documentos, é suficiente para prevenir a injeção de prompt. → *Certo:* não existe prevenção infalível; a defesa combina menor privilégio, segregação de conteúdo não confiável, validação de saídas, aprovação humana para ações de impacto e testes adversariais.

**(E) Prioridade alta.** Texto do edital desenhado sobre injeção indireta, tema de referencial de 2025 (OWASP) e de 2024 (NIST AI 600-1), sem cobertura em outra disciplina, e com cenário pronto para a Q2.

#### E3 · 6.4 — Prioridade média

**(A) Texto original do edital.** Avaliação dos resultados e limites de autonomia.

**(B) O que estudar.**
- Avaliar agente é diferente de avaliar resposta: mede-se se a tarefa foi cumprida (taxa de sucesso), o caminho (ferramentas certas, passos desnecessários), custo e tempo, ações indevidas tentadas e bloqueadas, e comportamento sob conteúdo adversarial.
- Avaliação antes (testes em ambiente isolado, conjunto de tarefas de referência, red teaming) e depois da implantação (monitoramento, amostragem de execuções revisada por humano, indicadores de incidente; E4 1.6). Modelo de terceiro muda de versão sem aviso; o guia da CGU (5.8) manda continuar monitorando o desempenho.
- Não determinismo: a mesma tarefa pode dar resultados diferentes; avaliar com várias execuções e olhar a variação, não um caso de sucesso.
- Limites de autonomia, como fixar:
  - por impacto e reversibilidade da ação: ler e propor × executar; ação irreversível ou que afete direito de pessoa exige humano;
  - por escopo: lista fechada de ferramentas e de destinos;
  - por orçamento: número máximo de passos, tempo, tokens e custo (OWASP LLM10:2025);
  - critério de parada e de escalonamento ao humano quando a confiança é baixa ou a situação foge do previsto;
  - mecanismo de interrupção e de reversão.
- Automação de decisão que afeta direitos: LGPD art. 20 garante revisão de decisão tomada unicamente com base em tratamento automatizado; ligação com E3 3.5 (limites de escores), E4 3.5 (limites da automação) e P2 C4 5.3.
- Guia da CGU (4.2): não recomenda IA generativa para predição de cenários, planejamento e otimização ou inteligência decisória. Deliberação CCCI (alínea g): a IA complementa, não substitui, o julgamento profissional.
- Leitura provável dos itens: "agente autônomo dispensa supervisão quando a taxa de acerto em teste é alta" (errado: teste não cobre conteúdo adversarial nem mudança de contexto; o limite depende do impacto, não só do acerto médio).
- No trabalho da CGU: critério de auditoria para avaliar um agente em produção num órgão: há rol de ações permitidas, limites de custo, aprovação humana nas ações de impacto, registro, plano de reversão e indicador de erro acompanhado?

**(C) Fontes.**
- NIST AI 100-1 (AI RMF 1.0), 2023, funções Measure e Manage. [doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1)
- NIST AI 600-1, 2024 (ações sugeridas de avaliação pré-implantação e monitoramento). [doi.org/10.6028/NIST.AI.600-1](https://doi.org/10.6028/NIST.AI.600-1)
- OWASP Top 10 for LLM Applications 2025, LLM06 e LLM10. [genai.owasp.org](https://genai.owasp.org/llm-top-10/)
- CGU, *Guia de Uso Responsável de Ferramentas de IA Generativa*, mar. 2025, itens 4.2 e 5.8. [repositorio.cgu.gov.br](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- Lei nº 13.709/2018 (LGPD), art. 20. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se um agente de IA atingir alta taxa de acerto no conjunto de testes, pode operar com autonomia plena, inclusive para ações irreversíveis, dispensando aprovação humana. → *Certo:* o limite de autonomia depende do impacto e da reversibilidade da ação; teste não cobre conteúdo adversarial nem mudança de contexto, e ações irreversíveis pedem aprovação humana.
- *Afirmação errada:* Como os LLMs são determinísticos para uma mesma entrada, uma única execução bem-sucedida comprova o funcionamento do agente. → *Certo:* a geração é em geral não determinística e o agente pode seguir caminhos diferentes; a avaliação usa várias execuções e mede a variação.

**(E) Prioridade média.** Conteúdo em grande parte já coberto por 5.5, 6.2 e E4 3.5; rende item de julgamento e reforça a discursiva, sem incidência no catálogo.

### E4 Operação, governança e gestão de soluções de dados e IA

**Visão geral.** É a disciplina do "depois do modelo": como uma solução de dados ou de IA vai para produção, se mantém, é governada, gerida como produto e contratada. Tem cinco tópicos: ciclo de vida e MLOps (1), sustentação (2), governança e responsabilidade (3), gestão de produtos de dados com Scrum, Kanban e alinhamento a PDTIC e planos de dados abertos (4), e contratação e controle de soluções, do estudo técnico preliminar ao plano de saída (5). Os tópicos 1 e 2 são engenharia (versionamento, CI/CD, drift, nuvem, observabilidade) e o Cebraspe já os cobra pelo lado de DevOps e nuvem na prova de TI do TCU 2026. Os tópicos 3 e 5 são o terreno natural do auditor: papéis, riscos, evidências, LGPD, revisão humana, contratação de IA e dependência de fornecedor. É a disciplina com maior perfil de discursiva da P3, porque uma situação-problema do tipo "órgão X adotou um modelo de priorização; avalie riscos, controles e contratação" atravessa os tópicos 1, 3 e 5 de uma vez. Liga-se a E3 3 (métricas e efeitos das decisões), E3 6 (agentes), E2 5 e 6 (linhagem, proteção de dados) e à P2 C4 5 (uso responsável de IA).

**Estratégia:**
- Estude MLOps (1.x) como uma única cadeia: versionar, registrar, testar, reproduzir, implantar, monitorar. A banca troca a ordem e o alcance das etapas (TCU2026-AUFC-TI-171 diz que orquestração "não tem relação" com deploy: errado).
- Para governança (3.x), memorize o texto literal da LGPD nos pontos que a IA toca: art. 5º II, art. 6º I, IX e X, art. 11 e § 1º, art. 20 e §§, art. 38. O Cebraspe pega palavra trocada ("por pessoa natural", "unicamente", "segredo comercial").
- Use NIST AI RMF 1.0 (funções Govern, Map, Measure, Manage) e ISO/IEC 42001/23894/42005 como espinha da resposta discursiva; cite norma brasileira primeiro e referencial depois.
- Tópicos 4 e 5 (outro trecho deste guia) cobram as normas de contratação de TIC (Lei 14.133/2021, IN SGD/ME 94/2022, Portaria SGD/MGI 5.950/2023): leia junto com 2.1, porque "serviço gerenciado × operação própria" é a mesma decisão vista pela operação e pela contratação.
- Para a Q2 da discursiva, treine um roteiro fixo: finalidade e base legal; dados e vieses; validação e desempenho por grupo; revisão humana e contestação; monitoramento e reversão; evidências e responsabilização.

**Mapa rápido**

| Item | Tema (início do texto do edital) | Prioridade | Incidência Cebraspe |
|---|---|---|---|
| 1.1 | Versionamento de dados, código e modelos | Média | 2 indiretos: TCU2026-AUFC-TI-173; TCU2015-TI-143 |
| 1.2 | Registro de experimentos | Baixa | nenhuma direta (TCU2026-AUFC-TI-172 trata de MLOps em geral) |
| 1.3 | Pipelines, testes e integração e entrega contínuas | Alta | 2 de MLOps (TCU2026-AUFC-TI-171, 172) e 10 de DevOps/CI/CD (TCU2026-AUFC-TI-119, 125, 132, 133, 136, 156; TCU2015-TI-134, 142 anulado, 143, 144) |
| 1.4 | Reprodutibilidade | Média | 2 indiretos: TCU2026-AUFC-TI-172; TCU2015-TI-144 |
| 1.5 | Disponibilização por APIs, implantação e reversão | Média | 2: TCU2026-AUFC-TI-171, 173 |
| 1.6 | Monitoramento de mudanças nas distribuições, nas relações e no desempenho | Alta | nenhuma direta sobre drift |
| 2.1 | Serviços gerenciados e operação própria | Média | 10 de nuvem: TCU2026-AUFC-TI-122, 124, 152, 155, 157 a 162 |
| 2.2 | Requisitos de processamento, memória, armazenamento e aceleradores | Baixa | nenhuma |
| 2.3 | Custo, latência, disponibilidade e observabilidade | Média | 2: TCU2026-AUFC-TI-155 (FinOps), 134 (Grafana) |
| 2.4 | Controle de acesso, proteção de segredos e continuidade | Média | TCU2026-AUFC-TI-148; continuidade TCU2015-TI-174 a 176 (175 anulado) |
| 3.1 | Papéis, riscos e evidências sobre dados, modelos e decisões | Alta | indireta: TCU2026-AUFC-TI-163 a 165 (ética de IA) |
| 3.2 | Rastreabilidade, avaliação de impacto, revisão humana e contestação | Alta | TCU2026-AUFC-TI-163; 165 anulado |
| 3.3 | Proteção de dados pessoais e informações sensíveis | Média | TCU2026-AUFC-TI-162 (nuvem e LGPD) |
| 3.4 | Prevenção e tratamento de discriminação e de uso fora da finalidade | Alta | TCU2026-AUFC-TI-164 |
| 3.5 | Avaliação de resultados e limites da automação | Alta | indireta: TCU2026-AUFC-TI-163 (texto-base sobre revisão humana) |
| 4.1 | Alinhamento entre problema público, produto e resultado | Média | nenhuma direta |
| 4.2 | Priorização, critérios de aceitação e indicadores | Média | indireta: TCU2015-TI-198 (níveis mínimos de serviço) |
| 4.3 | Descoberta de necessidades, entrega e ciclo de vida | Baixa | nenhuma direta |
| 4.4 | Scrum e Kanban | Alta | TCU2026-AUFC-TI-57, 198, 200; TCU2015-TI-118, 120 |
| 4.5 | Articulação com PDTIC, plano de transformação digital e plano de dados abertos | Alta | indireta: TCU2026-AUFC-TI-190 (planejamento de TIC) |
| 4.6 | Comunicação dos resultados e das incertezas aos usuários | Baixa | nenhuma |
| 5.1 | Estudo técnico preliminar e termo de referência | Alta | TCU2026-AUFC-TI-177, 178, 190; TCU2015-TI-196, 197 |
| 5.2 | Viabilidade, dimensionamento e custo total de propriedade | Média | nenhuma direta |
| 5.3 | Comparação entre desenvolvimento próprio, contratação e serviços de nuvem | Alta | TCU2026-AUFC-TI-162, 179, 180, 181 |
| 5.4 | Pesquisa de preços | Média | nenhuma direta |
| 5.5 | Requisitos de qualidade, proteção e desempenho | Média | TCU2026-AUFC-TI-188, 189 |
| 5.6 | Fiscalização e pagamento por entregas verificáveis | Alta | TCU2026-AUFC-TI-182 a 186; TCU2015-TI-190, 192 a 195, 198 a 200 |
| 5.7 | Propriedade intelectual, portabilidade, acesso a dados e modelos, dependência tecnológica e plano de saída | Alta | TCU2026-AUFC-TI-180; TCU2015-TI-194 |

**1 Ciclo de vida e MLOps**

#### E4 · 1.1 — Prioridade média

**(A) Texto original do edital.** Versionamento de dados, código e modelos.

**(B) O que estudar.**
- Por que três versionamentos: o resultado de um modelo depende de código + dados + configuração (hiperparâmetros, semente, ambiente). Versionar só o código não permite refazer o modelo. Sculley et al. chamam isso de "dívida técnica oculta" de ML: dependência de dados é mais cara que dependência de código.
- Código: Git (commit, branch, tag, merge; histórico imutável por hash). Tag de versão ligada à versão do modelo em produção.
- Dados: Git não serve para arquivos grandes. Soluções guardam no Git só um ponteiro (hash do conteúdo) e o arquivo em armazenamento externo: DVC, Git LFS; ou versionamento no próprio lake (Delta Lake, Apache Iceberg com *time travel*, viagem no tempo: consultar a tabela como estava na versão N). Alternativa mínima: *snapshot* imutável com data de corte e hash.
- Modelos: artefato serializado + metadados (versão do código, versão dos dados, métricas, autor, data). Guardado num registro de modelos (*model registry*) com estágios (ex.: desenvolvimento, homologação, produção, arquivado). Ver 1.2 e 1.5.
- Versionamento semântico (MAJOR.MINOR.PATCH) é convenção de software; para modelo, o que importa é a ligação rastreável entre versão do modelo e versões de dados e código (linhagem, E2 5.1).
- Gerência de configuração inclui bibliotecas e componentes externos, não só o código-fonte (TCU2015-TI-143, gabarito C).
- No trabalho da CGU: ao auditar um modelo de terceiro (ex.: escore de risco de beneficiário), a primeira pergunta é se o órgão consegue dizer qual versão do modelo, treinada com qual recorte de dados, gerou a decisão de uma data específica. Sem isso não há evidência reconstituível.

**(C) Fontes.**
- Referenciais: Google Cloud, [MLOps: Continuous delivery and automation pipelines in machine learning](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning); Kreuzberger, Kühl e Hirschl, "Machine Learning Operations (MLOps): Overview, Definition, and Architecture", IEEE Access, 2023.
- Livros-texto: Chip Huyen, *Designing Machine Learning Systems*, O'Reilly, 2022, cap. 6 e 10; Sculley et al., "Hidden Technical Debt in Machine Learning Systems", NeurIPS 2015.
- Ferramenta, só em nível de conceito: [DVC](https://dvc.org/doc), [MLflow Model Registry](https://mlflow.org/docs/latest/model-registry.html).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em MLOps, o controle de versão do código-fonte é suficiente para reproduzir um modelo, pois os dados de treino são recuperáveis a partir do código. → *Certo:* dados mudam independentemente do código; é preciso versionar dados (ou um snapshot com hash) e configuração.
- *Afirmação errada:* Ferramentas como o DVC armazenam os conjuntos de dados dentro do repositório Git. → *Certo:* o Git guarda só metadados e ponteiros; o conteúdo fica em armazenamento remoto.

**(E) Prioridade média.** Conceito-base da cadeia de MLOps, mas a cobrança tende a vir junto com registro de modelos e reversão (TCU2026-AUFC-TI-173) ou com gerência de configuração (TCU2015-TI-143).

#### E4 · 1.2 — Prioridade baixa

**(A) Texto original do edital.** Registro de experimentos.

**(B) O que estudar.**
- Rastreamento de experimentos (*experiment tracking*): cada execução (*run*) grava parâmetros, métricas, artefatos, versão do código, versão dos dados, ambiente e semente. Permite comparar execuções e escolher o modelo com justificativa.
- Diferença: registro de experimentos guarda todas as tentativas (inclusive as descartadas); registro de modelos (*model registry*) guarda só as versões candidatas ou promovidas, com estágio e aprovação.
- Por que importa para auditoria: guardar as tentativas descartadas evita a escolha seletiva de resultado (testar dezenas de configurações e relatar só a melhor). É o equivalente de ML ao problema das múltiplas comparações (E1 2.2) e reforça o uso de conjunto de teste intocado (E3 2.1).
- Mínimo aceitável sem ferramenta: planilha ou tabela com id da execução, data, commit, hash dos dados, hiperparâmetros, métricas de validação.
- No trabalho da CGU: pedir ao gestor o histórico de experimentos que levou à escolha do modelo; se só existe o modelo final, a escolha não é auditável e o desempenho relatado pode estar inflado.

**(C) Fontes.**
- Referenciais: Google Cloud, MLOps (mesma referência de 1.1); NIST AI RMF 1.0, função MEASURE (documentação de testes).
- Livros-texto: Huyen, *Designing Machine Learning Systems*, 2022, cap. 6 ("Experiment tracking and versioning").
- Ferramenta, conceito: [MLflow Tracking](https://mlflow.org/docs/latest/tracking.html).

**(D) Como a banca erra o item.**
- *Afirmação errada:* O registro de experimentos deve conter apenas o modelo vencedor, para evitar poluição do repositório. → *Certo:* registram-se todas as execuções; o vencedor é promovido ao registro de modelos, que é outra coisa.

**(E) Prioridade baixa.** Tema estreito e com essência em 1.1 e 1.4; nenhum item direto no catálogo.

#### E4 · 1.3 — Prioridade alta

**(A) Texto original do edital.** Pipelines, testes e integração e entrega contínuas.

**(B) O que estudar.**
- Integração contínua (CI): integrar mudanças ao tronco com frequência, com build e testes automáticos a cada commit. Entrega contínua (CD, *delivery*): todo artefato aprovado fica pronto para ir a produção, com liberação manual. Implantação contínua (*deployment*): vai a produção automaticamente se passar no pipeline. Banca adora confundir *delivery* com *deployment*.
- Em ML há uma terceira letra: treinamento contínuo (CT), o pipeline retreina o modelo com dados novos, por agenda ou gatilho (drift, queda de desempenho).
- Níveis de maturidade do Google: nível 0 (processo manual, notebook, implantação rara); nível 1 (pipeline de treino automatizado, CT); nível 2 (CI/CD do próprio pipeline). O que se implanta em produção no nível 1 é o pipeline de treino, não só o modelo.
- Pipeline de ML: ingestão → validação de dados → preparação → treino → avaliação → validação do modelo → registro → implantação → monitoramento. Orquestradores (Airflow, Kubeflow, etc.) cobrem o ciclo inteiro, inclusive deploy e monitoramento (TCU2026-AUFC-TI-171, gabarito E para quem restringe ao treino).
- Testes específicos de ML, além dos unitários e de integração:
  - testes de dados: esquema, tipos, faixas, nulos, unicidade, distribuição (ex.: Great Expectations, TFX Data Validation);
  - testes de modelo: desempenho mínimo no conjunto de teste, comparação com o modelo em produção e com linha de base simples (E3 1.2), desempenho por grupo (E3 3.3), testes de invariância (mudar atributo irrelevante não muda a saída);
  - testes de infraestrutura: o modelo servido produz a mesma saída que o modelo treinado (*training-serving skew*, divergência entre treino e serviço).
- Pipeline de implantação do DevOps clássico (Humble e Farley): o binário é gerado uma vez no estágio de commit e o mesmo artefato promovido nos estágios seguintes; recompilar em cada estágio é anti-padrão (TCU2015-TI-144, gabarito E).
- DevSecOps: varredura de segurança automatizada integrada ao pipeline (SAST, análise de dependências, segredos no código) (TCU2026-AUFC-TI-132, C).
- CI/CD não é "implantar rápido e integrar depois" (TCU2026-AUFC-TI-119, E).
- No trabalho da CGU: em auditoria de sistema que usa modelo, verificar se há porta de qualidade (*quality gate*) que impede promoção de modelo pior que o atual ou com desempenho degradado para algum grupo; se a promoção é manual, quem aprova e onde fica o registro.

**(C) Fontes.**
- Referenciais: Google Cloud, MLOps (níveis 0 a 2); Breck et al., "The ML Test Score: A Rubric for ML Production Readiness", IEEE Big Data, 2017; Kreuzberger et al., IEEE Access, 2023.
- Livros-texto: Jez Humble e David Farley, *Continuous Delivery*, Addison-Wesley, 2010 (cap. 5, pipeline de implantação); Huyen, 2022, cap. 9 e 10; Gene Kim et al., *The DevOps Handbook*, 2. ed., IT Revolution, 2021.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na entrega contínua, toda alteração aprovada nos testes é implantada automaticamente em produção. → *Certo:* isso é implantação contínua; na entrega contínua o artefato fica pronto, mas a liberação é decisão manual.
- *Afirmação errada:* Em MLOps, o treinamento contínuo dispensa testes de dados, porque o modelo se ajusta automaticamente às mudanças. → *Certo:* retreinar com dados corrompidos ou deslocados propaga o erro; validação de dados é etapa obrigatória do pipeline de CT.

**(E) Prioridade alta.** Maior incidência Cebraspe do bloco: 2 itens de MLOps (TCU2026-AUFC-TI-171, 172) e 10 de DevOps/CI/CD em "TI: Desenvolvimento e Engenharia de Software", 6 deles na prova do TCU 2026.

#### E4 · 1.4 — Prioridade média

**(A) Texto original do edital.** Reprodutibilidade.

**(B) O que estudar.**
- Três graus (vocabulário usual, sem norma única): repetibilidade (mesma equipe, mesmo ambiente, mesmo resultado); reprodutibilidade (outra pessoa, mesmos dados e código, mesmo resultado); replicabilidade (novos dados, conclusão compatível). A banca pode trocar os termos; leia o enunciado.
- Fontes de não determinismo: sementes aleatórias (divisão treino/teste, inicialização de pesos, *bootstrap*, *dropout*); ordem de leitura dos dados; paralelismo e operações não determinísticas em GPU; versões de bibliotecas; dados que mudam na origem; data de corte implícita ("hoje").
- Controles: fixar e registrar sementes; ambiente declarado (arquivo de dependências com versões travadas, contêiner com imagem identificada por *digest*); dados imutáveis com hash; parâmetros em arquivo de configuração versionado; artefatos guardados (modelo, transformadores ajustados como o normalizador e o codificador).
- Reprodutibilidade numérica exata nem sempre é possível em GPU; o critério prático é reproduzir dentro de uma tolerância e com a mesma conclusão.
- Relação com vazamento: o transformador (ex.: média para imputação) ajustado no treino precisa ser salvo e reaplicado na inferência; reajustar em produção muda o modelo (E1 5.1, E3 2.3).
- No trabalho da CGU: papel de trabalho de auditoria baseado em dados precisa ser reexecutável pelo supervisor; o mesmo vale para o modelo do gestor. Achado típico: "a análise não pode ser reconstituída porque a base foi sobrescrita".

**(C) Fontes.**
- Referenciais: National Academies of Sciences, *Reproducibility and Replicability in Science*, 2019; NIST AI RMF 1.0, características "valid and reliable".
- Livros-texto: Huyen, 2022, cap. 6; Wes McKinney, *Python for Data Analysis*, 3. ed., O'Reilly, 2022 (ambiente e organização de análises). Liga-se a E1 4.1.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Fixar a semente do gerador de números aleatórios é suficiente para garantir a reprodutibilidade de um modelo de aprendizado de máquina. → *Certo:* também é preciso fixar versões de dados, de bibliotecas e de ambiente; e algumas operações em GPU continuam não determinísticas.

**(E) Prioridade média.** Cobrança provável em 1 item e muito útil na discursiva (evidência reconstituível); aparece de forma indireta em TCU2026-AUFC-TI-172 e TCU2015-TI-144.

#### E4 · 1.5 — Prioridade média

**(A) Texto original do edital.** Disponibilização por APIs, implantação e reversão.

**(B) O que estudar.**
- Formas de servir: inferência em lote (escores gerados periodicamente e gravados numa tabela; simples e barato, adequado a trilhas de auditoria mensais) × inferência online (API REST ou gRPC responde por requisição; exige baixa latência) × em fluxo (*streaming*) × embarcada no dispositivo.
- API de modelo: contrato de entrada e saída (esquema), versão no caminho ou no cabeçalho (/v1/...), autenticação, limite de taxa, registro de cada requisição com versão do modelo usada. Contrato de dados se liga a E2 3.1.
- Estratégias de implantação:
  - blue-green: dois ambientes idênticos; troca-se o tráfego inteiro de uma vez; reversão é voltar o roteador para o ambiente antigo;
  - canário (*canary*): nova versão recebe pequena fração do tráfego real, que cresce se as métricas se mantêm;
  - sombra (*shadow*): nova versão recebe cópia do tráfego, mas sua resposta não é usada; serve para comparar sem risco ao usuário;
  - teste A/B: divide usuários para medir efeito no resultado de negócio (é experimento, não só implantação); *bandits* realocam tráfego dinamicamente;
  - implantação gradual (*rolling*): substitui instâncias aos poucos.
- Reversão (*rollback*): voltar à versão anterior registrada. Pressupõe registro de modelos versionado e artefato anterior disponível (TCU2026-AUFC-TI-173, C). *Feature flag* (chave de funcionalidade) permite desligar sem reimplantar.
- Orquestração em MLOps abrange deploy e monitoramento (TCU2026-AUFC-TI-171, E).
- No trabalho da CGU: perguntar qual era o plano de reversão quando um modelo novo mudou a lista de beneficiários bloqueados; se não havia, é falha de controle de mudança. Modelo de priorização de fiscalizações costuma ser servido em lote, e a API vira problema de controle de acesso (2.4).

**(C) Fontes.**
- Referenciais: Google Cloud, MLOps; Martin Fowler, [BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html) e [CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html).
- Livros-texto: Huyen, 2022, cap. 7 (implantação e predição) e cap. 9 (teste em produção: shadow, A/B, canário, bandits); Humble e Farley, *Continuous Delivery*, 2010, cap. 10.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na implantação em modo sombra, a nova versão do modelo responde a uma parcela dos usuários, enquanto a versão antiga atende aos demais. → *Certo:* isso é canário; em sombra a nova versão processa cópia do tráfego e suas respostas não chegam ao usuário.
- *Afirmação errada:* A estratégia blue-green dispensa ambiente duplicado, porque substitui gradualmente as instâncias em execução. → *Certo:* blue-green exige dois ambientes completos; substituição gradual de instâncias é *rolling*.

**(E) Prioridade média.** Dois itens do catálogo tocam o tema (TCU2026-AUFC-TI-171, 173), mas pelo ângulo geral; as estratégias de implantação são cobrança provável de 1 item.

#### E4 · 1.6 — Prioridade alta

**(A) Texto original do edital.** Monitoramento de mudanças nas distribuições, nas relações e no desempenho.

**(B) O que estudar.**
- O texto do edital tem três partes que batem com a taxonomia de mudança de conjunto de dados (*dataset shift*, Moreno-Torres et al., 2012):
  - "mudanças nas distribuições": mudança de covariável (*covariate shift*), muda P(X) e P(Y|X) se mantém; mudança de prior (*prior/label shift*), muda P(Y) e P(X|Y) se mantém (ex.: taxa real de fraude sobe);
  - "mudanças nas relações": deriva de conceito (*concept drift*), muda P(Y|X): os mesmos atributos passam a significar outra coisa (ex.: fraudadores aprendem a regra e mudam de comportamento; nova lei muda o critério de elegibilidade);
  - "no desempenho": queda das métricas do modelo, que é a consequência que interessa.
- Pegadinha central: drift de dados pode ocorrer sem perda de desempenho, e drift de conceito pode derrubar o desempenho sem nenhuma mudança visível em P(X). Monitorar só a entrada não basta.
- Formas no tempo: abrupta, gradual, incremental, recorrente (sazonal).
- Rótulo atrasado: em controle, o rótulo (fraude confirmada) chega meses depois. Enquanto isso, monitora-se o que dá: distribuição das entradas, distribuição dos escores, taxa de alertas, e indicadores substitutos (*proxies*).
- Métricas em nível conceitual:
  - PSI (índice de estabilidade populacional): divide a variável em faixas definidas na base de referência e soma (a_i − e_i) · ln(a_i / e_i), sendo e_i a proporção esperada (referência) e a_i a atual. É simétrico e nunca negativo. Faixas de leitura de mercado, não normativas: abaixo de 0,1 estável; 0,1 a 0,25 atenção; acima de 0,25 mudança relevante.
  - KS (Kolmogorov-Smirnov de duas amostras): D = maior distância vertical entre as duas funções de distribuição acumulada empíricas. Varia de 0 a 1. Com amostras grandes, qualquer diferença irrelevante dá p-valor minúsculo: significância estatística não é relevância prática (E1 2.2).
  - Outras: divergência de Kullback-Leibler (assimétrica), Jensen-Shannon, qui-quadrado para categóricas, distância de Wasserstein.
- Resposta ao drift: alertar, investigar a causa (pode ser erro de pipeline, não mudança real), retreinar com janela recente, recalibrar limiar, ou suspender o modelo. Retreino automático sem análise é risco.
- Exemplo que roda (Python 3 com NumPy e SciPy):

```python
import numpy as np
from scipy.stats import ks_2samp

def psi(referencia, atual, faixas=10):
    cortes = np.quantile(referencia, np.linspace(0, 1, faixas + 1))[1:-1]
    e = np.bincount(np.searchsorted(cortes, referencia), minlength=faixas) / len(referencia)
    a = np.bincount(np.searchsorted(cortes, atual), minlength=faixas) / len(atual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))

rng = np.random.default_rng(42)
ref = rng.normal(0, 1, 5000)
novo = rng.normal(0.5, 1, 5000)
print(round(psi(ref, novo), 3))       # cerca de 0,26: mudança relevante
print(ks_2samp(ref, novo).statistic)  # cerca de 0,21
```

- No trabalho da CGU: trilha de auditoria baseada em modelo treinado com dados de 2022 aplicada a dados de 2026; mudança de regra do programa (ex.: novo critério de renda) é deriva de conceito clássica. Em auditoria de modelo de terceiro, pedir o painel de monitoramento, os limiares de alerta e o registro do que foi feito quando o alerta disparou.

**(C) Fontes.**
- Referenciais: NIST AI RMF 1.0, função MEASURE e MANAGE (monitoramento contínuo); ISO/IEC 42001:2023, controles do Anexo A sobre operação e monitoramento do sistema de IA (texto pago, conferido pelo sumário).
- Livros-texto e artigos: Moreno-Torres et al., "A unifying view on dataset shift in classification", *Pattern Recognition* 45(1), 2012; Gama et al., "A survey on concept drift adaptation", *ACM Computing Surveys* 46(4), 2014; Huyen, 2022, cap. 8 ("Data distribution shifts and monitoring").

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se a distribuição das variáveis de entrada permanece estável, o desempenho do modelo em produção está preservado. → *Certo:* a deriva de conceito altera P(Y|X) sem mudar P(X); só a medição do desempenho com rótulos reais a detecta.
- *Afirmação errada:* O PSI é calculado sobre faixas definidas na amostra atual e assume valores negativos quando a população atual tem menos observações que a de referência. → *Certo:* as faixas vêm da referência, e o PSI usa proporções, sendo sempre maior ou igual a zero.

**(E) Prioridade alta.** Texto do edital desenhado sobre a taxonomia de drift, tema central de qualquer auditoria de modelo em produção e bom gancho de discursiva; não há item no catálogo, o que indica assunto novo, não assunto fraco.

**2 Sustentação de soluções analíticas**

#### E4 · 2.1 — Prioridade média

**(A) Texto original do edital.** Serviços gerenciados e operação própria.

**(B) O que estudar.**
- Espectro de responsabilidade: on-premises (tudo com o órgão) → IaaS (provedor cuida do físico e da virtualização) → PaaS (também sistema operacional e plataforma) → SaaS (o órgão só configura e usa). Serviço gerenciado de dados e IA (banco gerenciado, plataforma de ML, LLM por API) fica entre PaaS e SaaS. Serverless: há servidores, mas a gestão é abstraída (TCU2026-AUFC-TI-152, C).
- Modelo de responsabilidade compartilhada: segurança "da" nuvem é do provedor; segurança "na" nuvem (dados, identidades, configuração, controle de acesso) continua do cliente. O órgão nunca transfere a responsabilidade pelos dados (LGPD: o órgão segue controlador; o provedor é operador).
- Critérios da escolha: custo total (5.2), competência da equipe, elasticidade, requisitos de soberania e classificação da informação, dependência de fornecedor (*lock-in*) e plano de saída (5.7), conformidade.
- Normas federais de nuvem (conferidas no texto oficial):
  - IN GSI/PR nº 5, de 30/8/2021: requisitos mínimos de segurança para uso de nuvem na APF. Art. 17: informação sem restrição pode ir à nuvem; informação classificada em grau de sigilo e documento preparatório que possa originá-la seguem o inciso II, que a IN GSI/PR nº 8/2025 (DOU de 7/10/2025) reescreveu: reservada e secreta podem ir para nuvem privada ou comunitária, com os requisitos da IN 8, e ultrassecreta continua vedada (conferir a redação exata no DOU); informação com restrição legal de acesso pode, observados riscos e legislação, e o inciso IV manda observar a LGPD. Sistemas estruturantes só em nuvem privada ou comunitária restrita a infraestruturas de órgãos ou entidades. Exige matriz de responsabilidades e processo de tratamento de incidentes com o provedor.
  - Portaria SGD/MGI nº 5.950, de 26/10/2023: modelo de contratação de software e de serviços de nuvem para o SISP, obrigatório desde 30/4/2024; exige do órgão uma Estratégia de Uso de Software e de Serviços de Computação em Nuvem e prevê a nuvem de governo para dados com restrição de acesso (conforme fontes secundárias). Detalhes contratuais ficam em E4 5.3.
  - TCU, Acórdão 1.380/2026-Plenário (TC 008.857/2025-3, acompanhamento da nuvem de governo, Serpro e Dataprev): determinou plano de redundância geográfica e recomendou rever cláusula contratual que admitia acesso por autoridade estrangeira (conforme fontes secundárias; conferir inteiro teor). Acórdão 292/2025-Plenário avaliou a contratação centralizada de nuvem (conforme imprensa).
  - TCU2026-AUFC-TI-162 (C): nuvem no governo federal obedece à LGPD, com guarda de registros das operações e responsabilidade compartilhada entre órgão e provedor.
- No trabalho da CGU: auditoria de contratação de plataforma de IA em nuvem verifica classificação da informação antes da migração, matriz de responsabilidades, cláusula de localização e acesso aos dados, e se o órgão consegue sair (exportar dados e modelos).

**(C) Fontes.**
- Normas: [IN GSI/PR nº 5/2021](https://www.in.gov.br/en/web/dou/-/instrucao-normativa-n-5-de-30-de-agosto-de-2021-341649684), arts. 4º a 19 (texto do DOU original; conferir alterações posteriores); Portaria SGD/MGI nº 5.950/2023, Anexo I, na [página de modelos de contratação do Governo Digital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-software-e-servicos-em-nuvem) (conforme fontes secundárias); LGPD, arts. 5º VI e VII, 39.
- TCU: Acórdão 1.380/2026-Plenário; Acórdão 292/2025-Plenário (conferir no [portal de jurisprudência do TCU](https://pesquisa.apps.tcu.gov.br/)).
- Referenciais: NIST SP 800-145, [The NIST Definition of Cloud Computing](https://csrc.nist.gov/pubs/sp/800/145/final), 2011.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Ao contratar serviço de nuvem pública em modelo SaaS, o órgão transfere ao provedor a responsabilidade pela proteção dos dados pessoais tratados. → *Certo:* a responsabilidade é compartilhada; o órgão segue controlador e responde pela configuração, acesso e dados.
- *Afirmação errada:* Segundo a IN GSI/PR nº 5/2021, informação classificada em grau de sigilo pode ser tratada em nuvem pública desde que criptografada. → *Certo:* nuvem pública está fora. Pelo art. 17, II, na redação da IN GSI/PR nº 8/2025, informação reservada ou secreta só pode ir para nuvem privada ou comunitária, com os requisitos da IN 8, e a ultrassecreta continua vedada. Cuidado com material anterior a outubro de 2025, que diz que toda informação classificada é vedada.

**(E) Prioridade média.** Nuvem tem 10 itens Cebraspe no catálogo (TCU2026-AUFC-TI-122, 124, 152, 155, 157 a 162), mas a maioria mora na matéria de infraestrutura; aqui o foco é a decisão de operar e a norma federal.

#### E4 · 2.2 — Prioridade baixa

**(A) Texto original do edital.** Requisitos de processamento, memória, armazenamento e aceleradores.

**(B) O que estudar.**
- CPU: poucos núcleos potentes, bom para lógica sequencial, ETL, modelos tabulares (árvores, *gradient boosting*, regressão). GPU: milhares de núcleos simples, ótima para multiplicação de matrizes em paralelo: treino e inferência de redes neurais. TPU (Google): circuito específico (ASIC) para operações de tensor. Outros aceleradores: NPU, FPGA.
- Memória: o modelo e o lote precisam caber na memória do acelerador (VRAM). Regra de bolso: parâmetros × bytes por parâmetro (4 bytes em FP32, 2 em FP16/BF16, 1 em INT8); um modelo de 7 bilhões de parâmetros em FP16 ocupa cerca de 14 GB só de pesos; treino precisa de várias vezes isso (gradientes, estados do otimizador).
- Quantização (reduzir precisão numérica) e destilação reduzem custo de inferência com alguma perda de qualidade.
- Armazenamento: objeto (barato, para lake), bloco (disco de máquina), arquivo; formatos colunares (Parquet) reduzem leitura (E2 3.1). Gargalo frequente é E/S, não processamento.
- Escala vertical (máquina maior) × horizontal (mais máquinas, E2 4.2).
- Treino é caro e eventual; inferência é barata por chamada mas contínua: em produção o custo total da inferência costuma superar o do treino.
- No trabalho da CGU: avaliar se a contratação de GPU é compatível com o problema; um modelo tabular de risco não precisa de cluster de GPU, e o sobredimensionamento é achado de economicidade (E4 5.2).

**(C) Fontes.**
- Livros-texto: Huyen, 2022, cap. 7 (compressão de modelos, hardware); Hennessy e Patterson, *Computer Architecture: A Quantitative Approach*, 6. ed., 2017, cap. 7 (arquiteturas de domínio específico, TPU).
- Referenciais: documentação conceitual de provedores só se necessário.

**(D) Como a banca erra o item.**
- *Afirmação errada:* GPUs são superiores às CPUs para qualquer carga analítica, inclusive consultas SQL transacionais e modelos de árvore de decisão de pequeno porte. → *Certo:* a vantagem da GPU está no paralelismo massivo de operações matriciais; cargas sequenciais ou pequenas rodam bem ou melhor em CPU.

**(E) Prioridade baixa.** Tema genérico de infraestrutura, sem item no catálogo; vale saber o raciocínio de dimensionamento que alimenta E4 5.2.

#### E4 · 2.3 — Prioridade média

**(A) Texto original do edital.** Custo, latência, disponibilidade e observabilidade de pipelines e inferência.

**(B) O que estudar.**
- Latência (tempo de uma requisição, medida em percentis: p50, p95, p99, porque a média esconde a cauda) × vazão (*throughput*, requisições por segundo). Agrupar requisições em lote aumenta vazão e piora latência individual.
- Disponibilidade: fração do tempo em que o serviço atende. 99,9% ≈ 8,8 horas fora por ano; 99,99% ≈ 53 minutos. SLI (indicador medido), SLO (meta interna), SLA (compromisso contratual com consequência). Orçamento de erro = 1 − SLO.
- Observabilidade: capacidade de entender o estado interno pelo que o sistema emite. Três pilares: logs (eventos discretos), métricas (séries numéricas agregadas) e traces (rastros: o caminho de uma requisição entre serviços). Monitoramento verifica o que já se sabe perguntar; observabilidade permite investigar o desconhecido.
- Quatro sinais de ouro do SRE (Google): latência, tráfego, erros, saturação. Para modelos, acrescentar sinais de ML (1.6): distribuição de entradas e escores, desempenho quando o rótulo chega.
- Pipelines: monitorar atualidade dos dados (*freshness*), volume, falhas, duração; reprocessamento idempotente (E2 3.1).
- Custo: FinOps junta pessoas, processos e tecnologia para dar visibilidade e controle do gasto em nuvem (TCU2026-AUFC-TI-155, C). Alavancas: escala automática, instâncias reservadas ou preemptivas, desligar ambientes ociosos, inferência em lote quando a latência não importa, cache.
- Ferramentas citadas pelo Cebraspe: Grafana (painéis), Prometheus, Zabbix; OpenTelemetry é o padrão aberto de coleta de traces, métricas e logs. Em 2026 a banca cobrou parâmetro de configuração do Grafana (TCU2026-AUFC-TI-134): sinal de que detalhe de ferramenta pode cair, mas é baixo retorno.
- No trabalho da CGU: SLA de solução analítica contratada precisa de SLI mensurável pelo próprio órgão (não só relatório do fornecedor); fiscalização por entrega verificável (E4 5.6) depende de observabilidade.

**(C) Fontes.**
- Referenciais: Beyer et al., *Site Reliability Engineering*, O'Reilly/Google, 2016, cap. 4 (SLO) e cap. 6 (quatro sinais de ouro), [sre.google/books](https://sre.google/books/); [FinOps Foundation, FinOps Framework](https://www.finops.org/framework/); [OpenTelemetry, conceitos de observabilidade](https://opentelemetry.io/docs/concepts/observability-primer/).
- Livros-texto: Huyen, 2022, cap. 7 e 8.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Em serviços de inferência, a latência média é a métrica mais adequada para verificar o cumprimento de acordo de nível de serviço, por representar a experiência típica do usuário. → *Certo:* usam-se percentis altos (p95, p99), pois a média esconde a cauda de requisições lentas.
- *Afirmação errada:* Observabilidade e monitoramento são sinônimos: ambos se limitam a painéis de métricas predefinidas. → *Certo:* observabilidade combina logs, métricas e traces para investigar falhas não previstas.

**(E) Prioridade média.** Dois itens Cebraspe próximos (TCU2026-AUFC-TI-155, 134) e ligação direta com SLA e fiscalização de contrato; cobrança esperada de 1 item.

#### E4 · 2.4 — Prioridade média

**(A) Texto original do edital.** Controle de acesso, proteção de segredos e continuidade das soluções.

**(B) O que estudar.**
- Controle de acesso: menor privilégio (TCU2026-AUFC-TI-148, C), segregação de funções (quem desenvolve não aprova sozinho a ida a produção), RBAC (por papel) × ABAC (por atributo), contas de serviço com escopo mínimo, revisão periódica de acessos, MFA. Acesso ao modelo também é acesso aos dados: um modelo pode vazar dados de treino (ataques de inferência de pertencimento e de inversão), e uma API sem limite de consulta permite extrair o modelo.
- Segredos (senhas, chaves de API, certificados, *tokens*): nunca no código nem no repositório; usar cofre de segredos (*secrets manager*, ex.: HashiCorp Vault, cofres dos provedores) com rotação, auditoria de acesso e injeção em tempo de execução; varredura de segredos no pipeline (DevSecOps, 1.3). Chave de criptografia em serviço de gestão de chaves (KMS/HSM); política de ciclo de vida da chave.
- Continuidade: RPO (perda máxima tolerada de dados, define frequência de backup) × RTO (tempo máximo para restabelecer). Backup testado (restauração ensaiada), redundância geográfica (exigida da nuvem de governo no Acórdão TCU 1.380/2026, conforme fontes secundárias), recuperação de desastre. Para ML, continuidade inclui guardar o artefato do modelo, o pipeline e os dados de treino, não só o banco de produção; e prever modo de contingência manual se o modelo cair.
- Terceirizar não transfere a responsabilidade pela continuidade (TCU2015-TI-174, E). Estratégias de sítio: *hot*, *warm*, *cold standby* (TCU2015-TI-176, C).
- Normas e referenciais: ISO/IEC 27001:2022 e 27002:2022 (controles de acesso, gestão de chaves); ABNT NBR ISO 22301:2020 (continuidade); Decreto 12.572/2025 (Política Nacional de Segurança da Informação, que revogou o Decreto 9.637/2018); IN GSI/PR nº 5/2021 para nuvem.
- No trabalho da CGU: achado clássico é credencial de banco de dados gravada em script de rotina analítica ou em notebook compartilhado; outro é ausência de teste de restauração.

**(C) Fontes.**
- Normas: [Decreto nº 12.572/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/D12572.htm) (PNSI vigente desde 5/8/2025; revogou o Decreto nº 9.637/2018, art. 12; conferido no Planalto em 15/10/2026); IN GSI/PR nº 5/2021, com a redação da IN GSI/PR nº 8/2025.
- Referenciais: ISO/IEC 27001:2022 e 27002:2022 (texto pago, conferido pelo sumário); ABNT NBR ISO 22301:2020; [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html); NIST SP 800-57 Parte 1 Rev. 5 (gestão de chaves); [OWASP Machine Learning Security Top 10](https://owasp.org/www-project-machine-learning-security-top-10/).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Armazenar chaves de API em variáveis de configuração dentro do repositório privado da equipe atende às boas práticas de proteção de segredos, desde que o repositório tenha acesso restrito. → *Certo:* segredos ficam fora do repositório, em cofre com rotação e auditoria; o histórico do Git preserva o segredo mesmo após remoção.
- *Afirmação errada:* O RTO indica a quantidade máxima de dados que a organização aceita perder em um incidente. → *Certo:* isso é o RPO; RTO é o tempo máximo para restabelecer o serviço.

**(E) Prioridade média.** Tema de segurança com incidência histórica em continuidade (TCU2015-TI-174 a 176) e privilégio mínimo (TCU2026-AUFC-TI-148), mas coberto em profundidade pela matéria de segurança; aqui basta a aplicação a soluções de dados e IA.

**3 Governança e responsabilidade**

#### E4 · 3.1 — Prioridade alta

**(A) Texto original do edital.** Papéis, riscos e evidências sobre dados, modelos e decisões.

**(B) O que estudar.**
- Papéis típicos: dono do negócio ou da política (responde pela decisão e pelo uso), dono dos dados (*data owner*) e curador (*data steward*) (E2), cientista e engenheiro de dados e ML (constroem), responsável pela operação, encarregado de dados (LGPD art. 41), comitê de governança de dados ou de IA, segunda linha (riscos, conformidade) e terceira linha (auditoria interna). Modelo das três linhas do IIA (2020): gestão (primeira), funções de risco e conformidade (segunda), auditoria interna independente (terceira) (P2 C5 1.4).
- Matriz RACI (responsável, aprovador, consultado, informado) por etapa do ciclo de vida do modelo. Responsabilização é de pessoa e de órgão, nunca do algoritmo.
- Riscos específicos de IA: dados (viés de amostra, qualidade, vazamento), modelo (sobreajuste, instabilidade, falta de explicabilidade), uso (automação de decisão sem revisão, uso fora da finalidade, viés de automação), segurança (envenenamento de dados, exemplos adversariais, injeção de instruções em LLM, E3 6.3), operação (drift, dependência de fornecedor).
- Referenciais de risco e governança de IA:
  - NIST AI RMF 1.0 (jan. 2023): quatro funções, GOVERN (transversal: cultura, papéis, políticas), MAP (contexto e riscos), MEASURE (análise e métricas), MANAGE (tratamento e monitoramento). Características de IA confiável: válida e confiável; segura (*safe*); protegida e resiliente; responsabilizável e transparente; explicável e interpretável; com privacidade reforçada; justa, com viés prejudicial gerido. Perfil para IA generativa: NIST AI 600-1 (jul. 2024).
  - ISO/IEC 42001:2023: sistema de gestão de IA (AIMS), certificável, estrutura de alto nível igual à 27001 (contexto, liderança, planejamento, suporte, operação, avaliação de desempenho, melhoria), com controles no Anexo A.
  - ISO/IEC 23894:2023: orientação de gestão de riscos de IA, adaptando a ISO 31000:2018. Não é certificável.
  - Recomendação do Conselho da OCDE sobre IA (2019, revista em maio de 2024): cinco princípios (crescimento inclusivo e bem-estar; direitos humanos e valores democráticos, incluindo equidade e privacidade; transparência e explicabilidade; robustez, segurança e proteção; responsabilização) e cinco recomendações aos governos. O Brasil aderiu.
- Brasil: Plano Brasileiro de IA (PBIA 2024-2028, "IA para o Bem de Todos", MCTI, apresentado em 30/7/2024, versão final divulgada em 2025; cerca de R$ 23 bilhões; cinco eixos, sendo um de IA para melhoria dos serviços públicos e outro de apoio ao processo regulatório e de governança de IA; conforme fontes secundárias). Substitui a Estratégia Brasileira de IA (EBIA, Portaria MCTI 4.617/2021) como plano de referência (conferir se a EBIA foi formalmente revogada). PL 2.338/2023 (marco da IA, aprovado no Senado em dez. 2024, em tramitação na Câmara): só contexto (14.33); adota abordagem por grau de risco, avaliação preliminar e avaliação de impacto algorítmico.
- Normas recentes no Executivo federal (conforme fontes secundárias, conferir no DOU): Portaria SGD/MGI nº 5.921/2026, que exige previsão expressa no termo de referência para a contratada usar IA em contratos de operação de infraestrutura; Portaria MGI nº 3.485/2026, política de governança de IA do MGI. Guia "IA Generativa no Serviço Público" (SGD e Serpro, fev. 2025).
- CGU e controle interno: Deliberação CCCI nº 03/2025, publicada pela Portaria CGU nº 3.113/2025, sobre uso de IA pelas unidades de auditoria interna (ver E3 6.2 e a seção "A CGU e o governo federal em dados e IA"); Guia de Uso Responsável de Ferramentas de IA Generativa da CGU (mar. 2025, aprovado pela Portaria Normativa CGU nº 193/2025, conferir no DOU). Nenhum dos dois é referencial de governança de modelos de ML em geral.
- TCU: Acórdão 1.139/2022-Plenário (levantamento sobre IA na APF; determinou referencial próprio de auditoria de IA e guia para gestores, conforme resumo do TCU); Guia de uso de IA generativa no TCU (2024, uso interno).
- Evidências: o que prova que o controle existe e funciona. Ficha do modelo (*model card*: uso pretendido, dados, métricas por grupo, limitações), ficha de dados (*datasheet for datasets*), registro de experimentos e de modelos (1.2), logs de decisão com versão do modelo, atas de aprovação, relatórios de validação independente e de monitoramento. LGPD art. 6º X: responsabilização é "demonstração" da adoção de medidas eficazes.
- No trabalho da CGU: a auditoria de IA pergunta "quem decidiu, com base em quê, e onde está o registro". Achado típico: modelo em produção sem dono de negócio formalmente designado, sem ficha do modelo, sem critério de aceitação.

**(C) Fontes.**
- Normas: [LGPD, Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), arts. 6º X, 41, 50; Portarias SGD/MGI 5.921/2026 e MGI 3.485/2026 (conferir no DOU).
- Guias de governo: [PBIA 2024-2028, apresentação ao CCT](https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/cct/documentacao/23072024.pdf) (versão final: conferir no portal do MCTI); TCU, [Utilização de IA na Administração Pública Federal](https://portal.tcu.gov.br/data/files/D0/C3/BC/DA/EF17781046756058F18818A8/Utilizacao%20de%20Inteligencia%20Artificial%20na%20Administracao%20Publica.pdf) (Acórdão 1.139/2022-Plenário); [Guia de uso de IA generativa no TCU](https://portal.tcu.gov.br/data/files/42/F7/91/4B/B59019105E366F09E18818A8/Guia%20de%20uso%20de%20IA%20generativa%20no%20TCU.pdf).
- Referenciais: [NIST AI RMF 1.0 (NIST AI 100-1)](https://www.nist.gov/itl/ai-risk-management-framework); [NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1); [ISO/IEC 42001:2023](https://www.iso.org/standard/81230.html) e [ISO/IEC 23894:2023](https://www.iso.org/standard/77304.html) (textos pagos, conferidos pelo sumário); [Recomendação da OCDE sobre IA](https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449); IIA, Modelo das Três Linhas, 2020.
- Artigos: Mitchell et al., "Model Cards for Model Reporting", FAT* 2019; Gebru et al., "Datasheets for Datasets", CACM 2021.

**(D) Como a banca erra o item.**
- *Afirmação errada:* No NIST AI RMF, a função GOVERN é a etapa final do ciclo, executada após o mapeamento, a medição e o gerenciamento dos riscos. → *Certo:* GOVERN é transversal e permeia as outras três funções.
- *Afirmação errada:* A ISO/IEC 23894:2023 estabelece requisitos certificáveis de sistema de gestão de IA. → *Certo:* requisitos certificáveis estão na ISO/IEC 42001:2023; a 23894 é orientação de gestão de riscos baseada na ISO 31000.

**(E) Prioridade alta.** Núcleo da atuação do auditor sobre IA, objeto de referenciais recentes e de normas federais de 2026, e espinha de qualquer resposta discursiva; o catálogo tem 3 itens de ética de IA (TCU2026-AUFC-TI-163 a 165) na mesma linha.

#### E4 · 3.2 — Prioridade alta

**(A) Texto original do edital.** Rastreabilidade, avaliação de impacto, revisão humana e contestação.

**(B) O que estudar.**
- Rastreabilidade: reconstruir, para cada decisão, a entrada, a versão do modelo, o escore, o limiar, quem revisou e o que decidiu. Depende de 1.1, 1.2 e de logs imutáveis. Para agentes de IA, ver E3 6.2.
- Avaliação de impacto:
  - RIPD (relatório de impacto à proteção de dados pessoais), LGPD art. 5º XVII: "documentação do controlador que contém a descrição dos processos de tratamento de dados pessoais que podem gerar riscos às liberdades civis e aos direitos fundamentais, bem como medidas, salvaguardas e mecanismos de mitigação de risco". Art. 38: a ANPD "poderá determinar" que o controlador elabore o RIPD; conteúdo mínimo no parágrafo único (tipos de dados, metodologia de coleta e de segurança, análise de medidas e salvaguardas).
  - Avaliação de impacto algorítmico (AIA): mais ampla que o RIPD, cobre efeitos sobre direitos, grupos e sociedade, inclusive sem dado pessoal. Referencial: ISO/IEC 42005:2025 (avaliação de impacto de sistemas de IA, publicada em maio de 2025); controle de avaliação de impacto no Anexo A da ISO/IEC 42001. No Brasil, a AIA obrigatória para sistemas de alto risco está no PL 2.338/2023, que não é lei: cite só como contexto.
- Revisão humana e contestação, LGPD art. 20 (redação dada pela Lei 13.853/2019, conferida no Planalto):
  - caput: "O titular dos dados tem direito a solicitar a revisão de decisões tomadas unicamente com base em tratamento automatizado de dados pessoais que afetem seus interesses, incluídas as decisões destinadas a definir o seu perfil pessoal, profissional, de consumo e de crédito ou os aspectos de sua personalidade."
  - § 1º: o controlador fornece, quando solicitadas, "informações claras e adequadas a respeito dos critérios e dos procedimentos utilizados para a decisão automatizada, observados os segredos comercial e industrial".
  - § 2º: se recusar informar com base em segredo, a ANPD "poderá realizar auditoria para verificação de aspectos discriminatórios".
  - § 3º: VETADO. A MP 869/2018 havia previsto revisão "por pessoa natural"; a Lei 13.853/2019 repetiu a regra e ela foi vetada. Resultado: a LGPD garante o direito à revisão, mas não exige que ela seja feita por pessoa natural. Pegadinha certa da banca.
  - Três condições de incidência: decisão "unicamente" automatizada; com dados pessoais; que "afete seus interesses". Decisão com participação humana substantiva fica fora do art. 20 (mas a participação humana meramente formal, de carimbo, é discutível).
- Graus de supervisão humana: humano no circuito (*human-in-the-loop*, aprova cada decisão), humano sobre o circuito (*on-the-loop*, supervisiona e pode intervir), humano fora do circuito (*out-of-the-loop*). Revisão humana efetiva exige tempo, informação, competência e autoridade para divergir; senão vira viés de automação (aceitar a máquina por padrão).
- Contestação no direito administrativo: dever de motivação (Lei 9.784/1999, art. 50), contraditório e ampla defesa (CF art. 5º LV), recurso (Lei 9.784/1999, art. 56). Decisão administrativa apoiada em modelo continua precisando de motivação inteligível ao interessado (P2 C3 1.2).
- Explicabilidade × interpretabilidade: o TCU2026-AUFC-TI-163 (C) tratou as duas juntas como "o desafio de entender como os modelos funcionam"; o TCU2026-AUFC-TI-165, que dizia que explicabilidade "diz respeito às propriedades internas do modelo", foi anulado. Leitura segura: interpretabilidade é propriedade do modelo (transparência intrínseca); explicabilidade é a capacidade de dar razões compreensíveis de uma saída, inclusive por técnicas pós-hoc (SHAP, LIME). Detalhe em E3 3.4.
- No trabalho da CGU: modelo que bloqueia pagamento ou seleciona beneficiário para averiguação precisa de canal de contestação, motivação e revisão; em auditoria, testar se o canal existe, se é usado e quantas decisões foram revertidas (taxa de reversão é indicador de qualidade do modelo e da revisão).

**(C) Fontes.**
- Normas: [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), arts. 5º XVII, 6º VI e X, 20, 38; [Lei nº 9.784/1999](https://www.planalto.gov.br/ccivil_03/leis/l9784.htm), arts. 2º, 50 e 56; Constituição, art. 5º LV; [Mensagem de veto nº 288/2019](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/Msg/VEP/VEP-288.htm) (razões do veto ao § 3º; conferir).
- Guias: ANPD, guias e regulamentos sobre RIPD no [portal da ANPD](https://www.gov.br/anpd/pt-br) (conferir se já há regulamento de RIPD em vigor).
- Referenciais: [ISO/IEC 42005:2025](https://www.iso.org/standard/42005) (texto pago, conferido pelo sumário); ISO/IEC 42001:2023, Anexo A; NIST AI RMF 1.0, MAP 5 (impactos) e GOVERN 3 (supervisão humana); Recomendação OCDE, princípio 1.3 (transparência e explicabilidade).
- Livros-texto: Christoph Molnar, [*Interpretable Machine Learning*](https://christophm.github.io/interpretable-ml-book/), 2. ed., 2022.

**(D) Como a banca erra o item.**
- *Afirmação errada:* De acordo com a LGPD, o titular tem direito a solicitar a revisão, por pessoa natural, de decisões tomadas unicamente com base em tratamento automatizado de seus dados. → *Certo:* a exigência de revisão por pessoa natural (§ 3º do art. 20) foi vetada; o caput garante a revisão, sem impor que seja humana.
- *Afirmação errada:* O relatório de impacto à proteção de dados pessoais é obrigatório, por força da LGPD, para todo tratamento automatizado realizado por órgão público. → *Certo:* a LGPD diz que a ANPD "poderá determinar" sua elaboração (art. 38; art. 32 para o poder público); a obrigação depende de determinação ou regulamento.

**(E) Prioridade alta.** Perfil de discursiva (situação-problema sobre decisão automatizada que afeta cidadão), texto literal da LGPD com pegadinha clássica do veto, e item recente sobre explicabilidade (TCU2026-AUFC-TI-163; 165 anulado).

#### E4 · 3.3 — Prioridade média

**(A) Texto original do edital.** Proteção de dados pessoais e informações sensíveis.

**(B) O que estudar.**
- "Informações sensíveis" tem duas leituras: (a) dado pessoal sensível da LGPD; (b) informação com restrição de acesso (sigilo fiscal, bancário, classificada pela LAI). A mais provável é cobrar as duas, porque uma solução de IA de controle mistura ambas.
- LGPD art. 5º II, dado pessoal sensível: "dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural". Lista fechada; renda, CPF e endereço não são sensíveis.
- Art. 11: hipóteses de tratamento de sensíveis; sem consentimento, só quando "indispensável" para, entre outras, obrigação legal (II, a) e execução de políticas públicas pela administração (II, b). § 1º: o artigo vale para "qualquer tratamento de dados pessoais que revele dados pessoais sensíveis e que possa causar dano ao titular". Consequência para ML: modelo que infere saúde ou etnia a partir de dados comuns (proxies) trata dado sensível. § 2º: órgão público que usa as alíneas a e b dá publicidade à dispensa de consentimento.
- Poder público: art. 23 (finalidade pública, competência legal, transparência), arts. 26 e 27 (uso compartilhado). Dado anonimizado não é dado pessoal (art. 12), salvo se reversível com esforço razoável; pseudonimizado continua pessoal (E2 6.3).
- Princípios aplicados a IA: necessidade (minimização: não usar atributo que não melhora o modelo), segurança, prevenção, transparência.
- Riscos próprios de modelos: memorização de dados de treino (LLMs), inferência de pertencimento, reidentificação por combinação de atributos, vazamento por *prompt* em ferramenta de IA generativa externa. Controles: minimização, pseudonimização antes do treino, privacidade diferencial (noção), ambiente segregado, proibição de inserir dado pessoal ou sigiloso em ferramenta externa sem contrato.
- Nuvem: art. 17 da IN GSI/PR nº 5/2021 (2.1); TCU2026-AUFC-TI-162 (C).
- No trabalho da CGU: cruzamento de bases (CadÚnico, folha, CNIS) para trilhas de auditoria envolve dados pessoais e, às vezes, sensíveis (saúde, deficiência); a base legal é o exercício de competência legal de controle, mas necessidade, segurança e sigilo continuam valendo, e o papel de trabalho não pode expor dados além do necessário.

**(C) Fontes.**
- Normas: [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), arts. 5º I a III, 6º, 7º, 11, 12, 23, 26, 46; [LAI, Lei nº 12.527/2011](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm), arts. 23, 24 e 31; IN GSI/PR nº 5/2021, art. 17.
- Guias: ANPD, [Guia orientativo de tratamento de dados pessoais pelo Poder Público](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes) (conferir versão vigente).
- Referenciais: ISO/IEC 27701:2019 (extensão de privacidade; conferir edição 2025); NIST Privacy Framework 1.0.
- Ligações: E2 6.1 a 6.5; P2 C2 2.1 e 2.2.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Dados de renda e de endereço são dados pessoais sensíveis nos termos da LGPD, pois permitem inferir a condição socioeconômica do titular. → *Certo:* o rol do art. 5º II é específico e não inclui renda ou endereço; porém, se o tratamento revelar dado sensível e puder causar dano, aplica-se o art. 11 (§ 1º).
- *Afirmação errada:* O tratamento de dados pessoais sensíveis pela administração pública depende sempre de consentimento específico e destacado do titular. → *Certo:* o art. 11, II, a e b, dispensa consentimento quando indispensável para obrigação legal ou execução de políticas públicas, com publicidade da dispensa.

**(E) Prioridade média.** Tema muito cobrado em geral, mas o núcleo de proteção de dados está em E2 6.5 e na P2 C2; aqui pesa a aplicação a modelos (proxies e art. 11 § 1º). Incidência direta: TCU2026-AUFC-TI-162.

#### E4 · 3.4 — Prioridade alta

**(A) Texto original do edital.** Prevenção e tratamento de discriminação e de uso fora da finalidade.

**(B) O que estudar.**
- Discriminação algorítmica: decisão que, sem justificativa válida, usa o pertencimento a grupo ou atributos que funcionam como proxies dele e gera desvantagem sistemática onde o critério não deveria pesar (TCU2026-AUFC-TI-164, C, quase definição literal).
- Fontes de viés: histórico (dados refletem discriminação passada), de representação ou amostragem (grupo sub-representado), de medição (rótulo é proxy ruim: "foi fiscalizado" ≠ "é irregular"), de agregação, de avaliação (teste não representa a população), e ciclo de retroalimentação (o modelo escolhe quem fiscalizar, só esses geram rótulo, o modelo se confirma). Em controle, o ciclo de retroalimentação é o risco mais típico.
- Retirar o atributo protegido não resolve ("justiça por desconhecimento"): proxies (CEP, escola, nome) reconstroem o atributo.
- Métricas de equidade (E3 3.3): paridade demográfica (mesma taxa de seleção), igualdade de oportunidade (mesma sensibilidade, TPR), probabilidades equalizadas (mesmas TPR e FPR), paridade preditiva (mesmo VPP), calibração por grupo. Teorema da impossibilidade (Kleinberg et al.; Chouldechova): com taxas-base diferentes, não se atinge calibração e igualdade de FPR e FNR ao mesmo tempo, salvo modelo perfeito. Escolher a métrica é decisão normativa, a ser registrada.
- Tratamento: pré-processamento (reamostragem, reponderação), no treino (restrições de equidade), pós-processamento (limiares por grupo, com cuidado jurídico); e, antes de tudo, rever se o rótulo e a finalidade fazem sentido.
- Base normativa: CF art. 3º IV (promover o bem de todos sem preconceito) e art. 5º caput; LGPD art. 6º IX, não discriminação: "impossibilidade de realização do tratamento para fins discriminatórios ilícitos ou abusivos" (note: nem toda diferenciação é ilícita; o que se veda é a ilícita ou abusiva); art. 20 § 2º (auditoria da ANPD sobre aspectos discriminatórios).
- Uso fora da finalidade: LGPD art. 6º I, finalidade: "realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular, sem possibilidade de tratamento posterior de forma incompatível com essas finalidades"; art. 6º II, adequação. Exemplos em IA: modelo de priorização de atendimento reaproveitado para sanção; base coletada para concessão de benefício usada para treinar modelo comercial; ferramenta de uso interno virando decisão final. Controle: uso pretendido declarado na ficha do modelo e avaliação nova a cada mudança de uso (ISO/IEC 42001 e NIST MAP 1 tratam de "uso pretendido" e "uso indevido previsível"). Uso posterior compatível é admitido (art. 7º § 7º; conferir).
- No trabalho da CGU: modelo de risco de fraude em benefício que concentra alertas em uma região ou grupo por causa de onde houve mais fiscalização no passado; o auditor pede desempenho e taxa de alerta por grupo e verifica se o rótulo de treino é "irregularidade confirmada" ou só "foi fiscalizado".

**(C) Fontes.**
- Normas: [Constituição Federal](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), arts. 3º IV e 5º; [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), arts. 6º I, II e IX, 7º § 7º, 20 § 2º.
- Referenciais: NIST SP 1270, [Towards a Standard for Identifying and Managing Bias in AI](https://doi.org/10.6028/NIST.SP.1270), 2022; NIST AI RMF 1.0, característica "fair, with harmful bias managed"; ISO/IEC TR 24027:2021 (viés em sistemas de IA; texto pago, conferido pelo sumário); Recomendação OCDE, princípio 1.2.
- Livros-texto: Barocas, Hardt e Narayanan, [*Fairness and Machine Learning*](https://fairmlbook.org/), MIT Press, 2023; Kleinberg, Mullainathan e Raghavan, "Inherent Trade-Offs in the Fair Determination of Risk Scores", ITCS 2017.

**(D) Como a banca erra o item.**
- *Afirmação errada:* A exclusão dos atributos protegidos, como raça e sexo, do conjunto de treinamento é suficiente para impedir que o modelo produza resultados discriminatórios. → *Certo:* variáveis correlacionadas funcionam como proxies e reproduzem a discriminação; é preciso medir resultados por grupo.
- *Afirmação errada:* Pelo princípio da finalidade da LGPD, dados coletados para um propósito não podem ser utilizados em nenhum tratamento posterior. → *Certo:* veda-se o tratamento posterior incompatível com a finalidade informada; uso compatível é admitido.

**(E) Prioridade alta.** Item Cebraspe recente quase literal (TCU2026-AUFC-TI-164), forte relação com o trabalho de trilhas e priorização da CGU e com a P2 (C1 3.2, C4 5.2); ótimo para discursiva.

#### E4 · 3.5 — Prioridade alta

**(A) Texto original do edital.** Avaliação de resultados e limites da automação.

**(B) O que estudar.**
- Duas camadas de avaliação: desempenho do modelo (métricas técnicas, E3 3.1) × resultado da política ou do processo (o modelo melhorou a decisão?). Modelo com AUC alta pode não gerar resultado se a equipe não tem capacidade de agir sobre os alertas ou se os alertas não mudam a decisão.
- Avaliar resultado é avaliar intervenção: comparar com contrafactual (o que aconteceria sem o modelo). Desenhos: piloto com grupo de controle, A/B, implantação escalonada, diferenças em diferenças (E1 3.2). Cuidado com o ciclo de retroalimentação: só se observa o rótulo de quem o modelo selecionou; reservar amostra aleatória de verificação mantém estimativa não viesada da taxa de acerto.
- Indicadores úteis: taxa de acerto dos alertas (precisão no topo da lista), recuperação financeira por hora de análise, taxa de reversão em contestação, tempo de resposta, efeitos por grupo, e custo de falso positivo para o cidadão (benefício suspenso indevidamente) × falso negativo para o erário (E3 3.2).
- Limites da automação:
  - técnicos: generalização limitada fora da distribuição (1.6), incerteza não informada, alucinação em LLMs (E3 5.5), instabilidade;
  - jurídicos: decisão que afeta direitos exige motivação, contraditório e possibilidade de revisão (3.2); competência é do agente público, não delegável ao sistema;
  - humanos: viés de automação, complacência, perda de competência da equipe; e o inverso, aversão a algoritmo;
  - organizacionais: responsabilização difusa ("foi o sistema").
- Critério para decidir o grau de automação: impacto sobre direitos, reversibilidade da decisão, volume, qualidade demonstrada do modelo, explicabilidade. Regra prática: escore serve para priorizar e triar; decisão que restringe direito fica com pessoa competente, com acesso aos fundamentos (E3 3.5; P2 C4 5.1 e 5.3).
- Comparar com solução simples (regra de negócio, amostragem aleatória) antes de concluir que o modelo agrega valor (E3 1.2).
- No trabalho da CGU: avaliação de política pública que usa IA (ex.: concessão automática de benefício previdenciário) pergunta se a automação reduziu fila sem aumentar indeferimento indevido, e se há revisão para os casos negados. Na auditoria do próprio uso de IA pela CGU, a mesma lógica vale para trilhas.

**(C) Fontes.**
- Normas: [Lei nº 9.784/1999](https://www.planalto.gov.br/ccivil_03/leis/l9784.htm), arts. 2º, 11 (competência irrenunciável) e 50; [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), art. 20; [LINDB, Decreto-Lei 4.657/1942](https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm), arts. 20 e 21 (consequências práticas da decisão).
- Guias: TCU, Acórdão 1.139/2022-Plenário (falta de objetivos mensuráveis e de linha de base nas iniciativas de IA da APF, conforme resumo do TCU); CGU e TCU, referenciais de avaliação de políticas públicas (ver E4 4.x e P2 C3 3.2).
- Referenciais: NIST AI RMF 1.0, MEASURE 3 e MANAGE 2 (decidir se o sistema deve seguir em uso); Recomendação OCDE, princípio 1.5 (responsabilização).
- Livros-texto: Huyen, 2022, cap. 1 (quando usar ML); Parasuraman e Manzey, "Complacency and Bias in Human Use of Automation", *Human Factors* 52(3), 2010; Barocas, Hardt e Narayanan, 2023, cap. 1.

**(D) Como a banca erra o item.**
- *Afirmação errada:* Se o modelo de classificação apresenta alta acurácia no conjunto de teste, fica demonstrado que sua implantação melhorou os resultados da política pública. → *Certo:* desempenho do modelo não é efeito da intervenção; resultado exige comparação com cenário sem o modelo e verificação da capacidade de agir sobre os alertas.
- *Afirmação errada:* A revisão humana de todas as saídas do sistema elimina os riscos da automação de decisões. → *Certo:* revisão sem tempo, informação e autoridade para divergir vira carimbo (viés de automação); o risco é reduzido, não eliminado.

**(E) Prioridade alta.** Perfil de discursiva (decidir até onde automatizar e como medir resultado), conecta E3 3.5, P2 C4 5 e o tópico 4 desta disciplina; o texto-base dos itens TCU2026-AUFC-TI-163 a 165 trata justamente de revisão humana e limites.

**4 Gestão de produtos de dados**

#### E4 · 4.1 — Prioridade média

**(A) Texto original do edital.** Alinhamento entre problema público, produto e resultado.

**(B) O que estudar.**
- Cadeia de valor da política pública (modelo lógico): insumos → atividades → produtos (*outputs*) → resultados (*outcomes*) → impactos. Um painel, um modelo de risco ou uma API é **produto**; menos fraude paga, fila menor, auditoria mais certeira é **resultado**.
- Problema público: descrito com causa, população afetada, magnitude e evidência. O produto de dados só se justifica se atacar uma causa do problema; a árvore de problemas (causas → problema → efeitos) é a ferramenta usual da análise ex ante.
- Produto de dados: ativo com dono, usuários definidos, contrato de dados, nível de serviço e ciclo de vida. Em data mesh, o produto deve ser localizável, endereçável, confiável, autodescritivo, interoperável e seguro (ver E2 1.2).
- Teoria da mudança: hipótese explícita de por que o produto gera o resultado ("se o auditor recebe a lista de empenhos suspeitos ranqueada, ele seleciona melhor a amostra, e a taxa de achados por horas de auditoria sobe"). Sem a hipótese escrita, não há como avaliar depois.
- Erro clássico: medir sucesso pelo produto entregue (número de painéis, de modelos em produção, de acessos) e não pelo resultado. Indicador de produto mede esforço e entrega; indicador de resultado mede mudança na realidade.
- Contrafactual: resultado só é atribuível ao produto quando há comparação (antes/depois com grupo de controle, implantação escalonada). Ligação direta com E1 3.2 (causalidade em dados administrativos).
- Leitura provável da banca: item que confunde produto com resultado, ou que afirma que a entrega técnica basta para demonstrar valor público.
- No trabalho da CGU: avaliar se uma solução analítica de um ministério (ou da própria CGU) resolve o problema que motivou o investimento; exigir a teoria da mudança e os indicadores de resultado no planejamento; auditoria operacional que pergunta "o painel mudou alguma decisão?".

**(C) Fontes.**
- Casa Civil/IPEA. *Avaliação de políticas públicas: guia prático de análise ex ante*, v. 1 (2018), capítulos sobre diagnóstico do problema e modelo lógico. [ipea.gov.br](https://www.ipea.gov.br/portal/publicacoes)
- TCU. *Referencial de Controle de Políticas Públicas* (2020). [portal.tcu.gov.br](https://portal.tcu.gov.br/)
- Decreto nº 12.198/2024, art. 2º (a Estratégia Federal orienta a transformação digital para "oferecer políticas públicas e serviços de melhor qualidade"). [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/D12198.htm)
- Dehghani, Z. *Data Mesh: Delivering Data-Driven Value at Scale*. O'Reilly, 2022 (cap. sobre dados como produto).

**(D) Como a banca erra o item.**
- *Afirmação errada:* A entrega de um painel analítico em produção, com os indicadores de acesso dentro da meta, comprova que o produto de dados gerou o resultado esperado para o problema público. → *Certo:* acesso e entrega são indicadores de produto; o resultado exige medir a mudança no problema (e, para atribuí-la ao produto, alguma comparação).
- *Afirmação errada:* Em gestão de produtos de dados, o produto é definido a partir dos dados disponíveis, e o problema público é ajustado ao que o produto consegue responder. → *Certo:* o ponto de partida é o problema e o usuário; os dados disponíveis condicionam a viabilidade, não definem a necessidade.

**(E) Prioridade média.** Tema de raciocínio, mais provável na Q2 (justificar a solução de IA pelo problema público) do que em itens objetivos; sem incidência no catálogo.

#### E4 · 4.2 — Prioridade média

**(A) Texto original do edital.** Priorização, critérios de aceitação e indicadores.

**(B) O que estudar.**
- Técnicas de priorização:
  - MoSCoW (*must, should, could, won't*);
  - WSJF (*weighted shortest job first*): custo do atraso ÷ duração (ou tamanho) do trabalho, usado no SAFe;
  - RICE: (alcance × impacto × confiança) ÷ esforço;
  - modelo Kano (básico, de desempenho, de encantamento);
  - matriz valor × esforço.
  
  Todas ordenam por valor relativo ao custo. Nenhuma substitui decisão do dono do produto.
- No Scrum, quem ordena o *Product Backlog* é o *Product Owner* (PO), que responde por isso mesmo quando delega o trabalho (ver 4.4).
- Critério de aceitação × definição de pronto (DoD):
  - critério de aceitação é específico de um item: condição que aquele item precisa cumprir para ser aceito pelo usuário. Formato comum: "Dado… quando… então…" (Gherkin, BDD);
  - DoD é o padrão de qualidade que vale para **todo** incremento: testes, revisão, documentação, dados validados, monitoramento ligado;
  - um item só vira incremento quando atende à DoD. Atender ao critério de aceitação e falhar na DoD significa que o item não está pronto.
- Na contratação de TIC, a IN SGD/ME nº 94/2022 define critério de aceitação (art. 2º, XXIII) como "parâmetros objetivos e mensuráveis utilizados para verificar se um bem ou serviço recebido está em conformidade com os requisitos especificados". O Modelo de Gestão do Contrato fixa os critérios de aceitação, com "métricas, indicadores e níveis mínimos de serviços" (art. 19, I). Essa é a ponte com 5.6.
- História de usuário boa segue INVEST: independente, negociável, valiosa, estimável, pequena (*small*), testável.
- Indicadores:
  - SMART (específico, mensurável, alcançável, relevante, temporal);
  - indicador antecedente (*leading*, ex.: taxa de uso do alerta) × consequente (*lagging*, ex.: valor recuperado);
  - indicador de produto × de resultado (ver 4.1);
  - lei de Goodhart: quando a medida vira meta, deixa de ser boa medida. Exemplo: meta de "nº de alertas gerados" estimula alerta inútil.
- Para produto analítico ou de IA, o critério de aceitação inclui métrica mínima em conjunto de teste guardado pelo órgão, desempenho por grupo (E3 3.3), latência e reprodutibilidade (E4 1.4).
- No trabalho da CGU: verificar se o termo de referência traz critério de aceitação objetivo e mensurável ou apenas "a contento"; checar se o backlog de um produto de dados foi priorizado por valor público ou por conveniência do fornecedor; propor indicadores de resultado para a política auditada.

**(C) Fontes.**
- IN SGD/ME nº 94/2022, art. 2º, XXIII; art. 19, I. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Schwaber, K.; Sutherland, J. *The Scrum Guide* (nov. 2020): *Product Backlog*, *Definition of Done*. [scrumguides.org](https://scrumguides.org/scrum-guide.html)
- Cohn, M. *User Stories Applied*. Addison-Wesley, 2004.
- Reinertsen, D. *The Principles of Product Development Flow*. Celeritas, 2009 (custo do atraso, WSJF).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Critérios de aceitação e definição de pronto são sinônimos no Scrum: ambos se referem às condições que cada item do backlog deve cumprir. → *Certo:* a DoD é padrão único de qualidade do incremento; critério de aceitação é próprio de cada item. O Guia do Scrum 2020 nem define "critério de aceitação", só a DoD.
- *Afirmação errada:* Em contratações de TIC, critérios de aceitação podem ser fixados de forma qualitativa, cabendo ao fiscal avaliar a satisfação do requisitante. → *Certo:* a IN SGD/ME nº 94/2022 exige parâmetros objetivos e mensuráveis (art. 2º, XXIII).

**(E) Prioridade média.** Conceitos que caem embutidos em itens de Scrum (4.4) e de fiscalização (5.6); valem pela ponte entre gestão ágil e contrato. Incidência indireta: TCU2015-TI-198 (nível mínimo de serviço como referência de aferição).

#### E4 · 4.3 — Prioridade baixa

**(A) Texto original do edital.** Descoberta de necessidades, entrega e ciclo de vida.

**(B) O que estudar.**
- Descoberta (*discovery*) × entrega (*delivery*):
  - a descoberta reduz quatro riscos antes de construir: valor (o usuário quer?), usabilidade (consegue usar?), viabilidade técnica (dá para fazer?) e viabilidade de negócio (cabe nas regras, no orçamento, na lei?). A lista é a de Cagan;
  - "dual track": as duas trilhas correm em paralelo, e o que a descoberta valida entra no backlog de entrega.
- Técnicas de descoberta:
  - entrevista com usuário e observação do trabalho real (o auditor na trilha de auditoria);
  - mapa de jornada e análise de processo;
  - protótipo de baixa fidelidade e teste com dados reais;
  - MVP (produto mínimo viável): a menor versão que testa a hipótese de valor, não "versão 1 com tudo".
- Diamante duplo (Design Council): divergir e convergir no problema, depois divergir e convergir na solução.
- Ciclo de vida do produto de dados:
  - concepção, construção e implantação;
  - operação e sustentação (ver E4 2.x);
  - evolução;
  - descontinuação (*sunset*): aviso aos consumidores, arquivamento ou retenção dos dados (E2 6.2), revogação de acessos.
  
  Produto sem plano de descontinuação vira legado que ninguém consegue desligar.
- Para modelo de ML: o ciclo inclui monitoramento de deriva e retreino (E4 1.6) e o critério para aposentar o modelo.
- No trabalho da CGU: perguntar se a solução auditada passou por validação com usuários antes da contratação em larga escala; constatar produtos analíticos construídos sem usuário identificado e sem uso.

**(C) Fontes.**
- Cagan, M. *Inspired: How to Create Tech Products Customers Love*. 2. ed. Wiley, 2017.
- Design Council (UK). *Framework for Innovation: the Double Diamond*. [designcouncil.org.uk](https://www.designcouncil.org.uk/our-resources/framework-for-innovation/)
- Ries, E. *A startup enxuta*. LeYa, 2012 (MVP, ciclo construir–medir–aprender).

**(D) Como a banca erra o item.**
- *Afirmação errada:* O produto mínimo viável é a primeira versão completa do produto, entregue ao final da fase de construção para validação formal pelo cliente. → *Certo:* MVP é a menor versão capaz de testar uma hipótese de valor com usuários reais, usada cedo para aprender.
- *Afirmação errada:* Em abordagens ágeis, a descoberta de necessidades se encerra antes do início do desenvolvimento, e daí em diante o escopo fica congelado. → *Certo:* descoberta e entrega são contínuas e paralelas; o backlog muda com o que se aprende.

**(E) Prioridade baixa.** Redação genérica, sem norma própria e sem incidência no catálogo; o essencial reaparece em 4.1, 4.2 e 4.4.

#### E4 · 4.4 — Prioridade alta

**(A) Texto original do edital.** Scrum e Kanban.

**(B) O que estudar.**
- Guia do Scrum, versão de novembro de 2020 (vigente; não há edição oficial posterior). Pilares: transparência, inspeção, adaptação. Valores: compromisso, foco, abertura, respeito, coragem.
- Time Scrum: um time, sem sub-times nem hierarquia, em geral com 10 pessoas ou menos, **autogerenciável** (2020 trocou "auto-organizado" por "autogerenciável" e eliminou o "Time de Desenvolvimento"). Três responsabilidades (*accountabilities*):
  - *Product Owner*: maximiza o valor do produto e gerencia o *Product Backlog*, inclusive a ordenação. Pode delegar, mas continua responsável. É uma pessoa, não um comitê. Só ele pode cancelar a Sprint;
  - *Scrum Master*: responde pela eficácia do time. O guia o chama de "verdadeiro líder que serve" e atribui a ele remover impedimentos, ensinar Scrum e garantir que os eventos ocorram. **Não** atribui tarefas;
  - *Developers*: criam o incremento, elaboram o *Sprint Backlog*, cumprem a DoD e se responsabilizam mutuamente.
- Eventos (timebox para Sprint de um mês; Sprints menores tendem a ter eventos menores):
  - Sprint: até um mês, contém todos os outros eventos;
  - *Sprint Planning*: até 8 h; responde por que a Sprint é valiosa (Meta da Sprint), o que pode ser feito e como;
  - *Daily Scrum*: 15 min, **para os Developers**. Inspeciona o progresso rumo à Meta da Sprint e adapta o plano. As três perguntas saíram em 2020;
  - *Sprint Review*: até 4 h. Inspeciona o resultado com as partes interessadas e adapta o backlog. Não é só demonstração;
  - *Sprint Retrospective*: até 3 h, sobre pessoas, interações, processos, ferramentas e DoD.
- Artefatos e compromissos (novidade de 2020):
  - *Product Backlog* → Meta do Produto;
  - *Sprint Backlog* → Meta da Sprint;
  - Incremento → Definição de Pronto.
  
  Item que não atende à DoD não pode ser liberado nem apresentado na Review; volta ao *Product Backlog*. Pode haver vários incrementos numa Sprint, e a entrega pode ocorrer antes do fim dela.
- Kanban, em duas vertentes:
  - Método Kanban (David Anderson): comece com o que faz hoje, evolução incremental. Não prescreve papéis nem cerimônias (TCU2015-TI-118, gabarito C);
  - *Kanban Guide* (Vacanti e Coleman, versão 2020.12): três práticas (definir e visualizar o fluxo de trabalho; gerenciar ativamente os itens no fluxo; melhorar o fluxo) e quatro medidas obrigatórias (WIP, *throughput*, idade do item de trabalho, *cycle time*), mais a expectativa de nível de serviço (SLE, ex.: "85% dos itens terminam em até 8 dias").
- Limite de WIP (*work in progress*): limita o trabalho iniciado e não concluído. O sistema puxa trabalho quando há capacidade, não empurra. Reduzir WIP reduz o tempo de ciclo.
- Lei de Little: WIP médio = *throughput* médio × tempo de ciclo médio. Vale para médias em sistema estável.
- *Lead time* × *cycle time*:
  - *cycle time*: do início do trabalho no item até o término;
  - *lead time*: na leitura aceita pelo Cebraspe (TCU2026-AUFC-TI-200, gabarito C), vai do ponto de compromisso (*commitment*) até a entrega. Em outras fontes, vai do pedido do cliente até a entrega (*customer lead time*);
  - em qualquer leitura, *lead time* ≥ *cycle time*, porque começa antes ou no mesmo ponto.
- Scrum com Kanban (Scrumban, ou o guia "Kanban for Scrum Teams"): Kanban não substitui eventos do Scrum, complementa com gestão de fluxo.
- Produto de dados com Scrum: Sprint com DoD que inclua testes de dados, linhagem atualizada e métricas do modelo registradas (E4 1.2). Kanban costuma servir melhor à sustentação e às demandas de dados ad hoc, que são fluxo contínuo e imprevisível.
- No trabalho da CGU: auditar contrato de software "ágil" em que o órgão não exerce o papel de PO (o fornecedor prioriza o próprio backlog); verificar se a DoD contratual é verificável; usar *lead time* e WIP para avaliar gargalo em fábrica de software ou na fila de demandas de dados.

**(C) Fontes.**
- Schwaber, K.; Sutherland, J. *The Scrum Guide*, nov. 2020 (há versão oficial em português). [scrumguides.org](https://scrumguides.org/scrum-guide.html)
- Vacanti, D.; Coleman, J. *The Kanban Guide*, v. 2020.12. [kanbanguides.org](https://kanbanguides.org/the-kanban-guide/2020.12)
- Anderson, D. *Kanban: Successful Evolutionary Change for Your Technology Business*. Blue Hole Press, 2010.
- TCU, Acórdão 2.362/2015-Plenário (modelos de contratação de desenvolvimento de software, em especial com métodos ágeis), conforme ementa no portal do TCU. [portal.tcu.gov.br](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na *Daily Scrum*, o Scrum Master distribui as tarefas do dia a cada desenvolvedor e resolve os impedimentos relatados (TCU2026-AUFC-TI-198, gabarito E). → *Certo:* a *Daily* é dos Developers, que adaptam o próprio plano; o Scrum Master garante que o evento ocorra e ajuda a remover impedimentos, sem comandar.
- *Afirmação errada:* Na *Sprint Planning*, o Scrum Master prioriza os itens do *Product Backlog* (TCU2015-TI-120, gabarito E). → *Certo:* a ordenação é do *Product Owner*; os Developers selecionam o que cabe na Sprint.
- *Afirmação errada:* No Kanban, o *cycle time* de um item é sempre maior que o seu *lead time*. → *Certo:* o *lead time* começa no compromisso ou no pedido, antes do início do trabalho, então é maior ou igual ao *cycle time*.

**(E) Prioridade alta.** Tema citado nominalmente e o mais repetido do bloco em provas Cebraspe: 3 itens em 2026 (TCU2026-AUFC-TI-57, 198, 200) e 2 em 2015 (TCU2015-TI-118, 120). Cobrança literal do Guia de 2020.

#### E4 · 4.5 — Prioridade alta

**(A) Texto original do edital.** Articulação com PDTIC, plano de transformação digital e plano de dados abertos.

**(B) O que estudar.**
- Hierarquia atual, conferida no Planalto:
  - Decreto nº 12.069/2024: Estratégia **Nacional** de Governo Digital 2024–2027 e Rede Gov.br. Alcança União, estados, DF e municípios. Reeditada a cada quatro anos, com vigência coincidente com o PPA, e revista ao menos dois anos após a edição (art. 6º);
  - Decreto nº 12.198/2024: Estratégia **Federal** de Governo Digital 2024–2027 (EFGD) e Infraestrutura Nacional de Dados (IND), só para a administração federal direta, autárquica e fundacional. Revogou os arts. 1º a 6º-A e 13 do Decreto nº 10.332/2020, que tratava da estratégia anterior. Prevê revisão depois de dois anos da publicação (art. 8º).
- Decreto nº 12.198/2024, art. 6º: para cumprir a EFGD, cada órgão elabora três instrumentos:
  - Plano de Transformação Digital (PTD): no mínimo, ações de serviços digitais e melhoria da qualidade, unificação de canais digitais, governança e gestão de dados, e segurança e privacidade;
  - PDTIC: no mínimo, inventário de necessidades priorizado; plano de metas e ações, com unidade demandante e unidade executora; plano de gestão de pessoas; plano orçamentário; plano de gestão de riscos;
  - Plano de Dados Abertos (PDA), nos termos do Decreto nº 8.777/2016.
- Aprovação e pactuação:
  - os três instrumentos são aprovados pelo Comitê de Governança Digital do órgão (art. 6º, § 2º), que todo órgão deve instituir (art. 5º);
  - o PTD é pactuado com a Secretaria-Executiva do MGI em conjunto com a SGD (art. 4º, II);
  - a SGD apoia e monitora os PTDs (art. 3º, III).
- PDTIC no SISP: a IN SGD/ME nº 94/2022 define o PDTIC como "instrumento de diagnóstico, planejamento e gestão dos recursos e processos de TIC" (art. 2º, XXV) e exige:
  - contratação de TIC em consonância com o PDTIC, "elaborado conforme Portaria SGD/ME nº 778/2019" (art. 6º, I);
  - alinhamento à Estratégia de Governo Digital (art. 6º, II). A IN ainda remete ao Decreto nº 10.332/2020 "e suas atualizações"; hoje vale o Decreto nº 12.198/2024;
  - previsão no Plano de Contratações Anual (art. 7º);
  - DFD com registro do alinhamento ao PDTIC (art. 10, I e II).
- Plano de Dados Abertos (Decreto nº 8.777/2016, com as alterações do Decreto nº 9.903/2019):
  - a gestão da Política de Dados Abertos é **coordenada pela CGU**, por meio da INDA (art. 5º, redação de 2019);
  - o PDA é o "documento orientador para as ações de implementação e promoção de abertura de dados" de cada órgão (art. 2º, V);
  - conteúdo mínimo (art. 5º, § 2º): inventário e catálogo de dados; priorização transparente da abertura; cronograma; papéis e responsabilidades; engajamento de cidadãos; demais mecanismos de promoção do uso;
  - a autoridade de monitoramento da LAI (art. 40 da Lei nº 12.527/2011) assegura a publicação e a atualização do PDA (art. 5º, § 4º);
  - bases sem informação protegida são automaticamente passíveis de abertura (art. 8º);
  - pedido de abertura de base segue os prazos da LAI (art. 6º).
- Articulação na prática: o produto de dados entra no PTD (eixo de governança e gestão de dados), a contratação que o sustenta precisa estar no PDTIC e no PCA, e a base resultante, se não for protegida, entra no inventário do PDA. Produto de dados fora desses planos é sinal de improviso, e a contratação fica sem lastro (IN 94, art. 6º).
- No trabalho da CGU: a CGU coordena a política de dados abertos e monitora o cumprimento dos PDAs; em auditoria de TI, cruza o objeto contratado com o PDTIC e o PCA; em avaliação de produto de dados, verifica se as bases públicas geradas foram inventariadas e abertas.

**(C) Fontes.**
- Decreto nº 12.069, de 21/6/2024 (Estratégia Nacional de Governo Digital). [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/D12069.htm)
- Decreto nº 12.198, de 24/9/2024, arts. 3º a 9º. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/D12198.htm)
- Decreto nº 8.777, de 11/5/2016, arts. 2º, 5º, 6º, 8º e 9º, com redação do Decreto nº 9.903/2019. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8777.htm)
- IN SGD/ME nº 94/2022, arts. 2º, XXV, 6º, 7º e 10. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Portaria SGD/ME nº 778/2019 (governança de TIC no SISP), alterada pela Portaria SGD/ME nº 18.152/2020. Vigência conforme fontes secundárias; não achei revogação.
- SISP. *Guia de PDTIC do SISP*, v. 2.1 (dez. 2021), conforme fontes secundárias.

**(D) Como a banca erra o item.**
- *Afirmação errada:* O Decreto nº 12.069/2024 instituiu a Estratégia Federal de Governo Digital e obriga cada órgão federal a elaborar PTD, PDTIC e PDA. → *Certo:* o 12.069 é a Estratégia **Nacional** (todos os entes, Rede Gov.br); quem institui a Estratégia **Federal** e lista os três instrumentos é o Decreto nº 12.198/2024 (art. 6º).
- *Afirmação errada:* A gestão da Política de Dados Abertos do Poder Executivo federal é coordenada pela Secretaria de Governo Digital, a quem cabe aprovar os planos de dados abertos dos órgãos. → *Certo:* a coordenação é da CGU, por meio da INDA (Decreto nº 8.777/2016, art. 5º, redação do Decreto nº 9.903/2019); o PDA é aprovado pelo Comitê de Governança Digital do órgão (Decreto nº 12.198/2024, art. 6º, § 2º).

**(E) Prioridade alta.** Normas recentes (2024), citadas nominalmente no edital, e a política de dados abertos é coordenada pela própria CGU. O catálogo não tem item direto; o mais próximo é TCU2026-AUFC-TI-190 (planejamento de TIC).

#### E4 · 4.6 — Prioridade baixa

**(A) Texto original do edital.** Comunicação dos resultados e das incertezas aos usuários.

**(B) O que estudar.**
- Incerteza tem fontes distintas, e cada uma pede uma comunicação diferente:
  - amostral ou estatística: intervalo de confiança, erro-padrão (E1 2.1);
  - do modelo: erro de generalização, calibração e desempenho por grupo (E3 2.5, 3.1, 3.3);
  - dos dados: cobertura, defasagem, erro de vinculação entre bases (E2 5.2, 5.5);
  - de premissas: cenários.
- Boas práticas:
  - dar a estimativa com a faixa ("entre 120 e 180 milhões, com 95% de confiança"), não o número seco com falsa precisão;
  - usar frequência natural para leigos ("de cada 100 alertas, cerca de 30 se confirmam", que é a precisão);
  - separar o que é achado do que é hipótese;
  - mostrar o custo dos dois erros (falso positivo e falso negativo; E3 3.2);
  - em escore de risco, dizer que é priorização, não prova (E3 3.5).
- Documentação padronizada: *model card* (Mitchell et al., 2019) para modelos e *datasheet for datasets* (Gebru et al., 2021) para bases. Ambas registram uso pretendido, limitações e desempenho por subgrupo.
- Transparência e explicabilidade são características de IA confiável no NIST AI RMF 1.0 e princípio de IA da OCDE: informar o usuário de que interage com IA e permitir entender e contestar o resultado (liga com E4 3.2).
- Visualização honesta: eixo que começa em zero para barras, barras de erro, faixa sombreada em séries de previsão, evitar gráfico que sugere tendência a partir de dois pontos.
- No trabalho da CGU: relatório de auditoria baseado em modelo deve declarar a taxa de acerto estimada da trilha e o que não foi verificado; nota técnica ao gestor com "o que sabemos, o que não sabemos e o que muda a decisão".

**(C) Fontes.**
- NIST. *AI Risk Management Framework (AI RMF 1.0)*, NIST AI 100-1, jan. 2023, seção 3 (características de IA confiável). [nist.gov](https://www.nist.gov/itl/ai-risk-management-framework)
- OCDE. *Recommendation of the Council on Artificial Intelligence* (2019, revista em 2024), princípio 1.3 (transparência e explicabilidade). [oecd.ai](https://oecd.ai/en/ai-principles)
- Mitchell, M. et al. "Model Cards for Model Reporting". FAT* 2019.
- Gebru, T. et al. "Datasheets for Datasets". *Communications of the ACM*, 64(12), 2021.
- Spiegelhalter, D. *The Art of Statistics*. Pelican, 2019 (comunicação de risco e incerteza).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Ao apresentar a gestores não técnicos o resultado de um modelo preditivo, recomenda-se omitir intervalos e margens de erro, que dificultam a compreensão e enfraquecem a recomendação. → *Certo:* a incerteza relevante para a decisão deve ser comunicada, em linguagem acessível (faixas, cenários, frequências), sob pena de induzir decisão com falsa confiança.
- *Afirmação errada:* Um escore de risco alto atribuído por modelo a um beneficiário é evidência suficiente de irregularidade, a ser comunicada como achado. → *Certo:* escore orienta a seleção para verificação; achado exige evidência obtida na verificação.

**(E) Prioridade baixa.** Sem norma específica nem incidência; o conteúdo técnico está em E1 2.2, E3 3.3 e 3.5. Vale como competência de redação na discursiva, não como item objetivo provável.

**5 Contratação e controle de soluções**

#### E4 · 5.1 — Prioridade alta

**(A) Texto original do edital.** Estudo técnico preliminar e termo de referência.

**(B) O que estudar.**
- Lei nº 14.133/2021, art. 6º:
  - XX: o ETP é "documento constitutivo da primeira etapa do planejamento de uma contratação que caracteriza o interesse público envolvido e a sua melhor solução e dá base ao anteprojeto, ao termo de referência ou ao projeto básico a serem elaborados caso se conclua pela viabilidade da contratação";
  - XXIII: o TR é "documento necessário para a contratação de bens e serviços". Elementos: objeto (natureza, quantitativos, prazo, prorrogação); fundamentação (referência ao ETP); descrição da solução considerando todo o ciclo de vida; requisitos; modelo de execução; modelo de gestão; critérios de medição e pagamento; forma de seleção do fornecedor; estimativa de valor com memória de cálculo; adequação orçamentária.
- Lei nº 14.133/2021, art. 18:
  - a fase preparatória deve abordar "todas as considerações técnicas, mercadológicas e de gestão";
  - o § 1º lista 13 elementos do ETP;
  - o § 2º torna **obrigatórios** pelo menos os incisos I (necessidade), IV (quantidades com memória de cálculo), VI (estimativa de valor), VIII (justificativa do parcelamento ou não) e XIII (posicionamento conclusivo sobre a adequação). Os demais podem faltar, com justificativa.
- IN SGD/ME nº 94/2022, regra específica do SISP para TIC. A IN SEGES/ME nº 58/2022, que rege o ETP em geral, manda o ETP de TIC seguir as regras do órgão central do SISP (art. 16).
  - Fases (art. 8º): Planejamento da Contratação, Seleção do Fornecedor e Gestão do Contrato, com gerenciamento de riscos em todas.
  - Planejamento (art. 9º): instituição da equipe, ETP e TR. É obrigatório em todas as etapas, inclusive em inexigibilidade, dispensa, ata de registro de preços, adesão e contratação de empresa pública de TIC (§ 1º).
  - O planejamento começa com o DFD enviado pela área requisitante à área de TIC, com alinhamento ao PDTIC, e com a instituição da Equipe de Planejamento (art. 10). Não começa pelo TR.
  - Equipe de Planejamento: integrantes técnico, administrativo e requisitante (art. 2º, IV). Os papéis não se acumulam, salvo requisitante e técnico, excepcionalmente, com aprovação do Comitê de Governança Digital (art. 10, § 3º).
  - ETP (art. 11), feito pelos integrantes técnico e requisitante:
    - necessidades e requisitos, com cálculo do quantitativo;
    - análise comparativa de soluções (ver 5.3);
    - análise comparativa de custos com TCO (ver 5.2);
    - estimativa do custo total;
    - declaração de viabilidade.
    
    Assinam os dois integrantes e a autoridade máxima de TIC (§ 2º).
  - ETP facultativo (art. 9º, § 9º): dispensa por valor, guerra ou grave perturbação, emergência ou calamidade, remanescente. ETP dispensado (§ 10): repetição de licitação deserta ou fracassada há menos de um ano, mantidas as condições.
  - TR (art. 12): elaborado pela equipe **a partir do ETP**, com objeto, códigos Catmat/Catser, descrição da solução, justificativa, requisitos (art. 16), responsabilidades, modelo de execução e de gestão (arts. 18 e 19), estimativa de preços, adequação orçamentária, regime de execução, critérios de seleção e índice de correção (o ICTI, art. 24).
  - O TR pode ir a consulta ou audiência pública (§ 5º). Assinam a equipe e a autoridade máxima de TIC, e aprova a autoridade competente (§ 6º).
  - Vedações do art. 3º: mais de uma solução de TIC num único contrato; serviços do art. 3º do Decreto nº 9.507/2018, incluindo gestão de processos de TIC e gestão de segurança da informação.
- ETP e TR não se substituem: o ETP decide **se** e **qual** solução contratar; o TR especifica **como** contratar e gerir a solução escolhida.
- Para solução de IA, o ETP deve tratar:
  - o problema e a alternativa sem IA (E3 1.2: comparação com solução simples);
  - os dados disponíveis e a base legal de tratamento (LGPD);
  - o risco de viés e a avaliação de impacto (E4 3.2);
  - o modelo de pagamento (5.6);
  - o plano de saída (5.7).
  
  O TR traz as métricas mínimas e o conjunto de teste guardado pelo órgão, os requisitos de explicabilidade e registro, e a vedação de uso dos dados do órgão para treinar o modelo do fornecedor, salvo autorização.
- No trabalho da CGU: auditoria de conformidade que cruza ETP, TR e contrato. Achados típicos: ETP que copia o TR; ETP sem alternativa analisada; quantitativo sem memória de cálculo; TR sem critério de aceitação mensurável. A Q2 pode pedir exatamente essa análise para uma contratação de IA (ver 5.7).

**(C) Fontes.**
- Lei nº 14.133/2021, arts. 6º, XX e XXIII; 18, § 1º e § 2º. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- IN SGD/ME nº 94, de 23/12/2022 (vigência desde 1º/2/2023; revogou a IN SGD/ME nº 1/2019), arts. 2º, 3º, 8º a 16 e 24. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- IN SEGES/ME nº 58, de 8/8/2022 (ETP e Sistema ETP Digital), art. 16. [gov.br/compras](https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-no-58-de-8-de-agosto-de-2022)
- Decreto nº 10.947/2022 (Plano de Contratações Anual e DFD).
- TCU, Acórdão 2.037/2019-Plenário (conformidade de aquisições de TI, do planejamento à execução), conforme ementa no portal. [portal.tcu.gov.br](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)

**(D) Como a banca erra o item.**
- *Afirmação errada:* O estudo técnico preliminar pode substituir o termo de referência em alguns tipos de serviço de TI (TCU2026-AUFC-TI-177, gabarito E). → *Certo:* são documentos distintos e sucessivos; o ETP dá base ao TR, que continua necessário (Lei nº 14.133/2021, art. 6º, XX e XXIII).
- *Afirmação errada:* A etapa inicial da contratação de TI é a elaboração do termo de referência (TCU2026-AUFC-TI-178, gabarito E). → *Certo:* o planejamento começa com o DFD e a instituição da Equipe de Planejamento; o ETP vem antes do TR (IN SGD/ME nº 94/2022, arts. 9º e 10).
- *Afirmação errada:* O ETP deve conter todos os elementos do art. 18, § 1º, da Lei nº 14.133/2021, sob pena de nulidade. → *Certo:* são obrigatórios ao menos os incisos I, IV, VI, VIII e XIII; a falta dos demais exige justificativa (§ 2º).

**(E) Prioridade alta.** Subtópico de contratação de TI mais cobrado no catálogo Cebraspe: TCU2026-AUFC-TI-177, 178 e 190; TCU2015-TI-196 e 197 (sob as INs antigas). Também é a espinha da provável Q2 sobre contratação de IA.

#### E4 · 5.2 — Prioridade média

**(A) Texto original do edital.** Viabilidade, dimensionamento e custo total de propriedade.

**(B) O que estudar.**
- Viabilidade:
  - técnica, econômica e de prazo;
  - o ETP termina com "posicionamento conclusivo sobre a adequação da contratação" (Lei nº 14.133/2021, art. 18, § 1º, XIII) e com a "declaração da viabilidade", que justifica a solução escolhida pelos benefícios em eficácia, eficiência, efetividade e economicidade (IN SGD/ME nº 94/2022, art. 11, V);
  - concluir pela inviabilidade é resultado legítimo do ETP.
- Dimensionamento:
  - quantidades "acompanhadas das memórias de cálculo", considerando interdependências e economia de escala (Lei, art. 18, § 1º, IV);
  - a IN 94 exige o quantitativo "de forma detalhada, motivada e justificada, inclusive quanto à forma de cálculo" (art. 11, I) e a forma de cálculo na justificativa do TR (art. 15, III);
  - superdimensionar é achado clássico de auditoria (licença comprada e não usada, ata com quantitativo inflado).
- TCO (custo total de propriedade):
  - a IN 94 manda calcular o TCO "por meio da obtenção dos custos inerentes ao ciclo de vida dos bens e serviços de cada solução, a exemplo dos valores de aquisição dos ativos, insumos, garantia técnica estendida, manutenção, migração e treinamento", com memória de cálculo (art. 11, III, "a" e "b");
  - o TCO é calculado só para as soluções técnica e funcionalmente viáveis; as inviáveis são registradas sem cálculo (art. 11, § 1º);
  - a Lei manda considerar o ciclo de vida do objeto na busca da proposta mais vantajosa (art. 11, I; art. 18, VIII).
- TCO de solução de dados e IA. Custos que costumam faltar:
  - preparação e rotulagem de dados;
  - armazenamento e saída de dados da nuvem (*egress*);
  - inferência por volume (tokens, chamadas, GPU-hora);
  - monitoramento e retreino (E4 1.6);
  - equipe interna para fiscalizar;
  - migração na saída (5.7).
  
  Custo de nuvem é variável: dimensionar por cenários de uso e prever teto e alertas (prática de FinOps).
- Comparar soluções pelo valor presente do TCO no mesmo horizonte, não pelo preço de aquisição.
- No trabalho da CGU: refazer a memória de cálculo do quantitativo com dados de uso reais (logs de licença, volume de chamadas); verificar se o TCO considerou migração e saída; achado de solução "barata" na compra e cara na operação.

**(C) Fontes.**
- Lei nº 14.133/2021, arts. 11, I; 18, VIII e § 1º, IV, IX e XIII. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- IN SGD/ME nº 94/2022, arts. 11 e 15. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- FinOps Foundation. *FinOps Framework*. [finops.org](https://www.finops.org/framework/)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na análise comparativa de custos do ETP de TIC, o custo total de propriedade deve ser calculado para todas as soluções identificadas, inclusive as consideradas inviáveis, para fins de transparência. → *Certo:* as inviáveis são registradas no ETP, mas dispensadas do cálculo de TCO (IN SGD/ME nº 94/2022, art. 11, § 1º).
- *Afirmação errada:* O custo total de propriedade equivale ao preço de aquisição acrescido da garantia, de modo que custos de migração e treinamento ficam fora da análise. → *Certo:* a IN cita expressamente manutenção, migração e treinamento entre os custos do ciclo de vida.

**(E) Prioridade média.** Conceito claro e cobrável em 1 item, sem incidência no catálogo; útil na Q2 (dimensionar e custear a solução de IA).

#### E4 · 5.3 — Prioridade alta

**(A) Texto original do edital.** Comparação entre desenvolvimento próprio, contratação e serviços de nuvem.

**(B) O que estudar.**
- O ETP de TIC deve fazer "análise comparativa de soluções" considerando, além do custo, os benefícios. A IN SGD/ME nº 94/2022 (art. 11, II) manda olhar:
  - necessidades semelhantes em outros órgãos e as soluções adotadas;
  - alternativas de mercado;
  - software público ou de governo (Portaria STI/MP nº 46/2016);
  - padrões de governo (ePING, eMAG, ICP-Brasil, e-ARQ);
  - adequação do ambiente;
  - modelos de prestação;
  - tipos de solução;
  - bem × serviço;
  - ampliar × substituir;
  - métricas de pagamento.
- Opções e critérios:
  - desenvolvimento próprio: controle e PI totais; exige equipe estável e capacidade de sustentação. Risco de dependência de poucas pessoas;
  - desenvolvimento contratado (fábrica de software): escala; exige fiscalização forte. Modelo padronizado pela Portaria SGD/MGI nº 750/2023, obrigatório no SISP;
  - produto pronto ou SaaS: rapidez e custo previsível; menor aderência e maior risco de aprisionamento (*lock-in*);
  - reuso: cessão de software de outro órgão. O TCU cede código de suas soluções de IA mediante contrato de licenciamento, conforme notícia;
  - nuvem: elasticidade e serviços gerenciados de dados e IA; custo variável e responsabilidade compartilhada.
- Nuvem no SISP:
  - para criar, ampliar ou renovar data center, a regra é contratar nuvem, "salvo quando demonstrada a inviabilidade em estudo técnico preliminar" (IN 94, Anexo I, item 4.1);
  - nuvem segue as normas do GSI/PR (item 4.2), em especial a IN GSI/PR nº 5/2021 (requisitos mínimos de segurança para nuvem);
  - o órgão exige certificações de segurança do provedor (item 4.2.1) e cláusula de portabilidade de dados e software (item 4.2.2).
- Portaria SGD/MGI nº 5.950/2023: modelo de contratação de software e serviços de computação em nuvem no SISP. É obrigatório desde 30/4/2024; exceção só com autorização prévia da SGD. Pelos documentos dos órgãos publicados na página da SGD, exige que o órgão tenha uma Estratégia de Uso de Software e de Serviços de Computação em Nuvem. Detalhes do Anexo I conforme fontes secundárias, incluindo a exigência de dados em território nacional.
- Responsabilidade compartilhada:
  - IaaS: o cliente gerencia sistema operacional, aplicação e dados;
  - PaaS: o cliente gerencia aplicação e dados;
  - SaaS: o provedor gerencia infraestrutura, SO e aplicação; o cliente responde por dados, acessos e configuração.
  
  Em todos os modelos, a responsabilidade pelos dados e pela conformidade com a LGPD continua do órgão.
- Limites do "fazer": o órgão não pode terceirizar a gestão de processos de TIC nem a de segurança da informação (IN 94, art. 3º, II). Pode contratar apoio técnico, sob supervisão exclusiva de servidores (art. 3º, parágrafo único).
- Para IA:
  - comparar modelo próprio treinado com dados do órgão × modelo de fundação via API (LLM como serviço) × solução de mercado embarcada × plataforma de ML em nuvem;
  - critérios: sensibilidade e localização dos dados, explicabilidade exigida, custo de inferência, controle de versões do modelo (o provedor pode trocar o modelo sem aviso), dependência e saída.
- No trabalho da CGU: avaliar se o ETP comparou de fato as alternativas ou só justificou a escolhida; verificar a Estratégia de Uso de Nuvem; contratação de IA por órgão auditado é candidata forte à Q2, e este é o ponto em que se julga se "comprar IA" era a melhor solução.

**(C) Fontes.**
- IN SGD/ME nº 94/2022, arts. 3º e 11, II; Anexo I, itens 3 e 4. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Portaria SGD/MGI nº 5.950, de 26/10/2023 (modelo de contratação de software e nuvem), conforme fontes secundárias e página da SGD. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-software-e-servicos-em-nuvem)
- Portaria SGD/MGI nº 750, de 20/3/2023 (modelo de desenvolvimento, manutenção e sustentação de software), alterada pelas Portarias SGD/MGI nº 6.679/2024 e nº 6.040/2025 e, conforme fontes secundárias, nº 4.777/2026.
- IN GSI/PR nº 5, de 30/8/2021 (segurança em nuvem); há notícia de revisão em curso.
- TCU, Acórdãos 157/2024-Plenário (contratação de nuvem conduzida pelo TCU com CGU e CNJ) e 292/2025-Plenário (contratação centralizada de nuvem pela SGD/MGI), conforme ementas no portal. [portal.tcu.gov.br](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- NIST SP 800-145. *The NIST Definition of Cloud Computing* (2011). [nist.gov](https://csrc.nist.gov/pubs/sp/800/145/final)

**(D) Como a banca erra o item.**
- *Afirmação errada:* No modelo SaaS, cabem ao contratante a gestão da infraestrutura e do sistema operacional (TCU2026-AUFC-TI-181, gabarito E). → *Certo:* no SaaS o provedor gerencia infraestrutura, SO e aplicação; o cliente cuida de dados, usuários e configurações.
- *Afirmação errada:* O órgão do SISP que precise renovar seu data center deve priorizar a infraestrutura própria e só contratar nuvem se demonstrar, no ETP, vantagem econômica da nuvem. → *Certo:* é o inverso. A regra é nuvem, salvo inviabilidade demonstrada no ETP (IN 94, Anexo I, item 4.1).

**(E) Prioridade alta.** Três itens Cebraspe em 2026 sobre modelos de serviço (TCU2026-AUFC-TI-179 a 181) e um sobre normas de nuvem (TCU2026-AUFC-TI-162). Decisão central de qualquer contratação de IA; perfil de Q2.

#### E4 · 5.4 — Prioridade média

**(A) Texto original do edital.** Pesquisa de preços.

**(B) O que estudar.**
- Lei nº 14.133/2021, art. 23: o valor estimado deve ser compatível com o mercado. Para bens e serviços em geral, os parâmetros do § 1º podem ser usados "de forma combinada ou não":
  - I: composição de custos unitários menores ou iguais à **mediana** do painel de preços ou do banco de preços em saúde, no PNCP;
  - II: contratações similares da Administração no último ano;
  - III: mídia especializada, tabela oficial e sítios eletrônicos, com data e hora de acesso;
  - IV: pesquisa direta com **no mínimo 3 fornecedores**, com justificativa da escolha e orçamentos de até 6 meses antes da divulgação do edital;
  - V: base nacional de notas fiscais eletrônicas.
- IN SEGES/ME nº 65/2021, que regulamenta e segue vigente (não achei alteração; a sigla "SEGES/MGI" reflete só a mudança de ministério):
  - art. 5º: repete os parâmetros e manda **priorizar I e II**, justificando quando não for possível (§ 1º);
  - art. 6º: preço estimado pela média, mediana ou menor valor, sobre **três ou mais preços**, descartando inexequíveis, inconsistentes e excessivamente elevados;
  - análise crítica obrigatória quando houver grande variação (§ 4º);
  - menos de três preços só excepcionalmente, com justificativa e aprovação da autoridade (§ 5º);
  - com base só no painel, o valor não pode passar da mediana (§ 6º);
  - contratação direta: notas fiscais da futura contratada com outros clientes no último ano (art. 7º, § 1º).
- TIC:
  - os preços dos Catálogos de Soluções de TIC com Condições Padronizadas são usados como preço estimado, salvo se a pesquisa achar valor menor (IN 65, art. 8º);
  - na IN SGD/ME nº 94/2022, o PMC-TIC do catálogo é **valor máximo** da contratação (art. 40, § 1º);
  - a estimativa é feita pelo integrante técnico com apoio do administrativo, conforme a IN 65 (IN 94, art. 20);
  - a prorrogação exige nova pesquisa, feita pelo fiscal técnico (art. 36, § 1º).
- Para nuvem e IA, preço por unidade de consumo (vCPU-hora, GB-mês, milhão de tokens) muda rápido e varia por região e desconto de compromisso. Comparar mesma unidade, mesma região e mesmo nível de serviço.
- Sobrepreço × superfaturamento: sobrepreço é o preço orçado ou contratado acima do mercado; superfaturamento é o dano na execução (medição a maior, qualidade inferior, pagamento antecipado indevido). Definições no art. 6º da Lei nº 14.133/2021.
- No trabalho da CGU: análise de dados de preços (painel de preços, PNCP, notas fiscais) para achar sobrepreço; detectar cotações de fachada (fornecedores com sócios ou endereço em comum, orçamentos com o mesmo layout); outlier de preço por item (E1 1.1, E2 5.4).

**(C) Fontes.**
- Lei nº 14.133/2021, art. 23. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- IN SEGES/ME nº 65, de 7/7/2021, arts. 5º a 8º. [gov.br/compras](https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-me-no-65-de-7-de-julho-de-2021)
- IN SGD/ME nº 94/2022, arts. 20, 36 e 40. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)

**(D) Como a banca erra o item.**
- *Afirmação errada:* A pesquisa de preços exige, obrigatoriamente, a cotação direta com pelo menos três fornecedores, sendo os demais parâmetros apenas complementares. → *Certo:* os parâmetros são combináveis ou isolados; a lei e a IN priorizam o painel de preços e as contratações similares. A cotação direta é um dos parâmetros, e o mínimo de três é exigido dentro dela.
- *Afirmação errada:* Na contratação de item de TIC presente em catálogo padronizado da SGD, o órgão pode adotar preço acima do PMC-TIC se a pesquisa de mercado indicar valores superiores. → *Certo:* o PMC-TIC é valor máximo (IN 94, art. 40, § 1º); se a pesquisa achar preço menor, usa-se o menor (IN 65, art. 8º).

**(E) Prioridade média.** Tema clássico de licitações, cobrável por regra numérica (3 preços, 1 ano, 6 meses, mediana); sem incidência no catálogo para TI. É também matéria de P2 (licitações).

#### E4 · 5.5 — Prioridade média

**(A) Texto original do edital.** Requisitos de qualidade, proteção e desempenho.

**(B) O que estudar.**
- IN SGD/ME nº 94/2022, art. 16:
  - o integrante requisitante define requisitos de negócio, capacitação, legais, manutenção, temporais, segurança e privacidade (com o técnico) e sociais, ambientais e culturais (observando o Guia Nacional de Contratações Sustentáveis);
  - o integrante técnico define arquitetura, projeto e implementação, implantação, garantia e manutenção, capacitação, experiência e formação da equipe, metodologia, segurança e privacidade;
  - a equipe garante o alinhamento entre os dois grupos (parágrafo único).
- Segurança e privacidade (IN 94, Anexo I, item 7):
  - o TR deve conter requisitos de segurança da informação e privacidade (SIP) proporcionais ao risco;
  - aspectos: disponibilidade; prevenção de vazamento e fraude; gestão de riscos de SIP pela contratada; rastreabilidade com trilha de auditoria; continuidade; tratamento de dados pessoais conforme a LGPD; auditoria de SIP;
  - o detalhamento está no Guia de Requisitos e de Obrigações quanto à Segurança da Informação e Privacidade da SGD;
  - a contratada assina Termo de Compromisso (sigilo), e seus empregados, Termo de Ciência (art. 18, V).
- LGPD nos contratos:
  - controlador e operador mantêm registro das operações de tratamento (art. 37) e adotam medidas de segurança (art. 46). Foi o item TCU2026-AUFC-TI-189, gabarito C;
  - o operador trata dados segundo as instruções do controlador (art. 39).
- Qualidade de produto: ISO/IEC 25010:2023, com nove características: adequação funcional, eficiência de desempenho, compatibilidade, capacidade de interação, confiabilidade, segurança, manutenibilidade, flexibilidade e *safety*. Para IA, a ISO/IEC 25059:2023 estende o modelo, com robustez, transparência e controlabilidade, entre outras.
- Desempenho:
  - medir por percentil (latência p95/p99), não pela média;
  - disponibilidade em % com janela de medição, *throughput*, RPO/RTO para continuidade (E4 2.3, 2.4).
  
  Cada requisito vira indicador com nível mínimo de serviço (NMS) e glosa (5.6).
- Requisitos próprios de IA:
  - métrica mínima em conjunto de teste do órgão;
  - desempenho por grupo e limites de disparidade (E3 3.3);
  - calibração;
  - registro de entradas, saídas e versão do modelo;
  - explicação por decisão quando houver efeito sobre pessoas (E4 3.2);
  - proteção contra injeção de instruções e vazamento (E3 6.3);
  - proibição de reter ou usar dados do órgão para treino.
- Uso de IA **pela contratada**: a Portaria SGD/MGI nº 5.921/2026, em vigor desde 1º/9/2026, alterou o modelo de operação de infraestrutura e atendimento (Portaria SGD/MGI nº 1.070/2023). A contratada só pode usar ferramentas de IA se o TR ou a política de IA do órgão indicada no edital autorizar; o TR define regras, limites, responsabilidades, quem paga e os requisitos de privacidade e segurança. Conforme notícias do MGI e da imprensa especializada.
- Sustentabilidade e acessibilidade não são opcionais: integram os requisitos (IN 94, art. 16, I, "g"; Lei nº 14.133/2021, art. 18, § 1º, XII).
- No trabalho da CGU: verificar se os requisitos de segurança e LGPD do TR viraram cláusula e indicador; requisito de IA sem métrica verificável; trilha de auditoria exigida e não entregue.

**(C) Fontes.**
- IN SGD/ME nº 94/2022, arts. 16 e 18, V; Anexo I, item 7. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Lei nº 13.709/2018 (LGPD), arts. 37, 39 e 46. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- Portaria SGD/MGI nº 5.921, de 22/7/2026, conforme notícia oficial do MGI. [gov.br/gestao](https://www.gov.br/gestao/pt-br/assuntos/editoria-2013-defeso-eleitoral/publicada-portaria-que-aprimora-governanca-de-ia-em-modelo-de-contratacao-de-servicos-de-operacao-de-infraestrutura)
- ISO/IEC 25010:2023 e ISO/IEC 25059:2023 (texto pago, conferido pelo sumário). [iso.org](https://www.iso.org/standard/78176.html)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Sustentabilidade e acessibilidade são considerações espontâneas e opcionais do fornecedor, e só a segurança da informação é de observância obrigatória (TCU2026-AUFC-TI-188, gabarito E). → *Certo:* os três são requisitos a definir no planejamento (IN 94, art. 16; Lei nº 14.133/2021, art. 18, § 1º, XII).
- *Afirmação errada:* Em contrato de TIC com tratamento de dados pessoais, o dever de registrar as operações de tratamento é exclusivo do controlador, cabendo ao operador apenas seguir instruções. → *Certo:* controlador e operador devem manter registro (LGPD, art. 37).

**(E) Prioridade média.** Dois itens Cebraspe em 2026 (TCU2026-AUFC-TI-188 e 189); parte técnica já aparece em E4 2.x e 3.x, e aqui o foco é transformar requisito em cláusula.

#### E4 · 5.6 — Prioridade alta

**(A) Texto original do edital.** Fiscalização e pagamento por entregas verificáveis.

**(B) O que estudar.**
- Lei nº 14.133/2021:
  - art. 117: a execução é acompanhada por um ou mais fiscais especialmente designados, que anotam ocorrências e determinam a regularização (§ 1º), informam os superiores do que exceder sua competência (§ 2º) e são auxiliados pela assessoria jurídica e pelo controle interno (§ 3º);
  - terceiro contratado para assistir o fiscal responde objetivamente pelas informações, assina confidencialidade e não exerce atribuição exclusiva de fiscal; o fiscal continua responsável (§ 4º);
  - art. 140: recebimento provisório e definitivo;
  - art. 144: permite remuneração variável vinculada ao desempenho (metas, padrões de qualidade, sustentabilidade, prazos), motivada e dentro do limite orçamentário.
- IN SGD/ME nº 94/2022:
  - gestão do contrato: gestor do contrato e fiscais técnico, requisitante, administrativo e, quando preciso, setorial (art. 29);
  - o gestor não acumula papel de fiscal (§ 3º). Fiscais só acumulam requisitante e técnico, excepcionalmente (§ 4º);
  - o encargo não pode ser recusado, mas deficiências devem ser reportadas (§ 7º, com o Decreto nº 11.246/2022);
  - quem fornece a solução não pode ser quem a avalia, mede ou apoia a fiscalização (art. 4º).
- Modelo de pagamento na IN 94:
  - o pagamento é "efetuado em função dos resultados obtidos" (art. 18, IV);
  - o Modelo de Gestão fixa critérios de aceitação, indicadores e níveis mínimos de serviço (art. 19, I) e a glosa (art. 19, III);
  - vedado adotar homem-hora "ou equivalente" para aferir esforço, "salvo mediante justificativa e sempre vinculada à entrega de produtos de acordo com prazos e qualidade previamente definidos" (art. 5º, VIII);
  - vedado contratar por posto de trabalho alocado, salvo com comprovação de resultados compatíveis (art. 5º, IX);
  - vedado pagar por mero reembolso de salários (art. 5º, XIII);
  - em software, todas as atividades do ciclo de desenvolvimento estão dentro da métrica; não se pagam à parte levantamento de requisitos e reuniões (Anexo I, item 3.2).
- Posição do TCU:
  - Acórdão 1.508/2020-Plenário: auditoria sobre contratações de TI baseadas em unidade de serviço técnico (UST). Verificou se a execução garante critérios que aferem pagamento por resultados a preços razoáveis. A UST tende a medir esforço com outro nome. Conforme ementa no portal do TCU; o inteiro teor não foi lido;
  - Acórdão 2.362/2015-Plenário: modelos de contratação de software, inclusive com métodos ágeis;
  - Acórdão 980/2023-Plenário: riscos em aquisições de software.
- Modelos de remuneração no SISP: a Portaria SGD/MGI nº 750/2023 padroniza modalidades de remuneração para desenvolvimento e sustentação, e o novo texto teria sido motivado pela jurisprudência do TCU. Pela Portaria SGD/MGI nº 4.777/2026, conforme fonte secundária, entrou modalidade de alocação de profissionais vinculada ao alcance de resultados. Conferir o rol vigente no texto consolidado.
- Entrega verificável em projeto de dados e IA. Pagar por marco com evidência:
  - pipeline reproduzível que roda do zero no ambiente do órgão;
  - modelo que atinge a métrica mínima em conjunto de teste **guardado pelo órgão** e nunca entregue ao fornecedor, para evitar sobreajuste ao teste (E3 2.3);
  - relatório de avaliação por grupo;
  - *model card*;
  - código e documentação no repositório do órgão.
  
  Na operação, pagar por NMS medido (disponibilidade, latência p95, tempo de correção), com glosa automática.
- Ciclo de fiscalização (IN 94, arts. 31 a 33): reunião inicial, Termo de Compromisso e Termos de Ciência, ordem de serviço com métricas, recebimento provisório pelo fiscal técnico, avaliação de qualidade, glosa conforme NMS e recebimento definitivo pelo gestor.
- No trabalho da CGU:
  - auditar contrato de fábrica de software ou de UST para verificar se o pago corresponde a produto entregue e aceito;
  - recalcular glosas a partir dos registros de chamados;
  - achado típico: ateste sem critério, pagamento integral com NMS descumprido, horas faturadas sem produto.

**(C) Fontes.**
- Lei nº 14.133/2021, arts. 117, 140 e 144. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- IN SGD/ME nº 94/2022, arts. 4º, 5º, 18, 19, 29 a 33; Anexo I, item 3.2. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Decreto nº 11.246/2022 (agentes de contratação, gestores e fiscais).
- TCU, Acórdãos 1.508/2020, 2.362/2015 e 980/2023, todos do Plenário, conforme ementas na página de aquisições de TI do TCU. [portal.tcu.gov.br](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Portaria SGD/MGI nº 750/2023 e alterações (Portarias SGD/MGI nº 6.679/2024, nº 6.040/2025 e, conforme fonte secundária, nº 4.777/2026).

**(D) Como a banca erra o item.**
- *Afirmação errada:* Nas contratações de TIC do SISP, é vedado em qualquer hipótese o uso da métrica homem-hora. → *Certo:* a vedação admite exceção justificada, desde que vinculada à entrega de produtos com prazo e qualidade definidos (IN 94, art. 5º, VIII).
- *Afirmação errada:* O fiscal técnico do contrato de TIC pode também exercer a função de gestor do contrato quando o órgão tiver equipe reduzida. → *Certo:* o papel de gestor não pode ser acumulado com papéis da equipe de fiscalização (IN 94, art. 29, § 3º).
- *Afirmação errada:* A responsabilização do contratado por inexecução parcial ocorre apenas na esfera judicial (TCU2026-AUFC-TI-182, gabarito E). → *Certo:* cabem sanções administrativas (advertência, multa, impedimento, inidoneidade), sem prejuízo de outras esferas.

**(E) Prioridade alta.** Subtópico com mais itens Cebraspe no catálogo de governança de TI: TCU2026-AUFC-TI-182 a 186; TCU2015-TI-190, 192 a 195 e 198 a 200. É o centro da Q2 sobre contratação de IA (como pagar e como aceitar).

#### E4 · 5.7 — Prioridade alta

**(A) Texto original do edital.** Propriedade intelectual, portabilidade, acesso a dados e modelos, dependência tecnológica e plano de saída.

**(B) O que estudar.**
- Lei nº 14.133/2021, art. 93:
  - em projetos e serviços técnicos especializados, inclusive software e sua documentação técnica, o autor cede **todos os direitos patrimoniais** à Administração, que pode usar e alterar livremente;
  - em obra imaterial de caráter tecnológico, a cessão inclui dados, documentos e elementos de informação da tecnologia (§ 1º);
  - a Administração pode deixar de exigir a cessão em pesquisa, desenvolvimento e inovação, conforme a Lei nº 10.973/2004 (§ 2º).
- IN SGD/ME nº 94/2022:
  - o TR deve prever que a PI e os direitos autorais dos artefatos criados ou alterados pertencem à Administração, "incluindo a documentação, o código-fonte de aplicações, os modelos de dados e as bases de dados, justificando os casos em que isso não ocorrer" (art. 17, I, "h");
  - a contratada deve ceder esses direitos (art. 17, II, "h") e fazer a transição contratual (art. 17, II, "i");
  - software desenvolvido por contrato pertence ao órgão (Anexo I, item 3.4, com o art. 4º da Lei nº 9.609/1998).
- Portabilidade e saída:
  - em nuvem, cláusula que garanta "portabilidade de dados e softwares" e informações "disponíveis para transferência de localização, em prazo adequado" (IN 94, Anexo I, item 4.2.2);
  - transição e encerramento (art. 35): manter recursos para a continuidade, entregar versões finais e documentação, transferir conhecimento, devolver recursos, revogar acessos, eliminar caixas postais.
- Dependência tecnológica (*lock-in*):
  - formas: formato proprietário, API sem equivalente, conhecimento só na contratada, licença atrelada a um fabricante, custo de saída de dados (*egress*);
  - o TCU avaliou práticas de grandes fabricantes (concorrência restrita, cláusulas abusivas) no Acórdão 2.569/2018-Plenário e as compras pelo acordo corporativo com a Microsoft no Acórdão 1.875/2024-Plenário, conforme ementas no portal;
  - mitigação: formatos abertos, padrões de interoperabilidade (ePING), contêineres, infraestrutura como código, cláusula de saída com prazo e preço, conhecimento documentado e repassado ao longo do contrato, não só no fim.
- Plano de saída: documento previsto já no ETP e no TR, não no fim do contrato. Conteúdo:
  - inventário do que deve sair (dados, metadados, código, modelos, configurações, logs);
  - formato e prazo de exportação;
  - teste periódico de exportação;
  - transferência de conhecimento;
  - período de operação assistida;
  - destruição certificada dos dados no fornecedor ao final.
- Acesso a dados e modelos na contratação de IA, o ponto mais sensível:
  - pesos do modelo treinado ou ajustado com dados do órgão: exigir cessão ou, ao menos, entrega e direito de uso perpétuo;
  - dados de treino, rótulos, *prompts*, índices vetoriais e *embeddings* (E3 5.2), *pipelines* de avaliação e registros de inferência são do órgão;
  - modelo de fundação acessado como serviço: a PI do modelo base não é cedível; registrar a exceção justificada (art. 17, I, "h") e compensar com cláusulas de não uso dos dados do órgão para treino, de exportação de *prompts*, configurações e logs, de aviso prévio de troca ou descontinuação de versão do modelo, e de manutenção de versão para reprodutibilidade (E4 1.1);
  - exigir acesso para auditoria do modelo (testes de viés e desempenho pelo órgão ou pelo controle).
- **Q2 da discursiva:** contratação de solução de IA por órgão auditado é candidata forte. O roteiro de resposta junta este subitem com 5.1, 5.3 e 5.6:
  - problema e alternativa sem IA no ETP;
  - comparação próprio × mercado × nuvem com TCO;
  - requisitos de proteção de dados e de avaliação de viés;
  - pagamento por entrega verificável, com teste guardado pelo órgão;
  - PI de dados, pesos e *prompts*;
  - portabilidade e plano de saída;
  - riscos e controles (E4 3.x).
- No trabalho da CGU: verificar se o contrato garante ao órgão código, dados e modelos; se há plano de saída testado; achado de aprisionamento (prorrogações sucessivas "por não haver alternativa" criadas pelo próprio contrato).

**(C) Fontes.**
- Lei nº 14.133/2021, art. 93. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- IN SGD/ME nº 94/2022, arts. 17 e 35; Anexo I, itens 3.4 a 3.6 e 4.2.2. [gov.br/governodigital](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- Lei nº 9.609/1998 (Lei do Software), art. 4º. [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm)
- TCU, Acórdãos 2.569/2018-Plenário e 1.875/2024-Plenário, conforme ementas no portal. [portal.tcu.gov.br](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Não há guia federal específico de **contratação** de soluções de IA localizado até 13/10/2026. Há guias de **uso** da SGD/MGI (IA generativa, com o Serpro; introdução a RAG) e a Portaria SGD/MGI nº 5.921/2026 sobre uso de IA pela contratada. Como referência internacional: World Economic Forum, *AI Procurement in a Box* (2020). [weforum.org](https://www.weforum.org/publications/ai-procurement-in-a-box/)

**(D) Como a banca erra o item.**
- *Afirmação errada:* Na contratação de desenvolvimento de software sob demanda, os direitos patrimoniais sobre o código-fonte permanecem com a contratada, que concede à Administração licença de uso. → *Certo:* o autor cede todos os direitos patrimoniais à Administração (Lei nº 14.133/2021, art. 93; TCU2026-AUFC-TI-180, gabarito C), com exceção facultativa para P&D (§ 2º).
- *Afirmação errada:* A cessão de direitos prevista na IN SGD/ME nº 94/2022 alcança apenas o código-fonte das aplicações, ficando os modelos de dados e as bases de dados sob titularidade da contratada que os estruturou. → *Certo:* a IN inclui expressamente documentação, código-fonte, modelos de dados e bases de dados (art. 17, I, "h").

**(E) Prioridade alta.** Norma literal e cobrável (Lei nº 14.133/2021, art. 93; TCU2026-AUFC-TI-180; transição contratual em TCU2015-TI-194) e núcleo da situação-problema mais provável da Q2 (contratação de IA com risco de aprisionamento).

## Discursiva Q2

A Q2 é uma situação-problema de conhecimentos específicos, em até 60 linhas, valendo 70 pontos (7,0 na nota final, mais que P1 e P2 somadas). Os blocos E3 e E4 são os que o Cebraspe consegue transformar em caso de auditoria com mais facilidade, e E2 entra quando o caso envolve cruzamento de bases.

Os dez cenários abaixo consolidam as propostas das sete partes. Para cada um, o enunciado provável, os subitens que ele mobiliza e o esqueleto da resposta. Use o esqueleto como roteiro de tópicos; o texto da prova é corrido.

### 1. Modelo de risco para escolher o que fiscalizar

**Enunciado provável.** Uma unidade de auditoria quer usar um modelo treinado com os achados de auditorias passadas para escolher quais convênios ou pregões fiscalizar no próximo ano. Avalie os riscos e proponha salvaguardas.

**Subitens.** E3 2.2, 2.3, 3.1, 3.2, 3.3, 3.5; E4 3.1, 3.2; Deliberação CCCI 03/2025.

**Esqueleto.**
- Rótulos vêm de quem já foi auditado: viés de seleção, e o modelo aprende a escolha passada, não a irregularidade.
- Ciclo de retroalimentação: o que não é fiscalizado nunca vira rótulo positivo.
- Validação temporal (treinar no passado, testar no período seguinte) e checagem de vazamento.
- Métrica compatível com a capacidade: precisão no topo k, curva PR; acurácia não serve com classe rara.
- Desempenho por grupo (porte de município, região) e custo de cada tipo de erro.
- Salvaguardas: parcela de seleção aleatória, revisão humana registrada em papel de trabalho, documentação do modelo, reavaliação periódica.
- Fechamento: o escore prioriza, não conclui; achado continua exigindo evidência.

### 2. Bloqueio automático de pagamento com "97% de acurácia"

**Enunciado provável.** Um órgão contratou solução que suspende automaticamente benefícios considerados suspeitos e informa acurácia de 97%. Avalie como auditor.

**Subitens.** E3 2.6, 3.1 a 3.4; E4 1.6, 3.2, 3.4, 3.5, 5.5, 5.6.

**Esqueleto.**
- Com prevalência baixa, 97% de acurácia é compatível com um modelo inútil; pedir matriz de confusão, precisão e sensibilidade.
- Custo do falso positivo recai sobre o cidadão (benefício cortado): limiar deve refletir esse custo.
- Decisão automatizada que afeta interesse: LGPD art. 20, direito de pedir revisão e de receber explicação; motivação do ato.
- Desempenho por grupo e uso de variáveis que funcionam como proxy de atributo sensível.
- Revisão humana antes da suspensão, canal de contestação, taxa de reversão como indicador.
- Monitoramento de drift após mudança de regra do programa; plano de reversão.
- Contrato: critério de aceite mensurável, conjunto de teste guardado pelo órgão.

### 3. Cruzamento de bases para achar pagamento indevido

**Enunciado provável.** A CGU vai cruzar a base de beneficiários de um programa com a de óbitos e com a folha federal. Parte das linhas não tem CPF. Descreva o método e os riscos.

**Subitens.** E2 5.2 a 5.5, 6.1, 6.3; E3 3.2; E4 3.3.

**Esqueleto.**
- Perfilamento e dimensões de qualidade antes do cruzamento (completude, validade, unicidade, atualidade).
- Vinculação determinística onde há chave; probabilística (nome, data de nascimento, nome da mãe, município) com blocagem e limiares.
- Falso pareamento entre homônimos e falso não pareamento: estimar com amostra revisada manualmente.
- Conciliação de totais entre fontes.
- Base legal do tratamento, minimização, segregação de ambiente, pseudonimização na análise.
- Resultado é indício a confirmar com o gestor, não irregularidade comprovada.

### 4. Assistente com LLM e RAG para responder sobre normas

**Enunciado provável.** Um ministério quer um assistente com RAG para responder a servidores e cidadãos sobre regras de um benefício. Aponte riscos, forma de avaliação e controles.

**Subitens.** E3 5.2, 5.3, 5.4, 5.5, 6.3; E4 1.6, 5.5.

**Esqueleto.**
- Por que RAG e não ajuste fino: conhecimento muda, precisa de fonte citável, custo menor.
- Riscos: alucinação, documento revogado na base, recuperação errada, vazamento de documento restrito, injeção indireta por texto indexado.
- Avaliação antes da implantação: conjunto de perguntas com resposta de referência, fidelidade à fonte, citação; limites do LLM como juiz; amostra revisada por humano.
- Controles: curadoria e versionamento da base, filtro de permissão na recuperação, aviso de limitação ao usuário, monitoramento contínuo.

### 5. Agente de IA na auditoria interna

**Enunciado provável.** Uma unidade de auditoria interna propõe um agente que lê respostas de gestores e documentos de fornecedores, consulta bases, redige minuta de achado e envia e-mail ao gestor. Avalie.

**Subitens.** E3 6.1 a 6.4; E4 3.1, 3.2; Deliberação CCCI 03/2025; P2 C4.

**Esqueleto.**
- Documento de terceiro pode conter instrução maliciosa (injeção indireta); o agente trata conteúdo externo como dado, não como ordem.
- Exfiltração: agente com acesso a bases e a e-mail pode vazar dado sensível.
- Menor privilégio: sem ferramenta de envio; ações irreversíveis só com aprovação humana.
- Registro de cada chamada de ferramenta e identificação do uso de IA nos papéis de trabalho.
- Responsabilidade pelo achado continua com o auditor e com o chefe da auditoria; revisão crítica obrigatória.

### 6. Contratação de solução de IA em nuvem

**Enunciado provável.** Um órgão contrata, por pregão, solução de IA em nuvem para triagem de denúncias, paga por UST, sem conjunto de teste próprio, e com os modelos ajustados ficando com a contratada. Aponte falhas e proponha correções.

**Subitens.** E4 5.1 a 5.7, 2.1, 3.3; E3 4.5, 5.5.

**Esqueleto.**
- ETP sem análise de alternativas (próprio × contratado × nuvem) e sem TCO.
- Pagamento por esforço (UST) em vez de entrega verificável; critério de aceite mensurável com teste guardado pelo órgão.
- Requisitos de proteção: dados de denunciante, localização dos dados, segurança em nuvem.
- Propriedade intelectual dos modelos ajustados e dos dados (Lei 14.133, art. 93); portabilidade.
- Plano de saída e transição contratual; risco de dependência tecnológica.
- Avaliação de viés por grupo e limites de autonomia da triagem.

### 7. Modelo que não pode ser reconstituído

**Enunciado provável.** A auditoria constata que um modelo de priorização em produção não tem versão dos dados, registro de experimentos nem logs de decisão. Explique o problema e as correções.

**Subitens.** E4 1.1 a 1.6, 3.1, 3.2; E1 4.1.

**Esqueleto.**
- Sem versão de dados, código e modelo, não há como saber qual modelo decidiu o quê em uma data: falta evidência e falta responsabilização.
- Práticas: versionamento, registro de experimentos e de modelos, pipeline com testes, logs de decisão com versão.
- Implantação com reversão; monitoramento de drift e de desempenho.
- Papéis: dono de negócio do modelo designado, ficha do modelo, aprovação registrada.

### 8. Estudo que atribui efeito a um programa

**Enunciado provável.** Um ministério afirma que municípios que aderiram a um programa tiveram 40% menos irregularidades. Avalie se a conclusão causal se sustenta.

**Subitens.** E1 1.1, 2.2, 3.2; E4 4.6.

**Esqueleto.**
- Adesão voluntária: seleção (quem adere já era diferente).
- Explicações alternativas: regressão à média, mudança no critério de fiscalização, menos detecção em vez de menos ocorrência.
- Desenho melhor: comparação com elegíveis que não aderiram, diferenças em diferenças com tendência anterior.
- Significância × relevância prática; comunicar a incerteza ao gestor.

### 9. Trilha de auditoria com muitos alertas e poucos acertos

**Enunciado provável.** Uma trilha gera 12 mil alertas por mês, e a equipe confirma poucos. Explique e proponha como medir e melhorar.

**Subitens.** E1 1.1, 2.1, 2.2, 5.1; E3 3.1, 3.2; E2 5.2.

**Esqueleto.**
- Prevalência baixa e raciocínio de Bayes: mesmo regra boa gera muito falso positivo.
- Comparações múltiplas e qualidade da base inflam alertas.
- Amostra estatística dos alertas para estimar a taxa de acerto com margem de erro.
- Ajuste de limiar pela capacidade da equipe; priorização por valor em risco.

### 10. Consulta distribuída que dá resultados diferentes

**Enunciado provável.** A mesma consulta analítica, rodada em dias diferentes num cluster, devolve totais diferentes, e uma junção demora horas. Diagnostique.

**Subitens.** E2 3.1, 4.1 a 4.4, 5.4.

**Esqueleto.**
- Assimetria por chave nula ou valor sentinela concentrando dados numa partição; salting, broadcast.
- Deduplicação ou janela sem desempate determinístico.
- Reprocessamento não idempotente; fonte alterada entre execuções.
- Correções: snapshot versionado, desempate determinístico, conciliação de totais de controle.

### Como treinar

- Uma Q2 por semana desde já, alternando os cenários 1, 2, 4, 5 e 6, que são os de maior probabilidade.
- Escreva a primeira versão sem consulta, com tempo de 1h15, e depois compare com o esqueleto.
- Use o vocabulário do edital nas frases: "limites do uso de escores", "revisão humana e contestação", "entregas verificáveis", "plano de saída". O corretor procura esses termos.
- O desconto por erro de língua na Q2 é de 14 vezes o número de erros dividido pelo total de linhas (9.7.6). Revise a escrita.

## Lista consolidada de normas, referenciais e obras

Reúne as fontes citadas nos subitens, sem repetição. Onde não há link, a fonte não tem página oficial aberta ou o link não foi conferido.

### Constituição e leis

- Constituição Federal, arts. 3º IV e 5º — [link](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm)
- Decreto-Lei nº 4.657/1942 (LINDB), arts. 20 e 21 — [link](https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657compilado.htm)
- Lei 12.527/2011 (LAI), com alterações até a Lei 15.141/2025 — [link](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm)
- Lei 13.709/2018 (LGPD), compilada, com alterações até a Lei 15.352/2026 — [link](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- Lei 14.129/2021 (Governo Digital) — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14129.htm)
- Lei 8.159/1991 (Política Nacional de Arquivos) — [link](https://www.planalto.gov.br/ccivil_03/leis/l8159.htm)
- Lei nº 10.180/2001, art. 25, § 3º (citado na Deliberação CCCI nº 03/2025) — [link](https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10180.htm)
- Lei nº 10.973/2004 (Inovação), citada no art. 93, § 2º, da Lei nº 14.133 — [link](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.973.htm)
- Lei nº 13.853/2019 (alterou o art. 20 da LGPD; veto ao § 3º) — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13853.htm)
- Lei nº 14.133/2021 (arts. 6º XX e XXIII, 11, 18, 23, 93, 117, 140, 144) — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- Lei nº 9.609/1998 (Lei do Software), art. 4º — [link](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm)
- Lei nº 9.784/1999 (processo administrativo federal) — [link](https://www.planalto.gov.br/ccivil_03/leis/l9784.htm)
- PL 2.338/2023 (marco da IA, em tramitação; só contexto) — [link](https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)

### Decretos

- Decreto 10.046/2019 (governança no compartilhamento de dados), alterado pelos Decretos 11.266/2022 e 11.574/2023 — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/decreto/d10046.htm)
- Decreto 12.198/2024 (Estratégia Federal de Governo Digital 2024-2027 e Infraestrutura Nacional de Dados) — [link](https://www2.camara.leg.br/legin/fed/decret/2024/decreto-12198-24-setembro-2024-796286-publicacaooriginal-173095-pe.html)
- Decreto nº 10.947/2022 (Plano de Contratações Anual) — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/D10947.htm)
- Decreto nº 11.246/2022 (agentes de contratação, gestores e fiscais) — [link](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/D11246.htm)
- Decreto nº 12.069/2024 (Estratégia Nacional de Governo Digital 2024–2027) — [link](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/D12069.htm)
- Decreto nº 8.777/2016 (Política de Dados Abertos), alterado pelo Decreto nº 9.903/2019 — [link](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/decreto/d8777.htm)
- Decreto nº 9.507/2018 (execução indireta; art. 3º, vedações) — [link](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/decreto/D9507.htm)
- Decreto nº 12.572/2025 (Política Nacional de Segurança da Informação; revogou o Decreto nº 9.637/2018) — [link](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/D12572.htm)

### Normas da CGU

- CGU, Guia de Uso Responsável de Ferramentas de Inteligência Artificial Generativa, mar. 2025 — [link](https://repositorio.cgu.gov.br/bitstream/1/94718/2/Guia_de_uso_respons%c3%a1vel_de_IA_v5_publicacao.pdf)
- Deliberação CCCI nº 02/2024 (Portaria CGU nº 2.821, de 29/8/2024), citada nos considerandos da 03/2025 — sem link conferido
- Portaria CGU nº 3.113, de 19/9/2025 (DOU 22/9/2025, s. 1, p. 263), publica a Deliberação CCCI nº 03/2025: uso de IA pelas UAIG — [link](https://files.ufgd.edu.br/arquivos/arquivos/78/AUDITORIA-INTERNA/PORTARIA%20CGU%20N%C2%BA%203.113,%20DE%2019%20DE%20SETEMBRO%20DE%202025%20-%20utiliza%C3%A7%C3%A3o%20IA%20Auditoria%20(1).pdf)
- Portaria Normativa CGU nº 193, de 6/1/2025, aprova o Guia de Uso Responsável de Ferramentas de IA Generativa da CGU (conforme fontes secundárias) — [link](https://www.lex.com.br/portaria-normativa-cgu-no-193-de-6-de-janeiro-de-2025/)

### Normas e guias do TCU

- Acórdão 1.139/2022-TCU-Plenário, levantamento sobre IA na APF — [link](https://portal.tcu.gov.br/data/files/D0/C3/BC/DA/EF17781046756058F18818A8/Utilizacao%20de%20Inteligencia%20Artificial%20na%20Administracao%20Publica.pdf)
- Acórdão 1.380/2026-Plenário (nuvem de governo; conforme fontes secundárias) — [link](https://pesquisa.apps.tcu.gov.br/)
- Acórdão 1.508/2020-Plenário (aquisições de TI baseadas em UST) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 1.875/2024-Plenário (acordo corporativo Microsoft) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 157/2024-Plenário (contratação de nuvem TCU/CGU/CNJ) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 2.037/2019-Plenário (conformidade das aquisições de TI) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 2.362/2015-Plenário (modelos de contratação de software, métodos ágeis) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 2.569/2018-Plenário (modelo de contratação de grandes fabricantes de TI) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Acórdão 292/2025-Plenário (contratação centralizada de nuvem; conforme imprensa) — [link](https://pesquisa.apps.tcu.gov.br/)
- Acórdão 980/2023-Plenário (riscos em aquisições de software) — [link](https://portal.tcu.gov.br/tecnologia-da-informacao/aquisicoes-de-ti-1)
- Guia de uso de Inteligência Artificial Generativa no TCU (Portaria-CGTI nº 1, de 11/7/2024) — [link](https://portal.tcu.gov.br/publicacoes-institucionais/cartilha-manual-ou-tutorial/guia-de-uso-de-inteligencia-artificial-generativa-no-tribunal-de-contas-da-uniao-tcu)
- Referencial de Controle de Políticas Públicas (2020) — [link](https://portal.tcu.gov.br/)

### Normas e guias de governo sobre dados e IA

- ANPD, Guia orientativo de tratamento de dados pessoais pelo Poder Público — [link](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes)
- ANPD, minuta do Guia de Anonimização e Pseudonimização (consulta pública 2024) — [link](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-abre-consulta-a-sociedade-sobre-o-guia-de-anonimizacao-e-pseudonimizacao)
- Casa Civil/IPEA, Avaliação de políticas públicas: guia prático de análise ex ante (2018) — [link](https://www.ipea.gov.br/portal/publicacoes)
- Guia de PDTIC do SISP v. 2.1 (2021) — conferir no portal do SISP
- IN GSI/PR nº 5/2021 (segurança no uso de nuvem) — [link](https://www.in.gov.br/en/web/dou/-/instrucao-normativa-n-5-de-30-de-agosto-de-2021-341649684)
- Plano Brasileiro de Inteligência Artificial 2024-2028 (MCTI) — [link](https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/cct/documentacao/23072024.pdf)
- Portal Brasileiro de Dados Abertos — [link](https://dados.gov.br)
- Portaria MGI nº 3.485/2026 (política de governança de IA do MGI; conferir no DOU)
- Portaria SGD/ME nº 778/2019 (governança de TIC no SISP; PDTIC), alterada pela Portaria SGD/ME nº 18.152/2020 — conferir no DOU
- SGD/MGI e Serpro, IA Generativa no Serviço Público (Guia de IA generativa no Serviço Público), 2025 — [link](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/cartilha-ia-generativa)
- SGD/MGI, Guia de introdução ao RAG no setor público, 2026 — [link](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/guia-de-rag/)
- SGD/MGI, Guia prático de prompt e pesquisa com IA para servidores públicos, 2025 — [link](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/guia-pratico-de-prompt-e-pesquisa-com-ia-para-servidores-publicos/)
- SGD/MGI, GuIA unificado de inteligência artificial para o Setor Público (listado na página, não lido) — [link](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/inteligencia-artificial-1/publicacoes/guia-unificado-de-inteligencia-artificial-para-o-setor-publico-1/guia-unificado-de-inteligencia-artificial-para-o-setor-publico)

### Normas de contratação de TIC

- IN SEGES/ME nº 58/2022 (ETP) — [link](https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-no-58-de-8-de-agosto-de-2022)
- IN SEGES/ME nº 65/2021 (pesquisa de preços) — [link](https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-me-no-65-de-7-de-julho-de-2021)
- IN SGD/ME nº 94/2022 — [link](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/processo-de-contratacao-de-solucoes-de-tic-regido-pela-lei-ndeg-14-133-de-2021)
- IN SGD/MGI nº 6/2023, alterada pela IN SGD/MGI nº 86/2025 (aprovação prévia pela SGD; alçada de R$ 20 milhões), conforme fontes secundárias — conferir no DOU
- Portaria SGD/MGI nº 1.070/2023, alterada pela Portaria SGD/MGI nº 5.921/2026 (operação de infraestrutura; uso de IA pela contratada) — [link](https://www.gov.br/gestao/pt-br/assuntos/editoria-2013-defeso-eleitoral/publicada-portaria-que-aprimora-governanca-de-ia-em-modelo-de-contratacao-de-servicos-de-operacao-de-infraestrutura)
- Portaria SGD/MGI nº 5.950/2023 (modelo de software e nuvem) — [link](https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-software-e-servicos-em-nuvem)
- Portaria SGD/MGI nº 750/2023 (modelo de software), alterada pelas Portarias SGD/MGI nº 6.679/2024, nº 6.040/2025 e nº 4.777/2026 — conferir no DOU
- Portaria STI/MP nº 46/2016 (Software Público Brasileiro) — conferir no DOU

### Referenciais técnicos e internacionais

- ABNT NBR ISO 22301:2020 — [link](https://www.abntcatalogo.com.br/)
- ABNT NBR ISO/IEC 27002:2022
- ABNT NBR ISO/IEC 27701
- Apache Parquet, documentação — [link](https://parquet.apache.org/docs/)
- Apache Spark, Performance Tuning (AQE, skew join) — [link](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
- Armbrust et al., Lakehouse, CIDR 2021; Armbrust et al., Spark SQL, SIGMOD 2015; Zaharia et al., RDD, NSDI 2012; Dean e Ghemawat, MapReduce, OSDI 2004
- Artigos: Kaufman et al. 2012 (vazamento); Kleinberg et al. 2017 e Chouldechova 2017 (impossibilidade); Hardt, Price e Srebro 2016; Lundberg e Lee 2017 (SHAP); Ribeiro et al. 2016 (LIME); Breiman 2001 (florestas e "duas culturas"); Rudin 2019; Saito e Rehmsmeier 2015; Niculescu-Mizil e Caruana 2005; Elkan 2001; Dietterich 1998; Nadeau e Bengio 2003; Ensign et al. 2018; Lum e Isaac 2016
- DAMA International, DAMA-DMBOK 2ª ed. (2017, revisão 2024); DMBOK 3.0 em elaboração — [link](https://dama.org/dama-dmbok-3-0-project/)
- DAMA UK, The Six Primary Dimensions for Data Quality Assessment (2013)
- Design Council, Double Diamond — [link](https://www.designcouncil.org.uk/our-resources/framework-for-innovation/)
- Devlin et al., BERT, 2019 — [link](https://arxiv.org/abs/1810.04805)
- Documentação do scikit-learn (validação cruzada, armadilhas comuns, calibração) — [link](https://scikit-learn.org/stable/)
- Fellegi e Sunter, A Theory for Record Linkage, JASA 64(328), 1969
- FinOps Foundation, FinOps Framework — [link](https://www.finops.org/framework/)
- Google Cloud, MLOps: continuous delivery and automation pipelines in ML — [link](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)
- Google SRE books — [link](https://sre.google/books/)
- Greshake et al., Indirect Prompt Injection, 2023 — [link](https://arxiv.org/abs/2302.12173)
- Grinsztajn et al., tree-based models on tabular data, 2022 — [link](https://arxiv.org/abs/2207.08815)
- Grupo do Artigo 29, Parecer 05/2014 sobre técnicas de anonimização
- Hu et al., LoRA, 2021/2022 — [link](https://arxiv.org/abs/2106.09685)
- IIA, Modelo das Três Linhas (2020) — [link](https://www.theiia.org/en/content/position-papers/2020/the-iias-three-lines-model-an-update-of-the-three-lines-of-defense/)
- IIA, Normas Globais de Auditoria Interna (2024) — [link](https://www.theiia.org/en/standards/2024-standards/global-internal-audit-standards/)
- ISO 8000 (qualidade de dados)
- ISO/IEC 11179 (registro de metadados)
- ISO/IEC 20889:2018 (desidentificação)
- ISO/IEC 23894:2023 — [link](https://www.iso.org/standard/77304.html)
- ISO/IEC 25010:2023 (qualidade de produto) — [link](https://www.iso.org/standard/78176.html)
- ISO/IEC 25012:2008 (modelo de qualidade de dados)
- ISO/IEC 25059:2023 (qualidade de sistemas de IA) — [link](https://www.iso.org/standard/80655.html)
- ISO/IEC 27001:2022 e 27002:2022 — [link](https://www.iso.org/standard/27001)
- ISO/IEC 42001:2023, sistema de gestão de IA — [link](https://www.iso.org/standard/42001)
- ISO/IEC 42005:2025 — [link](https://www.iso.org/standard/42005)
- ISO/IEC 9075:2023 (SQL)
- ISO/IEC TR 24027:2021, Bias in AI systems and AI aided decision making (não lido) — [link](https://www.iso.org/standard/77607.html)
- Kingma e Ba, Adam, 2015 — [link](https://arxiv.org/abs/1412.6980)
- Lewis et al., Retrieval-Augmented Generation, 2020 — [link](https://arxiv.org/abs/2005.11401)
- Liu et al., Lost in the Middle, 2023/2024 — [link](https://arxiv.org/abs/2307.03172)
- Mikolov et al., Word2Vec, 2013 — [link](https://arxiv.org/abs/1301.3781)
- Model Context Protocol, Specification 2025-06-18 — [link](https://modelcontextprotocol.io/specification/2025-06-18)
- NIST AI 100-1, AI Risk Management Framework 1.0 (jan. 2023) — [link](https://doi.org/10.6028/NIST.AI.100-1)
- NIST AI 100-2 E2025, Adversarial Machine Learning — [link](https://doi.org/10.6028/NIST.AI.100-2e2025)
- NIST AI 600-1, Generative AI Profile, 26/7/2024 — [link](https://doi.org/10.6028/NIST.AI.600-1)
- NIST SP 1270, viés em IA, 2022 — [link](https://doi.org/10.6028/NIST.SP.1270)
- NIST SP 800-145 (definição de nuvem) — [link](https://csrc.nist.gov/pubs/sp/800/145/final)
- NIST SP 800-57 Parte 1 Rev. 5, gestão de chaves — [link](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final)
- NIST SP 800-88 Rev. 2 (sanitização de mídia, set. 2025; substituiu a Rev. 1) — [link](https://csrc.nist.gov/pubs/sp/800/88/r2/final)
- OCDE, Privacy Guidelines (revisão 2013) — [link](https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0188)
- OCDE, Recommendation of the Council on Artificial Intelligence, OECD/LEGAL/0449 (2019; revisada em 8/11/2023 e 3/5/2024) — [link](https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0449)
- Open Data Contract Standard (Bitol) — [link](https://bitol-io.github.io/open-data-contract-standard/)
- OpenLineage — [link](https://openlineage.io/)
- OpenTelemetry, observability primer — [link](https://opentelemetry.io/docs/concepts/observability-primer/)
- OWASP Machine Learning Security Top 10 — [link](https://owasp.org/www-project-machine-learning-security-top-10/)
- OWASP Secrets Management Cheat Sheet — [link](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- OWASP Top 10 for LLM Applications 2025 (nov. 2024) — [link](https://genai.owasp.org/llm-top-10/)
- pandas. User Guide: Copy-on-Write — [link](https://pandas.pydata.org/docs/user_guide/copy_on_write.html)
- pandas. User Guide: Merge, join, concatenate — [link](https://pandas.pydata.org/docs/user_guide/merging.html)
- Python Software Foundation. Execution model — [link](https://docs.python.org/3/reference/executionmodel.html)
- Python Software Foundation. The Python Tutorial (Python 3) — [link](https://docs.python.org/3/tutorial/)
- RFC 4180 (CSV) — [link](https://www.rfc-editor.org/rfc/rfc4180)
- RFC 8259 (JSON) — [link](https://www.rfc-editor.org/rfc/rfc8259)
- scikit-learn. Common pitfalls and recommended practices — [link](https://scikit-learn.org/stable/common_pitfalls.html)
- scikit-learn. Preprocessing data — [link](https://scikit-learn.org/stable/modules/preprocessing.html)
- Srivastava et al., Dropout, JMLR 2014 — [link](https://jmlr.org/papers/v15/srivastava14a.html)
- Sweeney, k-Anonymity, 2002; Dwork, Differential Privacy, 2006; Narayanan e Shmatikov, 2008
- The Kanban Guide v. 2020.12 — [link](https://kanbanguides.org/the-kanban-guide/2020.12)
- The Scrum Guide (nov. 2020) — [link](https://scrumguides.org/scrum-guide.html)
- Vaswani et al., Attention Is All You Need, 2017 — [link](https://arxiv.org/abs/1706.03762)
- Wasserstein, R. L.; Lazar, N. A. The ASA Statement on p-Values. The American Statistician 70(2), 2016 — [link](https://doi.org/10.1080/00031305.2016.1154108)
- World Economic Forum, AI Procurement in a Box (2020) — [link](https://www.weforum.org/publications/ai-procurement-in-a-box/)
- Zheng et al., Judging LLM-as-a-Judge, 2023 — [link](https://arxiv.org/abs/2306.05685)

### Livros-texto

- Anderson, D. Kanban. Blue Hole Press, 2010
- Angrist, J. D.; Pischke, J.-S. Mastering 'Metrics. Princeton University Press, 2015
- Angrist, J. D.; Pischke, J.-S. Mostly Harmless Econometrics. Princeton University Press, 2009
- Barocas, Hardt e Narayanan, Fairness and Machine Learning: Limitations and Opportunities, MIT Press, 2023 — [link](https://fairmlbook.org/)
- Batini e Scannapieco, Data and Information Quality, Springer, 2016
- Beyer et al., Site Reliability Engineering, O'Reilly, 2016 — [link](https://sre.google/books/)
- Breck et al., The ML Test Score, IEEE Big Data 2017
- Bussab, W. O.; Morettin, P. A. Estatística Básica. 10ª ed. Saraiva, 2024
- Cagan, M. Inspired. 2. ed. Wiley, 2017
- Chambers e Zaharia, Spark: The Definitive Guide, O'Reilly, 2018
- Chip Huyen, Designing Machine Learning Systems, O'Reilly, 2022
- Christen, Data Matching, Springer, 2012
- Cohn, M. User Stories Applied. Addison-Wesley, 2004
- Damji et al., Learning Spark, 2ª ed., O'Reilly, 2020
- Dehghani, Data Mesh, O'Reilly, 2022
- Elmasri e Navathe, Sistemas de Banco de Dados, 7ª ed., Pearson, 2018
- Gama et al., A survey on concept drift adaptation, ACM Computing Surveys 2014
- Géron, Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow, 3ª ed., O'Reilly, 2022 (trad. bras. Mãos à Obra: Aprendizado de Máquina com Scikit-Learn, Keras & TensorFlow, Alta Books)
- Goodfellow, Bengio e Courville, Deep Learning, MIT Press, 2016 — [link](https://www.deeplearningbook.org/)
- Hastie, Tibshirani e Friedman, The Elements of Statistical Learning, 2ª ed., Springer, 2009 — [link](https://hastie.su.domains/ElemStatLearn/)
- Haykin, Redes Neurais: princípios e prática, 2. ed., Bookman, 2001
- Hennessy e Patterson, Computer Architecture: A Quantitative Approach, 6. ed., 2017
- Herzog, Scheuren e Winkler, Data Quality and Record Linkage Techniques, Springer, 2007
- Humble e Farley, Continuous Delivery, Addison-Wesley, 2010
- Hyndman e Athanasopoulos, Forecasting: Principles and Practice, 3ª ed., OTexts, 2021 — [link](https://otexts.com/fpp3/)
- Inmon, Building the Data Warehouse, 4ª ed., Wiley, 2005
- James, Witten, Hastie e Tibshirani, An Introduction to Statistical Learning, 2ª ed. (com R), Springer, 2021 — [link](https://www.statlearning.com/)
- James, Witten, Hastie, Tibshirani e Taylor, An Introduction to Statistical Learning with Applications in Python, Springer, 2023 — [link](https://www.statlearning.com/)
- Jurafsky e Martin, Speech and Language Processing, 3. ed. (rascunho on-line) — [link](https://web.stanford.edu/~jurafsky/slp3/)
- Kim et al., The DevOps Handbook, 2. ed., IT Revolution, 2021
- Kimball e Ross, The Data Warehouse Toolkit, 3ª ed., Wiley, 2013
- Kleinberg, Mullainathan e Raghavan, Inherent Trade-Offs in the Fair Determination of Risk Scores, ITCS 2017
- Kleppmann, Designing Data-Intensive Applications, O'Reilly, 2017
- Kreuzberger et al., MLOps: Overview, Definition, and Architecture, IEEE Access 2023
- Little, R. J. A.; Rubin, D. B. Statistical Analysis with Missing Data. 3ª ed. Wiley, 2019
- Manning, Raghavan e Schütze, Introduction to Information Retrieval, Cambridge, 2008 — [link](https://nlp.stanford.edu/IR-book/)
- McKinney, W. Python for Data Analysis. 3ª ed. O'Reilly, 2022 — [link](https://wesmckinney.com/book/)
- Mitchell et al., Model Cards for Model Reporting, 2019; Gebru et al., Datasheets for Datasets, 2021
- Molinaro e de Graaf, SQL Cookbook, 2ª ed., O'Reilly, 2020
- Molnar, Interpretable Machine Learning, 3ª ed., 2025 — [link](https://christophm.github.io/interpretable-ml-book/)
- Montgomery, D. C.; Runger, G. C. Applied Statistics and Probability for Engineers. 7ª ed. Wiley, 2018 (trad. LTC: Estatística Aplicada e Probabilidade para Engenheiros)
- Moreno-Torres et al., A unifying view on dataset shift in classification, Pattern Recognition 2012
- Nigrini, M. Benford's Law: Applications for Forensic Accounting, Auditing, and Fraud Detection. Wiley, 2012
- Parasuraman e Manzey, Complacency and Bias in Human Use of Automation, Human Factors 2010
- Reinertsen, D. The Principles of Product Development Flow. Celeritas, 2009
- Reis e Housley, Fundamentals of Data Engineering, O'Reilly, 2022
- Ries, E. A startup enxuta. LeYa, 2012
- Russell e Norvig, Artificial Intelligence: A Modern Approach, 4. ed., Pearson, 2020
- Sculley et al., Hidden Technical Debt in Machine Learning Systems, NeurIPS 2015
- Silberschatz, Korth e Sudarshan, Database System Concepts, 7ª ed., McGraw-Hill, 2019
- Spiegelhalter, D. The Art of Statistics. Pelican, 2019
- Sutton e Barto, Reinforcement Learning: An Introduction, 2ª ed., MIT Press, 2018 — [link](http://incompleteideas.net/book/the-book-2nd.html)
- Tukey, J. W. Exploratory Data Analysis. Addison-Wesley, 1977
- Winand, SQL Performance Explained, 2012 — [link](https://use-the-index-luke.com/)
- Wooldridge, An Introduction to MultiAgent Systems, 2. ed., Wiley, 2009
- Wooldridge, J. M. Introductory Econometrics: A Modern Approach. 7ª ed. Cengage, 2020

## Pontos de atenção e limites da pesquisa

### Como a pesquisa foi feita

- O texto de cada subitem foi extraído do PDF do edital (`fontes-escopo/certame-2026/cebraspe-2026-cgu-affc-edital-01.pdf`) com `pdftotext` e copiado literalmente. A contagem de 81 subitens foi refeita sobre esse texto.
- A análise foi dividida em sete partes, pesquisadas em paralelo em 13/10/2026: E1; E2; E3 tópicos 1 a 3; E3 tópicos 4 a 6; E4 tópicos 1 a 3; E4 tópicos 4 e 5; e a seção da CGU com as pontes com a P2. Depois, as partes foram cruzadas, e as divergências entre elas foram resolvidas a favor da fonte oficial lida.
- As normas foram conferidas no Planalto, no DOU, no gov.br, no portal do TCU, da CGU e da ANPD. O Planalto recusou conexão em parte da pesquisa; nesses casos o texto foi lido no portal da Câmara ou em fonte secundária, e o item diz isso.
- Os referenciais técnicos foram conferidos na página do emissor (NIST, OCDE, ISO, DAMA, OWASP). As normas ISO são pagas e foram conferidas pelo sumário.
- Os exemplos de código e as contas numéricas (matriz de confusão, Brier, PSI, KS, perceptron com XOR, softmax, cosseno, pandas) foram executados em Python 3.12 antes de entrar no texto. Para isso, o scikit-learn foi instalado na máquina durante a pesquisa.
- A incidência vem do catálogo do projeto, que cobre 400 questões do Cebraspe (TCU 2015 e TCU 2026). É amostra pequena para Ciência de Dados: o catálogo tem 44 itens Cebraspe nessa matéria.

### Correções feitas durante a pesquisa

Premissas de partida que a pesquisa derrubou:

1. A Portaria Normativa CGU 116/2024 não é norma de IA; é o regulamento das ouvidorias.
2. A Alice é da CGU, não do TCU.
3. "Observatório da Despesa Pública" e "laboratório de IA" não constam da estrutura regimental da CGU (Decreto 11.330/2023, alterado até o Decreto 12.776/2025). A função do Observatório está hoje com a Diretoria de Pesquisas e Informações Estratégicas.
4. O Acórdão 1.508/2020-TCU-Plenário trata de aquisições de TI baseadas em UST e de pagamento por resultados. Quem trata de modelos de contratação de software, inclusive ágil, é o Acórdão 2.362/2015.
5. A Deliberação CCCI 03/2025 foi publicada pela Portaria CGU nº 3.113/2025, e não 3.313.
6. Para E4 havia histórico de cobrança no catálogo (DevOps, ágil e contratações), ao contrário do que o prompt supunha.

Correções de 15/10/2026, achadas na pesquisa do guia da P3 de Infraestrutura:

7. A PNSI vigente é a do Decreto 12.572/2025, que revogou o Decreto 9.637/2018 (E4 2.4 e lista de decretos).
8. A IN GSI/PR nº 8/2025 reescreveu o art. 17, II, da IN GSI/PR nº 5/2021: informação reservada e secreta pode ir para nuvem privada ou comunitária; ultrassecreta continua vedada (E4 2.1).
9. A NIST SP 800-88 Rev. 1 foi substituída pela Rev. 2 em 26/9/2025 (E2 6.2 e lista de referenciais).

### Pontos não confirmados ou que pedem conferência antes da prova

1. **Lei 15.352/2026:** só se confirmou que ela muda o nome da ANPD para "Agência Nacional de Proteção de Dados" no compilado da LGPD. Ementa, data e demais efeitos não foram lidos.
2. **LGPD art. 20 e o veto ao § 3º:** o veto foi conferido no texto compilado; o número da mensagem de veto não. O art. 7º § 7º foi citado de memória.
3. **Portaria Normativa CGU 193/2025** (aprova o guia de IA generativa da CGU): número e data vistos só em fonte secundária. O guia tem data de março de 2025, posterior à portaria; pode ser versão revisada.
4. **Guia de anonimização e pseudonimização da ANPD** e **Guia CGU/ANPD de transparência e proteção de dados:** só versões de consulta pública (a do Guia CGU/ANPD encerrou em 24/7/2026). Versões finais não localizadas.
5. **Portarias SGD/MGI 4.777/2026 e 5.921/2026, Portaria MGI 3.485/2026, IN SGD/MGI 6/2023 e 86/2025:** só fontes secundárias. Conferir no DOU número, data e vigência antes de citar artigo.
6. **Portaria SGD/MGI 5.950/2023** (modelo de software e nuvem): conteúdo do Anexo I por fontes secundárias.
7. **IN GSI/PR 5/2021** (nuvem): o art. 17, II, foi reescrito pela IN GSI/PR nº 8/2025 (DOU de 7/10/2025), conforme a consolidação do GSI e a nota técnica do órgão; conferir a redação exata no DOU.
8. **Acórdãos TCU 1.139/2022, 1.380/2026, 292/2025 e 1.508/2020:** conhecidos por resumo, ementa ou imprensa; inteiro teor não lido.
9. **STF, ADI 6.649 e ADPF 695** (Decreto 10.046/2019): teor da decisão por fontes secundárias.
10. **PBIA 2024-2028:** nomes dos cinco eixos diferem entre fontes; não se achou decreto que o institua nem a revogação formal da EBIA (Portaria MCTI 4.617/2021).
11. **Decreto 12.198/2024:** o art. 8º prevê revisão da Estratégia Federal após dois anos (setembro de 2026). Não se verificou se a revisão saiu até 9/10/2026.
12. **Portaria SGD/ME 778/2019** (PDTIC): sem revogação localizada.
13. **OWASP Top 10 for LLM 2025:** lista conferida em fontes secundárias. A página da LLM01 foi bloqueada pelo antivírus da máquina (Avast classificou o domínio genai.owasp.org como malicioso) e não foi lida.
14. **NIST AI 100-2 E2025 e a lista de 12 riscos do NIST AI 600-1:** citados sem releitura do PDF.
15. **Auditing AI Systems (2025):** o site lista a "Supreme Audit Institution of Brazil" sem nomear o TCU.
16. **Notícias da CGU no gov.br** (LAION, BIP): acesso restrito pelo período eleitoral (4/7 a 25/10/2026); conteúdo por fontes secundárias.
17. **Referencial de auditoria de modelos de ML:** não se localizou documento da CGU nem do TCU específico para auditar métricas, validação e equidade de modelos. Os guias de 2024 (TCU) e 2025 (CGU) tratam de IA generativa.
18. **Guia de amostragem em auditoria da CGU:** não localizado.
19. **Guia federal de contratação de soluções de IA:** não existe até 13/10/2026; há guias da SGD/MGI sobre uso de IA generativa, prompt e RAG.
20. **TCU2026-AUFC-TI-126** (código Python): anulado; o motivo da anulação não foi lido.
21. **Lead time no Kanban:** o Cebraspe adotou "do compromisso à entrega" (TCU2026-AUFC-TI-200, gabarito C); outras fontes contam do pedido.
22. **Edições de livros:** não se confirmaram as edições das traduções de Montgomery e Runger, Wooldridge e Géron; a 10ª edição de Bussab e Morettin (2024) foi confirmada só por livraria.
23. **Python 3.15:** não se confirmou se saiu na data prevista (1/10/2026). Os exemplos usam só recursos estáveis.

### Recomendações finais

- Antes da prova, confira a vigência das normas de 2026 listadas acima no DOU. São as mais prováveis de aparecer como novidade e as menos conferidas aqui.
- Use este relatório como mapa. Para os subitens de prioridade alta que dependem de documento (E3 6.2 e 6.3, E4 3.2, 4.5 e 5.x, E2 6.3 e 6.4), leia a fonte.
- Para a P3, treine itens C/E de interpretação: métrica que engana, conclusão causal sem base, código com defeito, arquitetura inadequada ao caso.
- Para a Q2, treine os cenários da seção anterior com o vocabulário do edital.
