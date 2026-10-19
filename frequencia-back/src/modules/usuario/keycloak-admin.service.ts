import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/exceptions/error-code.enum';

interface RoleRepresentation {
  id: string;
  name: string;
}

export interface NovoUsuarioKeycloak {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

/** Cliente mínimo da Admin REST API do Keycloak (cria usuário + atribui roles de realm). */
@Injectable()
export class KeycloakAdminService {
  constructor(private readonly config: ConfigService) {}

  private get base(): { url: string; realm: string } {
    const url = (this.config.get<string>('keycloak.authServerUrl') ?? '').replace(/\/$/, '');
    const realm = this.config.get<string>('keycloak.realm') ?? '';
    return { url, realm };
  }

  private unavailable(msg: string): AppException {
    return new AppException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, msg, HttpStatus.BAD_GATEWAY);
  }

  private async adminToken(): Promise<string> {
    const user = this.config.get<string>('keycloak.adminUser');
    const password = this.config.get<string>('keycloak.adminPassword');
    if (!user || !password) {
      throw this.unavailable(
        'Defina KEYCLOAK_ADMIN_USER e KEYCLOAK_ADMIN_PASSWORD para criar logins.',
      );
    }
    const res = await fetch(`${this.base.url}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: user,
        password,
      }),
    }).catch(() => null);
    if (!res) {
      throw this.unavailable(`Não consegui falar com o Keycloak em ${this.base.url}.`);
    }
    if (!res.ok) {
      throw this.unavailable(
        `Keycloak recusou o login admin (${res.status}). Confira KEYCLOAK_ADMIN_USER/PASSWORD no .env.`,
      );
    }
    return ((await res.json()) as { access_token: string }).access_token;
  }

  async createUser(input: NovoUsuarioKeycloak): Promise<{ id: string }> {
    const token = await this.adminToken();
    const { url, realm } = this.base;
    const admin = `${url}/admin/realms/${encodeURIComponent(realm)}`;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const [firstName, ...rest] = input.name.split(/\s+/);
    const create = await fetch(`${admin}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: input.email,
        email: input.email,
        firstName,
        lastName: rest.join(' ') || '-',
        enabled: true,
        emailVerified: true, // o vínculo aluno↔login usa o e-mail VERIFICADO do token
        credentials: [{ type: 'password', value: input.password, temporary: false }],
      }),
    }).catch(() => null);
    if (!create) throw this.unavailable('Keycloak indisponível.');
    if (create.status === 409) {
      throw new AppException(
        ErrorCode.CONFLICT,
        'Já existe um login com esse e-mail.',
        HttpStatus.CONFLICT,
      );
    }
    if (!create.ok) {
      const detalhe = await create.text().catch(() => '');
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `Keycloak recusou o cadastro (${create.status}): ${detalhe.slice(0, 200)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const id = create.headers.get('location')?.split('/').pop();
    if (!id) throw this.unavailable('Keycloak não retornou o id do usuário.');

    const roles: RoleRepresentation[] = [];
    for (const name of input.roles) {
      const r = await fetch(`${admin}/roles/${encodeURIComponent(name)}`, { headers }).catch(
        () => null,
      );
      if (!r?.ok) throw this.unavailable(`Role "${name}" não encontrada no realm.`);
      roles.push((await r.json()) as RoleRepresentation);
    }
    const map = await fetch(`${admin}/users/${id}/role-mappings/realm`, {
      method: 'POST',
      headers,
      body: JSON.stringify(roles),
    }).catch(() => null);
    if (!map?.ok) throw this.unavailable('Usuário criado, mas falhou ao atribuir o perfil.');
    return { id };
  }
}
