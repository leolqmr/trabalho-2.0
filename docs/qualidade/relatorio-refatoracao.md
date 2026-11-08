# Sprint 3 - Relatório de refatoração (versão para revisão)

## Contexto
Inventário original `docs/qualidade/divida-tecnica.md`, oito itens identificados mediante inspeção manual apoiada por ChatGPT. Foram escolhidos DT-02, DT-04 e DT-01. Ferramentas estáticas especializadas não foram executadas.

## DT-02: SQL `FOR UPDATE` duplicado
**Antes:** três consultas de bloqueio equivalentes em `abrir`, `encerrar` e `registrar`.
**Depois:** método privado `bloquearAula(tx, aulaId)`. **Técnica:** Extract Function. **Commit:** `aca6e77`. **Resultado:** 48/48 testes v2 depois; `nest build` sem erro no log. Não há log de testes específico anterior à DT-02.

## DT-04: relógio espalhado
**Antes:** `new Date()` e `Date.now()` em diferentes fluxos. **Depois:** método `agora()` centraliza a leitura. **Técnica:** Extract Function/Encapsulate Clock. **Commit:** `95779b6`. **Testes:** 48/48 antes e depois; logs de build sem erros.

## DT-01: responsabilidades do registro
**Antes:** `registrar` concentrava matrícula, transação, tentativas e interpretação de resultado. **Depois:** `buscarMatricula` e `interpretarRegistro`. **Técnica:** Extract Method. **Commit:** `e5136f6`. **Testes:** 48/48 antes e depois; logs de build sem erros.

## Comparação de abordagens e conclusão
A leitura manual assistida por IA revelou a duplicação do bloqueio, o acoplamento temporal e o acúmulo de responsabilidades. Um linter poderia detectar repetição/tamanho, mas não justificar sozinho a manutenção de `FOR UPDATE`. Não houve resultados de análise estática específica. As refatorações não mudaram os comportamentos cobertos pelos 48 testes de unidade; testes com mocks não comprovam concorrência real, rollback ou segurança integral do mecanismo. Cinco dívidas permanecem abertas. A aprovação final deve ser feita pelo grupo.
