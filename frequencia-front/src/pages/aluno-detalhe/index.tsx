import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useFrequenciaDoAluno } from '../../modules/frequencia/useFrequencia';
import { HistoricoFrequencia } from '../../components/frequencia/HistoricoFrequencia';
import { NivelBadge } from '../../components/frequencia/NivelBadge';
import { ResumoFrequenciaCards } from '../../components/frequencia/ResumoFrequenciaCards';
import { TableError } from '../../components/TableError';

/** Visão do professor: frequência detalhada de um aluno da turma. */
export default function AlunoDetalhePage() {
  const { turmaId = '', alunoId = '' } = useParams<{ turmaId: string; alunoId: string }>();
  const { frequencia, isLoading, error, reload } = useFrequenciaDoAluno(turmaId, alunoId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={`/turmas/${turmaId}/alunos`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para os alunos
      </Link>

      {error ? (
        <TableError error={error} onRetry={reload} />
      ) : isLoading || !frequencia ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                {frequencia.aluno.name}
              </h1>
              <NivelBadge nivel={frequencia.resumo.nivel} />
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {frequencia.aluno.email} — {frequencia.turma.name}
            </p>
          </div>

          <ResumoFrequenciaCards resumo={frequencia.resumo} />
          <div className="mt-8">
            <HistoricoFrequencia historico={frequencia.historico} />
          </div>
        </>
      )}
    </div>
  );
}
