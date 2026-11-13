# Log LLM — etapa de melhoria V2

**Status da execução:** a V2 foi executada no computador da equipe após a medição da V1. O resultado está documentado em `docs/testes/relatorios/reconstrucao/execucoes/v2.txt` e nos relatórios de cobertura JSON/HTML; não foi executada no ambiente do assistente.

## Pedido de complementação dirigido à LLM

> A v1 selecionou quatro user stories do P07: abertura de código temporário, registro, consulta e frequência. Inspecione as lacunas funcionais que sobraram na v1 preservada: tentativa número 5 e 6; expiração na exata fronteira temporal; encerramento manual; re-registro de presença; status sem chamada e contagem de presença; consultas `FrequenciaService.detalhe` e `minhas`; limites de comprimento do código com 7/8/9 caracteres. Gere casos Vitest para cada lacuna sem modificar testes originais. Use o mesmo escopo de cinco arquivos e mantenha mocks do Prisma. Anote requisito e lacuna em cada teste.

**Transparência:** o texto acima foi estruturado pela LLM nesta reconstrução; não é transcrição de uma interação externa independente nem prova de que a equipe descobriu sozinha todas as lacunas. A avaliação dos oráculos contra os requisitos continua sendo responsabilidade do grupo.

## Saída preparada

A v2 mantém **cópia literal da v1 em `tests/v2/base`** (com a única adaptação dos caminhos relativos de import por estar um diretório abaixo), e acrescenta:
- `chamada-limites-v2.test.ts`: EVO01–EVO09 e EVO15, 10 casos;
- `frequencia-service-v2.test.ts`: EVO10–EVO14, 5 casos.

**Total medido:** V1 **24/24** + 15 casos novos EVO = V2 **39/39**; zero testes reprovados e zero erros de carregamento no log `v2.txt`. O escopo medido mantém os mesmos cinco arquivos de produção da V1. Não usar resultados da Sprint 3 antiga como evidência desta reconstrução.

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

**Resultados V1 → V2:** linhas **66,30% → 92,39%** (+26,09 p.p.); branches **64,81% → 85,18%** (+20,37 p.p.). `indicadores-medidos.md` contém as contagens e as fontes. A classificação da matriz (15/15 critérios, 30/30 partições e 15/15 limites na V2) é por associação e inspeção dos casos, não uma métrica automática do Vitest. A ratificação humana dos oráculos da Etapa 1 permanece pendente.

**Sequência documentada:** commit da V1 `ce7b2bb`; execução local V1 às 21:46 de 09/11/2026; execução V2 às 21:50 e commit `91ee329` depois. A evidência de execução no Git é distinta da evidência de geração independente por LLM.

**Verificação posterior (13/11/2026):** foi relatada nova execução bem-sucedida no terminal, sem inclusão de novo arquivo de log neste documento.
