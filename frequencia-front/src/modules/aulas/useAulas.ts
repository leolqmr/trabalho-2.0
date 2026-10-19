import { useAsync } from '../../hooks/useAsync';
import { aulaService } from './aula.service';
import type { Aula, UpdateAulaDto } from './aula.types';

export function useAulas(turmaId: string) {
  const { data: aulas = [], isLoading, error, reload } = useAsync(
    () => aulaService.getByTurma(turmaId),
    [turmaId],
  );

  const create = async (date: string) => {
    await aulaService.create({ date, turma_id: turmaId });
    reload();
  };

  const update = async (id: string, dto: UpdateAulaDto) => {
    await aulaService.update(id, dto);
    reload();
  };

  const remove = async (aula: Aula) => {
    await aulaService.remove(aula.id);
    reload();
  };

  return { aulas, isLoading, error, reload, create, update, remove };
}
