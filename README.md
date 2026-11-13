# P07 — Sistema de Controle de Frequência

Aplicação web para gerenciamento de turmas, aulas e presenças, desenvolvida na disciplina de Desenvolvimento de Software. Professores podem organizar suas turmas e iniciar chamadas por **código temporário**; alunos matriculados registram a presença dentro do prazo e consultam o histórico e a situação de frequência.

## Funcionalidades

- Cadastro e gerenciamento de turmas, aulas e alunos.
- Autenticação e perfis de acesso integrados ao Keycloak.
- Chamada por código temporário de oito letras, com validade configurável de 1 a 15 minutos.
- Registro de presença vinculado à matrícula, com controle de tentativas e prevenção de duplicidade.
- Consulta de chamadas disponíveis e de frequência, com classificação de risco de faltas.
- Relatórios e rastreabilidade de testes, cobertura de código e refatorações da Sprint 3.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | NestJS, TypeScript, Prisma |
| Persistência | PostgreSQL |
| Identidade | Keycloak |
| Infraestrutura local | Docker Compose |
| Testes | Vitest e cobertura V8 |

## Organização do repositório

- `frequencia-front/`: interface web.
- `frequencia-back/`: API, domínio, testes e migrações do Prisma.
- `docs/testes/`: projeto de testes, suítes V1/V2, rastreabilidade, cobertura e relatório de análise crítica.
- `docs/qualidade/`: inventário de dívida técnica, validação humana e relatório de refatoração.
- `docker-compose.yml`: serviços locais de infraestrutura; backend e frontend têm perfil opcional `app`.

## Executar para desenvolvimento no Windows

**Pré-requisitos:** Node.js 24 (exigido pelo frontend), npm, Docker Desktop com Docker Compose, e portas 5433, 8080, 3000 e 5173 disponíveis.

O modo recomendado para desenvolvimento é **Docker para bancos/Keycloak + backend e frontend executados localmente**. O perfil Docker `app` não faz parte deste roteiro de validação: requer configuração adicional de URLs, autenticação e publicação do frontend.

### 1. Infraestrutura

Na **raiz do repositório**:

```powershell
docker compose up -d
docker compose ps
```

Esse comando sobe PostgreSQL (`localhost:5433`), banco do Keycloak e Keycloak (`http://localhost:8080/auth`). Ele **não** inicia backend ou frontend, que estão associados ao perfil opcional `app`.

### 2. Backend

Em um terminal PowerShell na raiz:

```powershell
cd frequencia-back
npm ci
```

Crie ou confira `frequencia-back/.env` (arquivo local; não publicar credenciais de ambientes reais) com os valores correspondentes ao Compose da raiz:

```dotenv
PORT=3000
API_PREFIX=sistema/api
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5433/frequencia_db?schema=public
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080/auth
KEYCLOAK_REALM=Local
KEYCLOAK_CLIENT_ID=sistema-back
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

Então:

```powershell
npx prisma generate --schema prisma/schema.prisma
npx prisma migrate deploy --schema prisma/schema.prisma
npm run dev
```

A API utiliza o prefixo `/sistema/api/v1` quando `API_PREFIX=sistema/api`. Uma resposta `401` em rota protegida significa que o servidor respondeu e está exigindo autenticação; não é o mesmo que um servidor fora do ar.

### 3. Frontend

Em **outro** terminal PowerShell na raiz:

```powershell
cd frequencia-front
npm ci
```

Crie ou confira `frequencia-front/.env.development.local`:

```dotenv
VITE_KEYCLOAK_JSON={"realm":"Local","auth-server-url":"http://localhost:8080/auth/","ssl-required":"external","resource":"sistema-front","public-client":true,"confidential-port":0}
VITE_API_URL=http://localhost:3000/sistema/api/v1
VITE_BASE_URL=/sistema
```

Inicie:

```powershell
npm run dev
```

Abra a **URL informada pelo Vite** e, com o `VITE_BASE_URL` acima, utilize o caminho `/sistema/` (normalmente `http://localhost:5173/sistema/`).

> Importante: o arquivo `frequencia-front/.env.example` é a referência para o frontend. Se já existir um `.env.development` local, confira se ele não está sobrescrevendo os valores; arquivos `.local` têm precedência maior. A importação do realm acontece na inicialização do Keycloak em banco novo; um volume persistido pode conservar configurações antigas.

## Validar antes do merge

Os comandos abaixo devem ser executados em seus respectivos diretórios, sem editar os testes históricos.

### Backend

```powershell
cd frequencia-back
npm test
npx vitest run --config vitest.sprint3.v1.config.ts --coverage
npx vitest run --config vitest.sprint3.v2.config.ts --coverage
npm run build
```

As evidências registradas na Sprint 3 indicam baseline **58/58**, V1 **24/24** e V2 **39/39**; os números devem ser confirmados na versão que será integrada. As coberturas históricas de branches foram **64,81% (V1)** e **85,18% (V2)** sob o mesmo escopo.

### Frontend

```powershell
cd frequencia-front
npm run build
npm test
```

### Roteiro manual no navegador

1. Autenticar-se com uma conta de professor configurada no Keycloak.
2. Criar ou abrir uma turma com aluno cadastrado; criar uma aula.
3. Abrir uma chamada por código temporário e conferir prazo e código exibido.
4. Autenticar-se com a conta do aluno **matriculado** e registrar o código correto durante a janela.
5. Conferir presença registrada, impedir duplicidade e consultar a frequência.
6. Verificar o tratamento de código incorreto, chamada encerrada/expirada e usuário não matriculado.
7. Conferir a lista de chamadas e os estados de frequência nas visões de professor e aluno.
8. Abrir o console e a aba **Network** do navegador: não deve haver falhas inesperadas de autenticação, CORS ou API.

> Um build ou teste unitário bem-sucedido não comprova, sozinho, o fluxo completo de interface, login e banco. Os testes da Sprint 3 utilizam mocks do Prisma e não validam concorrência real no PostgreSQL.

## Evidências e relatórios da Sprint 3

- `docs/testes/relatorio-analise-critica.pdf`
- `docs/qualidade/relatorio-refatoracao.pdf`
- `docs/testes/indicadores-medidos.md`
- `docs/testes/matriz-rastreabilidade.md`
- `docs/qualidade/divida-tecnica.md`
- `docs/qualidade/validacao-humana.md`

A documentação distingue métricas estruturais produzidas pelo Vitest/V8 da associação de testes a critérios e limites, que exige conferência humana. As refatorações da reconstrução estão identificadas nos commits `d5a055d`, `ad37b20` e `828138c`.

## Encerrar o ambiente

Na raiz do repositório:

```powershell
docker compose down
```

**Não execute `docker compose down -v` se quiser preservar os bancos.** As credenciais de exemplo são exclusivas de desenvolvimento local e não devem ser usadas em produção.

## Equipe

Saulo, Tiago, Fernando, Leonardo e Daniel.
