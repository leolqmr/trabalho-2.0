import { Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { AlunoComResumo } from '../aluno.types';
import { Can } from '../../../components/auth/Can';
import { NivelBadge } from '../../../components/frequencia/NivelBadge';
import { formatPercentual } from '../../../components/frequencia/format';
import { WRITE_ROLES } from '../../../utils/enums';

interface AlunoRowProps {
  aluno: AlunoComResumo;
  /** Link para o detalhe de frequência do aluno (montado pela página). */
  detalheHref: string;
  onEdit: (aluno: AlunoComResumo) => void;
  onDelete: (aluno: AlunoComResumo) => void;
}

export function AlunoRow({ aluno, detalheHref, onEdit, onDelete }: AlunoRowProps) {
  const { resumo } = aluno;

  return (
    <TableRow>
      <TableCell>
        <Link to={detalheHref} className="font-semibold text-gray-900 hover:text-red-600 dark:text-gray-100">
          {aluno.name}
        </Link>
        <div className="text-xs text-gray-500 dark:text-gray-400">{aluno.email}</div>
      </TableCell>
      <TableCell className="text-sm text-gray-700 dark:text-gray-300">{resumo.presencas}</TableCell>
      <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-100">{resumo.faltas}</TableCell>
      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
        {formatPercentual(resumo.percentual_faltas)}
      </TableCell>
      <TableCell>
        <NivelBadge nivel={resumo.nivel} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={detalheHref}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Ver faltas
          </Link>
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
