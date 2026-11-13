# Sprint 3 — User stories e critérios de aceitação

Projeto P07 — Controle de Frequência. Escopo selecionado: chamada temporária por código e classificação de faltas no backend TypeScript/NestJS. **São quatro histórias**, dentro do limite de seis da atividade.

Os critérios abaixo foram **reconstruídos do enunciado do P07 e do código da Sprint 2/feature atual com auxílio do ChatGPT**; não representam um documento preexistente de user stories. A equipe deve confirmar que são sua especificação de produto **antes do primeiro commit**. O acordo da equipe sobre riscos é: regular abaixo de 15%, atenção de 15% a 25%, crítico acima de 25%.

## US01 — Abrir e administrar uma chamada temporária

Como professor, quero abrir e encerrar uma janela de chamada com código temporário para receber presenças apenas no período autorizado.

- **CA01.1** A duração informada é um número inteiro entre **1 e 15 minutos**, inclusive; valores fora da faixa são rejeitados.
- **CA01.2** Uma chamada aberta gera código aleatório de **8 letras maiúsculas**, sem `I` ou `O`, e expira após a duração solicitada.
- **CA01.3** O código é mostrado apenas na resposta da abertura; sua consulta de status não expõe o código, o hash ou o salt.
- **CA01.4** Reabrir a chamada substitui o código e o prazo, reativa a janela e remove contadores anteriores de tentativa.
- **CA01.5** Abrir ou encerrar chamada para aula inexistente gera erro; encerrar sem janela existente também gera erro.
- **CA01.6** Encerrar a chamada fixa `encerradoEm`, impedindo registro posterior.

Referências: `chamada-codigo.service.ts`, DTO `abrir-chamada-codigo.dto.ts`, `chamada-codigo.controller.ts`.

## US02 — Registrar presença com código

Como aluno, quero informar a chave durante a janela de chamada para registrar minha presença com segurança.

- **CA02.1** Somente usuário com e-mail identificado e matriculado na turma da aula pode registrar sua presença.
- **CA02.2** O código informado aceita espaços periféricos e letras minúsculas, mas deve conter exatamente oito letras do alfabeto permitido.
- **CA02.3** Um código correto, para chamada existente e ativa, registra a presença do aluno.
- **CA02.4** Código incorreto gera erro e consome uma tentativa; após cinco tentativas, a sexta é bloqueada mesmo que o código esteja correto.
- **CA02.5** Chamada encerrada ou expirada não aceita registro; o instante exato de expiração já é inválido.
- **CA02.6** Presença já registrada retorna sucesso sem duplicar presença ou consumir tentativa.
- **CA02.7** Uma falta anterior (`present: false`) pode ser atualizada para presença, sem criar outra linha.

Referências: `chamada-codigo.service.ts` e DTO `registrar-codigo.dto.ts`.

## US03 — Consultar chamadas disponíveis

Como aluno, quero visualizar apenas as janelas de chamada disponíveis para as turmas em que estou matriculado.

- **CA03.1** Sem e-mail autenticado, a lista é vazia e não há consulta ao banco.
- **CA03.2** A consulta restringe os resultados a janelas abertas, não expiradas e vinculadas às turmas do aluno.
- **CA03.3** A resposta não expõe código, hash ou salt e informa se a presença já está registrada.
- **CA03.4** A consulta de status da aula retorna `null` sem janela, estado ativo/inativo com janela e quantidade de presentes; aula inexistente gera erro.

Referências: `chamada-codigo.service.ts`, métodos `listarAtivas` e `status`.

## US04 — Classificar risco de reprovação

Como professor, quero identificar o risco de reprovação por faltas para acompanhar alunos que precisam de atenção.

- **CA04.1** Faltas **abaixo de 15%** são `REGULAR`.
- **CA04.2** Faltas **entre 15% e 25%**, incluindo as fronteiras, são `ATENCAO`.
- **CA04.3** Faltas **acima de 25%** são `CRITICO`.
- **CA04.4** O percentual de faltas é calculado sobre aulas realizadas, arredondado para uma casa decimal; sem aulas realizadas, é zero.

Referências: `frequencia.util.ts`, funções `nivelDeFalta` e `calcularResumo`.

## Limites do projeto

Não há no código verificado QR, geolocalização ou validação física da localização do aluno. O código falado pelo professor pode ser repassado dentro do prazo: os testes comprovam expiração, vínculo de matrícula e limite de tentativas, **não** ausência total de fraude. Os testes unitários com mocks não comprovam isoladamente concorrência e rollback em PostgreSQL; isso exige teste de integração adicional.

**Ordem documental obrigatória:** revisar estes critérios e a matriz; fazer commit da Etapa 1; somente depois iniciar a geração da v1 sem apresentar a matriz à LLM.
