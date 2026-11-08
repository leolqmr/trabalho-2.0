# Sprint 3 Parte 2 — Inventário de dívida técnica

Projeto P07 — Controle de Frequência. Inspeção em 08/11/2026 da funcionalidade de chamada por código, backend NestJS e frontend React. Versão-base: commit `d4c8050` (`main`). Os itens abaixo são **diagnósticos de manutenção**, não alegações de que o produto esteja funcionalmente quebrado.

| ID | Local | Problema confirmado | Categoria | Consequência prática | Evidência/método | Status |
|---|---|---|---|---|---|---|
| DT-01 | `frequencia-back/src/modules/chamada-codigo/chamada-codigo.service.ts`, `registrar` (127–189) | Um método verifica identidade, matrícula, tempo, tentativas, segredo, grava presença e converte estados em exceções. | Long Method, baixa coesão, SRP | Qualquer mudança na política de tentativas toca o mesmo método que grava presenças; testes exigem mocks complexos. | Inspeção manual com auxílio de IA; sete etapas distintas no método. | Aberto |
| DT-02 | Mesmo serviço, `abrir` (64–66), `encerrar` (86–88) e `registrar` (144–146) | Consulta de bloqueio `SELECT ... FOR UPDATE` repetida três vezes. | Duplicated Code, manutenção de consistência | Mudança no mecanismo de lock precisa ser replicada; omitir uma ocorrência altera concorrência. | Comparação dos três trechos SQL. | Aberto |
| DT-03 | Mesmo serviço, construtor (30) e métodos que acessam `this.prisma` | Regras de negócio dependem diretamente de Prisma, suas transações e estruturas de consulta. | Acoplamento, DIP | Para testar casos simples de janela ou código é necessário emular várias interfaces de persistência; mudança de ORM repercute no serviço. | Inspeção manual; `PrismaService` concreto injetado. | Aberto |
| DT-04 | Mesmo serviço, `estaAtiva` (32–34) e `listarAtivas` (100) | Uso direto de `Date.now()` e `new Date()` dificulta controle do relógio. | Acoplamento temporal, testabilidade | Testes de expiração e fronteira de minuto dependem do tempo global; podem ficar intermitentes. | Inspeção manual dos acessos ao relógio. | Aberto |
| DT-05 | `registrar-codigo.dto.ts` e `chamada-codigo.service.ts` (163) | `trim().toUpperCase()` é repetido no DTO e no serviço, sem função compartilhada. | Duplicated Code, integridade conceitual | Alterar a normalização apenas em um ponto pode causar divergência entre validação HTTP e chamada do serviço. | Comparação literal dos dois trechos. | Aberto |
| DT-06 | Backend `chamada-codigo.service.ts` (10–12), DTO `registrar-codigo.dto.ts` e frontend `ChamadaCodigoAluno.tsx` (14, 48–52) | Formato de 8 letras e alfabeto permitido são repetidos entre módulos. | Magic Literals, acoplamento entre camadas | Alterar a política do código exige mudanças sincronizadas; a UI pode rejeitar uma chave aceita no servidor. | Inspeção de regex, `maxLength` e `TAMANHO_CODIGO`. | Aberto |
| DT-07 | `ChamadaCodigoProfessor.tsx` (10–123) | Componente concentra polling, contagem regressiva, estado de operações assíncronas, confirmação, exibição do segredo e layout. | Large Component, SRP, baixa coesão | A UI é mais trabalhosa de testar isoladamente; alterações de cronômetro e layout dividem o mesmo componente. | Inspeção manual do componente e seus efeitos. | Aberto |
| DT-08 | `ChamadaCodigoProfessor.tsx` (30–39) e `ChamadaCodigoAluno.tsx` (9–10, 81–86) | Contagem regressiva e dois intervalos de atualização foram implementados em ambos os componentes. | Duplicated Code, coesão | Correções de temporização e política de polling precisam ocorrer nos dois lugares. | Comparação dos intervalos e do cálculo `min:seg`. | Aberto |

## Escopo e confirmação

- Arquivos inspecionados: serviço e DTOs de chamada por código; componentes React de professor e aluno; suíte existente do serviço.
- Checagem inicial: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run prisma:generate`, `npm test -- --reporter=dot`. Resultado: **10 arquivos, 58 testes aprovados**. Não houve evidência de falha funcional após gerar o cliente Prisma.
- Ferramentas de análise estática especializadas ainda **não** foram executadas. Os diagnósticos acima são análise estrutural manual assistida por ChatGPT e precisam de confirmação pela equipe.
- **Não alterar status para Refatorado sem commit associado e evidência de testes v2 antes/depois.**

## Priorização sugerida após concluir a suíte v2

1. **DT-02** — Extract Function para o bloqueio de aula, em três pontos: impacto mensurável e baixo risco se houver testes de abertura/encerramento/registro.
2. **DT-04** — Introduce Clock/Extract Function para verificação temporal, permitindo teste determinístico do instante de expiração.
3. **DT-08** — Extract Custom Hook / Extract Function para cronômetro nos componentes React, desde que testes de interface cubram a mudança; caso contrário, substituir por DT-05 após escrever teste de caracterização.

As três refatorações **não foram realizadas** nesta etapa. A atividade exige executar primeiro a suíte v2 e confirmar resultados antes/depois de cada alteração.
