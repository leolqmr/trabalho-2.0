export type NivelFalta = 'REGULAR' | 'ATENCAO' | 'CRITICO';

/** Resumo de frequência de um aluno numa turma (calculado pelo backend). */
export interface ResumoFrequencia {
  /** Aulas da turma que já tiveram chamada. */
  aulas_realizadas: number;
  presencas: number;
  faltas: number;
  /** Faltas / aulas realizadas, em %. */
  percentual_faltas: number;
  nivel: NivelFalta;
  /** Limite de faltas, em % das aulas realizadas. */
  limite_percentual: number;
}

export interface HistoricoItem {
  aula_id: string;
  /** ISO 8601; é só um dia, formate em UTC (veja `formatDataAula`). */
  date: string;
  present: boolean;
}

export interface FrequenciaAluno {
  aluno: { id: string; name: string; email: string };
  turma: { id: string; name: string };
  resumo: ResumoFrequencia;
  historico: HistoricoItem[];
}
