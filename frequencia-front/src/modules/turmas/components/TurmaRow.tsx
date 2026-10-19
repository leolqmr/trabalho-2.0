import { CalendarDays, Edit2, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { Turma } from '../turma.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface TurmaRowProps {
  turma: Turma;
  /** Link para as aulas da turma (montado pela página, módulos não se importam). */
  aulasHref: string;
  /** Link para os alunos da turma (montado pela página). */
  alunosHref: string;
  onEdit: (turma: Turma) => void;
  onDelete: (turma: Turma) => void;
}

export function TurmaRow({ turma, aulasHref, alunosHref, onEdit, onDelete }: TurmaRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Link
          to={aulasHref}
          className="font-semibold text-gray-900 hover:text-red-600 dark:text-gray-100"
        >
          {turma.name}
        </Link>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(turma.createdAt).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={alunosHref}
            title="Ver alunos"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Users className="h-4 w-4" />
            Alunos
          </Link>
          <Link
            to={aulasHref}
            title="Ver aulas"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <CalendarDays className="h-4 w-4" />
            Aulas
          </Link>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onEdit(turma)}
              title="Editar"
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </Can>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onDelete(turma)}
              title="Excluir"
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
