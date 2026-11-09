# Sprint 3 — Refatorações e evidências consolidadas

- **DT-02 / Extract Function:** a chamada SQL `SELECT ... FOR UPDATE` nos métodos `abrir`, `encerrar` e `registrar` foi encapsulada em `bloquearAula(tx, aulaId)`. Commit [`aca6e77`](https://github.com/leolqmr/trabalho-2.0/commit/aca6e77cf9a2c54fd338a6aee9dbc298bba88a51). Evidências: `suites/estado-0-a3d2338.txt` (antes) e `suites/estado-1-aca6e77.txt` (depois), ambos com v1 **117/117** e v2 **48/48**; no log de 08/11, `dt02-testes.txt` (48/48) e `dt02-build.txt` (`nest build`, sem erros). O log "antes" que faltava passou a existir em 09/11.
- **DT-04 / Extract Function e encapsulamento temporal:** acesso a `Date` centralizado no método `agora()`, usado em abertura, encerramento e verificação temporal. Commit [`95779b6`](https://github.com/leolqmr/trabalho-2.0/commit/95779b6e470a5fc69f6bb5ff64866a5c7989d7c9). Evidências: `suites/estado-1-aca6e77.txt` → `suites/estado-2-95779b6.txt` (v1 117/117 e v2 48/48 nos dois), mais `dt04-antes-testes.txt` e `dt04-depois-testes.txt` (48/48) e logs de build sem erros.
- **DT-01 / Extract Method:** os métodos `buscarMatricula` e `interpretarRegistro` separam validação de matrícula e interpretação dos estados de registro; o fluxo transacional permanece. Commit [`e5136f6`](https://github.com/leolqmr/trabalho-2.0/commit/e5136f61452020ccdc9ef513b9a4adf57fd00dce). Evidências: `suites/estado-2-95779b6.txt` → `suites/estado-3-e5136f6.txt` (v1 117/117 e v2 48/48 nos dois), mais `dt01-antes-testes.txt` e `dt01-depois-testes.txt` (48/48) e logs de build sem erros.

## Resumo por estado do código

Executado em 09/11/2026, com a v1 oficial (`tests/v1-llm/`, 117 testes) e a v2 (`tests/v2/`, 48 testes):

| Estado | Commit | v1 oficial | v2 |
|---|---|---:|---:|
| 0 — original (antes da DT-02) | `a3d2338` | 117/117 | 48/48 |
| 1 — depois da DT-02 | `aca6e77` | 117/117 | 48/48 |
| 2 — depois da DT-04 | `95779b6` | 117/117 | 48/48 |
| 3 — depois da DT-01 (final) | `e5136f6` | 117/117 | 48/48 |

A v1 oficial foi gerada sobre o código já refatorado e passa também no original, o que reforça que o comportamento descrito pelos critérios foi preservado.

## Efeito medido por ferramenta (`evidencias/ferramentas/`)

| Refatoração | Medida | Antes | Depois |
|---|---|---|---|
| DT-01 | ESLint `max-lines-per-function`, método `registrar` | 55 linhas (acima do limite de 50) | 31 linhas |
| DT-02 | jscpd, limiar padrão (5 linhas/50 tokens), clone no serviço | 9 linhas (`abrir` ↔ `encerrar`) | nenhum clone |
| DT-02 | jscpd, limiar sensível (3 linhas/25 tokens) | — | 7 linhas residuais (`abrir` ↔ `encerrar`), registradas como DT-09 |

**Comparação de métodos:** a inspeção com apoio de LLM identificou sobreposição de responsabilidades, duplicação e acoplamento ao tempo; as ferramentas (ESLint, jscpd e madge) confirmaram e mediram DT-01, DT-02 e DT-07, deram achados só parciais para DT-06 e DT-08, e não detectaram DT-04 nem DT-05. A comparação completa está em `log-analise.md` e em `relatorio-refatoracao.md`.

**Limitações:** testes unitários mockam Prisma e não simulam PostgreSQL real nem concorrência. A passagem das suítes após cada mudança é evidência de regressão dentro do escopo testado, não prova de equivalência comportamental universal. O build (`nest build`) não foi reexecutado em 09/11; valem os logs de 08/11. Necessária revisão pela equipe antes do merge.
