# Log LLM — etapa de melhoria V2

**Status pré-execução:** a v2 foi preparada em arquivos separados para aplicação **somente após a medição da v1**. A execução não ocorreu no ambiente do assistente.

## Pedido de complementação dirigido à LLM

> A v1 selecionou quatro user stories do P07: abertura de código temporário, registro, consulta e frequência. Inspecione as lacunas funcionais que sobraram na v1 preservada: tentativa número 5 e 6; expiração na exata fronteira temporal; encerramento manual; re-registro de presença; status sem chamada e contagem de presença; consultas `FrequenciaService.detalhe` e `minhas`; limites de comprimento do código com 7/8/9 caracteres. Gere casos Vitest para cada lacuna sem modificar testes originais. Use o mesmo escopo de cinco arquivos e mantenha mocks do Prisma. Anote requisito e lacuna em cada teste.

**Atenção:** esta é uma instrução estruturada pela LLM para esta reconstrução, não prova de que o grupo descobriu as lacunas antes de receber o pacote. A revisão e aceite dos testes da v2 cabem à equipe.

## Saída preparada

A v2 mantém **cópia literal da v1 em `tests/v2/base`** (com a única adaptação dos caminhos relativos de import por estar um diretório abaixo), e acrescenta:
- `chamada-limites-v2.test.ts`: EVO01–EVO09 e EVO15, 10 casos;
- `frequencia-service-v2.test.ts`: EVO10–EVO14, 5 casos.

**Total previsto:** 24 + 15 = 39 testes. Este total decorre de inspeção do código dos testes, não de execução. A cobertura não é presumida. Não usar resultados 117/117 ou 59/59 da Sprint 3 antiga como evidência da reconstrução.

## Registro de investigação por técnica

| Lacuna funcional da v1 | Testes v2 | Por que é importante |
|---|---|---|
| limite de tentativas | EVO01–EVO02 | troca de `>` por `>=` muda o resultado na 5ª tentativa |
| relógio e fechamento manual | EVO03–EVO04, EVO08 | expiração exata é decisão de branch |
| idempotência da presença | EVO05 | código inválido não deve gastar tentativa se já existe presença |
| normalização no registro | EVO06 | validação DTO e comportamento do serviço são camadas distintas |
| status e contagem | EVO07–EVO08 | consulta não coberta na v1 |
| presença já registrada na listagem | EVO09 | verifica campo derivado `registrada` |
| dados de frequência e identificação | EVO10–EVO14 | `FrequenciaService` estava incluído no escopo mas não testado pela v1 |
| fronteiras de comprimento de token | EVO15 | ambos os lados de comprimento 8 |

Após executar v1 e v2, completar `indicadores-medidos.md` com ferramentas e contagens; analisar oráculos contra critérios ratificados pelo grupo. Um teste passar não comprova que o requisito original está correto.
