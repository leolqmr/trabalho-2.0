# Projeto manual de testes — matriz PREPARATÓRIA da Sprint 3

**STATUS: RASCUNHO PARA REVISÃO HUMANA.** Uma LLM elaborou a proposta a partir dos critérios da feature. Antes de gerar v1, alguém do grupo deve revisar os critérios, preencher entradas/esperados, corrigir os números e commitar este arquivo. Esta matriz não contém resultados da LLM nem da v1/v2, preservando a sequência metodológica pedida pela professora.

Base: `feat/chamada-codigo-temporario`, commit `c9028b6`; requisitos em `requisitos-e-criterios.md`.

## Critérios selecionados e cenários esperados (gabarito antes da IA)

| Requisito | Entrada/estado relevante | Resultado esperado | Caso manual esperado | Coberto pela v1? | Coberto pela v2? |
|---|---|---|---|---|---|
| US01-CA01 | código com 8 letras válidas; código com I/O/7/9 caracteres | Geração válida, entradas proibidas rejeitadas | M01 | A preencher | A preencher |
| US01-CA02 | duração 0, 1, 15, 16 e 2,5 minutos | aceita inteiros 1..15; recusa os demais | M02 | A preencher | A preencher |
| US01-CA03 | abertura bem-sucedida | resposta revela código uma vez; persistência guarda hash e salt | M03 | A preencher | A preencher |
| US01-CA04 | aula que não existe | nenhuma chamada criada e erro | M04 | A preencher | A preencher |
| US02-CA01 | email ausente; matrícula inexistente; matrícula válida | registro autorizado só com email e matrícula | M05 | A preencher | A preencher |
| US02-CA02 | janela ativa; expirada; encerrada | só janela ativa admite registro | M06 | A preencher | A preencher |
| US02-CA03 | código incorreto, minúsculas e espaços | incorreto não registra; normalizado confere | M07 | A preencher | A preencher |
| US02-CA04 | tentativa 5 e 6 | quinta ainda aceita; sexta é bloqueada | M08 | A preencher | A preencher |
| US02-CA05 | primeira marcação e marcação duplicada | registra e não duplica; sem consumo extra se já presente | M09 | A preencher | A preencher |
| US03-CA01 | lista sem e-mail | lista vazia, não consulta dados de aluno | M10 | A preencher | A preencher |
| US03-CA02 | e-mail matriculado; presença registrada/não registrada | só suas turmas e sem hash/salt | M11 | A preencher | A preencher |
| US03-CA03 | status sem chamada, expirado, presente | status e contagem coerentes | M12 | A preencher | A preencher |
| US04-CA01 | 14,9;15;25;25,1% | REGULAR, ATENCAO, ATENCAO, CRITICO | M13 | A preencher | A preencher |
| US04-CA02 | zero aulas, faltas e presenças | percentual sem divisão por zero e arredondado | M14 | A preencher | A preencher |
| US04-CA03 | detalhe aluno inexistente/existente; minhas sem/com email | restrição por turma/e-mail, ordem decrescente | M15 | A preencher | A preencher |

**15 critérios, 15 casos manuais esperados**, sujeito a revisão do grupo. Estas entradas não garantem que uma suíte passe.

## Partições de equivalência previstas

| ID | Variável / partição ou fronteira | Classe/valor | Coberto v1? | Coberto v2? |
|---|---|---|---|---|
| P01 | código: 8 letras válidas sem I/O | Válida | A preencher | A preencher |
| P02 | código: I/O ou tamanho incompatível | Inválida | A preencher | A preencher |
| P03 | código com minúsculas e espaços | Válida | A preencher | A preencher |
| P04 | duração inteira 1–15 | Válida | A preencher | A preencher |
| P05 | duração abaixo de 1 | Inválida | A preencher | A preencher |
| P06 | duração acima de 15 | Inválida | A preencher | A preencher |
| P07 | duração fracionária | Inválida | A preencher | A preencher |
| P08 | aula inexistente | Inválida | A preencher | A preencher |
| P09 | email ausente no registro | Inválida | A preencher | A preencher |
| P10 | chamada inexistente | Inválida | A preencher | A preencher |
| P11 | aluno não matriculado | Inválida | A preencher | A preencher |
| P12 | chamada expirada | Inválida | A preencher | A preencher |
| P13 | código incorreto | Inválida | A preencher | A preencher |
| P14 | código válido e aluno apto | Válida | A preencher | A preencher |
| P15 | listagem sem email | Inválida | A preencher | A preencher |
| P16 | listagem com matrícula | Válida | A preencher | A preencher |
| P17 | faltas abaixo de 15% | Válida | A preencher | A preencher |
| P18 | faltas de 15% a 25% | Válida | A preencher | A preencher |
| P19 | faltas acima de 25% | Válida | A preencher | A preencher |
| P20 | nenhuma aula realizada | Válida | A preencher | A preencher |
| P21 | exatamente 5 tentativas | Válida | A preencher | A preencher |
| P22 | 6 ou mais tentativas | Inválida | A preencher | A preencher |
| P23 | chamada encerrada manualmente | Inválida | A preencher | A preencher |
| P24 | presença preexistente | Válida | A preencher | A preencher |
| P25 | status sem chamada | Válida | A preencher | A preencher |
| P26 | status expirado na fronteira | Válida | A preencher | A preencher |
| P27 | detalhe de aluno inexistente | Inválida | A preencher | A preencher |
| P28 | detalhe de aluno existente | Válida | A preencher | A preencher |
| P29 | minhas frequências sem e-mail | Inválida | A preencher | A preencher |
| P30 | minhas frequências com e-mail | Válida | A preencher | A preencher |

## Valores-limite previstos

| ID | Variável / partição ou fronteira | Classe/valor | Coberto v1? | Coberto v2? |
|---|---|---|---|---|
| L01 | duração 0 | limite | A preencher | A preencher |
| L02 | duração 1 | limite | A preencher | A preencher |
| L03 | duração 15 | limite | A preencher | A preencher |
| L04 | duração 16 | limite | A preencher | A preencher |
| L05 | código com 7 letras | limite | A preencher | A preencher |
| L06 | código com 8 letras | limite | A preencher | A preencher |
| L07 | código com 9 letras | limite | A preencher | A preencher |
| L08 | faltas 14,9% | limite | A preencher | A preencher |
| L09 | faltas 15% | limite | A preencher | A preencher |
| L10 | faltas 25% | limite | A preencher | A preencher |
| L11 | faltas 25,1% | limite | A preencher | A preencher |
| L12 | aulas realizadas = 0 | limite | A preencher | A preencher |
| L13 | expiração exatamente agora | limite | A preencher | A preencher |
| L14 | quinta tentativa | limite | A preencher | A preencher |
| L15 | sexta tentativa | limite | A preencher | A preencher |

## Aprovação do projeto manual (preenchimento por integrantes)

- Responsável(eis): **A preencher pelo grupo**
- Data da validação: **A preencher pelo grupo**
- Ajustes decididos pelo grupo: **A preencher pelo grupo**
- SHA do commit da matriz (deve anteceder o commit da v1): **A preencher após commit**

As partições e limites são hipóteses/critério prévio da equipe e não resultados calculados retrospectivamente. Se o grupo alterar critérios depois da v1, registrar um adendo e motivo, sem reescrever a versão inicial do histórico.
