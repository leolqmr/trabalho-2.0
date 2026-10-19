import { calcularResumo, nivelDeFalta } from './frequencia.util';

const marcar = (presentes: number, faltas: number) => [
  ...Array.from({ length: presentes }, () => ({ present: true })),
  ...Array.from({ length: faltas }, () => ({ present: false })),
];

describe('calcularResumo', () => {
  it('conta presenças, faltas e o percentual sobre as aulas realizadas', () => {
    expect(calcularResumo(marcar(7, 1), 8)).toEqual({
      aulas_realizadas: 8,
      presencas: 7,
      faltas: 1,
      percentual_faltas: 12.5,
      nivel: 'REGULAR',
      limite_percentual: 25,
    });
  });

  it('não divide por zero quando ainda não houve nenhuma chamada', () => {
    expect(calcularResumo([], 0)).toMatchObject({
      faltas: 0,
      percentual_faltas: 0,
      nivel: 'REGULAR',
    });
  });

  it('o aluno sem marcação em uma aula não leva falta por ela', () => {
    // 8 aulas realizadas, mas ele só foi marcado em 6 (entrou depois): 1 falta = 12,5%.
    expect(calcularResumo(marcar(5, 1), 8).percentual_faltas).toBe(12.5);
  });
});

describe('nivelDeFalta', () => {
  it.each([
    [0, 'REGULAR'],
    [14.9, 'REGULAR'],
    [15, 'ATENCAO'],
    [24.9, 'ATENCAO'],
    [25, 'ATENCAO'],
    [25.1, 'CRITICO'],
    [26, 'CRITICO'],
    [60, 'CRITICO'],
  ])('%s%% de faltas => %s', (percentual, nivel) => {
    expect(nivelDeFalta(percentual)).toBe(nivel);
  });
});
