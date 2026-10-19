export interface Aluno {
  id: string;
  name: string;
  email: string;
  turma_id: string;
  createdAt: string;
}

export interface CreateAlunoDto {
  name: string;
  email: string;
}

export type UpdateAlunoDto = Partial<CreateAlunoDto>;
