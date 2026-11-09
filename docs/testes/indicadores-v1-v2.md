# Sprint 3 — Indicadores comparativos v1 e v2

**Como foi medido.** Em 09/11/2026 as duas suítes foram executadas **no mesmo código** (o da branch `sprint3/testes`, já com as três refatorações), com o **mesmo escopo** (quatro arquivos: `chamada-codigo.service.ts`, os dois DTOs da chamada e `frequencia.util.ts`) e a mesma ferramenta (Vitest 4.1.11 com `@vitest/coverage-v8`). 

| Fonte | Arquivo |
|---|---|
| Relatório HTML e JSON da v1 | `docs/testes/relatorios/v1/` |
| Relatório HTML e JSON da v2 | `docs/testes/relatorios/v2/` |
| Saída do executor de testes (aprovados/falhos) | `docs/testes/relatorios/execucao/*.txt` |

| Indicador | **v1** (Claude, sem matriz) | **v2** (melhorada) |
|---|---:|---:|
| Testes declarados no código | **117** | 48 |
| Passando / falhando / não compilam | **117 / 0 / 0** | 48 / 0 / 0 |
| Cobertura de linhas | **100%** (81/81) | **100%** (81/81) |
| Cobertura de branches | **97,91%** (47/48) | **97,91%** (47/48) |
| Cobertura de statements | 100% (98/98) | 100% (98/98) |
| Cobertura de funções | 100% (23/23) | 100% (23/23) |
| Cobertura de requisitos (critérios com teste) | **21/21 (100%)** | **21/21 (100%)** |
| Partições cobertas | **25/25 (100%)** | **25/25 (100%)** |
| Valores-limite cobertos | **16/16 (100%)** | **16/16 (100%)** |
| Fluxos/estados cobertos | **7/7** | **7/7** |
| Testes sem `expect` | 0/117 | 0/48 |
| Oráculo genérico (`rejects.toThrow()` sem dizer o erro) | **15** | **0** |
| Defeitos reais de produção encontrados | 0 | 0 |

A medição funcional (requisitos, partições, limites e fluxos) vem de `matriz-rastreabilidade.md`: um caso conta como coberto quando existe um teste com a mesma entrada e o resultado esperado. A contagem de `expect` e de `toThrow()` genérico foi feita por script sobre os arquivos de teste, sem editá-los.

## Interpretação e limites

- **A v1 e a v2 empatam na cobertura estrutural e na matriz** (100% de linhas, 97,91% de branches, 25/25 partições, 16/16 limites, 7/7 fluxos). O que as distingue não aparece nesses números: a precisão do oráculo (15 verificações genéricas na v1 contra 0 na v2) e a quantidade de verificações extras (a v1 tem 69 testes além dos 48 casos da matriz).
- **A única branch descoberta é a mesma nas duas suítes.** Está na linha 29 de `chamada-codigo.service.ts`, onde só há `@Injectable()`, e é uma expressão condicional (`cond-expr`) com contagem `[0, 1]`. Não há ternário na linha-fonte, então ela provavelmente vem do código gerado na transpilação do decorator (inferência nossa). Não identificamos teste que a exercite, e ela não representa uma decisão de negócio. Consequência: a meta "branches acima da v1" **não é alcançável** (97,91% = 97,91%).
- **Limite dos testes:** todos usam mocks do Prisma. A cobertura **não comprova** concorrência real, transações/locks nem prevenção de fraude presencial. O código de oito letras pode ser repassado dentro do prazo.
- **Nenhum defeito real foi encontrado**, e isso não prova que não existam: foi feita inspeção dos oráculos, não teste de mutação.
