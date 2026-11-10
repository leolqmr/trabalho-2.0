# Sprint 3 | Parte 2 — Qualidade e refatoração do P07

**Projeto:** Controle de Frequência, token temporário · **Base:** `feat/chamada-codigo-temporario` (`c9028b6`).

## 1. Escopo e método de identificação

Analisaram-se `ChamadaCodigoService`, `FrequenciaService`, utilitários de frequência e DTOs da feature. A inspeção com GPT-6 produziu **8 candidatos** em `divida-tecnica.md`, distribuídos por propriedades de projeto, SOLID e code smells. Não se afirma que ferramentas externas (jscpd/madge/ESLint) foram executadas sem os logs correspondentes. A equipe confirmou os achados em `validacao-humana.md` (com responsável e data registrados). Falsos positivos são mantidos como candidatos recusados com justificativa; a quantidade de itens não supera a qualidade do diagnóstico.

## 2. Relatório de dívida técnica

O inventário identifica ID, arquivo/função, problema, categoria, consequência concreta, **como foi encontrado** e status. Permanecem abertas a DT-05 (duplicação de SQL de bloqueio) e a DT-08 (ausência de testes reais de concorrência com PostgreSQL). A DT-04 foi descartada na revisão humana. Algumas sugestões (ex.: DT-06) dependem de avaliar se a abstração traria benefício ou complexidade artificial. Consulte a tabela e assinaturas da equipe nos anexos.

## 3. Refatorações realizadas — três técnicas distintas

| ID | Técnica | Local | Por que foi escolhida | Commit | V2 antes → depois |
|---|---|---|---|---|---|
| DT-01 | Replace Magic Literal | `ChamadaCodigoService.abrir` | `60_000` tinha unidade implícita, agora `MILISSEGUNDOS_POR_MINUTO` | `d5a055d` | 39/39 → 39/39 |
| DT-02 | Extract Function | `ChamadaCodigoService.registrar` | separou verificação da matrícula da orquestração da transação | `ad37b20` | 39/39 → 39/39 |
| DT-03 | Move Function | `FrequenciaService.montar` → `frequencia.util.montarFrequencia` | separou acesso Prisma de transformação pura de histórico e resumo | `828138c` | 39/39 → 39/39 |

As refatorações foram feitas em commits independentes com ID literal na mensagem. **Todas devem passar com testes antes e depois**, usando os arquivos `docs/testes/relatorios/reconstrucao/execucoes/DTxx-{antes,depois}-v2.txt` e logs de build. As três não implicam mudança do contrato público; asserções e teste de build sustentam preservação dos comportamentos examinados, sem provar equivalência universal.

## 4. Trechos antes e depois

**DT-01 (Replace Magic Literal):** antes `dto.duracaoMinutos * 60_000`; depois `dto.duracaoMinutos * MILISSEGUNDOS_POR_MINUTO`. Sem alteração numérica da duração.

**DT-02 (Extract Function):** antes `registrar` chamava `this.prisma.aluno.findUnique(...)` e validava matrícula inline. Depois `const aluno = await this.buscarAlunoMatriculado(chamada.aula.turma_id, email)`. A busca e sua exceção continuam iguais; o helper é privado.

**DT-03 (Move Function):** antes o método `private montar(...)` integrava `FrequenciaService`. Depois o serviço chama `montarFrequencia(aluno, aulasRealizadas)` de `frequencia.util.ts`, sem acesso ao Prisma. Mantém ordenação decrescente da data, campos expostos e `calcularResumo`.

## 5. Comparação manual, ferramentas e LLM

A LLM acelerou a identificação de funções longas, constante numérica e mistura entre consulta e transformação. Sua sugestão de mover lógica não prova que o desenho original era ruim: a equipe deve julgar a consequência prática. Análise manual é indispensável para interpretar locks transacionais, falsos positivos e comportamento esperado. Ferramentas estáticas são úteis para duplicação e complexidade, mas **não há logs de execução nesta reconstrução**; portanto, nenhuma descoberta é indevidamente atribuída a elas. A ausência desses logs limita a comparação empírica com ferramentas estáticas.

## 6. Riscos e conclusão

Os testes usam mocks; faltam testes de integração com PostgreSQL para `FOR UPDATE`, rollback e concorrência entre abrir, encerrar e registrar. Permanecem itens abertos no inventário, cuja aceitação depende de validação da equipe. O pacote não reescreve commits antigos nem reaproveita refatorações da Sprint 3 anterior. V2 e build devem passar após cada uma das três refatorações. A alteração de estrutura não garante correção fora dos ramos testados.

**Anexos verificáveis:** `divida-tecnica.md`, `log-analise.md`, `validacao-humana.md`, os commits identificados com `DT-xx` e logs pré/pós. A revisão humana está documentada em `validacao-humana.md`; os resultados de testes e builds estão registrados nos logs da reconstrução.



