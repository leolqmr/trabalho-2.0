import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PrismaService } from '@/database/prisma.service';
import { montarFrequencia } from './frequencia.util';

const ALUNO_COM_HISTORICO = {
  turma: { select: { id: true, name: true } },
  presencas: { select: { present: true, aula: { select: { id: true, date: true } } } },
} as const;

@Injectable()
export class FrequenciaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Frequência de um aluno da turma (visão do professor). */
  async detalhe(turmaId: string, alunoId: string) {
    const aluno = await this.prisma.aluno.findFirst({
      where: { id: alunoId, turma_id: turmaId },
      include: ALUNO_COM_HISTORICO,
    });
    if (!aluno) throw new ResourceNotFoundException('Aluno', alunoId);
    return montarFrequencia(aluno, await this.aulasRealizadas(turmaId));
  }

  /**
   * Frequência do usuário logado, uma entrada por turma em que o e-mail dele
   * está cadastrado como aluno. Só usa o e-mail do próprio token: ninguém
   * consegue pedir a frequência de outra pessoa por aqui.
   */
  async minhas(email?: string) {
    if (!email) return [];
    const alunos = await this.prisma.aluno.findMany({
      where: { email },
      include: ALUNO_COM_HISTORICO,
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(
      alunos.map(async (a) => montarFrequencia(a, await this.aulasRealizadas(a.turma_id))),
    );
  }

  /** Aulas da turma que já tiveram chamada (ao menos uma presença registrada). */
  private aulasRealizadas(turmaId: string) {
    return this.prisma.aula.count({ where: { turma_id: turmaId, presencas: { some: {} } } });
  }

}
