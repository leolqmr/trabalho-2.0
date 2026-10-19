import { CheckCircle2, XCircle } from 'lucide-react';

export function PresencaBadge({ present }: { present: boolean }) {
  if (present) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Presente
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
      <XCircle className="h-3.5 w-3.5" />
      Ausente
    </span>
  );
}
