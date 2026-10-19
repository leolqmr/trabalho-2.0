import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, CalendarX, Users } from 'lucide-react';
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
import type { Aula } from '../../modules/aulas/aula.types';
import { AulaModal } from '../../modules/aulas/components/AulaModal';
import { AulaRow } from '../../modules/aulas/components/AulaRow';
import { useAulas } from '../../modules/aulas/useAulas';
import { turmaService } from '../../modules/turmas/turma.service';
import { useAsync } from '../../hooks/useAsync';
import { Can } from '../../components/auth/Can';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { WRITE_ROLES, Links } from '../../utils/enums';
import { formatAulaDate } from '../../modules/aulas/aula.types';

export default function AulasPage() {
  const { turmaId = '' } = useParams<{ turmaId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aulaToEdit, setAulaToEdit] = useState<Aula | null>(null);
  const [newAulaKey, setNewAulaKey] = useState(0);
  const [aulaToDelete, setAulaToDelete] = useState<Aula | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: turma } = useAsync(() => turmaService.getById(turmaId).catch(() => null), [turmaId]);
  const { aulas, isLoading, error, reload, create, update, remove } = useAulas(turmaId);

  // Mais recentes primeiro.
  const sorted = [...aulas].sort((a, b) => b.date.localeCompare(a.date));

  const handleSave = async (date: string) => {
    try {
      if (aulaToEdit) {
        await update(aulaToEdit.id, { date });
        toast.success('Aula atualizada com sucesso!');
      } else {
        await create(date);
        toast.success('Aula criada com sucesso!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar aula.');
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!aulaToDelete) return;
    try {
      await remove(aulaToDelete);
      toast.success('Aula removida com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover aula.');
    }
  };

  const handleOpenCreate = () => {
    setAulaToEdit(null);
    setNewAulaKey((key) => key + 1);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={Links.TURMAS}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para turmas
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Aulas{turma ? ` — ${turma.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Abra uma aula para registrar a presença dos participantes.
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
            to={`/turmas/${turmaId}/alunos`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Users className="h-4 w-4" />
            Alunos
          </Link>
          <Can roles={WRITE_ROLES}>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nova Aula
            </button>
          </Can>
        </div>
      </div>

      <Frame className="w-full">
        <Table variant="card" exportEnabled={!isLoading && !error && sorted.length > 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={2} />
            ) : error ? (
              <TableMessageRow colSpan={2}>
                <TableError error={error} onRetry={reload} />
              </TableMessageRow>
            ) : sorted.length === 0 ? (
              <TableMessageRow colSpan={2}>
                <EmptyState
                  icon={CalendarX}
                  title="Nenhuma aula cadastrada"
                  description="Crie a primeira aula desta turma para começar a registrar presença."
                />
              </TableMessageRow>
            ) : (
              sorted.map((aula) => (
                <AulaRow
                  key={aula.id}
                  aula={aula}
                  presencasHref={`/aulas/${aula.id}/presencas`}
                  onEdit={(a) => {
                    setAulaToEdit(a);
                    setIsModalOpen(true);
                  }}
                  onDelete={(a) => {
                    setAulaToDelete(a);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Frame>

      <AulaModal
        key={aulaToEdit?.id ?? `new-${newAulaKey}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        aulaToEdit={aulaToEdit}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir aula"
        description={`Deseja realmente excluir a aula de ${aulaToDelete ? formatAulaDate(aulaToDelete.date) : ''}? As presenças registradas serão removidas.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
