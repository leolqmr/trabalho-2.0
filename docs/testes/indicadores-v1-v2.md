# Sprint 3 — Indicadores comparativos v1 e v2

**Como foi medido.** Em 09/11/2026 as três suítes foram executadas **no mesmo código** (o da branch `sprint3/testes`, já com as três refatorações), com o **mesmo escopo** (quatro arquivos: `chamada-codigo.service.ts`, os dois DTOs da chamada e `frequencia.util.ts`) e a mesma ferramenta (Vitest 4.1.11 com `@vitest/coverage-v8`). Isso substitui a tabela de 08/11, que comparava suítes medidas em momentos diferentes do código.

| Fonte | Arquivo |
|---|---|
| Relatório HTML e JSON da v1 oficial | `docs/testes/relatorios/v1/` |
| Relatório HTML e JSON da v2 | `docs/testes/relatorios/v2/` |
| Relatório da v1 anterior, no código atual | `docs/testes/relatorios/v1-anterior-codigo-atual/` |
| Saída do executor de testes (aprovados/falhos) | `docs/testes/relatorios/execucao/*.txt` |

| Indicador | v1 anterior (ChatGPT, com matriz) | **v1 oficial** (Claude, sem matriz) | **v2** (melhorada) |
|---|---:|---:|---:|
| Testes declarados no código | 14 | **117** | 48 |
| Passando / falhando / não compilam | 14 / 0 / 0 | **117 / 0 / 0** | 48 / 0 / 0 |
| Cobertura de linhas | 46,91% (38/81) | **100%** (81/81) | **100%** (81/81) |
| Cobertura de branches | 39,58% (19/48) | **97,91%** (47/48) | **97,91%** (47/48) |
| Cobertura de statements | 46,93% (46/98) | 100% (98/98) | 100% (98/98) |
| Cobertura de funções | 60,86% (14/23) | 100% (23/23) | 100% (23/23) |
| Cobertura de requisitos (critérios com teste) | 11/21 (52,38%) | **21/21 (100%)** | **21/21 (100%)** |
| Partições cobertas | 10/25 (40,00%) | **25/25 (100%)** | **25/25 (100%)** |
| Valores-limite cobertos | 3/16 (18,75%) | **16/16 (100%)** | **16/16 (100%)** |
| Fluxos/estados cobertos | 0/7 | **7/7** | **7/7** |
| Testes sem `expect` | 0/14 | 0/117 | 0/48 |
| Oráculo genérico (`rejects.toThrow()` sem dizer o erro) | 1 | **15** | **0** |
| Defeitos reais de produção encontrados | 0 | 0 | 0 |

A medição funcional (requisitos, partições, limites e fluxos) vem de `matriz-rastreabilidade.md`: um caso conta como coberto quando existe um teste com a mesma entrada e o resultado esperado. A contagem de `expect` e de `toThrow()` genérico foi feita por script sobre os arquivos de teste, sem editá-los.

## Interpretação e limites

- **A v1 oficial é muito mais forte que a v1 anterior:** +53,09 pontos percentuais de linhas e +58,33 de branches, e passou de 14 para 117 testes, sem nenhuma rodada de correção.
- **A v1 oficial e a v2 empatam na cobertura estrutural e na matriz.** O que as distingue não aparece nesses números: a precisão do oráculo (15 verificações genéricas contra 0) e a quantidade de verificações extras (a v1 oficial tem 69 testes além dos 48 casos da matriz).
- **A única branch descoberta é a mesma nas duas suítes.** Está na linha 29 de `chamada-codigo.service.ts`, onde só há `@Injectable()`, e é uma expressão condicional (`cond-expr`) com contagem `[0, 1]`. Não há ternário na linha-fonte, então ela vem do código gerado na transpilação do decorator. Não identificamos teste que a exercite, e ela não representa uma decisão de negócio. Consequência: a meta "branches acima da v1" **não é alcançável contra a v1 oficial** (97,91% = 97,91%); contra a v1 anterior, a v2 melhora 58,33 pontos percentuais.
- **Medições de 08/11 (removidas do repositório; constam no histórico do git).** Eram 43,42% de linhas e 39,58% de branches para a v1 anterior, sobre um código com 76 linhas e 93 statements; depois das refatorações o escopo tem 81 linhas e 98 statements, por isso os números mudaram.
- **Limite dos testes:** todos usam mocks do Prisma. A cobertura **não comprova** concorrência real, transações/locks nem prevenção de fraude presencial. O código de oito letras pode ser repassado dentro do prazo.
- **Nenhum defeito real foi encontrado**, e isso não prova que não existam: foi feita inspeção dos oráculos, não teste de mutação.
