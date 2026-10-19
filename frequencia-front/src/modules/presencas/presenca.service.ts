import { request, requestList } from '../../services/http';
import type { CreatePresencaDto, Presenca } from './presenca.types';

export class PresencaService {
  getByAula(aulaId: string): Promise<Presenca[]> {
    return requestList<Presenca>(`/presencas?aula_id=${aulaId}`, 'Erro ao buscar presenças');
  }

  create(dto: CreatePresencaDto): Promise<Presenca> {
    return request<Presenca>('/presencas', 'Erro ao registrar presença', {
      method: 'POST',
      json: dto,
    });
  }

  setPresent(id: string, present: boolean): Promise<Presenca> {
    return request<Presenca>(`/presencas/${id}`, 'Erro ao atualizar presença', {
      method: 'PATCH',
      json: { present },
    });
  }

  remove(id: string): Promise<void> {
    return request<void>(`/presencas/${id}`, 'Erro ao remover participante', {
      method: 'DELETE',
    });
  }
}

export const presencaService = new PresencaService();
