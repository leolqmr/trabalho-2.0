# Sprint 3 — Indicadores v1 → v2 (comparação atualizada)

**Projeto:** P07 — Controle de Frequência · **Rodada de melhoria posterior à v1 oficial:** 09/11/2026 · **Branch proposta:** `sprint3/evolucao-v1-v2-pos-v1`.

## 1. Comparação principal — escopo ampliado e igual para as duas suítes

Ambas as configurações do Vitest/V8 incluem os mesmos **cinco arquivos**: `chamada-codigo.service.ts`, `abrir-chamada-codigo.dto.ts`, `registrar-codigo.dto.ts`, `frequencia.util.ts` e, agora, `frequencia.service.ts`. A v1 oficial de 117 testes permaneceu intacta; a v2 manteve 48 testes e recebeu 11 testes do serviço de frequência, totalizando **59**.

| Indicador | v1 oficial, 5 arquivos | v2 ampliada, 5 arquivos | Evolução |
|---|---:|---:|---:|
| Testes declarados | 117 | 59 | V2 +11 em relação aos seus 48 testes originais |
| Testes aprovados na nova execução, 5 arquivos | **117/117** (`v1-cinco-arquivos.txt`) | **59/59** (`v2-cinco-arquivos.txt`) | Ambas as suítes foram executadas e aprovadas |
| Statements | **84,48%** | **100%** | **+15,52 p.p.** |
| Branches | **87,03% (47/54)** | **96,29% (52/54)** | **+9,26 p.p.; +5 branches** |
| Funções | **74,19%** | **100%** | **+25,81 p.p.** |
| Linhas | **83,50%** | **100%** | **+16,50 p.p.** |
| `frequencia.service.ts` — linhas | **0%** | **100%** | **+100 p.p.** |
| `frequencia.service.ts` — branches | **0%** | **83,33%** | **+83,33 p.p.** |

**Fonte das métricas:** `docs/testes/relatorios/evolucao-pos-v1/v1/coverage-summary.json` e `.../v2/coverage-summary.json`, gerados pelo Vitest/V8 em 09/11/2026, sobre os mesmos cinco arquivos (97 linhas e 54 branches instrumentadas). **Fonte de aprovação:** `docs/testes/relatorios/execucao/evolucao-pos-v1/v1-cinco-arquivos.txt` (117/117; código 0), `v2-cinco-arquivos.txt` (59/59; código 0) e `build.txt` (NestJS; código 0). A **suíte geral** também foi executada com `npm.exe test`: **58/58 testes aprovados em 10 arquivos**, código 0, conforme `suite-geral.txt` e `RESUMO.md` na mesma pasta. O aviso do Vite e a mensagem `Error: boom` no teste do filtro de exceções não alteraram o resultado aprovado; o `boom` é uma entrada proposital do teste. Logs de tentativas anteriores com erro de comando não devem ser confundidos com execuções aprovadas.

## 2. Histórico preservado — escopo original de quatro arquivos

Os relatórios previamente versionados (`docs/testes/relatorios/v1/` e `.../v2/`) continham somente os quatro primeiros arquivos. **Naquele escopo, ambas as suítes empataram**: 100% de linhas, 97,91% de branches, 100% de statements e 100% de funções. A v1 oficial possuía 117 testes e a v2 tinha 48; a comparação qualitativa encontrava 15 oráculos genéricos (`rejects.toThrow()` sem tipo/status) na v1 e nenhum na v2.

Os percentuais da seção 1 **não representam uma perda de qualidade da v1**: a redução aparente de 100% para 83,50% de linhas decorre de acrescentar um quinto arquivo não exercitado pela v1. Não comparar numeradores/denominadores entre os escopos.

## 3. Requisitos, testes complementares e limites

A matriz manual inicial T01–T48 e seus 21 critérios continuam válidos. As suítes já cobriam os 48 casos no escopo inicial; os novos EVO-01–EVO-11 são **complementos à US04** referentes à recuperação, filtragem, organização e composição dos dados no `FrequenciaService`. A descrição dos onze testes consta de `PLANO-EVOLUCAO-V1-V2.md` e de `ADENDO-EVOLUCAO-V1-V2.md`.

- **Cronologia honesta:** a antiga v2 foi criada em 08/11/2026; a v1 oficial de 117 testes, em 09/11/2026; e a **ampliação da v2**, nesta branch, é posterior à nova v1. Não dizer que todos os 48 testes originais da v2 foram motivados pela análise da nova v1.
- **Cobertura não é correção comprovada:** os testes novos usam mocks do Prisma; não avaliam banco PostgreSQL real, concorrência, autenticação HTTP de ponta a ponta nem fraude presencial.
- **Lacunas remanescentes:** 96,29% de branches não é 100%; no serviço de frequência há uma branch não percorrida (linha 11 do relatório atual). A cobertura deve ser lida com sua configuração e versão de código.

## 4. Reprodutibilidade e evidências

Execute no diretório `frequencia-back`:

```powershell
npx.exe vitest run --config vitest.sprint3.v1.config.ts --coverage
npx.exe vitest run --config vitest.sprint3.v2.config.ts --coverage
npm.exe test
npm.exe run build
```

Para preservar logs e JSON **sem conflito com OneDrive**, execute sem redirecionar a saída para dentro do diretório de cobertura enquanto o Vitest está limpando esse diretório. Salve os logs após a execução ou use diretório separado de relatórios.


## 5. Fechamento das evidências (branch atual)

O commit `f42ba27` adicionou os logs de v1, v2 e build depois de seus testes diretos passarem. O `RESUMO.md` daquela versão ainda registrava códigos 1 de tentativas anteriores com executáveis incompatíveis (`npx.cmd` no ambiente NVM). No commit `24c4fe6`, o resumo foi corrigido com base nos logs de código 0, e a **suíte geral foi reexecutada e aprovada (58/58 testes, 10 arquivos, código 0)**. A execução inválida permanece apenas no histórico do Git: não foi reclassificada retroativamente como sucesso. O `RESUMO.md` é o índice das quatro verificações válidas.
