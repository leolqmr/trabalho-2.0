import { useAsync } from '../../hooks/useAsync';
import { presencaService } from './presenca.service';
import type { Presenca } from './presenca.types';

export function usePresencas(aulaId: string) {
  const { data: presencas = [], isLoading, error, reload } = useAsync(
    () => presencaService.getByAula(aulaId),
    [aulaId],
  );

  const add = async (email: string, present: boolean) => {
    await presencaService.registrar(aulaId, [{ email, present }]);
    reload();
  };

  const setPresent = async (presenca: Presenca, present: boolean) => {
    await presencaService.registrar(aulaId, [{ email: presenca.email ?? '', present }]);
    reload();
  };

  const remove = async (presenca: Presenca) => {
    await presencaService.remove(aulaId, presenca.id);
    reload();
  };

  return { presencas, isLoading, error, reload, add, setPresent, remove };
}
