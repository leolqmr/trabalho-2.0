import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCheck, RefreshCw, Users } from 'lucide-react';
import {
  Frame,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableMessageRow,
  TableRow,
  TableSkeletonRows,
  toast,
} from '@cincoders/cinnamon';
import type { ChamadaItem } from '../../modules/presencas/presenca.types';
import { PresencaRow } from '../../modules/presencas/components/PresencaRow';
import { usePresencas } from '../../modules/presencas/usePresencas';
import { aulaService } from '../../modules/aulas/aula.service';
import { formatAulaDate } from '../../modules/aulas/aula.types';
import { useAsync } from '../../hooks/useAsync';
import { Can } from '../../components/auth/Can';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { WRITE_ROLES } from '../../utils/enums';

export default function PresencasPage() {
  const { aulaId = '' } = useParams<{ aulaId: string }>();

  const { data: aula } = useAsync(() => aulaService.getById(aulaId).catch(() => null), [aulaId]);
  const { chamada, isLoading, error, reload, marcar, marcarTodos } = usePresencas(aulaId);

  const presentes = chamada.filter((c) => c.present === true).length;
  const faltas = chamada.filter((c) => c.present === false).length;
  const pendentes = chamada.length - presentes - faltas;

  const handleMarcar = async (item: ChamadaItem, present: boolean) => {
    try {
      await marcar(item, present);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao registrar presença.');
    }
  };

  const handleMarcarTodos = async () => {
    try {
      await marcarTodos(true);
      toast.success('Todos marcados como presentes. Ajuste as faltas abaixo.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao registrar presenças.');
    }
  };

  const alunosHref = aula ? `/turmas/${aula.turma_id}/alunos` : '/turmas';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={aula ? `/turmas/${aula.turma_id}/aulas` : '/turmas'}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para aulas
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Chamada{aula ? ` — ${formatAulaDate(aula.date)}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {chamada.length > 0
              ? `${presentes} presente(s), ${faltas} falta(s)${pendentes > 0 ? `, ${pendentes} ainda sem marcação` : ''} — ${chamada.length} aluno(s).`
              : 'Os alunos cadastrados na turma aparecem aqui para você marcar presente ou falta.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            title="Recarregar dados"
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to={alunosHref}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Users className="h-4 w-4" />
            Gerenciar alunos
          </Link>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={handleMarcarTodos}
              disabled={chamada.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCheck className="h-4 w-4" />
              Todos presentes
            </button>
          </Can>
        </div>
      </div>

      <Frame className="w-full">
        <Table variant="card" exportEnabled={!isLoading && !error && chamada.length > 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead className="text-right">Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={2} />
            ) : error ? (
              <TableMessageRow colSpan={2}>
                <TableError error={error} onRetry={reload} />
              </TableMessageRow>
            ) : chamada.length === 0 ? (
              <TableMessageRow colSpan={2}>
                <EmptyState
                  icon={Users}
                  title="Nenhum aluno na turma"
                  description="Cadastre os alunos da turma em “Gerenciar alunos” para fazer a chamada."
                />
              </TableMessageRow>
            ) : (
              chamada.map((item) => (
                <PresencaRow key={item.aluno_id} item={item} onMarcar={handleMarcar} />
              ))
            )}
          </TableBody>
        </Table>
      </Frame>
    </div>
  );
}
