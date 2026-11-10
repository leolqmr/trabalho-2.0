# Matriz de rastreabilidade — MATRIZ FINAL — VALIDAR EXECUÇÕES

**Histórico:** o projeto manual anterior foi commitado em `matriz-projeto-manual.md`. Este arquivo final é produzido após a medição da v1 e a criação da v2. Colunas v1/v2 registram a **cobertura planejada pelos testes fornecidos no pacote**, não são evidências de execução. Após rodar, confirmar com os testes e os logs.

## Critérios por história

| Critério | Testes previstos v1 | Novos testes previstos v2 | V1 planejada | V2 planejada |
|---|---|---|---|---|
| US01-CA01 (formato) | CT01 | EVO15 | Sim | Sim |
| US01-CA02 (duração) | CT02–CT06, CT09 | — | Sim | Sim |
| US01-CA03 (segredo) | CT09 | — | Sim | Sim |
| US01-CA04 (aula inexistente) | CT10 | — | Sim | Sim |
| US02-CA01 (identidade/matrícula) | CT11–CT13 | — | Sim | Sim |
| US02-CA02 (expiração/encerramento) | CT14 | EVO03–EVO04 | Sim | Sim |
| US02-CA03 (código inválido/normalização) | CT07–CT08, CT15 | EVO06 | Sim | Sim |
| US02-CA04 (limite de tentativas) | — | EVO01–EVO02 | Não | Sim |
| US02-CA05 (presença/idempotência) | CT16 | EVO05 | Parcial | Sim |
| US03-CA01 (sem e-mail) | CT17 | — | Sim | Sim |
| US03-CA02 (listagem/segredos) | CT18 | EVO09 | Parcial | Sim |
| US03-CA03 (status/presentes) | — | EVO07–EVO08 | Não | Sim |
| US04-CA01 (classificação) | CT19–CT22 | — | Sim | Sim |
| US04-CA02 (cálculo) | CT23–CT24 | EVO14 | Sim | Sim |
| US04-CA03 (consultas de frequência) | — | EVO10–EVO13 | Não | Sim |

**Cobertura de critérios estrita** (somente se todos os CT/EVO mapeados executarem corretamente): v1 = 12/15 = 80%; v2 = 15/15 = 100%. O percentual de requisitos é uma métrica de rastreabilidade, distinta da cobertura estrutural medida pelo Vitest. Para critérios marcados 'Parcial' na v1, contar como coberto apenas se o grupo entender que o cenário v1 verifica a condição completa; este projeto os conta provisoriamente como cobertos na soma 12/15 por existir pelo menos um teste relacionado.

## Partições definidas na Etapa 1 (classes válidas e inválidas)

Cada ID identifica uma classe/estado distinto; o percentual depende de verificar que o teste citado realmente exercitou a classe.

| ID | Variável / partição | Tipo | V1 | V2 |
|---|---|---|---|---|
| P01 | código: 8 letras válidas sem I/O | Válida | CT01 | = |
| P02 | código: I/O ou tamanho incompatível | Inválida | CT08 | EVO15 |
| P03 | código com minúsculas e espaços | Válida | CT07 | EVO06 |
| P04 | duração inteira 1–15 | Válida | CT02, CT03 | = |
| P05 | duração abaixo de 1 | Inválida | CT04 | = |
| P06 | duração acima de 15 | Inválida | CT05 | = |
| P07 | duração fracionária | Inválida | CT06 | = |
| P08 | aula inexistente | Inválida | CT10 | = |
| P09 | email ausente no registro | Inválida | CT11 | = |
| P10 | chamada inexistente | Inválida | CT12 | = |
| P11 | aluno não matriculado | Inválida | CT13 | = |
| P12 | chamada expirada | Inválida | CT14 | EVO03 |
| P13 | código incorreto | Inválida | CT15 | = |
| P14 | código válido e aluno apto | Válida | CT16 | = |
| P15 | listagem sem email | Inválida | CT17 | = |
| P16 | listagem com matrícula | Válida | CT18 | EVO09 |
| P17 | faltas abaixo de 15% | Válida | CT19 | = |
| P18 | faltas de 15% a 25% | Válida | CT20, CT21 | = |
| P19 | faltas acima de 25% | Válida | CT22 | = |
| P20 | nenhuma aula realizada | Válida | CT24 | EVO14 |
| P21 | exatamente 5 tentativas | Válida | — | EVO01 |
| P22 | 6 ou mais tentativas | Inválida | — | EVO02 |
| P23 | chamada encerrada manualmente | Inválida | — | EVO04 |
| P24 | presença preexistente | Válida | — | EVO05 |
| P25 | status sem chamada | Válida | — | EVO07 |
| P26 | status expirado na fronteira | Válida | — | EVO08 |
| P27 | detalhe de aluno inexistente | Inválida | — | EVO10 |
| P28 | detalhe de aluno existente | Válida | — | EVO11 |
| P29 | minhas frequências sem e-mail | Inválida | — | EVO12 |
| P30 | minhas frequências com e-mail | Válida | — | EVO13 |

**Total proposto:** 30 partições: 20 v1 (66,7%) e 30 v2 (100%), desde que os testes sejam efetivamente executados. Não confundir P24 com o estado de tentativa 5/6.

## Valores-limite definidos na Etapa 1

| ID | Fronteira | Caso exercitado v1 | v2 |
|---|---|---|---|
| L01 | duração 0 | CT04 | = |
| L02 | duração 1 | CT02 | = |
| L03 | duração 15 | CT03 | = |
| L04 | duração 16 | CT05 | = |
| L05 | código com 7 letras | — | EVO15 |
| L06 | código com 8 letras | CT01 | EVO15 |
| L07 | código com 9 letras | — | EVO15 |
| L08 | faltas 14,9% | CT19 | = |
| L09 | faltas 15% | CT20 | = |
| L10 | faltas 25% | CT21 | = |
| L11 | faltas 25,1% | CT22 | = |
| L12 | aulas realizadas = 0 | CT24 | = |
| L13 | expiração exatamente agora | — | EVO03, EVO08 |
| L14 | quinta tentativa | — | EVO01 |
| L15 | sexta tentativa | — | EVO02 |

**Total proposto:** 15 limites, 10 v1 (66,7%) e 15 v2 (100%), condicionados à confirmação da equipe e da execução. Limites adicionais não computados: timestamps um milissegundo antes/depois, já cobertos parcialmente pela partição expirada e válida.

## Lacuna → melhoria

| Lacuna constatável no código de teste v1 | Teste específico adicionado na v2 | Requisito |
|---|---|---|
| 5ª e 6ª tentativas ausentes | EVO01, EVO02 | US02-CA04 |
| expiração pontual e encerramento manual | EVO03, EVO04 | US02-CA02 |
| idempotência da presença ausente | EVO05 | US02-CA05 |
| normalização no serviço não verificada | EVO06 | US02-CA03 |
| status sem chamada, expiração e contagem ausentes | EVO07, EVO08 | US03-CA03 |
| listagem com presença já registrada | EVO09 | US03-CA02 |
| serviço de frequência ausente da v1 | EVO10–EVO14 | US04-CA02/CA03 |
| limites 7 e 9 letras não exercitados | EVO15 | US01-CA01 |

As lacunas acima são verificadas por **inspeção estática dos arquivos de teste**. Sua confirmação empírica exige executar a v1 antes de gerar/commitar a v2, seguindo o fluxo real estabelecido no roteiro.
