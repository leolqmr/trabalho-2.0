import { ClipboardCheck, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import { formatAulaDate } from '../aula.types';
import type { Aula } from '../aula.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface AulaRowProps {
  aula: Aula;
  /** Link para a chamada da aula (montado pela página). */
  presencasHref: string;
  onEdit: (aula: Aula) => void;
  onDelete: (aula: Aula) => void;
}

export function AulaRow({ aula, presencasHref, onEdit, onDelete }: AulaRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Link
          to={presencasHref}
          className="font-semibold capitalize text-gray-900 hover:text-red-600 dark:text-gray-100"
        >
          {formatAulaDate(aula.date)}
        </Link>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={presencasHref}
            title="Abrir chamada"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ClipboardCheck className="h-4 w-4" />
            Chamada
          </Link>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onEdit(aula)}
              title="Editar"
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </Can>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onDelete(aula)}
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
