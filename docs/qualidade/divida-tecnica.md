# Inventário de dívida técnica — Sprint 3 reconstruída

**Escopo:** commit `c9028b6` da feature de token temporário, sem reaproveitar refatorações da Sprint 3 antiga.

**Atenção:** os itens são **diagnósticos candidatos produzidos pela LLM após leitura de código**. Pelo Passo 1 do enunciado, só podem ser descritos como **confirmados** após alguém da equipe ler as funções e decidir se há um problema concreto. Preencher `validacao-humana.md` e atualizar a coluna status após a revisão.

| ID | Local (método) | Problema | Categoria | Consequência concreta | Como foi encontrado | Status planejado |
|---|---|---|---|---|---|---|
| DT-01 | `chamada-codigo.service.ts`, `abrir` | `60_000` representa ms/minuto sem nome | Magic Number / legibilidade | Unidade de tempo implícita facilita alteração errada de duração | Leitura do código assistida por LLM; confirmar manualmente | Aberto; planejado DT01 |
| DT-02 | `chamada-codigo.service.ts`, `registrar` | Orquestra identidade, matrícula, lock, tentativas, hash e persistência no mesmo método | SRP, Long Method, baixa coesão | Mudanças de política e fluxo de cadastro se misturam, dificultando testes separados | Leitura do código assistida por LLM; confirmar manualmente | Aberto; planejado DT02 |
| DT-03 | `frequencia.service.ts`, `montar` | Conversão/ordenação do DTO dentro de service acoplado ao banco | Move Function, coesão | Consulta do banco e transformação pura evoluem juntas; teste de formatação exige construir service | Leitura do código assistida por LLM; confirmar manualmente | Aberto; planejado DT03 |
| DT-04 | `chamada-codigo.service.ts`, `estaAtiva` | `Date.now()` chamado diretamente pela regra | DIP / acoplamento temporal | Testes de expiração dependem de relógio global e podem ficar sensíveis ao tempo | Leitura do código assistida por LLM; confirmar manualmente | Aberto |
| DT-05 | `chamada-codigo.service.ts`, `abrir`, `encerrar`, `registrar` | Bloqueio da aula em SQL quase repetido | Duplicated Code; integridade conceitual | Ajustar política de lock exige auditar três locais; refatorar exige cuidado transacional | Leitura do código assistida por LLM; confirmar manualmente | Aberto |
| DT-06 | `chamada-codigo.service.ts`, helpers de hash | Criptografia, geração e validação do token no mesmo módulo de serviço | Information hiding / coesão (a avaliar) | Troca da implementação criptográfica exige editar módulo de regra de presença; o encapsulamento atual pode ser suficiente | Leitura do código assistida por LLM; confirmar manualmente | Aberto / candidato a descartar |
| DT-07 | `frequencia.service.ts`, `ALUNO_COM_HISTORICO` | Formato de consulta Prisma exposto à lógica que monta o retorno | Acoplamento / abstração de dados | Alterar a projeção pode quebrar transformação de frequência; o helper extraído reduz esse acoplamento | Leitura do código assistida por LLM; confirmar manualmente | Aberto / parcialmente mitigado DT03 |
| DT-08 | `chamada-codigo.service.ts`, `$queryRaw FOR UPDATE` | Testes de unidade com mocks não exercitam concorrência real | Dívida de teste / risco de integridade | Regressão de atomicidade ou corrida entre encerrar e registrar pode passar despercebida | Inspeção de código e testes com LLM; confirmar manualmente | Aberto |

**Categorias:** propriedades de projeto (coesão, acoplamento, integridade conceitual, information hiding), SRP/DIP e smells (Magic Number, Long Method, Duplicated Code). Nem toda suspeita é uma violação comprovada; a equipe deve recusar falsos positivos.

### Motivos para escolher as três refatorações

- **DT-01 — Replace Magic Literal:** mudança pequena, segura, melhora clareza da unidade usada na expiração.
- **DT-02 — Extract Function:** isola a busca/validação da matrícula dentro de `registrar`, preservando o contrato e o fluxo transacional.
- **DT-03 — Move Function:** move transformação de histórico do `FrequenciaService` para utilitário puro, separando apresentação de persistência.

**Três técnicas diferentes, em dois módulos diferentes.** Cada patch do pacote exige `git diff`, testes pré e pós e commit separado com o ID literal (`DT-01`, `DT-02`, `DT-03`). Não aplicar refatoração em cima de código das branches antigas: partir exclusivamente de `c9028b6`.
