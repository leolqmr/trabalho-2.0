# Log de identificação da dívida técnica

## Proveniência

- Base analisada: `feat/chamada-codigo-temporario`, commit `c9028b6`.
- Data da análise assistida: 09/11/2026.
- Assistente: GPT-6 (OpenAI). Os candidatos foram propostos com base na leitura de `chamada-codigo.service.ts`, `frequencia.service.ts`, `frequencia.util.ts` e testes existentes.
- Ferramentas estáticas executadas nesta reconstrução: **nenhuma registrada**. ESLint, jscpd e madge são opcionais; não atribuir a elas descobertas sem logs de execução.

## Prompt/solicitação real registrada

> “Eu quero que voce refaça toda a sprint 3 para mim considerando todos os erros cometidos ao longo do caminho. Faça como ponto de partida aquela branch em que implementamos a feature de tokens temporário [...] pois ela foi a mais recente antes do início da sprint 3”.

Análise solicitada: identificação de dívidas reais ligadas a propriedades de projeto, SOLID e smells, escolhendo três refatorações com categorias diferentes e testes pré/pós.

## Resultado e crítica

A LLM sugeriu os oito itens DT01–DT08, com trechos concretos e consequências. Riscos de falso positivo:
- DT-06: encapsular criptografia em módulo próprio pode aumentar indireção sem benefício proporcional.
- DT-07: o `ALUNO_COM_HISTORICO` pode ser um acoplamento aceitável da camada de aplicação; testar se de fato causa mudança em cascata.
- DT-08: não é um smell de código; é dívida de cobertura de integração. Mantê-lo apenas se equipe julgar relevante.

**Resultado da revisão registrada:** `validacao-humana.md` identifica **Saulo** como responsável pela revisão de 09/11/2026 dos oito candidatos. Foram **confirmados cinco** (DT-01, DT-02, DT-03, DT-05, DT-08) e **descartados três** como falsos positivos (DT-04, DT-06, DT-07). As DT-01/02/03 foram resolvidas nos commits `d5a055d`, `ad37b20`, `828138c`; DT-05 e DT-08 permanecem abertas. A revisão dos demais integrantes não foi documentalmente comprovada.

**Comparação crítica:** a LLM ajudou a localizar o literal numérico sem nome, a acumulação de responsabilidades e a transformação de dados dentro do serviço. A revisão humana descartou extrações de baixa utilidade (DT-06/07) e a sugestão de abstrair `Date.now()` (DT-04) porque temporizadores falsos do Vitest permitem testar a expiração. Nenhuma ferramenta estática foi usada para quantificar esses achados nesta reconstrução; por isso, a comparação com ESLint/jscpd/madge é apenas metodológica, não experimental.
