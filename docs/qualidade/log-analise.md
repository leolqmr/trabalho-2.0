# Sprint 3 Parte 2 — Log de análise de qualidade

Data da inspeção: 08/11/2026. Repositório: `leolqmr/trabalho-2.0`, commit `d4c8050`.

## Fontes e processo

1. Inspeção manual assistida por ChatGPT dos arquivos de chamada por código e seus componentes React, incluindo linhas enumeradas com `nl -ba`.
2. Comparação de módulos com as propriedades de projeto, SOLID e code smells solicitados pela professora.
3. Execução inicial de `npm test -- --reporter=dot` falhou ao carregar seis suites porque faltava o cliente Prisma gerado após `npm ci --ignore-scripts`. Após `npm run prisma:generate`, todos os **58 testes** das **10 suites** existentes passaram. O erro de preparação não deve ser contabilizado como defeito de produto.

## Uso de LLM

- Ferramenta: ChatGPT (modelo apresentado pelo serviço como GPT-6), 08/11/2026.
- Contexto fornecido pelo usuário: "https://github.com/leolqmr/trabalho-2.0 pode dar uma olhadinha de novo no repositório, pois implementamos uma feature que implementa um sistema de token para facilitar na chamada e depois pode refazer essa atividade da sprint 3 para mim?"
- Contexto adicional da conversa: os dois roteiros de Sprint 3, regras acordadas do grupo sobre percentual de faltas e link do projeto P07.
- Análise realizada: leitura dos arquivos mencionados no inventário; descrição dos problemas e consequências. Os resultados são **hipóteses confirmadas pela leitura de código**, não diagnósticos automáticos de linter.
- Não houve resultados de ferramentas específicas (`jscpd`, Sonar, madge) a incorporar nesta versão.

## Falsos positivos e cuidados

- `SELECT ... FOR UPDATE` não foi classificado como erro: é uma precaução relevante contra concorrência. A dívida está **somente na duplicação** da consulta, não na escolha de usá-la.
- O uso de hash com salt não é dívida: evita armazenar o token em texto claro.
- Mocks unitários não comprovam rollback real nem resistência completa a fraude; esses pontos foram sinalizados como limites de cobertura, não defeitos confirmados.
