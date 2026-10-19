import { request, requestList } from '../../services/http';
import type { CreateTurmaDto, Turma, UpdateTurmaDto } from './turma.types';

export class TurmaService {
  getAll(): Promise<Turma[]> {
    return requestList<Turma>('/turmas', 'Erro ao buscar turmas');
  }

  getById(id: string): Promise<Turma> {
    return request<Turma>(`/turmas/${id}`, 'Erro ao buscar turma');
  }

  create(dto: CreateTurmaDto): Promise<Turma> {
    return request<Turma>('/turmas', 'Erro ao criar turma', { method: 'POST', json: dto });
  }

  update(id: string, dto: UpdateTurmaDto): Promise<Turma> {
    return request<Turma>(`/turmas/${id}`, 'Erro ao atualizar turma', {
      method: 'PATCH',
      json: dto,
    });
  }

  remove(id: string): Promise<void> {
    return request<void>(`/turmas/${id}`, 'Erro ao excluir turma', { method: 'DELETE' });
  }
}

export const turmaService = new TurmaService();
