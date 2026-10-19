import { TableCell, TableRow } from '@cincoders/cinnamon';
import type { ChamadaItem } from '../presenca.types';
import { Can } from '../../../components/auth/Can';
import { WRITE_ROLES } from '../../../utils/enums';

interface PresencaRowProps {
  item: ChamadaItem;
  onMarcar: (item: ChamadaItem, present: boolean) => void;
}

const BASE = 'px-3 py-1 text-xs font-medium transition cursor-pointer';
const IDLE = 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800';

function SituacaoTexto({ present }: { present: boolean | null }) {
  if (present === null) return <span className="text-xs text-gray-400">Não marcado</span>;
  return present ? (
    <span className="text-xs font-medium text-green-700 dark:text-green-400">Presente</span>
  ) : (
    <span className="text-xs font-medium text-red-700 dark:text-red-400">Falta</span>
  );
}

export function PresencaRow({ item, onMarcar }: PresencaRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{item.email}</div>
      </TableCell>
      <TableCell className="text-right">
        {/* Clicar em "Presente" ou "Falta" grava na hora a situação do aluno nesta aula. */}
        <Can roles={WRITE_ROLES} fallback={<SituacaoTexto present={item.present} />}>
          <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => item.present !== true && onMarcar(item, true)}
              aria-pressed={item.present === true}
              className={`${BASE} ${item.present === true ? 'bg-green-600 text-white' : IDLE}`}
            >
              Presente
            </button>
            <button
              onClick={() => item.present !== false && onMarcar(item, false)}
              aria-pressed={item.present === false}
              className={`${BASE} border-l border-gray-300 dark:border-gray-700 ${
                item.present === false ? 'bg-red-600 text-white' : IDLE
              }`}
            >
              Falta
            </button>
          </div>
        </Can>
      </TableCell>
    </TableRow>
  );
}
