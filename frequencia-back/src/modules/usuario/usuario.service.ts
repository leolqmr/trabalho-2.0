import { Injectable } from '@nestjs/common';
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
}
