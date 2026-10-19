import { AlertTriangle, CheckCircle2, XOctagon } from 'lucide-react';
import type { NivelFalta } from '../../types/frequencia';

const ESTILOS: Record<NivelFalta, { label: string; classes: string; Icon: typeof CheckCircle2 }> = {
  REGULAR: {
    label: 'Regular',
    classes: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    Icon: CheckCircle2,
  },
  ATENCAO: {
    label: 'Atenção',
    classes: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
    Icon: AlertTriangle,
  },
  CRITICO: {
    label: 'Crítico',
    classes: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    Icon: XOctagon,
  },
};

export function NivelBadge({ nivel }: { nivel: NivelFalta }) {
  const { label, classes, Icon } = ESTILOS[nivel];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
