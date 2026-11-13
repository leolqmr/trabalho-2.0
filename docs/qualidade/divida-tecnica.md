# Inventário de dívida técnica — Sprint 3 reconstruída

**Escopo:** commit `c9028b6` da feature de token temporário, sem reaproveitar refatorações da Sprint 3 antiga.

**Validação:** os oito candidatos foram revisados e registrados por **Saulo** em 09/11/2026, conforme `validacao-humana.md`. Cinco foram confirmados, três descartados como falsos positivos. Dos cinco confirmados, três foram resolvidos por refatoração e dois permanecem abertos. A revisão individual de Tiago, Fernando, Leonardo e Daniel não está documentada.

| ID | Local (método) | Problema | Categoria | Consequência concreta | Como foi encontrado | Status após validação e refatoração |
|---|---|---|---|---|---|---|
| DT-01 | `chamada-codigo.service.ts`, `abrir` | `60_000` representa ms/minuto sem nome | Magic Number / legibilidade | Unidade de tempo implícita facilita alteração errada de duração | Leitura assistida por GPT-6; revisão registrada por Saulo | Resolvida - commit d5a055d; testes V2 e build aprovados |
| DT-02 | `chamada-codigo.service.ts`, `registrar` | Orquestra identidade, matrícula, lock, tentativas, hash e persistência no mesmo método | SRP, Long Method, baixa coesão | Mudanças de política e fluxo de cadastro se misturam, dificultando testes separados | Leitura assistida por GPT-6; revisão registrada por Saulo | Resolvida - commit ad37b20; testes V2 e build aprovados |
| DT-03 | `frequencia.service.ts`, `montar` | Conversão/ordenação do DTO dentro de service acoplado ao banco | Move Function, coesão | Consulta do banco e transformação pura evoluem juntas; teste de formatação exige construir service | Leitura assistida por GPT-6; revisão registrada por Saulo | Resolvida - commit 828138c; testes V2 e build aprovados |
| DT-04 | `chamada-codigo.service.ts`, `estaAtiva` | `Date.now()` chamado diretamente pela regra | DIP / acoplamento temporal | Testes de expiração dependem de relógio global e podem ficar sensíveis ao tempo | Leitura assistida por GPT-6; revisão registrada por Saulo | Descartada - falso positivo |
| DT-05 | `chamada-codigo.service.ts`, `abrir`, `encerrar`, `registrar` | Bloqueio da aula em SQL quase repetido | Duplicated Code; integridade conceitual | Ajustar política de lock exige auditar três locais; refatorar exige cuidado transacional | Leitura assistida por GPT-6; revisão registrada por Saulo | Confirmada - aberta; baixa prioridade |
| DT-06 | `chamada-codigo.service.ts`, helpers de hash | Criptografia, geração e validação do token no mesmo módulo de serviço | Information hiding / coesão (a avaliar) | Troca da implementação criptográfica exige editar módulo de regra de presença; o encapsulamento atual pode ser suficiente | Leitura assistida por GPT-6; revisão registrada por Saulo | Descartada - falso positivo |
| DT-07 | `frequencia.service.ts`, `ALUNO_COM_HISTORICO` | Formato de consulta Prisma exposto à lógica que monta o retorno | Acoplamento / abstração de dados | Alterar a projeção pode quebrar transformação de frequência; o helper extraído reduz esse acoplamento | Leitura assistida por GPT-6; revisão registrada por Saulo | Descartada - falso positivo |
| DT-08 | `chamada-codigo.service.ts`, `$queryRaw FOR UPDATE` | Testes de unidade com mocks não exercitam concorrência real | Dívida de teste / risco de integridade | Regressão de atomicidade ou corrida entre encerrar e registrar pode passar despercebida | Inspeção assistida por GPT-6; revisão registrada por Saulo | Confirmada - aberta; testes de integracao pendentes |

**Categorias:** propriedades de projeto (coesão, acoplamento, integridade conceitual, information hiding), SRP/DIP e smells (Magic Number, Long Method, Duplicated Code). Nem toda suspeita é uma violação comprovada; a equipe deve recusar falsos positivos.

### Motivos para escolher as três refatorações

- **DT-01 — Replace Magic Literal:** mudança pequena, segura, melhora clareza da unidade usada na expiração.
- **DT-02 — Extract Function:** isola a busca/validação da matrícula dentro de `registrar`, preservando o contrato e o fluxo transacional.
- **DT-03 — Move Function:** move transformação de histórico do `FrequenciaService` para utilitário puro, separando apresentação de persistência.

**Execução concluída:** três técnicas diferentes em dois módulos. Os commits `d5a055d`, `ad37b20` e `828138c` registram cada alteração com seu ID; há logs de testes V2 pré/pós e evidências de build em `docs/testes/relatorios/reconstrucao/execucoes/`. Os registros individuais de build marcados como retrospectivos não são capturas integrais do terminal. O ponto de partida da reconstrução foi `c9028b6`.
