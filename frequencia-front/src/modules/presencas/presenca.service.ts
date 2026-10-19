import { request, requestList } from '../../services/http';
import type { ChamadaItem, MarcacaoPresenca } from './presenca.types';

export class PresencaService {
  /** GET /aulas/:id/presencas — alunos da turma com a situação nesta aula. */
  getChamada(aulaId: string): Promise<ChamadaItem[]> {
    return requestList<ChamadaItem>(`/aulas/${aulaId}/presencas`, 'Erro ao buscar a chamada');
  }

  /**
   * POST /aulas/:id/presencas — registra a chamada. Idempotente por aluno:
   * quem já foi marcado é atualizado, então serve para marcar e corrigir.
   */
  registrar(aulaId: string, marcacoes: MarcacaoPresenca[]): Promise<unknown> {
    return request<unknown>(`/aulas/${aulaId}/presencas`, 'Erro ao registrar presença', {
      method: 'POST',
      json: { presencas: marcacoes },
    });
  }
}

export const presencaService = new PresencaService();
