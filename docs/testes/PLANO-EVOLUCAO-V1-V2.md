# Sprint 3 — correção de evolução v1 → v2 (proposta para revisão)

## Contexto e histórico preservado

- **Matriz inicial:** `e2866be7` (08/11). **v2 antiga:** `a3d23387` (08/11).
- **v1 oficial nova:** `49117f84` (09/11), 117 testes gerados por Claude em conversa nova sem a matriz no prompt.
- O problema metodológico é que a **v2 antiga precede a v1 oficial**. Não apagar ou reescrever esses commits.
- Esta branch acrescenta uma **rodada de melhoria posterior à v1 oficial** (v2 ampliada). O histórico antigo continua identificável e os relatórios de 09/11 devem ser chamados de *baseline histórico*, não de nova medição.

## Lacuna identificada na v1

Os 117 testes da v1 exercitam `frequencia.util.ts`, mas não exercitam diretamente `FrequenciaService`, responsável por recuperar a frequência por e-mail/turma, ordenar o histórico e compor o resumo. É uma lacuna ligada à US04 (consulta e classificação do risco), não uma mudança de requisitos.

## Evolução implementada

1. Preservar **sem alterações** `tests/v1-llm/chamada-v1.test.ts`.
2. Acrescentar `tests/v2/frequencia-service-v2.test.ts` com **11 testes** de consulta e composição da frequência.
3. Ampliar o `coverage.include` **nas duas configs**, de forma idêntica, para adicionar `src/modules/frequencia/frequencia.service.ts`. Não ampliar apenas na v2.
4. Rodar novamente as suítes v1 e v2 com `--coverage` no mesmo commit, capturando testes e métricas, e conferir ganho estrutural real. Os números anteriores de 100% linhas/97,91% branches eram de **quatro arquivos**, não são comparáveis com os novos percentuais de cinco arquivos.
5. Refazer a tabela de indicadores e o PDF após coletar os valores instrumentados, sem inventar números. Incluir a cobertura absoluta (contagens) e percentuais; destacar a possível branch gerada por decorator.

## Lacunas, entradas e oráculos dos testes novos

| ID | Cenário | Verificação |
|---|---|---|
| EVO-01 | E-mail ausente | `[]` sem acessar Prisma |
| EVO-02 | E-mail vazio | `[]` sem acessar Prisma |
| EVO-03 | Sem matrículas | `[]`, filtro por e-mail, sem contar aulas |
| EVO-04 | Uma turma, duas aulas | 1 falta = 50%, `CRITICO` e filtro correto |
| EVO-05 | Histórico fora de ordem | Saída em ordem decrescente e presenças preservadas |
| EVO-06 | Duas turmas distintas | Resumos separados e denominadores de cada turma |
| EVO-07 | Aluno sem marcações | Zero faltas e zero por cento |
| EVO-08 | Zero aulas | Sem divisão por zero |
| EVO-09 | Detalhe existente | Restrição por `turma_id` e `id` |
| EVO-10 | Aluno fora da turma | Erro `ResourceNotFoundException` e sem contagem |
| EVO-11 | Fronteira de 25% | 1 falta/4 aulas = `ATENCAO` |

## Verificações obrigatórias antes de aprovar merge

- Rodar `npm test`, `npm run build`, e as duas suítes com os configs atualizados. Registrar código de saída e relatórios reais.
- Reabrir o PDF `docs/testes/relatorio-analise-critica.pdf` e atualizar a seção "Melhorias da v2", os indicadores e a cronologia. Ele **não** estará atualizado automaticamente apenas com a aplicação deste pacote.
- Registrar a rodada de melhoria no `docs/testes/llm-log.md` (data, prompt, resposta, correções e execução). Não atribuir a geração da v2 antiga a uma revisão da nova v1.
- Documentar em `docs/testes/matriz-rastreabilidade.md` os casos novos `EVO-01` a `EVO-11` como testes complementares da v2, sem alterar o gabarito original T01–T48.
- A v2 acrescenta testes de unidade com mocks; isso **não prova** autorização real no HTTP, transações PostgreSQL ou ausência de fraude.

## Limite de confiança

Este pacote foi preparado a partir dos arquivos públicos da `main` em 09/11/2026. Os testes **não foram executados neste ambiente** (dependências de backend não instaladas); portanto a aprovação e os percentuais dependem do Vitest no computador da equipe.
