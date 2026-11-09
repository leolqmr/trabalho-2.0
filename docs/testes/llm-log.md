# Sprint 3 — Log de interação com LLM

Este log preserva as geracoes originais e documenta uma terceira etapa posterior: v2 original de 08/11 (48 testes), v1 oficial de 09/11 (117 testes) e ampliacao posterior da v2 de 09/11 (+11 testes).

| Suíte | LLM | Quando | Prompt | Resposta (sem edição) |
|---|---|---|---|---|
| **v1** | Claude Opus 5.5 (claude.ai, conversa normal) | 09/11/2026, por volta das 09h (Recife) | `docs/testes/prompt-v1.md` | `frequencia-back/tests/v1-llm/chamada-v1.test.ts` (117 testes) |
| v2 original | ChatGPT, GPT-6 | 08/11/2026 | Parte 2 | `frequencia-back/tests/v2/` (48 testes antes da ampliacao) |
| **v2 ampliada (pos-v1)** | ChatGPT, GPT-6 | 09/11/2026 | Parte 3 | `frequencia-back/tests/v2/frequencia-service-v2.test.ts` (+11, total 59) |

## Parte 1 — v1 (Claude Opus 5.5)

- Projeto: P07 — Controle de Frequência. Framework: Vitest 4, NestJS/TypeScript.
- Modelo e data de uso, informados pela equipe: Claude Opus 5.5, conversa normal (não temporária) aberta do zero, em 09/11/2026 por volta das 09h.
- Código fornecido à LLM: o da branch `sprint3/testes` no commit `6ce1ba2`, ou seja, **já com as três refatorações** (DT-01, DT-02, DT-04).

### Rodada 1 — geração da v1

**Prompt (texto completo em `docs/testes/prompt-v1.md`, 455 linhas).** Ele reúne, num único bloco, as instruções abaixo, as quatro histórias com os 21 critérios de aceitação (copiados de `requisitos-e-criterios.md`, sem as linhas de referência), o código de `chamada-codigo.service.ts`, dos dois DTOs, de `frequencia.util.ts` e o `schema.prisma`. A parte de instruções foi:

```text
Você é um engenheiro de testes. Gere uma suíte de testes automatizados em **Vitest 4** (TypeScript) para o backend NestJS descrito abaixo.

## Técnicas obrigatórias
1. **Partições de equivalência:** para cada variável de entrada, identifique classes válidas e inválidas e teste um representante de cada uma.
2. **Análise de valores-limite:** teste os valores dos dois lados de cada fronteira.
3. **Cobertura dos critérios de aceitação:** todo critério (CAxx.y) deve ter pelo menos um teste.

Em cada teste, coloque um comentário indicando **qual critério de aceitação** ele cobre e **qual técnica** usa (partição, valor-limite ou fluxo). Exemplo: `// US02 CA02.4 — valor-limite: 6ª tentativa`.

## Regras
- Entregue **um único arquivo** `chamada-v1.test.ts`, que ficará em `frequencia-back/tests/v1-llm/`. Os imports relativos partem daí (ex.: `../../src/modules/chamada-codigo/chamada-codigo.service`).
- Use apenas `vitest` e as dependências que já aparecem no código abaixo (`@nestjs/common`, `zod`, `nestjs-zod`, `@prisma/client`). Não use banco de dados real: crie mocks do `PrismaService` com `vi.fn()`.
- Os resultados esperados devem vir dos **critérios de aceitação**, não do comportamento atual do código.
- Não altere o código de produção.
- Responda apenas com o arquivo completo, em um bloco de código.
```

**Verificação de independência.** O prompt não contém a matriz nem os IDs T01–T48 (busca por "matriz" e por `T` seguido de dois dígitos: 0 ocorrências). A matriz também não foi colada na conversa. **Limite:** não foi verificado se recursos de memória ou de histórico do aplicativo estavam ativos nessa conversa, por isso a independência é "sem acesso à matriz pelo prompt", não uma garantia absoluta.

**Resposta.** Um arquivo de 1.224 linhas com 117 testes, commitado em `49117f8` exatamente como recebido da equipe (comparação byte a byte, sem nenhuma alteração nossa). Cada teste traz o comentário de critério e técnica pedido no prompt.

**Rodadas de correção:** nenhuma. A suíte importou e executou de primeira, sem nome ou caminho inventado.

**Resultado da execução** (`docs/testes/relatorios/execucao/v1-execucao.txt`): 117 testes, **117 passando, 0 falhando, 0 que não compilam**.

**Problemas observados na v1** (detalhados no relatório de análise crítica):

1. **15 oráculos genéricos.** `rejects.toThrow()` sem dizer qual erro (linhas 365, 433, 643, 650, 659, 673, 675, 696, 722, 733, 741, 750, 759, 766 e 843). Em todos esses casos o requisito pede um erro específico (400, 409 ou 429), então qualquer exceção faria o teste passar.
2. **Acoplamento à forma das consultas do Prisma.** Os testes das linhas 894–914 e 930–939 comparam o objeto `where`/`select` passado ao Prisma. Uma refatoração da consulta que mantivesse o comportamento quebraria esses testes.
3. **Um teste probabilístico** (linha 218: ao menos 46 códigos distintos em 50 gerados). A chance de falhar é desprezível (espaço de 24⁸ códigos), mas o resultado não é determinístico.
4. **Nenhuma falha de execução**, API inventada ou teste sem asserção (0 de 117 sem `expect`).

---

## Parte 2 — v2 (ChatGPT, GPT-6, 08/11/2026)

**Contexto.** A v2 foi construída em 08/11, a partir da matriz de 48 casos (T01–T48), antes de existir a v1 de 09/11. O confronto entre as duas foi feito depois, no relatório de análise crítica.

- Projeto: P07 - Controle de frequência
- Modelo utilizado: ChatGPT, GPT-6
- Framework: Vitest 4, NestJS/TypeScript
- Código-base observado: branch `sprint3/testes`.

**Instrução de melhoria (texto completo):**

> A partir da matriz de 48 casos T01–T48, ampliar a suíte de Vitest para verificar todas as partições de equivalência e limites de cada critério das quatro histórias, inclusive 0/1/15/16 minutos; tamanho 7/8/9; encerramento e reabertura; matrícula; erro 400/409/429; quinta e sexta tentativa; janela exatamente na expiração; presença existente; status de chamada sem revelar hash; limiares de faltas 14,9/15/25/25,1 e arredondamento 1/3. Identificar cada caso com seu ID, preservar a v1 sem edição, testar asserções de negócio, manter o mesmo escopo de cobertura e comparar resultados instrumentados.

**Resposta:** `frequencia-back/tests/v2/chamada-v2.test.ts` e `frequencia-back/tests/v2/frequencia-v2.test.ts`; configuração isolada `vitest.sprint3.v2.config.ts`.

**Validação:** os resultados de Vitest e cobertura estão em `docs/testes/relatorios/{v1,v2}/` e em `docs/testes/relatorios/execucao/`, medidos em 09/11/2026 (ver `indicadores-v1-v2.md`).


## Parte 3 — Evolução posterior à v1 oficial (09/11/2026)

**Contexto e ordem histórica.** A v2 inicial (48 casos T01–T48) foi criada em 08/11/2026. A v1 oficial, com 117 testes, foi gerada em 09/11/2026 por Claude Opus 5.5, em uma conversa nova que recebeu os critérios de aceitação e o código, mas não recebeu a matriz T01–T48. Após a análise crítica da v1, o grupo pediu ao ChatGPT (GPT-6) uma melhoria posterior da v2. A nova rodada **não** converte retroativamente a v2 antiga em uma resposta à v1 nova: os 48 testes anteriores foram preservados, e 11 casos novos foram adicionados em 09/11/2026.

**Pedido literal do usuário para a nova rodada:**

> Vamos fazer o seguinte, vamos criar uma nova branch e vamos ajeitar essa evolução da v1 para v2. Pode fazer isso para mim? Depois eu debato acerca do merge dessa branch com meus colegas.

**Estratégia adotada pelo ChatGPT (paráfrase, não prompt literal):** preservar a v1 de 117 testes sem modificações; identificar uma lacuna ainda não exercitada pela v1; ampliar a v2 com testes unitários de `FrequenciaService` sem alterar código de produção; ampliar **igualmente** o escopo instrumentado de ambas as suítes, incluindo `frequencia.service.ts` além dos quatro arquivos anteriores; executar as duas no mesmo commit; registrar ganhos e limitações.

**Artefatos produzidos:**

- `frequencia-back/tests/v2/frequencia-service-v2.test.ts`, com 11 testes EVO-01 a EVO-11 (v2: 48 + 11 = 59 testes).
- `frequencia-back/vitest.sprint3.v1.config.ts` e `vitest.sprint3.v2.config.ts`, com os mesmos cinco arquivos em `coverage.include`.
- `docs/testes/PLANO-EVOLUCAO-V1-V2.md`, `ADENDO-EVOLUCAO-V1-V2.md`, `indicadores-v1-v2.md` e relatório de análise crítica revisado.
- Branch `sprint3/evolucao-v1-v2-pos-v1`, commit inicial da proposta `4879b3f`.

**Validação observada antes deste complemento:** 59/59 testes v2 passaram no terminal do VS Code. A cobertura instrumentada, com cinco arquivos em ambas as suítes, foi: v1 = 83,50% linhas, 87,03% branches, 84,48% statements e 74,19% funções; v2 = 100% linhas, 96,29% branches, 100% statements e 100% funções. Arquivos JSON originais em `docs/testes/relatorios/evolucao-pos-v1/{v1,v2}/coverage-summary.json`. O registro histórico da v1 de 117/117 testes havia sido feito com quatro arquivos; também foi arquivado o log posterior de execução **da v1 no escopo ampliado** (117/117; `v1-cinco-arquivos.txt`), sem confundi-lo com o histórico anterior.

**Problema de execução encontrado:** a primeira tentativa de salvar o log dentro do diretório de cobertura falhou com `EBUSY` ao tentar excluir o próprio arquivo no OneDrive. Os comandos diretos do Vitest funcionaram. A rotina `registrar-evidencias.ps1` grava logs em `docs/testes/relatorios/execucao/evolucao-pos-v1/`, que fica **fora** das pastas `coverage.reportsDirectory` de ambas as versões.

**Verificação concluída e evidências:** na branch, os logs `docs/testes/relatorios/execucao/evolucao-pos-v1/v1-cinco-arquivos.txt`, `v2-cinco-arquivos.txt` e `build.txt` terminaram com código de saída **0**: 117/117 testes da v1, 59/59 da v2 e compilação NestJS bem-sucedida. Esses testes foram executados no computador da equipe. A suíte geral (`npm test`) ainda precisa de uma **nova execução válida**, porque seu log anterior contém apenas o erro do comando `npx.cmd` não encontrado. A rotina `aplicar-ajustes-finais.ps1` prepara sua execução local e gera `RESUMO.md` a partir dos logs reais, sem presumir resultado.

**Limitações:** os testes usam mocks do Prisma; eles não comprovam transações reais, bloqueios de linhas no PostgreSQL, autenticação HTTP ponta a ponta ou presença física na sala. Alguns EVO testam leitura, filtragem e apresentação de frequência, comportamentos complementares ao escopo explícito de CA04.1–CA04.4. Ver o apêndice EVO da matriz.
