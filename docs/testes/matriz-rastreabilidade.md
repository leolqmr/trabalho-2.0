# Sprint 3 — Matriz de rastreabilidade (consolidada)

**Projeto:** P07 — Controle de Frequência · **Branch:** `sprint3/testes` · **Atualização:** 09/11/2026 (colunas da v1 e da v2).

A matriz inicial foi commitada em `e2866be7` antes de qualquer suíte. Esta versão **preenche as colunas** a partir da leitura das asserções dos testes; não é uma matriz manual nova. **PE** = partição de equivalência; **VL** = valor-limite; **FL** = fluxo/estado.

**Colunas de cobertura:**
- **v1 (09/11):** a v1 gerada pelo Claude Opus 5.5 em conversa nova, sem a matriz (`frequencia-back/tests/v1-llm/chamada-v1.test.ts`). `Sim (Lnnn)` indica a linha do teste que exercita o caso com a mesma entrada e verifica o resultado esperado. Os 117 testes passam (`relatorios/execucao/v1-execucao.txt`).
- **v2:** casos TNN em `frequencia-back/tests/v2/`, com 48/48 testes passando.

| Critério | Variável | Partição ou limite | Caso planejado e resultado esperado | v1? | v2? |
|---|---|---|---|---|---|
| CA01.1 | duração | VL 0 | T01: `0` → rejeita | Sim (L150) | Sim (T01) |
| CA01.1 | duração | VL 1 | T02: `1` → aceita | Sim (L145) | Sim (T02) |
| CA01.1 | duração | PE interior | T03: `8` → aceita | Sim (L165) | Sim (T03) |
| CA01.1 | duração | VL 15 | T04: `15` → aceita | Sim (L155) | Sim (T04) |
| CA01.1 | duração | VL 16 | T05: `16` → rejeita | Sim (L160) | Sim (T05) |
| CA01.1 | duração | PE não inteiro | T06: `1.5` → rejeita | Sim (L185) | Sim (T06) |
| CA01.2 | código gerado | PE formato | T07: código → 8 letras `[A-HJ-NP-Z]` | Sim (L202) | Sim (T07) |
| CA01.2 | expiração | VL duração mínima | T08: abrir com 1 minuto → prazo ≈ abertura + 60.000 ms | Sim (L224) | Sim (T08) |
| CA01.3 | resposta de status | PE segredo | T09: status existente → sem `codigo`, `codigoHash`, `salt` | Sim (L280) | Sim (T09) |
| CA01.4 | janela anterior | FL inexistente | T10: primeira abertura → cria janela | Sim (L369) | Sim (T10) |
| CA01.4 | janela anterior | FL existente | T11: reabrir → nova chave/hash, limpa tentativas e `encerradoEm: null` | Sim (L334) | Sim (T11) |
| CA01.5 | aula | PE inexistente | T12: abrir em aula inexistente → erro de recurso | Sim (L377) | Sim (T12) |
| CA01.5 | chamada | PE inexistente | T13: encerrar aula sem chamada → erro de recurso | Sim (L395) | Sim (T13) |
| CA01.6 | encerramento | FL sucesso | T14: encerrar → salva `encerradoEm` | Sim (L412) | Sim (T14) |
| CA02.1 | e-mail | PE ausente | T15: `undefined` → acesso negado, sem banco | Sim (L456) | Sim (T15) |
| CA02.1 | matrícula | PE inexistente | T16: e-mail não matriculado → acesso negado | Sim (L470) | Sim (T16) |
| CA02.1 | matrícula | PE existente | T17: aluno matriculado → segue à validação da chamada | Sim (L487) | Sim (T17) |
| CA02.2 | código submetido | PE normalizado | T18: minúsculas e espaços periféricos → código válido normalizado | Sim (L601) | Sim (T18) |
| CA02.2 | comprimento | VL 7 | T19: sete letras → erro DTO | Sim (L535) | Sim (T19) |
| CA02.2 | comprimento | VL 8 | T20: oito letras válidas → aceita DTO | Sim (L507) | Sim (T20) |
| CA02.2 | comprimento | VL 9 | T21: nove letras → erro DTO | Sim (L540) | Sim (T21) |
| CA02.2 | caracteres | PE proibido | T22: inclui `I` ou `O` → erro DTO | Sim (L556) | Sim (T22) |
| CA02.3 | código | PE correto | T23: correto, ativa e matriculado → upsert presença e sucesso | Sim (L613) | Sim (T23) |
| CA02.4 | código | PE incorreto | T24: incorreto → erro e contador incrementado | Sim (L647) | Sim (T24) |
| CA02.4 | tentativas | VL 5 | T25: quinta tentativa com código certo → registra presença | Sim (L655) | Sim (T25) |
| CA02.4 | tentativas | VL 6 | T26: sexta tentativa com código certo → bloqueia, não grava presença | Sim (L669) | Sim (T26) |
| CA02.5 | janela | PE encerrada | T27: `encerradoEm` definido → conflito | Sim (L729) | Sim (T27) |
| CA02.5 | janela | VL instante exato | T28: `expiraEm === agora` → conflito | Sim (L745) | Sim (T28) |
| CA02.5 | janela | PE ativa | T29: `expiraEm > agora` e aberta → permite validação | Sim (L626) | Sim (T29) |
| CA02.6 | presença anterior | FL já presente | T30: `present: true` → sucesso sem contador/upsert | Sim (L772) | Sim (T30) |
| CA02.7 | presença anterior | FL falta | T31: `present: false` com chave correta → atualiza para true | Sim (L817) | Sim (T31) |
| CA03.1 | e-mail | PE ausente | T32: sem e-mail → `[]` sem findMany | Sim (L870) | Sim (T32) |
| CA03.2 | consulta | PE matriculado/ativo | T33: filtro exige matrícula, data futura e não encerrada | Sim (L894) | Sim (T33) |
| CA03.3 | estado de registro | PE presença false/ausente | T34: lista → `registrada: false`, sem segredos | Sim (L949) | Sim (T34) |
| CA03.3 | estado de registro | PE presença true | T35: lista → `registrada: true`, sem segredos | Sim (L941) | Sim (T35) |
| CA03.4 | aula | PE inexistente | T36: status de aula inexistente → erro | Sim (L999) | Sim (T36) |
| CA03.4 | chamada | PE inexistente | T37: status sem janela → `null` | Sim (L1006) | Sim (T37) |
| CA03.4 | chamada | FL ativa | T38: janela ativa → `ativa: true`, quantidade de presentes | Sim (L1012) | Sim (T38) |
| CA03.4 | chamada | FL encerrada/expirada | T39: janela inativa → `ativa: false` | Sim (L1019) | Sim (T39) |
| CA04.1 | faltas % | PE regular | T40: `0` → REGULAR | Sim (L1061) | Sim (T40) |
| CA04.1 | faltas % | VL 14,9 | T41: `14.9` → REGULAR | Sim (L1071) | Sim (T41) |
| CA04.2 | faltas % | VL 15 | T42: `15` → ATENCAO | Sim (L1078) | Sim (T42) |
| CA04.2 | faltas % | PE atenção | T43: `20` → ATENCAO | Sim (L1088) | Sim (T43) |
| CA04.2 | faltas % | VL 25 | T44: `25` → ATENCAO | Sim (L1098) | Sim (T44) |
| CA04.3 | faltas % | VL 25,1 | T45: `25.1` → CRITICO | Sim (L1105) | Sim (T45) |
| CA04.3 | faltas % | PE crítico | T46: `50` → CRITICO | Sim (L1110) | Sim (T46) |
| CA04.4 | faltas/aulas | PE fração | T47: 1 falta/3 aulas → 33,3% | Sim (L1151) | Sim (T47) |
| CA04.4 | aulas realizadas | VL zero | T48: 0 aulas → 0%, sem divisão por zero | Sim (L1127) | Sim (T48) |


**Notas sobre a v1:** T10 é verificado em L369 junto com o auxiliar `abrirChamada` (caminho de criação da janela). T34 é verificado em L949; a ausência de segredos na lista está em L918. T06 usa 1,5 (L185); o valor 7,5 está em L180.

## Indicadores funcionais

| Indicador | v1 | v2 |
|---|---:|---:|
| Critérios de aceitação com ao menos um caso coberto | 21/21 (100,00%) | 21/21 (100,00%) |
| Partições de equivalência (PE) | 25/25 (100,00%) | 25/25 (100,00%) |
| Valores-limite (VL) | 16/16 (100,00%) | 16/16 (100,00%) |
| Fluxos/estados (FL) | 7/7 (100,00%) | 7/7 (100,00%) |


- "Coberto" mede **existência de um teste com a entrada e o resultado esperado do caso**, não a qualidade do oráculo. Os 15 testes da v1 com `rejects.toThrow()` genérico cobrem o caso, mas só verificam que *algum* erro ocorreu (ver `relatorio-analise-critica.md`).
- Os testes da v1 e da v2 usam mocks do Prisma: a cobertura **não comprova** concorrência real, transações/locks nem prevenção de fraude presencial. O código de oito letras pode ser repassado dentro do prazo.
- A matriz inicial ficou preservada no histórico do Git; este documento só acrescenta colunas.


## Apêndice — Testes complementares da v2 posteriores à v1 oficial

Este apêndice **não substitui nem altera** os 48 casos T01–T48 da matriz inicialmente commitada em `e2866be7`. Os novos casos **EVO-01 a EVO-11** foram acrescentados à v2 depois da geração da v1 de 117 testes. Eles ampliam o teste do fluxo de consulta e consolidação de frequência (`FrequenciaService`), que não é exercitado diretamente pela v1. A coluna **v1** se refere à suíte oficial inalterada e não aos testes preexistentes de `src/**/*.spec.ts`, excluídos pelas configurações isoladas.

**Rastreabilidade:** o risco é classificado em CA04.1–CA04.3 e o percentual calculado conforme CA04.4; vários cenários de consulta por e-mail/turma, identidade e histórico são **comportamentos complementares à US04**, não critérios de aceitação previamente escritos. Não tratá-los como requisitos preexistentes nem inflar artificialmente a contagem de 21 critérios.

| ID | Relação com os requisitos | Técnica / cenário | Oráculo da v2 | v1 direta? | v2? |
|---|---|---|---|---|---|
| EVO-01 | US04, consulta complementar | PE: e-mail `undefined` | `[]`, sem acesso ao Prisma | Não | Sim |
| EVO-02 | US04, consulta complementar | PE: e-mail vazio | `[]`, sem busca de alunos | Não | Sim |
| EVO-03 | US04, consulta complementar | PE: aluno sem matrícula | `[]`, filtra e-mail, não conta aulas | Não | Sim |
| EVO-04 | US04 / CA04.3 e CA04.4 | PE: 1 falta em 2 aulas | 50%, `CRITICO`, conta aulas da turma | Não | Sim |
| EVO-05 | US04, histórico complementar | Fluxo: presenças fora de ordem | Histórico decrescente, mantém `present` | Não | Sim |
| EVO-06 | US04, consulta complementar | PE: duas turmas | Resumos e denominadores independentes | Não | Sim |
| EVO-07 | US04 / CA04.4 | PE: ausência de marcações | 0 faltas, 0%, `REGULAR` | Não | Sim |
| EVO-08 | US04 / CA04.4 | VL: zero aulas realizadas | 0% sem divisão por zero | Não | Sim |
| EVO-09 | US04, consulta complementar | PE: aluno existente na turma | Busca por `alunoId` + `turmaId`, devolve resumo | Não | Sim |
| EVO-10 | US04, consulta complementar | PE: aluno inexistente/fora da turma | `ResourceNotFoundException`, não conta aulas | Não | Sim |
| EVO-11 | US04 / CA04.2 e CA04.4 | VL: 25% de faltas | `ATENCAO` com 1 falta/4 aulas | Não | Sim |

**Local dos testes:** `frequencia-back/tests/v2/frequencia-service-v2.test.ts`; ordem dos `it(...)` corresponde a EVO-01 a EVO-11. Há cenários semelhantes para os cálculos no utilitário cobertos pela v1 (T40–T48); "v1 direta? Não" significa ausência de teste do **serviço de consolidação** para o cenário EVO, não ausência total de verificação da regra matemática.

**Indicadores funcionais e estruturais distintos:** os 21 critérios originais e os 48 casos T01–T48 continuam cobertos pelas duas versões. Os EVO não devem ser somados a um novo total de critérios. A v2 ampliada tem 59 testes; as duas suítes têm cobertura calculada sobre os mesmos cinco arquivos (ver `indicadores-v1-v2.md`).
