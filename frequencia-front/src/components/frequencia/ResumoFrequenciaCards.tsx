import type { NivelFalta, ResumoFrequencia } from '../../types/frequencia';
import { formatPercentual } from './format';
import { NivelBadge } from './NivelBadge';

const BARRA: Record<NivelFalta, string> = {
  REGULAR: 'bg-green-500',
  ATENCAO: 'bg-yellow-500',
  CRITICO: 'bg-red-600',
};

function Card({ titulo, valor, destaque }: { titulo: string; valor: string | number; destaque?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{titulo}</div>
      <div className={`mt-1 text-2xl font-bold ${destaque ?? 'text-gray-900 dark:text-gray-100'}`}>{valor}</div>
    </div>
  );
}

/** Números da frequência + barra de faltas em relação ao limite da turma. */
export function ResumoFrequenciaCards({ resumo }: { resumo: ResumoFrequencia }) {
  const usado = Math.min(100, (resumo.percentual_faltas / resumo.limite_percentual) * 100);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card titulo="Aulas com chamada" valor={resumo.aulas_realizadas} />
        <Card titulo="Presenças" valor={resumo.presencas} destaque="text-green-700 dark:text-green-400" />
        <Card titulo="Faltas" valor={resumo.faltas} destaque={resumo.faltas > 0 ? 'text-red-700 dark:text-red-400' : undefined} />
        <Card titulo="% de faltas" valor={formatPercentual(resumo.percentual_faltas)} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            {formatPercentual(resumo.percentual_faltas)} de faltas — limite de {resumo.limite_percentual}%
          </span>
          <NivelBadge nivel={resumo.nivel} />
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(usado)}
          aria-label="Faltas em relação ao limite"
          className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <div className={`h-full rounded-full ${BARRA[resumo.nivel]}`} style={{ width: `${usado}%` }} />
        </div>
      </div>
    </div>
  );
}
