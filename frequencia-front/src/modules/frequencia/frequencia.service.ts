import { request } from '../../services/http';
import type { FrequenciaAluno } from '../../types/frequencia';

export class FrequenciaService {
  /** GET /me/frequencia — frequência do usuário logado, uma entrada por turma. */
  getMinha(): Promise<FrequenciaAluno[]> {
    return request<FrequenciaAluno[]>('/me/frequencia', 'Erro ao buscar sua frequência');
  }

  /** GET /turmas/:turmaId/alunos/:alunoId/frequencia — visão do professor. */
  getDoAluno(turmaId: string, alunoId: string): Promise<FrequenciaAluno> {
    return request<FrequenciaAluno>(
      `/turmas/${turmaId}/alunos/${alunoId}/frequencia`,
      'Erro ao buscar a frequência do aluno',
    );
  }
}

export const frequenciaService = new FrequenciaService();
