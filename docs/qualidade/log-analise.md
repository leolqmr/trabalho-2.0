# Sprint 3 Parte 2 — Log de análise de qualidade

Data da inspeção: 08/11/2026. Repositório: `leolqmr/trabalho-2.0`, commit `d4c8050`.

## Fontes e processo

1. Inspeção manual assistida por ChatGPT dos arquivos de chamada por código e seus componentes React, incluindo linhas enumeradas com `nl -ba`.
2. Comparação de módulos com as propriedades de projeto, SOLID e code smells solicitados pela professora.
3. Execução inicial de `npm test -- --reporter=dot` falhou ao carregar seis suites porque faltava o cliente Prisma gerado após `npm ci --ignore-scripts`. Após `npm run prisma:generate`, todos os **58 testes** das **10 suites** existentes passaram. O erro de preparação não deve ser contabilizado como defeito de produto.

## Uso de LLM

- Ferramenta: ChatGPT (modelo apresentado pelo serviço como GPT-6), 08/11/2026.
- Contexto fornecido pelo usuário: "https://github.com/leolqmr/trabalho-2.0 pode dar uma olhadinha de novo no repositório, pois implementamos uma feature que implementa um sistema de token para facilitar na chamada e depois pode refazer essa atividade da sprint 3 para mim?"
- Contexto adicional da conversa: os dois roteiros de Sprint 3, regras acordadas do grupo sobre percentual de faltas e link do projeto P07.
- Análise realizada: leitura dos arquivos mencionados no inventário; descrição dos problemas e consequências. Os resultados são **hipóteses confirmadas pela leitura de código**, não diagnósticos automáticos de linter.
- Em 08/11 não houve resultados de ferramentas. Elas foram executadas depois, em 09/11/2026 (seção "Ferramentas executadas em 09/11/2026", abaixo).

## Falsos positivos e cuidados

- `SELECT ... FOR UPDATE` não foi classificado como erro: é uma precaução relevante contra concorrência. A dívida está **somente na duplicação** da consulta, não na escolha de usá-la.
- O uso de hash com salt não é dívida: evita armazenar o token em texto claro.
- Mocks unitários não comprovam rollback real nem resistência completa a fraude; esses pontos foram sinalizados como limites de cobertura, não defeitos confirmados.

## Ferramentas executadas em 09/11/2026

As ferramentas foram executadas pelo Claude (Claude Code, Sonnet 5.5) depois das refatorações, para cruzar com o diagnóstico manual e de LLM. Elas foram instaladas numa pasta temporária, fora do repositório. A configuração e as saídas brutas estão em `docs/qualidade/evidencias/ferramentas/`. Cada ferramenta rodou sobre o código **original** (commit `a3d2338`, antes das refatorações) e o **atual** (`49117f8`), nos arquivos do serviço, do controller, dos dois DTOs da chamada, de `frequencia.util.ts` e dos dois componentes React.

| Ferramenta | Versão | Configuração |
|---|---|---|
| ESLint + `typescript-eslint` + `eslint-plugin-sonarjs` | 9.39.5 · 8.72.1 · 4.2.2 | `complexity` 10, `max-lines-per-function` 50, `max-params` 4, `no-magic-numbers` (ignora 0, 1 e -1), `sonarjs/cognitive-complexity` 15, `no-duplicate-string`, `no-identical-functions` (`eslint.config.mjs`) |
| jscpd | 5.4.3 | limiar padrão (5 linhas, 50 tokens) e limiar sensível (3 linhas, 25 tokens) |
| madge | 8.0.0 | `--circular`, backend e frontend |

### O que cada ferramenta apontou, dívida por dívida

| Dívida | Achado da ferramenta | Situação |
|---|---|---|
| DT-01 (`registrar` longo) | ESLint: `registrar` com **55 linhas** no original (limite 50); com **31** no código atual, deixou de ser apontado | Confirmada; a refatoração resolveu |
| DT-02 (`FOR UPDATE` duplicado) | jscpd: clone de 9 linhas entre `abrir` e `encerrar` no original; no atual o clone some no limiar padrão | Confirmada. **Resíduo novo** abaixo (DT-09) |
| DT-03 (acoplamento ao Prisma) | madge: o serviço depende direto de `database/prisma.service`; 0 dependências circulares, antes e depois | Corrobora o acoplamento, mas a ferramenta não o classifica como problema |
| DT-04 (relógio espalhado) | Nenhuma regra apontou `new Date()` / `Date.now()` | Só a leitura manual/LLM encontrou |
| DT-05 (normalização duplicada) | Nada | Só a leitura manual/LLM encontrou |
| DT-06 (literais mágicos) | `no-magic-numbers`: 29 achados; os que corroboram são o `8` (tamanho do código) em `ChamadaCodigoAluno` L14, L52 e L56 e o `15` no DTO | Confirmada em parte |
| DT-07 (componente grande) | ESLint: `ChamadaCodigoProfessor` com 108 linhas (limite 50) e complexidade 16 (limite 10) | Confirmada |
| DT-08 (temporização e polling duplicados) | jscpd não achou clone entre os componentes (o código é parecido, não idêntico). `no-magic-numbers` aponta os intervalos 1000 e 5000 nos dois e o formato `mm:ss` copiado em Aluno L10 e Professor L39 | Só a leitura manual/LLM viu o conjunto; a ferramenta mostra pedaços |

### Achado novo da ferramenta, confirmado por leitura

Com o limiar sensível, o jscpd aponta no código **atual** um clone de 7 linhas entre `abrir` (L74–80) e `encerrar` (L96–99): `const aulas = await this.bloquearAula(tx, aulaId); if (aulas.length === 0) throw new ResourceNotFoundException('Aula', aulaId);`. A DT-02 extraiu a consulta SQL, mas deixou a verificação de "aula inexistente" repetida em dois métodos. Foi registrado como **DT-09** em `divida-tecnica.md`, para a equipe confirmar.

### Falsos positivos e ruído

- `no-magic-numbers`: `204` (status HTTP do decorator do controller, L31), `1000` e `10` do arredondamento em `frequencia.util.ts` L42, `60` e `2` do formato `mm:ss`, `[1, 2, 3, 5, 10, 15]` (opções do seletor de duração, L101 de `ChamadaCodigoProfessor`) e `useState(3)` (duração padrão). Dos 29 achados, só os citados na tabela acima viraram evidência de dívida; os demais não foram classificados um a um.
- `ChamadaCodigoAluno` (`JanelaAluno`, 54 linhas, limite 50): limítrofe e provavelmente falso positivo, porque grande parte é marcação JSX.
- jscpd: um clone no arquivo de teste `chamada-codigo.service.spec.ts` (L46–51 e L59–64) e outro, no limiar sensível, entre `chamada-codigo.controller.ts` e `frequencia.controller.ts` (L2–7, só `import`s e decorators). Nenhum foi tratado como dívida.
- `madge` não encontrou dependência circular no backend nem no frontend.

**Limite:** a classificação acima foi feita pelo Claude e ainda precisa ser revisada pela equipe, como pede o roteiro para achados de ferramenta.
