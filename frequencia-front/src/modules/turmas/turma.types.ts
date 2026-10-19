export interface Turma {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateTurmaDto {
  name: string;
}

export type UpdateTurmaDto = Partial<CreateTurmaDto>;
