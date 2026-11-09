# Sprint 3 — Adendo de rastreabilidade e log da melhoria posterior à v1

**Objetivo:** registrar a evolução da v2 realizada **após** a v1 oficial de 117 testes, sem apagar a matriz manual nem alterar a resposta original da LLM.

## Histórico e autoria

- **Matriz inicial:** commit `e2866be7` (08/11/2026); contém T01–T48 e 21 critérios.
- **V2 inicial:** commit `a3d23387` (08/11/2026), ChatGPT GPT-6, 48 testes.
- **V1 oficial:** commit `49117f84` (09/11/2026), Claude Opus 5.5, 117 testes; prompt integral em `prompt-v1.md`, log original em `llm-log.md`.
- **Rodada posterior à v1:** proposta por ChatGPT GPT-6 em 09/11/2026, na branch `sprint3/evolucao-v1-v2-pos-v1`, com 11 casos novos, ampliação igual da cobertura e documentação comparativa. Os novos testes são `frequencia-back/tests/v2/frequencia-service-v2.test.ts`.
- **Natureza da correção:** extensão da suíte v2, **não** reexecução retroativa da geração de 08/11 nem reescrita da v1.

## Casos complementares da v2

| Caso | Hist./critério relacionado | Cenário | Oráculo observado |
|---|---|---|---|
| EVO-01 | US04, consulta do aluno | E-mail `undefined` | Lista vazia sem consultar Prisma |
| EVO-02 | US04 | E-mail vazio | Lista vazia sem consultar Prisma |
| EVO-03 | US04 | Matrícula não encontrada | Lista vazia, filtro por e-mail |
| EVO-04 | US04 | Uma turma, duas aulas, uma falta | 50% de faltas, risco `CRITICO` |
| EVO-05 | US04 | Histórico desordenado | Ordenação decrescente por data |
| EVO-06 | US04 | Duas turmas | Resumos e denominadores independentes |
| EVO-07 | US04 | Nenhuma marcação | Zero falta, 0% de faltas |
| EVO-08 | US04 | Zero aulas realizadas | Zero %, sem divisão por zero |
| EVO-09 | US04 | Consulta detalhe por turma/aluno | Filtro por ambos os identificadores |
| EVO-10 | US04 | Aluno fora da turma ou inexistente | `ResourceNotFoundException` sem contar aulas |
| EVO-11 | US04 | Exatamente 25% de faltas | Classificação `ATENCAO` |

**Nota de escopo:** esses casos aprofundam a história US04 com o `FrequenciaService`. Eles não substituem T01–T48. São testes de unidade com mocks do Prisma, não integração com PostgreSQL.

## Resultado da rodada

- **v1, cinco arquivos:** linhas 83,50%; branches 87,03%; funções 74,19%; statements 84,48%. A aprovação 117/117 foi comprovada no log histórico de quatro arquivos; o resumo final da execução ampliada não está visível na evidência recebida.
- **v2, cinco arquivos:** 59/59 aprovados, linhas 100%; branches 96,29%; funções 100%; statements 100%.
- **Ganho medido:** +16,50 p.p. de linhas e +9,26 p.p. de branches, mesmo conjunto de arquivos e mesmo código-fonte.
- **Limitação da evidência:** os prints foram apresentados ao ChatGPT. Os logs e JSON dos relatórios devem ser versionados separadamente para permitir auditoria; conferir seu conteúdo antes de publicar.

## Instruções da rodada / log adicional

Pedido do grupo: criar branch independente e corrigir a evolução v1→v2 antes de discutir o merge. Estratégia do assistente: preservar v1 e v2 originais, identificar uma lacuna de cobertura da US04 no serviço de frequência, acrescentar 11 testes com mocks, incluir esse serviço nas duas configurações de cobertura, executar no mesmo código, comparar percentuais e registrar limitações. Não houve alteração de código de produção. A primeira medição via script falhou por `EBUSY` (arquivo de log no OneDrive bloqueado ou escrito dentro do diretório que a ferramenta tenta limpar); os comandos diretos do Vitest geraram a cobertura e a execução da v2 foi validada com 59/59 testes. Esse erro foi de infraestrutura/relatório, não um defeito demonstrado do sistema.
