import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HistoricoFrequencia } from './HistoricoFrequencia';
import { ResumoFrequenciaCards } from './ResumoFrequenciaCards';
import { formatDataAula } from './format';

describe('formatDataAula', () => {
  it('mostra o dia certo mesmo no fuso do Brasil (a data é guardada em UTC)', () => {
    expect(formatDataAula('2026-10-19T00:00:00.000Z')).toContain('19/10/2026');
  });
});

describe('<ResumoFrequenciaCards>', () => {
  it('mostra faltas, percentual e a situação do aluno', () => {
    render(
      <ResumoFrequenciaCards
        resumo={{
          aulas_realizadas: 8,
          presencas: 5,
          faltas: 3,
          percentual_faltas: 30,
          nivel: 'CRITICO',
          limite_percentual: 25,
        }}
      />,
    );

    expect(screen.getByText('Crítico')).toBeInTheDocument();
    expect(screen.getByText(/limite de 25%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});

describe('<HistoricoFrequencia>', () => {
  const historico = [
    { aula_id: 'a2', date: '2026-10-08T00:00:00.000Z', present: false },
    { aula_id: 'a1', date: '2026-10-01T00:00:00.000Z', present: true },
  ];

  it('lista todas as aulas e filtra só as faltas', () => {
    render(<HistoricoFrequencia historico={historico} />);

    expect(screen.getByText('Presente')).toBeInTheDocument();
    expect(screen.getByText('Falta')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/só as faltas/i));

    expect(screen.queryByText('Presente')).toBeNull();
    expect(screen.getByText('Falta')).toBeInTheDocument();
  });

  it('avisa quando ainda não há nenhuma aula com chamada', () => {
    render(<HistoricoFrequencia historico={[]} />);
    expect(screen.getByText(/Nenhuma aula com chamada ainda/i)).toBeInTheDocument();
  });
});
