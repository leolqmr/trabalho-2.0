# Log de identificação da dívida técnica

## Proveniência

- Base analisada: `feat/chamada-codigo-temporario`, commit `c9028b6`.
- Data da análise assistida: 09/11/2026.
- Assistente: GPT-6 (OpenAI). Os candidatos foram propostos com base na leitura de `chamada-codigo.service.ts`, `frequencia.service.ts`, `frequencia.util.ts` e testes existentes.
- Ferramentas estáticas executadas nesta preparação: **nenhuma**. Não afirmar que ESLint, jscpd ou madge foram executados; estas ferramentas são opcionais no roteiro. O grupo pode rodá-las e registrar versões/saídas depois.

## Prompt/solicitação real registrada

> “Eu quero que voce refaça toda a sprint 3 para mim considerando todos os erros cometidos ao longo do caminho. Faça como ponto de partida aquela branch em que implementamos a feature de tokens temporário [...] pois ela foi a mais recente antes do início da sprint 3”.

Análise solicitada: identificação de dívidas reais ligadas a propriedades de projeto, SOLID e smells, escolhendo três refatorações com categorias diferentes e testes pré/pós.

## Resultado e crítica

A LLM sugeriu os oito itens DT01–DT08, com trechos concretos e consequências. Riscos de falso positivo:
- DT-06: encapsular criptografia em módulo próprio pode aumentar indireção sem benefício proporcional.
- DT-07: o `ALUNO_COM_HISTORICO` pode ser um acoplamento aceitável da camada de aplicação; testar se de fato causa mudança em cascata.
- DT-08: não é um smell de código; é dívida de cobertura de integração. Mantê-lo apenas se equipe julgar relevante.

**Pendente:** cada achado deve ser conferido por um integrante no arquivo `validacao-humana.md`. O status proposto não equivale a aprovação humana. O relatório final deve mencionar quais falsos positivos foram descartados e por quê.
