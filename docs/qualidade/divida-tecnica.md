# Sprint 3 — Inventário atualizado de dívida técnica

Projeto P07 — Controle de Frequência. O diagnóstico original foi registrado em `2919303c`; esta revisão consolida **os commits efetivamente presentes** na branch `sprint3/testes`, sem inventar testes de integração. Em 09/11/2026 foram acrescentados os resultados de ferramentas (`log-analise.md`) e o item DT-09.

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
| DT-09 | `chamada-codigo.service.ts`, `abrir` e `encerrar` | Duplicated Code | Depois da DT-02, `bloquearAula` seguido de `if (aulas.length === 0) throw new ResourceNotFoundException('Aula', aulaId)` ainda se repete (L74–80 e L96–99): a regra "aula inexistente" fica em dois lugares. | Não abordado. Resíduo da DT-02 apontado pelo jscpd. | Aberto (proposto em 09/11; a equipe deve confirmar) |

## Evidências para as três refatorações

Em 09/11/2026 a **v1 oficial** (117 testes) e a **v2** (48 testes) foram executadas em cada estado do código, com worktrees temporários. Os logs estão em `docs/qualidade/evidencias/suites/`.

| Estado | Commit | v1 oficial | v2 | Log |
|---|---|---:|---:|---|
| 0 — original, antes da DT-02 | `a3d2338` | 117/117 | 48/48 | `estado-0-a3d2338.txt` |
| 1 — depois da DT-02 (= antes da DT-04) | `aca6e77` | 117/117 | 48/48 | `estado-1-aca6e77.txt` |
| 2 — depois da DT-04 (= antes da DT-01) | `95779b6` | 117/117 | 48/48 | `estado-2-95779b6.txt` |
| 3 — depois da DT-01 (estado final) | `e5136f6` | 117/117 | 48/48 | `estado-3-e5136f6.txt` |

| Item | Commit | Estado antes → depois | Testes antes → depois | Build depois |
|---|---|---|---|---|
| DT-02 | [`aca6e77`](https://github.com/leolqmr/trabalho-2.0/commit/aca6e77cf9a2c54fd338a6aee9dbc298bba88a51) | 0 → 1 | v1 117/117 → 117/117; v2 48/48 → 48/48 | `nest build` sem erro no log de 08/11 |
| DT-04 | [`95779b6`](https://github.com/leolqmr/trabalho-2.0/commit/95779b6e470a5fc69f6bb5ff64866a5c7989d7c9) | 1 → 2 | v1 117/117 → 117/117; v2 48/48 → 48/48 | `nest build` sem erro no log de 08/11 |
| DT-01 | [`e5136f6`](https://github.com/leolqmr/trabalho-2.0/commit/e5136f61452020ccdc9ef513b9a4adf57fd00dce) | 2 → 3 | v1 117/117 → 117/117; v2 48/48 → 48/48 | `nest build` sem erro no log de 08/11 |

- O log "antes" da DT-02, que faltava, passou a existir (estado 0). Entre os estados 2 e 3 há também o commit `2a6571a`, que só acrescenta a dependência de cobertura e não altera código de produção.
- A v1 oficial foi gerada sobre o código já refatorado e **passa também no código original**, o que reforça que as refatorações preservaram o comportamento descrito pelos critérios.
- Os logs de 08/11 (`dt01-*`, `dt02-*`, `dt04-*`) continuam em `docs/qualidade/evidencias/`. Eles registram a invocação `nest build` sem erros; na sessão de execução, o usuário mostrou código de saída `0` para a DT-02. Os logs em texto, isoladamente, não preservam `$LASTEXITCODE` em todos os casos. Isso deve ser exposto, não ocultado. O build **não foi reexecutado** em 09/11.

**Método:** leitura de código apoiada por ChatGPT em 08/11, cruzada em 09/11 com ESLint, jscpd e madge (resultados em `log-analise.md` e `evidencias/ferramentas/`). Os itens ainda abertos continuam registrados para sprints posteriores. A equipe precisa revisar se concorda com os nove diagnósticos e com a escolha dos três.
