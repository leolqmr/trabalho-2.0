import { Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { Presenca } from '../presenca.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface PresencaRowProps {
  presenca: Presenca;
  onToggle: (presenca: Presenca, present: boolean) => void;
  onDelete: (presenca: Presenca) => void;
}

const BASE = 'px-3 py-1 text-xs font-medium transition';

export function PresencaRow({ presenca, onToggle, onDelete }: PresencaRowProps) {
  return (
    <TableRow>
      <TableCell className="text-sm text-gray-900 dark:text-gray-100">
        {presenca.email ?? presenca.user_id ?? '—'}
      </TableCell>
      <TableCell>
        {/* Marcação direta: clicar em "Presente" ou "Falta" define a situação do aluno. */}
        <Can
          roles={WRITE_ROLES}
          fallback={
            <span
              className={
                presenca.present
                  ? 'text-xs font-medium text-green-700 dark:text-green-400'
                  : 'text-xs font-medium text-red-700 dark:text-red-400'
              }
            >
              {presenca.present ? 'Presente' : 'Falta'}
            </span>
          }
        >
          <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => !presenca.present && onToggle(presenca, true)}
              aria-pressed={presenca.present}
              className={`${BASE} cursor-pointer ${
                presenca.present
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Presente
            </button>
            <button
              onClick={() => presenca.present && onToggle(presenca, false)}
              aria-pressed={!presenca.present}
              className={`${BASE} cursor-pointer border-l border-gray-300 dark:border-gray-700 ${
                !presenca.present
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              Falta
            </button>
          </div>
        </Can>
      </TableCell>
      <TableCell className="text-right">
        <Can roles={WRITE_ROLES}>
          <button
            onClick={() => onDelete(presenca)}
            title="Remover da chamada"
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Can>
      </TableCell>
    </TableRow>
  );
}
