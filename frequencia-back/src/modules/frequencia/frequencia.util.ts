/** Limite de faltas (% das aulas realizadas) a partir do qual o aluno está em situação crítica. */
export const LIMITE_FALTAS_PERCENTUAL = 25;

/** A partir deste percentual o aluno entra em atenção (60% do limite). */
export const ATENCAO_FALTAS_PERCENTUAL = 15;

export type NivelFalta = 'REGULAR' | 'ATENCAO' | 'CRITICO';

export interface ResumoFrequencia {
  /** Aulas da turma que já tiveram chamada registrada. */
  aulas_realizadas: number;
  presencas: number;
  faltas: number;
  /** Faltas / aulas realizadas, em % com 1 casa decimal. */
  percentual_faltas: number;
  nivel: NivelFalta;
  limite_percentual: number;
}

export function nivelDeFalta(percentualFaltas: number): NivelFalta {
  if (percentualFaltas >= LIMITE_FALTAS_PERCENTUAL) return 'CRITICO';
  if (percentualFaltas >= ATENCAO_FALTAS_PERCENTUAL) return 'ATENCAO';
  return 'REGULAR';
}

/**
 * Resume a frequência de um aluno. `marcacoes` são as presenças registradas
 * para ele (`present` true/false); `aulasRealizadas` é o total de aulas da
 * turma com chamada feita — o denominador do percentual de faltas.
 */
export function calcularResumo(
  marcacoes: { present: boolean }[],
  aulasRealizadas: number,
): ResumoFrequencia {
  const presencas = marcacoes.filter((m) => m.present).length;
  const faltas = marcacoes.length - presencas;
  const percentual_faltas =
    aulasRealizadas > 0 ? Math.round((faltas / aulasRealizadas) * 1000) / 10 : 0;

  return {
    aulas_realizadas: aulasRealizadas,
    presencas,
    faltas,
    percentual_faltas,
    nivel: nivelDeFalta(percentual_faltas),
    limite_percentual: LIMITE_FALTAS_PERCENTUAL,
  };
}
