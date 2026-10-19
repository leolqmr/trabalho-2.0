import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/exceptions/error-code.enum';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PaginatedResponseDto } from '@/common/pagination/paginated-response.dto';
import type { PaginationQueryDto } from '@/common/pagination/pagination-query.dto';
import { PrismaService } from '@/database/prisma.service';
import type { CreateAulaDto } from './dto/create-aula.dto';
import type { ListAulasQueryDto } from './dto/list-aulas-query.dto';
import type { RegistrarPresencasDto } from './dto/registrar-presencas.dto';
import type { UpdateAulaDto } from './dto/update-aula.dto';

@Injectable()
export class AulaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAulasQueryDto) {
    const where = query.turma_id ? { turma_id: query.turma_id } : {};
    const [items, total] = await Promise.all([
      this.prisma.aula.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.aula.count({ where }),
    ]);
    return PaginatedResponseDto.of(items, total, query);
  }

  async findOne(id: string) {
    const aula = await this.prisma.aula.findUnique({ where: { id } });
    if (!aula) throw new ResourceNotFoundException('Aula', id);
    return aula;
  }

  async create(dto: CreateAulaDto) {
    const turma = await this.prisma.turma.findUnique({ where: { id: dto.turma_id } });
    if (!turma) throw new ResourceNotFoundException('Turma', dto.turma_id);
    return this.prisma.aula.create({ data: { turma_id: dto.turma_id, date: dto.date } });
  }

  async update(id: string, dto: UpdateAulaDto) {
    await this.findOne(id);
    return this.prisma.aula.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.aula.delete({ where: { id } });
  }

  /**
   * Chamada da aula: todos os alunos da turma, cada um com a situação já
   * marcada (`present`) ou `null` se ainda não foi marcado.
   */
  async findPresencas(aulaId: string, query: PaginationQueryDto) {
    const aula = await this.findOne(aulaId);
    const where = { turma_id: aula.turma_id };
    const [alunos, total] = await Promise.all([
      this.prisma.aluno.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.take,
        include: { presencas: { where: { aula_id: aulaId }, select: { id: true, present: true } } },
      }),
      this.prisma.aluno.count({ where }),
    ]);

    const items = alunos.map((aluno) => ({
      aluno_id: aluno.id,
      name: aluno.name,
      email: aluno.email,
      presenca_id: aluno.presencas[0]?.id ?? null,
      present: aluno.presencas[0]?.present ?? null,
    }));
    return PaginatedResponseDto.of(items, total, query);
  }

  /**
   * Grava a chamada. Idempotente por (aula, aluno): quem já foi marcado é
   * atualizado, os demais são criados. Só aceita alunos da turma da aula, e
   * grava tudo numa transação (a chamada inteira ou nada).
   */
  async registrarPresencas(aulaId: string, dto: RegistrarPresencasDto) {
    const aula = await this.findOne(aulaId);
    const alunoIds = dto.presencas.map((m) => m.aluno_id);

    const validos = await this.prisma.aluno.findMany({
      where: { id: { in: alunoIds }, turma_id: aula.turma_id },
      select: { id: true },
    });
    const idsValidos = new Set(validos.map((a) => a.id));
    const invalido = alunoIds.find((id) => !idsValidos.has(id));
    if (invalido) {
      throw new AppException(
        ErrorCode.VALIDATION_FAILED,
        `O aluno ${invalido} não pertence à turma desta aula.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const { aluno_id, present } of dto.presencas) {
        await tx.presenca.upsert({
          where: { aula_id_aluno_id: { aula_id: aulaId, aluno_id } },
          create: { aula_id: aulaId, aluno_id, present },
          update: { present },
        });
      }
      return tx.presenca.findMany({
        where: { aula_id: aulaId, aluno_id: { in: alunoIds } },
        orderBy: { createdAt: 'asc' },
      });
    });
  }
}
