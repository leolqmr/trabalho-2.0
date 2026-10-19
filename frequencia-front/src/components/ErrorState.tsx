import { RefreshCw } from 'lucide-react';
import { ErrorScreen, buildSupportMailto, httpErrors } from '@cincoders/cinnamon';

const SUPPORT_EMAIL = 'helpdesk@cin.ufpe.br';

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

/**
 * Bloco de erro de carregamento (ilustração padrão da cinnamon + "Tentar
 * novamente" + contato com o suporte). Usado dentro de `<TableMessageRow>` nas
 * listagens. Sem detalhes técnicos na tela: eles vão só no e-mail de suporte.
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center py-4">
      <ErrorScreen errorType={httpErrors.SERVER_ERROR} />
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
        <a
          href={buildSupportMailto(error, SUPPORT_EMAIL, 'frequencia')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Contatar suporte
        </a>
      </div>
    </div>
  );
}
