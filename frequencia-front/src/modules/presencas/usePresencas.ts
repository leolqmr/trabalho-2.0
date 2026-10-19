import { useAsync } from '../../hooks/useAsync';
import { presencaService } from './presenca.service';
import type { ChamadaItem } from './presenca.types';

export function usePresencas(aulaId: string) {
  const { data: chamada = [], isLoading, error, reload } = useAsync(
    () => presencaService.getChamada(aulaId),
    [aulaId],
  );

  const marcar = async (item: ChamadaItem, present: boolean) => {
    await presencaService.registrar(aulaId, [{ aluno_id: item.aluno_id, present }]);
    reload();
  };

  /** Marca a mesma situação para todos os alunos da turma de uma vez. */
  const marcarTodos = async (present: boolean) => {
    await presencaService.registrar(
      aulaId,
      chamada.map((item) => ({ aluno_id: item.aluno_id, present })),
    );
    reload();
  };

  return { chamada, isLoading, error, reload, marcar, marcarTodos };
}
