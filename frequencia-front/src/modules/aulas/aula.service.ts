import { request, requestList } from '../../services/http';
import { toAulaIso } from './aula.types';
import type { Aula, CreateAulaDto, UpdateAulaDto } from './aula.types';

export class AulaService {
  getByTurma(turmaId: string): Promise<Aula[]> {
    return requestList<Aula>(`/aulas?turma_id=${turmaId}`, 'Erro ao buscar aulas');
  }

  getById(id: string): Promise<Aula> {
    return request<Aula>(`/aulas/${id}`, 'Erro ao buscar aula');
  }

  create(dto: CreateAulaDto): Promise<Aula> {
    return request<Aula>('/aulas', 'Erro ao criar aula', {
      method: 'POST',
      json: { turma_id: dto.turma_id, date: toAulaIso(dto.date) },
    });
  }

  update(id: string, dto: UpdateAulaDto): Promise<Aula> {
    return request<Aula>(`/aulas/${id}`, 'Erro ao atualizar aula', {
      method: 'PATCH',
      json: dto.date ? { date: toAulaIso(dto.date) } : {},
    });
  }

  remove(id: string): Promise<void> {
    return request<void>(`/aulas/${id}`, 'Erro ao excluir aula', { method: 'DELETE' });
  }
}

export const aulaService = new AulaService();
