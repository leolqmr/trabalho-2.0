# Sprint 3 — Indicadores comparativos v1 e v2

**Fonte estrutural:** `docs/testes/relatorios/v1/coverage-summary.json` e `.../v2/coverage-summary.json`, versionados na branch `sprint3/testes`. Ambos medem os **mesmos quatro arquivos**: serviço e dois DTOs da chamada por código, além de `frequencia.util.ts`. **Fonte de execução v2:** logs `docs/qualidade/evidencias/dt04-antes-testes.txt`, `dt04-depois-testes.txt`, `dt01-antes-testes.txt`, `dt01-depois-testes.txt`.

| Indicador | v1 (LLM) | v2 (melhorada) |
|---|---:|---:|
| Testes declarados no código | 14 | 48 |
| Testes aprovados comprovados por log disponível | Não arquivado | 48/48 |
| Testes falhos / que não compilaram | Não verificável apenas com o material salvo | 0 nos logs v2 consultados |
| Cobertura de linhas | **43,42%** (33/76) | **100%** (76/76) |
| Cobertura de branches | **39,58%** (19/48) | **97,91%** (47/48) |
| Cobertura de statements | 44,08% (41/93) | 100% (93/93) |
| Cobertura de funções | 52,63% (10/19) | 100% (19/19) |
| Critérios com asserção identificada na suíte | 11/21 (52,38%) | 21/21 (100%) |
| Partições identificadas na suíte | 10/25 (40%) | 25/25 (100%) |
| Limites identificados na suíte | 3/16 (18,75%) | 16/16 (100%) |
| Fluxos identificados | 0/7 | 7/7 |
| Testes sem `expect` / `assert` (inspeção sintática) | 0/14 | 0/48 |
| Testes com oráculo genérico | Ao menos 1 (sem e-mail: `toThrow()` genérico) | Nenhum identificado na inspeção dos nomes e asserções relevantes |
| Defeitos reais de produção confirmados pelos testes | Nenhum documentado | Nenhum documentado |

## Interpretação e limites

- A v2 acrescentou **56,58 pontos percentuais de linhas** e **58,33 pontos percentuais de branches**.
- Um branch permanece não percorrido no serviço (`41/42` branches do serviço); o conjunto total fica em `47/48`. O relatório de cobertura v2 indica a linha 28 do arquivo base. A leitura pontual no HTML é necessária para vincular a lacuna à condição correta; não inferir defeito.
- **Medição histórica:** os JSON de cobertura são anteriores às três refatorações (arquivos fonte podem ter números de linha diferentes hoje). Essa é a comparação correta **v1 × v2**, mantido o escopo naquele momento. Os logs após as refatorações comprovam execução dos 48 testes, não nova cobertura estrutural.
- **Validação funcional:** a v1 tem 14 testes no código, mas não existe resultado `test-results.json` ou `console.txt` de sua execução arquivado no repositório. O percentual de critérios mapeia **existência de asserções**, não aprovação instrumental. Recomenda-se arquivar um log de execução v1 isolada sem modificar o arquivo de teste.
- **Oráculo e mocks:** alto percentual de cobertura não demonstra ausência de defeitos, rollback transacional nem garantia de que o estudante permaneceu fisicamente em sala. O código de oito letras pode ser compartilhado dentro do prazo.
