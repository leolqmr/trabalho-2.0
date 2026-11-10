# Log LLM — Sprint 3 reconstruída, geração da V1

## Metadados

- **Modelo:** OpenAI GPT-6, assistência nesta conversa, 09/11/2026.
- **Branch-base:** `feat/chamada-codigo-temporario`, commit `c9028b6` (mesmo conteúdo do merge `d4c8050`).
- **Framework:** Vitest 4.x e V8 coverage para NestJS/TypeScript; execução deverá ocorrer no computador da equipe.
- **Rodada da geração nesta reconstrução:** uma rodada de composição dos arquivos em `tests/v1-llm/`. A quantidade de testes executados e eventuais reparos de compilação ainda não foi medida aqui.
- **Independência:** esta é uma reconstrução com assistência da mesma LLM que já conheceu partes da Sprint 3 anterior. **Não declarar que houve geração cega**. O protocolo requer que o projeto manual seja aprovado antes da geração. A equipe deve avaliar se deseja uma geração adicional em nova conversa/sessão sem mostrar a matriz e preservar o resultado bruto para fortalecer esse requisito.

## Solicitação do usuário — registro literal

> Eu quero que voce refaça toda a sprint 3 para mim considerando todos os erros cometidos ao longo do caminho. Faça como ponto de partida aquela branch em que implementamos a feature de tokens temporário que fizemos em um outro chat. Lembre-se de ler novamente com muita atenção o enunciado de novo da sprint 3 e faça a partir dessa branch que eu disse, pois ela foi a mais recente antes do início da sprint 3.

## Contexto técnico fornecido à geração

Inspeção dos arquivos no commit `c9028b6`:
- `src/modules/chamada-codigo/chamada-codigo.service.ts`
- `src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto.ts`
- `src/modules/chamada-codigo/dto/registrar-codigo.dto.ts`
- `src/modules/frequencia/frequencia.util.ts`
- `src/modules/frequencia/frequencia.service.ts`
- `vitest.config.ts` e `package.json`.

## Especificação operativa reproduzível para LLM

> Gere somente uma v1 de testes Vitest (sem alterar o código de produção) para as histórias: abertura pelo professor de token temporário com duração inteira 1 a 15 minutos e oito letras sem I/O; armazenamento de hash+salt sem expor segredo; registro por aluno matriculado com e-mail, código e janela ativa; consulta de chamadas do aluno sem segredo; cálculo de frequência, faltas e limiar de risco. Use partições de equivalência, limites, cenários válidos e inválidos, e anote `US`, critério, partição ou limite nos nomes/comentários dos testes. Use mocks do Prisma sem acessar Postgres. Preserve arquivos da v1 para posterior comparação. Não receba a matriz detalhada de casos antes da geração. Produza código compatível com imports e assinaturas reais do commit-base.

Este bloco descreve a especificação usada para compor o pacote; **não é apresentado como transcrição de uma chamada independente a um serviço externo**.

## Arquivos produzidos

- `tests/v1-llm/chamada-v1.test.ts`: 18 `it(...)`.
- `tests/v1-llm/frequencia-v1.test.ts`: 6 `it(...)`.
- `vitest.sprint3.v1.config.ts`: cobertura limitada aos mesmos cinco arquivos usados na v2.

## Diagnóstico inicial por inspeção

- Sem testes do método `FrequenciaService.detalhe/minhas` na v1.
- Sem limites explícitos da 5ª e 6ª tentativas.
- Sem status na fronteira exata de expiração ou chamada fechada manualmente.
- Sem cenário de presença já registrada.
- Uma asserção de hash hexadecimal de 64 caracteres (`CT09`) decorre da implementação SHA-256, **não de requisito que especifica o algoritmo**: exemplo de oráculo acoplado a detalhe interno.

## Registro de execução — preencher depois de rodar

| Momento | Comando | Testes passando | Falhando | Não compilando | Ajuste de compilação (se houve) | Log |
|---|---|---:|---:|---:|---|---|
| v1 original | `npx.exe vitest run --config vitest.sprint3.v1.config.ts --coverage` | A medir | A medir | A medir | Não inventar | `docs/testes/relatorios/reconstrucao/execucoes/v1.txt` |

Se ocorrer falha na v1, investigar primeiro se é um teste incorreto ou defeito real; NÃO apagar nem editar a v1 silenciosamente. Registrar até 3 rodadas **apenas para compilar/executar** e preservar a revisão no Git. Não alegar que testes passaram antes de existir log válido.
