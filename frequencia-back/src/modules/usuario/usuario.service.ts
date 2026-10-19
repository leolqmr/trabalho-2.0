import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/exceptions/error-code.enum';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PrismaService } from '@/database/prisma.service';
import type { CreateUsuarioDto } from './dto/create-usuario.dto';
import { KeycloakAdminService } from './keycloak-admin.service';

const ROLE_PROFESSOR = ['sys_sistema-admin', 'sys_sistema-users'];
const ROLE_ALUNO = ['sys_sistema-users'];

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const turmaId = dto.perfil === 'ALUNO' ? dto.turma_id : undefined;
    if (turmaId) {
      const turma = await this.prisma.turma.findUnique({ where: { id: turmaId } });
      if (!turma) throw new ResourceNotFoundException('Turma', turmaId);
    }

    const { id } = await this.keycloak.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      roles: dto.perfil === 'PROFESSOR' ? ROLE_PROFESSOR : ROLE_ALUNO,
    });

    if (turmaId) {
      await this.prisma.aluno.upsert({
        where: { turma_id_email: { turma_id: turmaId, email: dto.email } },
        update: { name: dto.name },
        create: { turma_id: turmaId, name: dto.name, email: dto.email },
      });
    }
    return { id, name: dto.name, email: dto.email, perfil: dto.perfil, turma_id: turmaId ?? null };
  }

  async findAll() {
    const users = await this.keycloak.listUsers([...new Set([...ROLE_PROFESSOR, ...ROLE_ALUNO])]);
    return users
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        enabled: u.enabled,
        perfil: u.roles.includes('sys_sistema-admin')
          ? ('PROFESSOR' as const)
          : u.roles.includes('sys_sistema-users')
            ? ('ALUNO' as const)
            : ('SEM_PERFIL' as const),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  /** Apaga o login. O cadastro do aluno na turma e o histórico de presenças são mantidos. */
  async remove(id: string, currentUserId?: string): Promise<void> {
    if (id === currentUserId) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        'Você não pode apagar o próprio login.',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.keycloak.deleteUser(id);
  }

  async resetPassword(id: string, password: string): Promise<void> {
    await this.keycloak.resetPassword(id, password);
  }
}
