# Sprint 3 — Resumo das verificacoes validas da branch de evolucao

Branch: `sprint3/evolucao-v1-v2-pos-v1`  
Gerado em: 2026-11-09 16:06:01 -03:00  
Commit base da verificacao: `f42ba27`

| Verificacao | Codigo de saida | Resultado | Log |
|---|---:|---|---|
| v1 oficial, configuracao de 5 arquivos (117 testes) | 0 | APROVADO | `v1-cinco-arquivos.txt` |
| v2 ampliada, configuracao de 5 arquivos (59 testes) | 0 | APROVADO | `v2-cinco-arquivos.txt` |
| Suite geral npm.exe test (58/58 testes, 10 arquivos) | 0 | APROVADO | `suite-geral.txt` |
| Build NestJS | 0 | APROVADO | `build.txt` |

Codigo 0 = processo terminou com sucesso. Os totais 117/117, 59/59 e 58/58 tambem foram validados nos respectivos logs.

**Notas para a leitura dos logs:** o `suite-geral.txt` inclui `Error: boom`, produzido intencionalmente pelo teste de tratamento de excecoes `http-exception.filter.spec.ts` (a suite termina aprovada). Os logs isolados v1/v2 incluem aviso do Vite sobre `configLoader: native` e diagnostico `NativeCommandError` do PowerShell ao redirecionar stderr; eles tambem registram o resumo do Vitest aprovado e codigo de saida 0. Nao confundir avisos/erros exercitados pelos testes com falhas efetivas de execucao.

**Ambiente de validacao:** Windows com Node/NVM, execucoes locais da equipe. Nao ha comprovacao de CI/GitHub Actions para esta branch.

**Proveniencia:** logs produzidos na maquina da equipe (Windows/NVM), nao executados pelo assistente. Logs anteriores que falharam com `npx.cmd` foram substituidos ou permanecem no historico do Git; nao sao evidencia de teste aprovado.

**Cobertura:** os percentuais nao sao derivados deste resumo. Consultar `docs/testes/relatorios/evolucao-pos-v1/{v1,v2}/coverage-summary.json`: v1 83,50% linhas e 87,03% branches; v2 100% linhas e 96,29% branches.

**Escopo:** apenas os mesmos cinco arquivos de producao entram nos dois relatorios de cobertura. A suite geral e o build sao verificacoes adicionais, nao fazem parte dessa porcentagem.