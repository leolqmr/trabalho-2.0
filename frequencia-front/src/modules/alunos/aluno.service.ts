import { request, requestList } from '../../services/http';
import type { Aluno, CreateAlunoDto, UpdateAlunoDto } from './aluno.types';

export class AlunoService {
  getByTurma(turmaId: string): Promise<Aluno[]> {
    return requestList<Aluno>(`/turmas/${turmaId}/alunos`, 'Erro ao buscar alunos');
  }

  create(turmaId: string, dto: CreateAlunoDto): Promise<Aluno> {
    return request<Aluno>(`/turmas/${turmaId}/alunos`, 'Erro ao cadastrar aluno', {
      method: 'POST',
      json: dto,
    });
  }

  update(turmaId: string, id: string, dto: UpdateAlunoDto): Promise<Aluno> {
    return request<Aluno>(`/turmas/${turmaId}/alunos/${id}`, 'Erro ao atualizar aluno', {
      method: 'PATCH',
      json: dto,
    });
  }

  remove(turmaId: string, id: string): Promise<void> {
    return request<void>(`/turmas/${turmaId}/alunos/${id}`, 'Erro ao remover aluno', {
      method: 'DELETE',
    });
  }
}

export const alunoService = new AlunoService();
