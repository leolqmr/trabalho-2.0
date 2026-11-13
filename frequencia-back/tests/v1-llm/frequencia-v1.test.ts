/** Sprint 3, V1 LLM. US04 - cálculo e níveis de faltas. */
import { describe, expect, it } from 'vitest';
import { calcularResumo, nivelDeFalta } from '../../src/modules/frequencia/frequencia.util';

describe('US04 - cálculo de faltas', () => {
  // US04-CA01 — partição regular; oráculo a conferir com critério de aceitação.
  it('CT19 [partição regular] menos de 15% significa REGULAR', () => {
    expect(nivelDeFalta(14.9)).toBe('REGULAR');
  });
  // US04-CA01 — limite 15; oráculo a conferir com critério de aceitação.
  it('CT20 [limite 15] 15% significa ATENCAO', () => {
    expect(nivelDeFalta(15)).toBe('ATENCAO');
  });
  // US04-CA01 — limite 25; oráculo a conferir com critério de aceitação.
  it('CT21 [limite 25] 25% ainda significa ATENCAO', () => {
    expect(nivelDeFalta(25)).toBe('ATENCAO');
  });
  // US04-CA01 — limite acima de 25; oráculo a conferir com critério de aceitação.
  it('CT22 [limite acima de 25] 25,1% significa CRITICO', () => {
    expect(nivelDeFalta(25.1)).toBe('CRITICO');
  });
  // US04-CA02 — partição com dados; oráculo a conferir com critério de aceitação.
  it('CT23 [partição com dados] calcula presença e falta sobre aulas realizadas', () => {
    const r = calcularResumo([{ present: true }, { present: false }, { present: true }], 4);
    expect(r).toEqual({
      aulas_realizadas: 4, presencas: 2, faltas: 1, percentual_faltas: 25,
      nivel: 'ATENCAO', limite_percentual: 25,
    });
  });
  // US04-CA02 — limite zero aulas; oráculo a conferir com critério de aceitação.
  it('CT24 [limite zero aulas] não divide por zero', () => {
    const r = calcularResumo([], 0);
    expect(r.percentual_faltas).toBe(0);
    expect(r.nivel).toBe('REGULAR');
  });
});
