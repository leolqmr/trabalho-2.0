# Indicadores medidos — Sprint 3

## Execuções

| Indicador | V1 | V2 |
|---|---:|---:|
| Testes executados | 24 | 39 |
| Testes aprovados | 24 | 39 |
| Testes reprovados | 0 | 0 |
| Cobertura de linhas | 66,30% | 92,39% |
| Cobertura de branches | 64,81% | 85,18% |
| Cobertura de statements | 64,86% | 90,99% |
| Cobertura de funções | 55,55% | 92,59% |

## Evolução

- Linhas: +26,09 pontos percentuais.
- Branches: +20,37 pontos percentuais.
- Statements: +26,13 pontos percentuais.
- Funções: +37,04 pontos percentuais.
- Testes adicionais na V2: 15.

## Rastreabilidade

Conforme a matriz de rastreabilidade, sujeita à conferência
dos cenários de teste pela equipe:

| Indicador | V1 | V2 |
|---|---:|---:|
| Critérios de aceitação | 12/15 | 15/15 |
| Partições | 20/30 | 30/30 |
| Valores-limite | 10/15 | 15/15 |

Esses indicadores são classificações de rastreabilidade,
não métricas produzidas automaticamente pelo Vitest.

## Baseline

- 58 testes aprovados.
- 10 arquivos de teste aprovados.
- Código de saída: 0.

## Fontes

- relatorios/reconstrucao/v1/coverage-summary.json
- relatorios/reconstrucao/v2/coverage-summary.json
- relatorios/reconstrucao/execucoes/v1.txt
- relatorios/reconstrucao/execucoes/v2.txt
- relatorios/reconstrucao/execucoes/baseline.txt
- matriz-rastreabilidade.md

## Limitações

Os testes V1 e V2 utilizam mocks do Prisma. Não demonstram
a correção de transações concorrentes em PostgreSQL real.
Cobertura estrutural elevada não garante ausência de defeitos.

## Conferência posterior

Em 13/11/2026 foi relatada nova execução bem-sucedida de baseline, V1, V2 e build do backend no terminal local. **Não foi anexado um novo log desta reexecução**, de modo que as métricas reproduzidas acima continuam fundamentadas nos logs e relatórios preservados de 09/11/2026. Os percentuais de requisitos representam associação de casos por inspeção; dois critérios da V1 estão marcados como parciais na matriz e requerem revisão específica.
