import { Injectable } from '@nestjs/common';
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

  async findPresencas(aulaId: string, query: PaginationQueryDto) {
    await this.findOne(aulaId);
    const where = { aula_id: aulaId };
    const [items, total] = await Promise.all([
      this.prisma.presenca.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.presenca.count({ where }),
    ]);
    return PaginatedResponseDto.of(items, total, query);
  }

  /**
   * Grava a chamada. Idempotente por (aula, aluno): quem já tem registro nesta
   * aula é atualizado, os demais são criados — reenviar a chamada corrigida não
   * duplica presenças. Tudo numa transação: ou grava a chamada inteira ou nada.
   */
  async registrarPresencas(aulaId: string, dto: RegistrarPresencasDto) {
    await this.findOne(aulaId);

    const userIds = dto.presencas.map((m) => m.user_id);

    return this.prisma.$transaction(async (tx) => {
      const existentes = await tx.presenca.findMany({
        where: { aula_id: aulaId, user_id: { in: userIds } },
        select: { id: true, user_id: true },
      });
      const idPorUsuario = new Map(existentes.map((p) => [p.user_id, p.id]));

      for (const { user_id, present } of dto.presencas) {
        const existenteId = idPorUsuario.get(user_id);
        if (existenteId) {
          await tx.presenca.update({ where: { id: existenteId }, data: { present } });
        } else {
          await tx.presenca.create({ data: { aula_id: aulaId, user_id, present } });
        }
      }

      return tx.presenca.findMany({
        where: { aula_id: aulaId, user_id: { in: userIds } },
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  async removePresenca(aulaId: string, presencaId: string): Promise<void> {
    const presenca = await this.prisma.presenca.findFirst({
      where: { id: presencaId, aula_id: aulaId },
    });
    if (!presenca) throw new ResourceNotFoundException('Presença', presencaId);
    await this.prisma.presenca.delete({ where: { id: presencaId } });
  }
}
