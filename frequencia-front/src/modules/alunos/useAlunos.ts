import { useAsync } from '../../hooks/useAsync';
import { alunoService } from './aluno.service';
import type { Aluno, CreateAlunoDto, UpdateAlunoDto } from './aluno.types';

export function useAlunos(turmaId: string) {
  const { data: alunos = [], isLoading, error, reload } = useAsync(
    () => alunoService.getByTurma(turmaId),
    [turmaId],
  );

  const create = async (dto: CreateAlunoDto) => {
    await alunoService.create(turmaId, dto);
    reload();
  };

  const update = async (id: string, dto: UpdateAlunoDto) => {
    await alunoService.update(turmaId, id, dto);
    reload();
  };

  const remove = async (aluno: Aluno) => {
    await alunoService.remove(turmaId, aluno.id);
    reload();
  };

  return { alunos, isLoading, error, reload, create, update, remove };
}
