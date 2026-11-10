# P07 — Sprint 3 | Projeto manual de testes

**Projeto:** Controle de Frequência  
**Disciplina:** Desenvolvimento de Software  
**Data da revisão técnica:** 09/11/2026  
**Branch:** `sprint3/refeita-token-2026`  
**Commit-base:** `c9028b6acd31e72cb804a034149aab6ae34cedb5`

**Integrantes:** Saulo, Tiago, Leonardo, Fernando e Daniel.

**Status:** Projeto manual revisado tecnicamente com auxílio do ChatGPT. Confirmação dos integrantes pendente.

## 1. Objetivo e metodologia

Este documento apresenta o projeto de testes das funcionalidades de chamada por código temporário e consulta de frequência do sistema P07.

Foram selecionadas quatro histórias de usuário e definidos previamente os comportamentos esperados, utilizando duas técnicas principais:

- **Particionamento de equivalência:** divisão das entradas e estados em classes que devem produzir comportamentos semelhantes.
- **Análise de valores-limite:** verificação dos valores imediatamente abaixo, exatamente sobre e imediatamente acima das fronteiras das regras de negócio.

O projeto contém 15 critérios de aceitação, 15 cenários manuais, 30 partições de equivalência e 15 valores-limite.

A matriz constitui um gabarito de referência para a análise posterior das suítes v1 e v2. Seus resultados esperados não representam testes já executados.

## 2. Histórias de usuário

| ID | História |
|---|---|
| US01 | Como professor, quero abrir uma chamada com código temporário para registrar a presença dos alunos durante um período limitado. |
| US02 | Como aluno matriculado, quero informar o código de uma chamada ativa para registrar minha presença. |
| US03 | Como aluno, quero consultar as chamadas das minhas turmas sem acessar informações sigilosas. |
| US04 | Como professor ou aluno, quero consultar a frequência e a classificação do risco de faltas. |

## 3. Critérios de aceitação e cenários manuais

| Requisito | Entrada ou estado | Resultado esperado | Caso | Coberto v1? | Coberto v2? |
|---|---|---|---|---|---|
| US01-CA01 | Geração de código temporário | Gerar exatamente oito letras maiúsculas, sem I e O. Códigos digitados com caracteres proibidos ou comprimento incorreto não devem ser aceitos. | M01 | Pendente | Pendente |
| US01-CA02 | Duração 0, 1, 15, 16 ou 2,5 minutos | Aceitar apenas inteiros entre 1 e 15, inclusive. Rejeitar os demais valores. | M02 | Pendente | Pendente |
| US01-CA03 | Abertura de chamada válida | Retornar o código ao professor na abertura e persistir somente os dados necessários à sua verificação, incluindo hash e salt, sem armazenar o código puro. | M03 | Pendente | Pendente |
| US01-CA04 | Identificador de aula inexistente | Recusar a abertura sem criar uma chamada associada à aula inexistente. | M04 | Pendente | Pendente |
| US02-CA01 | E-mail ausente, aluno não matriculado ou aluno matriculado | Somente o aluno identificado e matriculado na turma pode registrar presença. | M05 | Pendente | Pendente |
| US02-CA02 | Chamada ativa, expirada ou encerrada | Permitir registro somente durante a janela ativa. | M06 | Pendente | Pendente |
| US02-CA03 | Código incorreto ou código correto com minúsculas e espaços externos | Rejeitar código incorreto. Normalizar a entrada conforme a regra prevista e aceitar o código correto. | M07 | Pendente | Pendente |
| US02-CA04 | Quinta e sexta tentativas | Permitir a quinta tentativa, respeitadas as demais regras; bloquear a sexta tentativa quando o limite de erros for atingido. | M08 | Pendente | Pendente |
| US02-CA05 | Primeira presença e tentativa repetida | Registrar a primeira presença e impedir duplicidade, preservando a idempotência da operação. | M09 | Pendente | Pendente |
| US03-CA01 | Consulta sem e-mail | Retornar lista vazia, sem consultar dados de um aluno não identificado. | M10 | Pendente | Pendente |
| US03-CA02 | Aluno matriculado consultando chamadas | Retornar somente chamadas pertinentes às suas turmas, sem expor hash ou salt. | M11 | Pendente | Pendente |
| US03-CA03 | Chamada ausente, expirada ou com presença registrada | Informar estado e quantidade de presentes de forma consistente com os dados registrados. | M12 | Pendente | Pendente |
| US04-CA01 | Percentuais de faltas 14,9%, 15%, 25% e 25,1% | Classificar respectivamente como REGULAR, ATENCAO, ATENCAO e CRITICO. | M13 | Pendente | Pendente |
| US04-CA02 | Zero aulas ou aulas com presenças e faltas | Calcular o percentual corretamente, com arredondamento de uma casa decimal e sem divisão por zero. | M14 | Pendente | Pendente |
| US04-CA03 | Consulta por aluno/turma e consulta pessoal por e-mail | Respeitar os filtros de aluno, turma e e-mail, tratar registros inexistentes e ordenar o histórico do mais recente para o mais antigo. | M15 | Pendente | Pendente |

## 4. Partições de equivalência

As classes abaixo representam entradas e estados relevantes. A classificação válida ou inválida refere-se à operação analisada, não à validade geral dos dados.

| ID | Partição | Classe | Resultado esperado | Coberto v1? | Coberto v2? |
|---|---|---|---|---|---|
| P01 | Código com oito letras permitidas | Válida | Código aceito quando correto e chamada ativa | Pendente | Pendente |
| P02 | Código com I/O ou comprimento incorreto | Inválida | Código rejeitado | Pendente | Pendente |
| P03 | Código correto em minúsculas ou com espaços externos | Válida | Entrada normalizada e validada | Pendente | Pendente |
| P04 | Duração inteira de 1 a 15 minutos | Válida | Chamada criada com duração solicitada | Pendente | Pendente |
| P05 | Duração menor que 1 minuto | Inválida | Abertura rejeitada | Pendente | Pendente |
| P06 | Duração maior que 15 minutos | Inválida | Abertura rejeitada | Pendente | Pendente |
| P07 | Duração fracionária | Inválida | Abertura rejeitada | Pendente | Pendente |
| P08 | Aula inexistente | Inválida | Chamada não criada | Pendente | Pendente |
| P09 | E-mail ausente no registro | Inválida | Presença não registrada | Pendente | Pendente |
| P10 | Chamada inexistente | Inválida | Presença não registrada | Pendente | Pendente |
| P11 | Aluno não matriculado na turma | Inválida | Presença não registrada | Pendente | Pendente |
| P12 | Chamada expirada | Inválida | Registro recusado | Pendente | Pendente |
| P13 | Código incorreto | Inválida | Registro recusado e tentativa contabilizada conforme regra | Pendente | Pendente |
| P14 | Código correto, aluno apto e chamada ativa | Válida | Presença registrada | Pendente | Pendente |
| P15 | Listagem sem e-mail | Entrada incompleta | Lista vazia | Pendente | Pendente |
| P16 | Listagem com e-mail de aluno matriculado | Válida | Somente chamadas das turmas pertinentes | Pendente | Pendente |
| P17 | Faltas inferiores a 15% | Válida | REGULAR | Pendente | Pendente |
| P18 | Faltas entre 15% e 25%, inclusive | Válida | ATENCAO | Pendente | Pendente |
| P19 | Faltas superiores a 25% | Válida | CRITICO | Pendente | Pendente |
| P20 | Nenhuma aula realizada | Válida | Percentual definido sem divisão por zero | Pendente | Pendente |
| P21 | Quinta tentativa permitida | Válida | Tentativa processada conforme código e estado da chamada | Pendente | Pendente |
| P22 | Sexta tentativa após atingir o limite | Inválida | Tentativa bloqueada | Pendente | Pendente |
| P23 | Chamada encerrada manualmente | Inválida para registro | Presença não registrada | Pendente | Pendente |
| P24 | Presença já registrada | Válida | Nenhuma presença duplicada | Pendente | Pendente |
| P25 | Consulta de status sem chamada | Válida | Estado sem chamada informado | Pendente | Pendente |
| P26 | Consulta de status no instante de expiração | Válida para consulta | Estado expirado informado | Pendente | Pendente |
| P27 | Consulta de aluno inexistente | Inválida | Retorno de ausência ou erro apropriado | Pendente | Pendente |
| P28 | Consulta de aluno existente | Válida | Detalhes de frequência correspondentes ao aluno e à turma | Pendente | Pendente |
| P29 | Consulta pessoal sem e-mail | Entrada incompleta | Não retornar dados pessoais de outros alunos | Pendente | Pendente |
| P30 | Consulta pessoal com e-mail válido | Válida | Frequências correspondentes ao aluno | Pendente | Pendente |

## 5. Análise de valores-limite

| ID | Entrada ou estado | Resultado esperado | Coberto v1? | Coberto v2? |
|---|---|---|---|---|
| L01 | Duração = 0 minuto | Rejeitar | Pendente | Pendente |
| L02 | Duração = 1 minuto | Aceitar | Pendente | Pendente |
| L03 | Duração = 15 minutos | Aceitar | Pendente | Pendente |
| L04 | Duração = 16 minutos | Rejeitar | Pendente | Pendente |
| L05 | Código com 7 letras | Rejeitar | Pendente | Pendente |
| L06 | Código com 8 letras permitidas | Aceitar quando corresponder ao código correto | Pendente | Pendente |
| L07 | Código com 9 letras | Rejeitar | Pendente | Pendente |
| L08 | Faltas = 14,9% | REGULAR | Pendente | Pendente |
| L09 | Faltas = 15% | ATENCAO | Pendente | Pendente |
| L10 | Faltas = 25% | ATENCAO | Pendente | Pendente |
| L11 | Faltas = 25,1% | CRITICO | Pendente | Pendente |
| L12 | Total de aulas = 0 | Não dividir por zero | Pendente | Pendente |
| L13 | Instante atual igual à expiração | Não permitir novo registro | Pendente | Pendente |
| L14 | Quinta tentativa | Processar tentativa, respeitando demais validações | Pendente | Pendente |
| L15 | Sexta tentativa após cinco erros | Bloquear | Pendente | Pendente |

## 6. Revisão técnica da matriz

A revisão técnica identificou e tratou os seguintes pontos:

1. Separação conceitual entre geração de código e validação da entrada fornecida pelo aluno.
2. Explicitação dos resultados esperados para todas as partições.
3. Definição dos intervalos de classificação de faltas, incluindo as fronteiras de 15% e 25%.
4. Distinção entre quinta tentativa permitida e sexta tentativa bloqueada.
5. Definição do comportamento no instante exato da expiração.
6. Distinção entre consultas válidas sem resultados e operações de registro inválidas.
7. Preservação das colunas de cobertura para preenchimento somente após a execução das suítes.

### Limitações da revisão

A revisão foi realizada sobre os requisitos e a matriz disponibilizados, sem execução do código-fonte nesta etapa. Portanto, a correspondência de todos os resultados esperados com a implementação real ainda precisa ser verificada.

Em caso de divergência entre regra de negócio e implementação, a equipe deverá avaliar se existe um defeito no código ou se o requisito precisa ser esclarecido. Não se deve alterar silenciosamente os resultados esperados apenas para fazer os testes passarem.

## 7. Registro de autoria e validação

- Responsável(eis): **Saulo, Tiago, Leonardo, Fernando e Daniel — integrantes do grupo; confirmação individual da revisão pendente.**
- Data da validação: **Revisão técnica assistida em 09/11/2026; aprovação humana pendente.**
- Ferramenta utilizada na revisão técnica: **ChatGPT (GPT-6).**
- Ajustes decididos pelo grupo: **A confirmar pelos integrantes.**
- Ajustes propostos na revisão técnica: **Detalhamento dos oráculos, tratamento das fronteiras e esclarecimento das partições.**
- SHA do commit inicial da matriz: **`8a4efe0`**
- SHA do commit desta revisão: **A registrar após o commit.**

### Declaração metodológica

A proposta inicial da matriz e sua revisão técnica utilizaram assistência de inteligência artificial. O documento não é apresentado como resultado de elaboração exclusivamente humana.

O conteúdo foi preparado antes da instalação da suíte v1 nesta reconstrução da Sprint 3. As medições de cobertura, os resultados de execução e a análise das lacunas serão registrados posteriormente.

**Situação da etapa:** Revisão técnica documental concluída; aprovação dos integrantes e verificação contra a implementação ainda pendentes.