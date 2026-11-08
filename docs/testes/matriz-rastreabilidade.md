# Sprint 3 — Matriz de rastreabilidade

Esta matriz é o planejamento esperado antes da geração da suíte v1. As colunas `v1` e `v2` devem ser preenchidas **após inspeção e execução** das respectivas suítes. `PE` = partição de equivalência; `VL` = valor-limite; `FL` = fluxo/estado. Cada linha tem um caso de teste e um oráculo verificável.

| Critério | Variável | Partição/limite | Caso de teste e resultado esperado | v1 | v2 |
|---|---|---|---|---|---|
| CA01.1 | duração | VL 0 | T01: `0` → rejeita | — | — |
| CA01.1 | duração | VL 1 | T02: `1` → aceita | — | — |
| CA01.1 | duração | PE interior | T03: `8` → aceita | — | — |
| CA01.1 | duração | VL 15 | T04: `15` → aceita | — | — |
| CA01.1 | duração | VL 16 | T05: `16` → rejeita | — | — |
| CA01.1 | duração | PE não inteiro | T06: `1.5` → rejeita | — | — |
| CA01.2 | código gerado | PE formato | T07: código → 8 letras `[A-HJ-NP-Z]` | — | — |
| CA01.2 | expiração | VL duração mínima | T08: abrir com 1 minuto → prazo ≈ abertura + 60.000 ms | — | — |
| CA01.3 | resposta de status | PE segredo | T09: status existente → sem `codigo`, `codigoHash`, `salt` | — | — |
| CA01.4 | janela anterior | FL inexistente | T10: primeira abertura → cria janela | — | — |
| CA01.4 | janela anterior | FL existente | T11: reabrir → nova chave/hash, limpa tentativas e `encerradoEm: null` | — | — |
| CA01.5 | aula | PE inexistente | T12: abrir em aula inexistente → erro de recurso | — | — |
| CA01.5 | chamada | PE inexistente | T13: encerrar aula sem chamada → erro de recurso | — | — |
| CA01.6 | encerramento | FL sucesso | T14: encerrar → salva `encerradoEm` | — | — |
| CA02.1 | e-mail | PE ausente | T15: `undefined` → acesso negado, sem banco | — | — |
| CA02.1 | matrícula | PE inexistente | T16: e-mail não matriculado → acesso negado | — | — |
| CA02.1 | matrícula | PE existente | T17: aluno matriculado → segue à validação da chamada | — | — |
| CA02.2 | código submetido | PE normalizado | T18: minúsculas e espaços periféricos → código válido normalizado | — | — |
| CA02.2 | comprimento | VL 7 | T19: sete letras → erro DTO | — | — |
| CA02.2 | comprimento | VL 8 | T20: oito letras válidas → aceita DTO | — | — |
| CA02.2 | comprimento | VL 9 | T21: nove letras → erro DTO | — | — |
| CA02.2 | caracteres | PE proibido | T22: inclui `I` ou `O` → erro DTO | — | — |
| CA02.3 | código | PE correto | T23: correto, ativa e matriculado → upsert presença e sucesso | — | — |
| CA02.4 | código | PE incorreto | T24: incorreto → erro e contador incrementado | — | — |
| CA02.4 | tentativas | VL 5 | T25: quinta tentativa com código certo → registra presença | — | — |
| CA02.4 | tentativas | VL 6 | T26: sexta tentativa com código certo → bloqueia, não grava presença | — | — |
| CA02.5 | janela | PE encerrada | T27: `encerradoEm` definido → conflito | — | — |
| CA02.5 | janela | VL instante exato | T28: `expiraEm === agora` → conflito | — | — |
| CA02.5 | janela | PE ativa | T29: `expiraEm > agora` e aberta → permite validação | — | — |
| CA02.6 | presença anterior | FL já presente | T30: `present: true` → sucesso sem contador/upsert | — | — |
| CA02.7 | presença anterior | FL falta | T31: `present: false` com chave correta → atualiza para true | — | — |
| CA03.1 | e-mail | PE ausente | T32: sem e-mail → `[]` sem findMany | — | — |
| CA03.2 | consulta | PE matriculado/ativo | T33: filtro exige matrícula, data futura e não encerrada | — | — |
| CA03.3 | estado de registro | PE presença false/ausente | T34: lista → `registrada: false`, sem segredos | — | — |
| CA03.3 | estado de registro | PE presença true | T35: lista → `registrada: true`, sem segredos | — | — |
| CA03.4 | aula | PE inexistente | T36: status de aula inexistente → erro | — | — |
| CA03.4 | chamada | PE inexistente | T37: status sem janela → `null` | — | — |
| CA03.4 | chamada | FL ativa | T38: janela ativa → `ativa: true`, quantidade de presentes | — | — |
| CA03.4 | chamada | FL encerrada/expirada | T39: janela inativa → `ativa: false` | — | — |
| CA04.1 | faltas % | PE regular | T40: `0` → REGULAR | — | — |
| CA04.1 | faltas % | VL 14,9 | T41: `14.9` → REGULAR | — | — |
| CA04.2 | faltas % | VL 15 | T42: `15` → ATENCAO | — | — |
| CA04.2 | faltas % | PE atenção | T43: `20` → ATENCAO | — | — |
| CA04.2 | faltas % | VL 25 | T44: `25` → ATENCAO | — | — |
| CA04.3 | faltas % | VL 25,1 | T45: `25.1` → CRITICO | — | — |
| CA04.3 | faltas % | PE crítico | T46: `50` → CRITICO | — | — |
| CA04.4 | faltas/aulas | PE fração | T47: 1 falta/3 aulas → 33,3% | — | — |
| CA04.4 | aulas realizadas | VL zero | T48: 0 aulas → 0%, sem divisão por zero | — | — |

## Denominadores da análise

- 4 user stories; **21 critérios de aceitação** (`6 + 7 + 4 + 4`); **48 casos esperados**.
- Cobertura de requisitos: critérios com ao menos uma asserção relevante / 21.
- Cobertura de partições: linhas rotuladas `PE` efetivamente verificadas / total de linhas `PE`.
- Cobertura de limites: linhas rotuladas `VL` efetivamente verificadas / total de linhas `VL`.
- Casos `FL` são reportados separadamente, sem contaminar os denominadores de `PE` e `VL`.
- Cobertura estrutural: medir exclusivamente `chamada-codigo.service.ts`, DTOs de chamada por código e `frequencia.util.ts`, com relatório de linhas e branches gerado por Vitest/V8; comparar exatamente o mesmo escopo nas duas versões.
- Resultados de `T08` usam relógio controlado ou tolerância documentada para não gerar testes intermitentes.
- T12 a T14 e T23 a T31 usam mocks do Prisma; transação real e corrida concorrente precisam de integração com banco para comprovação completa.

## Protocolo

Revisar e commitar esta matriz **antes** da interação que gerará a v1. Não fornecê-la como contexto no prompt v1. Depois, preencher as colunas com `Sim`, `Não` e referência ao teste correspondente, manter a v1 sem edição manual, medir, construir v2 e atualizar a matriz em commit posterior.
