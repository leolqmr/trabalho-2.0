## Infraestrutura local — Docker

O projeto utiliza Docker Compose para executar os serviços necessários ao desenvolvimento

### Pré-requisitos
- Docker Desktop instalado e em execução
- WSL 2 configurado (Windows)
- Docker Compose disponível

### Inicialização

Na raiz do repositório, execute:

```bash
docker compose up -d
```

O comando inicia os seguintes serviços:

| Serviço | Descrição | Acesso |
|---|---|---|
| PostgreSQL | Banco de dados da aplicação | localhost:5433 |
| Keycloak DB | Banco interno do Keycloak | Rede interna Docker |
| Keycloak | Autenticação e autorização | http://localhost:8080/auth |

O backend e o frontend estão configurados no perfil opcional `app` e não são iniciados pelo comando padrão.

### Verificar os serviços

```bash
docker compose ps
```

Para testar o PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d frequencia_db -c "SELECT 1;"
```

### Keycloak

Console administrativo: http://localhost:8080/auth/admin/

Credenciais locais de desenvolvimento:
- Usuário: `admin`
- Senha: `admin`

O realm `Local` é importado automaticamente a partir de `frequencia-back/setup/realm.json`.

### Encerrar os serviços

```bash
docker compose down
```

O comando preserva os volumes e os dados persistentes dos bancos.

**Observação:** as credenciais fornecidas são apenas para desenvolvimento local e não devem ser utilizadas em produção.
