import { Edit2, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { Aluno } from '../aluno.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface AlunoRowProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (aluno: Aluno) => void;
}

export function AlunoRow({ aluno, onEdit, onDelete }: AlunoRowProps) {
  return (
    <TableRow>
      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{aluno.name}</TableCell>
      <TableCell className="text-sm text-gray-600 dark:text-gray-400">{aluno.email}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onEdit(aluno)}
              title="Editar"
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </Can>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onDelete(aluno)}
              title="Remover da turma"
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Can>
        </div>
      </TableCell>
    </TableRow>
  );
}
