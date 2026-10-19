import { useAsync } from '../../hooks/useAsync';
import { presencaService } from './presenca.service';
import type { Presenca } from './presenca.types';

export function usePresencas(aulaId: string) {
  const { data: presencas = [], isLoading, error, reload } = useAsync(
    () => presencaService.getByAula(aulaId),
    [aulaId],
  );

  const add = async (userId: string, present: boolean) => {
    await presencaService.create({ aula_id: aulaId, user_id: userId, present });
    reload();
  };

  const setPresent = async (presenca: Presenca, present: boolean) => {
    await presencaService.setPresent(presenca.id, present);
    reload();
  };

  const remove = async (presenca: Presenca) => {
    await presencaService.remove(presenca.id);
    reload();
  };

  return { presencas, isLoading, error, reload, add, setPresent, remove };
}
