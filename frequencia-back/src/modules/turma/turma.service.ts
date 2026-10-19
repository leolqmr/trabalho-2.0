import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PaginatedResponseDto } from '@/common/pagination/paginated-response.dto';
import type { PaginationQueryDto } from '@/common/pagination/pagination-query.dto';
import { PrismaService } from '@/database/prisma.service';
import type { CreateTurmaDto } from './dto/create-turma.dto';
import type { UpdateTurmaDto } from './dto/update-turma.dto';
import type { AlunoDaTurma } from './turma.type';

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

  /**
   * Alunos da turma. O schema não tem tabela de matrícula, então o aluno é
   * quem aparece (`email`) em alguma presença das aulas da turma, com o
   * resumo de presenças/faltas.
   */
  async findAlunos(turmaId: string, query: PaginationQueryDto) {
    await this.findOne(turmaId);

    const registros = await this.prisma.presenca.findMany({
      where: { aula: { turma_id: turmaId } },
      select: { email: true, present: true },
    });

    const porAluno = new Map<string, AlunoDaTurma>();
    for (const { email, present } of registros) {
      // Registros antigos, de antes do e-mail, não têm como identificar o aluno.
      if (!email) continue;
      const aluno = porAluno.get(email) ?? {
        email,
        total_aulas: 0,
        presencas: 0,
        faltas: 0,
      };
      aluno.total_aulas += 1;
      if (present) aluno.presencas += 1;
      else aluno.faltas += 1;
      porAluno.set(email, aluno);
    }

    const alunos = [...porAluno.values()].sort((a, b) => a.email.localeCompare(b.email));
    return PaginatedResponseDto.of(
      alunos.slice(query.skip, query.skip + query.take),
      alunos.length,
      query,
    );
  }
}
