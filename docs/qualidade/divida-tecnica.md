# Sprint 3 — Inventário atualizado de dívida técnica

Projeto P07 — Controle de Frequência. O diagnóstico original foi registrado em `2919303c`; esta revisão consolida **os commits efetivamente presentes** na branch `sprint3/testes`, sem inventar ferramentas ou testes de integração.

| ID | Local | Categoria | Problema/consequência | Tratamento realizado | Status |
|---|---|---|---|---|---|
| DT-01 | `chamada-codigo.service.ts`, método `registrar` | Long Method / baixa coesão / SRP | Verificação de matrícula e conversão de resultados HTTP misturadas ao fluxo de registro. | `buscarMatricula` e `interpretarRegistro` extraídos; menor concentração de responsabilidades. | Refatorado (`e5136f6`) |
| DT-02 | `chamada-codigo.service.ts`, `abrir`, `encerrar`, `registrar` | Duplicated Code / consistência | Consulta de bloqueio `SELECT ... FOR UPDATE` repetida em três métodos. | Método `bloquearAula(tx, aulaId)` reutilizado em todos os fluxos. | Refatorado (`aca6e77`) |
| DT-03 | `chamada-codigo.service.ts`, serviço inteiro | Acoplamento / DIP | Domínio conhece o Prisma e seus detalhes de transação, o que amplia mocks e custo de troca de ORM. | Não abordado nesta sprint. | Aberto |
| DT-04 | `chamada-codigo.service.ts`, métodos temporais | Acoplamento temporal / testabilidade | Leituras diretas de `new Date()`/`Date.now()` dispersas. | Método `agora()` centraliza a leitura temporal. | Refatorado (`95779b6`) |
| DT-05 | `registrar-codigo.dto.ts` e serviço | Duplicated Code | Normalização `trim().toUpperCase()` duplicada. | Não abordado nesta sprint. | Aberto |
| DT-06 | Backend, DTO, `ChamadaCodigoAluno.tsx` | Magic Literals / acoplamento | Tamanho e alfabeto de token representados em múltiplas camadas. | Não abordado nesta sprint. | Aberto |
| DT-07 | `ChamadaCodigoProfessor.tsx` | Large Component / SRP | Componente concentra polling, cronômetro, requests, segredo e UI. | Não abordado nesta sprint. | Aberto |
| DT-08 | `ChamadaCodigoProfessor.tsx`, `ChamadaCodigoAluno.tsx` | Duplicated Code | Temporização e polling aparecem em múltiplos componentes React. | Não abordado nesta sprint. | Aberto |

## Evidências para as três refatorações

| Item | Commit | Testes v2 antes | Testes v2 depois | Build depois |
|---|---|---|---|---|
| DT-02 | [`aca6e77`](https://github.com/leolqmr/trabalho-2.0/commit/aca6e77cf9a2c54fd338a6aee9dbc298bba88a51) | Cobertura v2 histórica, sem log específico pré-DT02 | 48/48 | `nest build` sem erro no log |
| DT-04 | [`95779b6`](https://github.com/leolqmr/trabalho-2.0/commit/95779b6e470a5fc69f6bb5ff64866a5c7989d7c9) | 48/48 | 48/48 | `nest build` sem erro no log |
| DT-01 | [`e5136f6`](https://github.com/leolqmr/trabalho-2.0/commit/e5136f61452020ccdc9ef513b9a4adf57fd00dce) | 48/48 | 48/48 | `nest build` sem erro no log |

**Local:** `docs/qualidade/evidencias/`. Os logs de build registram a invocação `nest build` sem erros; na sessão de execução, o usuário mostrou código de saída `0` para a DT-02. Os logs em texto, isoladamente, não preservam `$LASTEXITCODE` em todos os casos. Isso deve ser exposto, não ocultado.

**Método:** leitura de código apoiada por ChatGPT, sem uso efetivo de `jscpd`, SonarQube, madge ou outras ferramentas especializadas de análise estática. Os itens ainda abertos continuam registrados para sprints posteriores. A equipe precisa revisar se concorda com os oito diagnósticos e com a escolha dos três.
