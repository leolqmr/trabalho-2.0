import { RefreshCw, UserX } from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useMinhaFrequencia } from '../../modules/frequencia/useFrequencia';
import { EmptyState } from '../../components/EmptyState';
import { HistoricoFrequencia } from '../../components/frequencia/HistoricoFrequencia';
import { NivelBadge } from '../../components/frequencia/NivelBadge';
import { ResumoFrequenciaCards } from '../../components/frequencia/ResumoFrequenciaCards';
import { TableError } from '../../components/TableError';

/** Visão do aluno: as próprias faltas, o nível e as datas, por turma. */
export default function MinhaFrequenciaPage() {
  const auth = useAuth();
  const email = auth.user?.profile?.email;
  const { turmas, isLoading, error, reload } = useMinhaFrequencia();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          Minha frequência
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Veja quantas faltas você tem, em que dias faltou e como está em relação ao limite.
        </p>
      </div>

      {error ? (
        <TableError error={error} onRetry={reload} />
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : turmas.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="Você ainda não está em nenhuma turma"
          description={`O e-mail ${email ?? 'da sua conta'} não está cadastrado como aluno. Peça ao professor para cadastrar este e-mail na turma.`}
        />
      ) : (
        <div className="space-y-10">
          {turmas.map((item) => (
            <section key={item.aluno.id} aria-label={item.turma.name}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.turma.name}</h2>
                <NivelBadge nivel={item.resumo.nivel} />
              </div>
              <ResumoFrequenciaCards resumo={item.resumo} />
              <div className="mt-6">
                <HistoricoFrequencia historico={item.historico} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
