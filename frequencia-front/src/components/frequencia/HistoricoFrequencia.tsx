import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import type { HistoricoItem } from '../../types/frequencia';
import { EmptyState } from '../EmptyState';
import { formatDataAula } from './format';

/** Lista as aulas com chamada e a situação do aluno em cada uma; dá para filtrar só as faltas. */
export function HistoricoFrequencia({ historico }: { historico: HistoricoItem[] }) {
  const [soFaltas, setSoFaltas] = useState(false);
  const itens = soFaltas ? historico.filter((h) => !h.present) : historico;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Histórico de aulas</h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={soFaltas}
            onChange={(e) => setSoFaltas(e.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          Mostrar só as faltas
        </label>
      </div>

      {itens.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={soFaltas ? 'Nenhuma falta' : 'Nenhuma aula com chamada ainda'}
          description={soFaltas ? 'Nenhuma falta registrada até agora.' : 'As aulas aparecem aqui depois que o professor faz a chamada.'}
        />
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {itens.map((item) => (
            <li key={item.aula_id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm capitalize text-gray-900 dark:text-gray-100">{formatDataAula(item.date)}</span>
              {item.present ? (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Presente
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  Falta
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
