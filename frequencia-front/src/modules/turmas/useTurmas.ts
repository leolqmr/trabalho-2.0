import { useAsync } from '../../hooks/useAsync';
import { turmaService } from './turma.service';
import type { CreateTurmaDto, Turma, UpdateTurmaDto } from './turma.types';

export function useTurmas() {
  const { data: turmas = [], isLoading, error, reload } = useAsync(() => turmaService.getAll(), []);

  const create = async (dto: CreateTurmaDto) => {
    await turmaService.create(dto);
    reload();
  };

  const update = async (id: string, dto: UpdateTurmaDto) => {
    await turmaService.update(id, dto);
    reload();
  };

  const remove = async (turma: Turma) => {
    await turmaService.remove(turma.id);
    reload();
  };

  return { turmas, isLoading, error, reload, create, update, remove };
}
