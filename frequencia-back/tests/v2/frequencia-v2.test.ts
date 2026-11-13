/** Sprint 3 / V2 — casos T40-T48 da matriz. */
import { describe, expect, it } from 'vitest';
import { calcularResumo, nivelDeFalta } from '../../src/modules/frequencia/frequencia.util';

// US04 CA04.1 — partição e valor-limite regular
it('T40 [PE regular] zero por cento', () => {
  expect(nivelDeFalta(0)).toBe('REGULAR');
});
it('T41 [VL 14.9] imediatamente abaixo de atenção', () => {
  expect(nivelDeFalta(14.9)).toBe('REGULAR');
});

// US04 CA04.2 — início, interior e fim da atenção
it('T42 [VL 15] início inclusivo da atenção', () => {
  expect(nivelDeFalta(15)).toBe('ATENCAO');
});
it('T43 [PE atenção] vinte por cento', () => {
  expect(nivelDeFalta(20)).toBe('ATENCAO');
});
it('T44 [VL 25] limite inclusivo da atenção', () => {
  expect(nivelDeFalta(25)).toBe('ATENCAO');
});

// US04 CA04.3 — início e interior da faixa crítica
it('T45 [VL 25.1] acima do limite de faltas', () => {
  expect(nivelDeFalta(25.1)).toBe('CRITICO');
});
it('T46 [PE crítico] cinquenta por cento', () => {
  expect(nivelDeFalta(50)).toBe('CRITICO');
});

// US04 CA04.4 — cálculo e divisão por zero
it('T47 [PE fração] arredonda 1 falta / 3 aulas para 33,3%', () => {
  const resumo = calcularResumo([{ present: true }, { present: true }, { present: false }], 3);
  expect(resumo).toMatchObject({ aulas_realizadas: 3, presencas: 2, faltas: 1,
    percentual_faltas: 33.3, nivel: 'CRITICO', limite_percentual: 25 });
});
it('T48 [VL zero] sem aulas registra zero e não divide por zero', () => {
  expect(calcularResumo([], 0)).toMatchObject({ aulas_realizadas: 0, presencas: 0,
    faltas: 0, percentual_faltas: 0, nivel: 'REGULAR' });
});
