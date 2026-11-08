# Sprint 3 — Matriz de rastreabilidade (consolidada)

**Projeto:** P07 — Controle de Frequência · **Branch:** `sprint3/testes` · **Consolidação:** 08/11/2026.

A matriz inicial foi commitada em `e2866be7` antes da suíte v1 (`e7c5e593`) e da v2 (`a3d23387`). Esta versão **preenche as colunas** com base na inspeção das asserções das suítes preservadas e nas evidências de execução. Não representa uma matriz manual nova. **PE** = partição de equivalência; **VL** = valor-limite; **FL** = fluxo/estado.

**Critério de leitura:** `V1: Sim` significa cenário equivalente explicitamente verificado no código v1 (não necessariamente o mesmo valor do caso planejado); `V2: Sim` significa caso TNN correspondente no código v2 e suíte v2 de 48/48 aprovada. Os resultados individuais da v1 **não** foram preservados em um relatório do runner no repositório; sua cobertura estrutural foi preservada e sua aprovação individual precisa ser confirmada, caso a avaliação exija essa prova.

| Critério | Variável | Partição ou limite | Caso planejado e resultado esperado | Coberto v1? | Coberto v2? |
|---|---|---|---|---|---|
| CA01.1 | duração | VL 0 | T01: `0` → rejeita | Sim* | Sim (T01) |
| CA01.1 | duração | VL 1 | T02: `1` → aceita | Não | Sim (T02) |
| CA01.1 | duração | PE interior | T03: `8` → aceita | Sim* | Sim (T03) |
| CA01.1 | duração | VL 15 | T04: `15` → aceita | Não | Sim (T04) |
| CA01.1 | duração | VL 16 | T05: `16` → rejeita | Não | Sim (T05) |
| CA01.1 | duração | PE não inteiro | T06: `1.5` → rejeita | Não | Sim (T06) |
| CA01.2 | código gerado | PE formato | T07: código → 8 letras `[A-HJ-NP-Z]` | Sim* | Sim (T07) |
| CA01.2 | expiração | VL duração mínima | T08: abrir com 1 minuto → prazo ≈ abertura + 60.000 ms | Não | Sim (T08) |
| CA01.3 | resposta de status | PE segredo | T09: status existente → sem `codigo`, `codigoHash`, `salt` | Não | Sim (T09) |
| CA01.4 | janela anterior | FL inexistente | T10: primeira abertura → cria janela | Não | Sim (T10) |
| CA01.4 | janela anterior | FL existente | T11: reabrir → nova chave/hash, limpa tentativas e `encerradoEm: null` | Não | Sim (T11) |
| CA01.5 | aula | PE inexistente | T12: abrir em aula inexistente → erro de recurso | Não | Sim (T12) |
| CA01.5 | chamada | PE inexistente | T13: encerrar aula sem chamada → erro de recurso | Não | Sim (T13) |
| CA01.6 | encerramento | FL sucesso | T14: encerrar → salva `encerradoEm` | Não | Sim (T14) |
| CA02.1 | e-mail | PE ausente | T15: `undefined` → acesso negado, sem banco | Sim* | Sim (T15) |
| CA02.1 | matrícula | PE inexistente | T16: e-mail não matriculado → acesso negado | Sim* | Sim (T16) |
| CA02.1 | matrícula | PE existente | T17: aluno matriculado → segue à validação da chamada | Não | Sim (T17) |
| CA02.2 | código submetido | PE normalizado | T18: minúsculas e espaços periféricos → código válido normalizado | Sim* | Sim (T18) |
| CA02.2 | comprimento | VL 7 | T19: sete letras → erro DTO | Sim* | Sim (T19) |
| CA02.2 | comprimento | VL 8 | T20: oito letras válidas → aceita DTO | Não | Sim (T20) |
| CA02.2 | comprimento | VL 9 | T21: nove letras → erro DTO | Não | Sim (T21) |
| CA02.2 | caracteres | PE proibido | T22: inclui `I` ou `O` → erro DTO | Não | Sim (T22) |
| CA02.3 | código | PE correto | T23: correto, ativa e matriculado → upsert presença e sucesso | Não | Sim (T23) |
| CA02.4 | código | PE incorreto | T24: incorreto → erro e contador incrementado | Não | Sim (T24) |
| CA02.4 | tentativas | VL 5 | T25: quinta tentativa com código certo → registra presença | Não | Sim (T25) |
| CA02.4 | tentativas | VL 6 | T26: sexta tentativa com código certo → bloqueia, não grava presença | Não | Sim (T26) |
| CA02.5 | janela | PE encerrada | T27: `encerradoEm` definido → conflito | Não | Sim (T27) |
| CA02.5 | janela | VL instante exato | T28: `expiraEm === agora` → conflito | Não | Sim (T28) |
| CA02.5 | janela | PE ativa | T29: `expiraEm > agora` e aberta → permite validação | Não | Sim (T29) |
| CA02.6 | presença anterior | FL já presente | T30: `present: true` → sucesso sem contador/upsert | Não | Sim (T30) |
| CA02.7 | presença anterior | FL falta | T31: `present: false` com chave correta → atualiza para true | Não | Sim (T31) |
| CA03.1 | e-mail | PE ausente | T32: sem e-mail → `[]` sem findMany | Sim* | Sim (T32) |
| CA03.2 | consulta | PE matriculado/ativo | T33: filtro exige matrícula, data futura e não encerrada | Não | Sim (T33) |
| CA03.3 | estado de registro | PE presença false/ausente | T34: lista → `registrada: false`, sem segredos | Não | Sim (T34) |
| CA03.3 | estado de registro | PE presença true | T35: lista → `registrada: true`, sem segredos | Não | Sim (T35) |
| CA03.4 | aula | PE inexistente | T36: status de aula inexistente → erro | Sim* | Sim (T36) |
| CA03.4 | chamada | PE inexistente | T37: status sem janela → `null` | Não | Sim (T37) |
| CA03.4 | chamada | FL ativa | T38: janela ativa → `ativa: true`, quantidade de presentes | Não | Sim (T38) |
| CA03.4 | chamada | FL encerrada/expirada | T39: janela inativa → `ativa: false` | Não | Sim (T39) |
| CA04.1 | faltas % | PE regular | T40: `0` → REGULAR | Sim* | Sim (T40) |
| CA04.1 | faltas % | VL 14,9 | T41: `14.9` → REGULAR | Não | Sim (T41) |
| CA04.2 | faltas % | VL 15 | T42: `15` → ATENCAO | Não | Sim (T42) |
| CA04.2 | faltas % | PE atenção | T43: `20` → ATENCAO | Sim* | Sim (T43) |
| CA04.2 | faltas % | VL 25 | T44: `25` → ATENCAO | Não | Sim (T44) |
| CA04.3 | faltas % | VL 25,1 | T45: `25.1` → CRITICO | Não | Sim (T45) |
| CA04.3 | faltas % | PE crítico | T46: `50` → CRITICO | Sim* | Sim (T46) |
| CA04.4 | faltas/aulas | PE fração | T47: 1 falta/3 aulas → 33,3% | Não | Sim (T47) |
| CA04.4 | aulas realizadas | VL zero | T48: 0 aulas → 0%, sem divisão por zero | Sim* | Sim (T48) |

\* **Equivalência documentada:** T03 é coberto na v1 pela duração de 5 minutos, em vez de 8; T46 pela classificação de 30%, em vez de 50%. **O critério CA02.5 também é exercitado na v1** pelo teste de janela já expirada, mas a entrada não equivale exatamente a T27 nem T28; por isso essas duas linhas permanecem `Não` na coluna v1.

## Indicadores funcionais e ressalvas

- **21 critérios de aceitação:** 11 identificados no código v1 (52,38%); 21/21 na v2 (100%). Para a v1, não confundir *identificados na suíte* com *comprovadamente aprovados*.
- **25 partições (PE):** 10 identificadas na v1 (40%); 25 na v2 (100%).
- **16 limites (VL):** 3 identificados na v1 (18,75%); 16 na v2 (100%).
- **7 fluxos/estados (FL):** 0 identificados na v1; 7 na v2.
- A suíte v2 passou em conjunto com **48/48 testes** nos arquivos `docs/qualidade/evidencias/dt01-antes-testes.txt` e `dt01-depois-testes.txt`, após as refatorações; a v1 é preservada em `frequencia-back/tests/v1-llm/chamada-v1.test.ts`.
- Os testes de unidade utilizam mocks do Prisma: a cobertura **não comprova** concorrência real, transações/locks ou prevenção absoluta de fraude presencial.
- Manter o histórico inicial da matriz: este documento substitui apenas seu conteúdo atual na branch, **sem reescrever os commits anteriores**.
