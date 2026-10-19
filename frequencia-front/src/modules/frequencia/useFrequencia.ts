import { useAsync } from '../../hooks/useAsync';
import { frequenciaService } from './frequencia.service';

export function useMinhaFrequencia() {
  const { data: turmas = [], isLoading, error, reload } = useAsync(
    () => frequenciaService.getMinha(),
    [],
  );
  return { turmas, isLoading, error, reload };
}

export function useFrequenciaDoAluno(turmaId: string, alunoId: string) {
  const { data, isLoading, error, reload } = useAsync(
    () => frequenciaService.getDoAluno(turmaId, alunoId),
    [turmaId, alunoId],
  );
  return { frequencia: data, isLoading, error, reload };
}
