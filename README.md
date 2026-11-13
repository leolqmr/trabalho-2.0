## Infraestrutura local — Docker

O projeto utiliza Docker Compose para executar os serviços necessários ao desenvolvimento.

### Pré-requisitos
- Docker Desktop instalado e em execução (já inclui o Docker Compose)
- WSL 2 configurado (apenas Windows)

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

O backend e o frontend estão configurados no perfil opcional `app` e não são iniciados pelo comando padrão. Para iniciá-los junto com os demais serviços:

```bash
docker compose --profile app up -d
```

> O Keycloak leva alguns instantes para ficar pronto. Acompanhe com `docker compose logs -f keycloak` e aguarde a mensagem de inicialização concluída antes de acessá-lo.

### Verificar os serviços

```bash
docker compose ps
```

Para testar o PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d frequencia_db -c "SELECT 1;"
```

### PostgreSQL

- Host: `localhost`
- Porta: `5433` (diferente da padrão `5432` para evitar conflito com um PostgreSQL instalado localmente)
- Banco: `frequencia_db`
- Usuário: `postgres`
- Senha: `<senha>`

### Keycloak

> **Atenção:** as credenciais abaixo são apenas para desenvolvimento local e não devem ser utilizadas em produção.

Console administrativo: http://localhost:8080/auth/admin/

Credenciais locais de desenvolvimento:
- Usuário: `admin`
- Senha: `admin`

O realm `Local` é importado automaticamente a partir de `frequencia-back/setup/realm.json`.

Usuários e clients de teste do realm:

| Tipo | Nome | Senha |
|---|---|---|
| `<usuário/client>` | `<nome>` | `<senha>` |

### Encerrar os serviços

```bash
docker compose down
```

O comando preserva os volumes e os dados persistentes dos bancos.

Para encerrar **e apagar todos os dados** (útil para recomeçar do zero):

```bash
docker compose down -v
```

> Esse comando é destrutivo: remove os volumes e todos os dados dos bancos.

### Problemas comuns

- **`port is already allocated` (8080 ou 5433):** outro processo já usa a porta. Encerre-o ou altere a porta no `docker-compose.yml`.
- **`Cannot connect to the Docker daemon`:** o Docker Desktop não está em execução. Abra-o e aguarde iniciar.
- **Keycloak não abre logo após o `up -d`:** ele ainda está iniciando. Veja os logs com `docker compose logs -f keycloak`.