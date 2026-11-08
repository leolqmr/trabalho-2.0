# Sprint 3 - Relatório de análise crítica (versão para revisão)

## Contexto
Projeto P07 — Controle de Frequência. Foram selecionadas US01 (janela de chamada temporária), US02 (registro por código), US03 (consulta de chamadas) e US04 (risco por faltas). Stack: NestJS, TypeScript, Prisma, Vitest 4.1.11 e V8. LLM: ChatGPT GPT-6, 08/11/2026. Branch: `sprint3/testes`.

## Projeto manual
Matriz com **21 critérios**, **25 partições**, **16 limites** e **7 fluxos**, derivando **48 casos**. O commit `e2866be7` precedeu a v1 (`e7c5e593`) e a v2 (`a3d23387`).

## Geração
A v1 contém 14 testes declarados. A v2 contém 48 testes T01–T48. Os testes existentes em `src/**/*.spec.ts` foram excluídos das medições. Os prompts estão em `docs/testes/llm-log.md`. O modelo tinha visto a matriz anteriormente na mesma conversa, portanto não se garante independência estrita do protocolo.

## Indicadores
Consulte `docs/testes/indicadores-v1-v2.md`: v1 43,42% linhas e 39,58% branches; v2 100% linhas e 97,91% branches. Critérios identificados no código: v1 11/21; v2 21/21. Partições: 10/25 e 25/25; limites: 3/16 e 16/16. O resultado detalhado da execução v1 **não foi arquivado**; não afirmar 14 testes aprovados. A v2 teve 48/48 testes aprovados nos logs pós-refatorações.

## Análise crítica
A v1 deixou sem verificação explícita duração 1/15/16 min, tamanho 9 letras, quinta/sexta tentativas, expiração exata, reabertura, encerramento e idempotência. A v2 acrescentou T01–T48 com valores-limite, estados e asserções mais específicas. Executar uma linha não percorre todas as decisões: a v1 marcou 19/48 branches e a v2 47/48; um branch do serviço continua não exercitado. A v1 inclui `toThrow()` genérico no cenário de e-mail ausente, um oráculo menos específico. Não foi confirmado defeito real de produção. Testes com mocks não demonstram concorrência real em PostgreSQL.

## Conclusão
A LLM agiliza geração de testes, mas a equipe precisa revisar os oráculos, registrar falhas de forma transparente e medir cobertura estrutural/funcional. Em próxima sprint, separar sessão de geração v1 da matriz, preservar o log do runner e adicionar testes de integração. Todos os valores decorrem de evidências arquivadas no GitHub, exceto as contagens funcionais da v1/v2, obtidas por inspeção das asserções da suíte.
