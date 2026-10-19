import { request, requestList } from '../../services/http';
import type { MarcacaoPresenca, Presenca } from './presenca.types';

export class PresencaService {
  /** GET /aulas/:id/presencas */
  getByAula(aulaId: string): Promise<Presenca[]> {
    return requestList<Presenca>(`/aulas/${aulaId}/presencas`, 'Erro ao buscar presenças');
  }

  /**
   * POST /aulas/:id/presencas — registra a chamada. Idempotente por aluno: quem
   * já tem registro na aula é atualizado, então serve para marcar e corrigir.
   */
  registrar(aulaId: string, marcacoes: MarcacaoPresenca[]): Promise<Presenca[]> {
    return request<Presenca[]>(`/aulas/${aulaId}/presencas`, 'Erro ao registrar presença', {
      method: 'POST',
      json: { presencas: marcacoes },
    });
  }

  /** DELETE /aulas/:aulaId/presencas/:presencaId */
  remove(aulaId: string, presencaId: string): Promise<void> {
    return request<void>(
      `/aulas/${aulaId}/presencas/${presencaId}`,
      'Erro ao remover participante',
      { method: 'DELETE' },
    );
  }
}

export const presencaService = new PresencaService();
