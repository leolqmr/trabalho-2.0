import { request } from '../../services/http';

export interface EstadoChamadaCodigo {
  id: string;
  iniciadoEm: string;
  expiraEm: string;
  encerradoEm: string | null;
  ativa: boolean;
  presentes: number;
}

export interface ChamadaCodigoAberta {
  id: string;
  codigo: string;
  iniciadoEm: string;
  expiraEm: string;
  encerradoEm: null;
  ativa: true;
}

export interface ChamadaCodigoAluno {
  id: string;
  expiraEm: string;
  registrada: boolean;
  aula: {
    id: string;
    date: string;
    turma: { id: string; name: string };
  };
}

export const chamadaCodigoService = {
  status: (aulaId: string) =>
    request<EstadoChamadaCodigo | null>(`/aulas/${aulaId}/chamada-codigo`, 'Erro ao consultar a chamada'),
  abrir: (aulaId: string, duracaoMinutos: number) =>
    request<ChamadaCodigoAberta>(`/aulas/${aulaId}/chamada-codigo`, 'Erro ao abrir chamada', {
      method: 'POST',
      json: { duracaoMinutos },
    }),
  encerrar: (aulaId: string) =>
    request<void>(`/aulas/${aulaId}/chamada-codigo`, 'Erro ao encerrar chamada', { method: 'DELETE' }),
  abertas: () => request<ChamadaCodigoAluno[]>('/me/chamadas-codigo', 'Erro ao consultar chamadas abertas'),
  registrar: (chamadaId: string, codigo: string) =>
    request<{ aula_id: string; registrada: boolean }>(
      `/me/chamadas-codigo/${chamadaId}/registrar`,
      'Não foi possível registrar sua presença',
      { method: 'POST', json: { codigo } },
    ),
};
