import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/exceptions/error-code.enum';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PaginatedResponseDto } from '@/common/pagination/paginated-response.dto';
import type { PaginationQueryDto } from '@/common/pagination/pagination-query.dto';
import { PrismaService } from '@/database/prisma.service';
import type { CreateAlunoDto } from './dto/create-aluno.dto';
import type { CreateTurmaDto } from './dto/create-turma.dto';
import type { UpdateAlunoDto } from './dto/update-aluno.dto';
import type { UpdateTurmaDto } from './dto/update-turma.dto';

@Injectable()
export class TurmaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const [items, total] = await Promise.all([
      this.prisma.turma.findMany({
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.turma.count(),
    ]);
    return PaginatedResponseDto.of(items, total, query);
  }

  async findOne(id: string) {
    const turma = await this.prisma.turma.findUnique({ where: { id } });
    if (!turma) throw new ResourceNotFoundException('Turma', id);
    return turma;
  }

  create(dto: CreateTurmaDto) {
    return this.prisma.turma.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: UpdateTurmaDto) {
    await this.findOne(id);
    return this.prisma.turma.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.turma.delete({ where: { id } });
  }

  // ---------- Alunos (matrícula) da turma ----------

  async findAlunos(turmaId: string, query: PaginationQueryDto) {
    await this.findOne(turmaId);
    const where = { turma_id: turmaId };
    const [items, total] = await Promise.all([
      this.prisma.aluno.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.aluno.count({ where }),
    ]);
    return PaginatedResponseDto.of(items, total, query);
  }

  async createAluno(turmaId: string, dto: CreateAlunoDto) {
    await this.findOne(turmaId);
    await this.assertEmailLivre(turmaId, dto.email);
    return this.prisma.aluno.create({
      data: { turma_id: turmaId, name: dto.name, email: dto.email },
    });
  }

  async updateAluno(turmaId: string, alunoId: string, dto: UpdateAlunoDto) {
    const aluno = await this.findAluno(turmaId, alunoId);
    if (dto.email && dto.email !== aluno.email) {
      await this.assertEmailLivre(turmaId, dto.email);
    }
    return this.prisma.aluno.update({ where: { id: alunoId }, data: dto });
  }

  async removeAluno(turmaId: string, alunoId: string): Promise<void> {
    await this.findAluno(turmaId, alunoId);
    await this.prisma.aluno.delete({ where: { id: alunoId } });
  }

  private async findAluno(turmaId: string, alunoId: string) {
    const aluno = await this.prisma.aluno.findFirst({ where: { id: alunoId, turma_id: turmaId } });
    if (!aluno) throw new ResourceNotFoundException('Aluno', alunoId);
    return aluno;
  }

  private async assertEmailLivre(turmaId: string, email: string) {
    const existente = await this.prisma.aluno.findUnique({
      where: { turma_id_email: { turma_id: turmaId, email } },
    });
    if (existente) {
      throw new AppException(
        ErrorCode.CONFLICT,
        `Já existe um aluno com o e-mail ${email} nesta turma.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
