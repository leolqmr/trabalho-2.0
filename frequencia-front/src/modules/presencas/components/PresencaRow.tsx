import { CheckCircle2, Trash2, XCircle } from 'lucide-react';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { Presenca } from '../presenca.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface PresencaRowProps {
  presenca: Presenca;
  onToggle: (presenca: Presenca, present: boolean) => void;
  onDelete: (presenca: Presenca) => void;
}

export function PresencaRow({ presenca, onToggle, onDelete }: PresencaRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-gray-900 dark:text-gray-100">
        {presenca.user_id}
      </TableCell>
      <TableCell>
        {presenca.present ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Presente
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            Ausente
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onToggle(presenca, !presenca.present)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
            >
              Marcar {presenca.present ? 'ausente' : 'presente'}
            </button>
          </Can>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => onDelete(presenca)}
              title="Remover"
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
