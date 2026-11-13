# Sprint 3 — Log de interação com LLM

Este log tem duas partes. A **v1** (Parte 1) foi gerada em 09/11/2026 numa conversa nova, sem a matriz de rastreabilidade. A **v2** (Parte 2) foi construída em 08/11/2026 a partir da matriz.

| Suíte | LLM | Quando | Prompt | Resposta (sem edição) |
|---|---|---|---|---|
| **v1** | Claude Opus 5.5 (claude.ai, conversa normal) | 09/11/2026, por volta das 09h (Recife) | `docs/testes/prompt-v1.md` | `frequencia-back/tests/v1-llm/chamada-v1.test.ts` (117 testes) |
| v2 | ChatGPT, GPT-6 | 08/11/2026 | Parte 2 | `frequencia-back/tests/v2/` (48 testes) |

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
