# Sprint 3 — Log de interação com LLM

- Projeto: P07 - Controle de frequência
- Data: 08/11/2026
- Modelo utilizado: ChatGPT, GPT-6
- Framework: Vitest 4, NestJS/TypeScript
- Código-base observado: branch `sprint3/testes`, originada do commit `d4c8050`.

## Rodada 1 — geração original da v1

**Solicitação do usuário (texto integral):**

> pronto, não dei merge ainda, vamos continuar trabalhando nessa branch. o que falta para terminar? pode fazer para mim por favor?

**Instrução de trabalho elaborada pelo assistente para gerar a suíte (texto completo):**

> Produzir testes automatizados com Vitest para o código do backend de Controle de Frequência, particularmente `chamada-codigo.service.ts`, `abrir-chamada-codigo.dto.ts`, `registrar-codigo.dto.ts` e `frequencia.util.ts`. Histórias selecionadas: professor abre e encerra chamada por código válido por 1 a 15 minutos; aluno autenticado e matriculado registra presença com código de oito letras e até cinco tentativas, enquanto a janela está ativa; aluno consulta chamadas abertas para suas turmas; professor acompanha risco de faltas segundo limites 15% e 25%. Usar partições de equivalência e valores-limite, com comentários identificando história, critério e técnica. Não alterar o código de produção. Criar uma primeira versão v1 antes de medir cobertura e mantê-la sem edição após o registro. Usar apenas nomes/métodos reais inspecionados no repositório e mocks de Prisma quando necessário.

**Resposta:** arquivo `frequencia-back/tests/v1-llm/chamada-v1.test.ts` contendo **14 casos declarados**, separado da suíte preexistente. A v1 não foi retocada neste pacote após a geração.

**Problemas/limitações antecipados:** a suíte cobre poucas fronteiras, não percorre abertura, encerramento, tentativas 5/6 ou sucesso por token; cobertura incompleta é esperada e deve ser confirmada por relatório real. Os testes existentes em `src/**/*.spec.ts` não entram na medição da v1.

**Transparência sobre o protocolo:** como a conversa atual já continha a matriz anteriormente, a independência estrita entre a matriz e a geração por LLM **não pode ser garantida**. O assistente não inseriu os IDs T01–T48 no arquivo v1, mas a equipe pode regenerá-la em uma conversa nova que não receba a matriz para satisfazer a separação rigorosamente. Não declarar que a matriz ficou desconhecida para o modelo.

**Rodadas de correção da v1:** nenhuma neste pacote. Registrar aqui as rodadas adicionais somente se houver erro de importação/execução e, se necessário, preservando a resposta original.

## Rodada 2 — construção da v2

**Instrução de melhoria (texto completo):**

> A partir da matriz de 48 casos T01–T48, ampliar a suíte de Vitest para verificar todas as partições de equivalência e limites de cada critério das quatro histórias, inclusive 0/1/15/16 minutos; tamanho 7/8/9; encerramento e reabertura; matrícula; erro 400/409/429; quinta e sexta tentativa; janela exatamente na expiração; presença existente; status de chamada sem revelar hash; limiares de faltas 14,9/15/25/25,1 e arredondamento 1/3. Identificar cada caso com seu ID, preservar a v1 sem edição, testar asserções de negócio, manter o mesmo escopo de cobertura e comparar resultados instrumentados.

**Resposta:** `frequencia-back/tests/v2/chamada-v2.test.ts` e `frequencia-back/tests/v2/frequencia-v2.test.ts`; configuração isolada `vitest.sprint3.v2.config.ts`.

**Validação:** resultados de Vitest e cobertura devem ser preenchidos a partir de `docs/testes/relatorios/{v1,v2}/` depois de executados na máquina da equipe. Nenhum percentual foi inventado.
