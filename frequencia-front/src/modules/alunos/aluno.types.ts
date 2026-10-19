import type { ResumoFrequencia } from '../../types/frequencia';

export interface Aluno {
  id: string;
  name: string;
  email: string;
  turma_id: string;
  createdAt: string;
}

/** Item da lista de alunos da turma: o aluno + o resumo de faltas dele. */
export interface AlunoComResumo extends Aluno {
  resumo: ResumoFrequencia;
}

export interface CreateAlunoDto {
  name: string;
  email: string;
}

export type UpdateAlunoDto = Partial<CreateAlunoDto>;
