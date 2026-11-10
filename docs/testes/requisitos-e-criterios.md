# P07 — Sprint 3 reconstruída | Escopo e critérios (Etapa 1)

**BASE EXATA:** `feat/chamada-codigo-temporario` no commit `c9028b6acd31e72cb804a034149aab6ae34cedb5`, de 08/11/2026. O merge `d4c8050` contém a mesma árvore Git. As suítes e refatorações antigas da Sprint 3 NÃO são o ponto de partida.

**Status:** proposta de projeto manual para a **equipe revisar e aprovar ANTES da primeira geração de testes**. A matriz em `matriz-projeto-manual.md` é um rascunho produzido com assistência de LLM; não deve ser apresentada como autoria exclusivamente humana. O grupo deve verificar e eventualmente corrigir os critérios abaixo, commitar separadamente e registrar no histórico a data e o responsável pela revisão.

## Histórias selecionadas da Sprint 2

As histórias abaixo são reconstruídas a partir do P07 acordado pelo grupo e do comportamento do código no commit-base. Não são uma transcrição de user stories formais da Sprint 2, que não foram encontradas como documento separado. O grupo precisa ratificá-las como critérios que realmente adotou.

| US | História | Critérios de aceitação selecionados (CA) | Entradas |
|---|---|---|---|
| US01 | Como professor, quero abrir uma janela de chamada com código temporário | CA01: código com oito letras sem I/O; CA02: duração inteira de 1 a 15 min e expiração correspondente; CA03: código puro só na abertura, banco salva hash+salt; CA04: aula inexistente não abre chamada | duração, aulaId, letras |
| US02 | Como aluno matriculado, quero registrar presença usando código | CA01: exige e-mail e matrícula na turma; CA02: janela precisa estar aberta e não expirada; CA03: código inválido não gera presença e entrada é normalizada; CA04: até 5 tentativas; na 6ª bloqueia; CA05: código válido registra e presença existente é idempotente | e-mail, código, hora, total de tentativas, status |
| US03 | Como aluno, quero consultar chamadas abertas sem ver segredos | CA01: sem e-mail retorna lista vazia; CA02: consulta somente matrícula e não expõe hash/salt; CA03: status reflete expiração e número de presentes | e-mail, expiração, presenças |
| US04 | Como professor/aluno, quero ver meu resumo de frequência e risco | CA01: níveis REGULAR <15, ATENCAO entre 15 e 25 inclusive, CRITICO >25; CA02: faltas/aulas realizadas com uma casa e zero aulas não divide por zero; CA03: detalhe por turma/aluno e minha frequência por e-mail, histórico recente primeiro | marcacões, aulas, turma, e-mail |

**Total:** 4 user stories; **15 critérios de aceitação**.

## Regras de oráculo independente

Os esperados para 1/15 minutos, 5/6 tentativas, 15%/25% faltas e segurança de matrícula precisam ser ratificados pela equipe como contrato de negócio. O código foi usado como fonte auxiliar para localizar o comportamento implementado, não como substituto de especificação. Quando a regra acordada diferir da implementação, registrar defeito real com reprodução e backlog, sem corrigir silenciosamente o teste.

## Workflow exigido pelo enunciado

1. Revisão humana da Etapa 1 → commit do projeto manual.
2. Prompt à LLM apenas com histórias/critério e código, **sem entregar a matriz detalhada** → v1 imutável após o commit.
3. Medição da v1 e análise das lacunas → commit dos relatórios v1.
4. Gerar/revisar v2 para lacunas reais → medir v2 no mesmo escopo.
5. Inventariar dívida, validar achados manualmente, refatorar pelo menos 3 itens separadamente com testes pré/pós.
6. Entregar os dois PDFs finais, nunca preencher métricas estimadas como se fossem medidas.
