import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, Users } from 'lucide-react';
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
import type { Presenca } from '../../modules/presencas/presenca.types';
import { PresencaModal } from '../../modules/presencas/components/PresencaModal';
import { PresencaRow } from '../../modules/presencas/components/PresencaRow';
import { usePresencas } from '../../modules/presencas/usePresencas';
import { aulaService } from '../../modules/aulas/aula.service';
import { formatAulaDate } from '../../modules/aulas/aula.types';
import { useAsync } from '../../hooks/useAsync';
import { Can } from '../../components/auth/Can';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { WRITE_ROLES } from '../../utils/enums';

export default function PresencasPage() {
  const { aulaId = '' } = useParams<{ aulaId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [toDelete, setToDelete] = useState<Presenca | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: aula } = useAsync(() => aulaService.getById(aulaId).catch(() => null), [aulaId]);
  const { presencas, isLoading, error, reload, add, setPresent, remove } = usePresencas(aulaId);

  const presentes = presencas.filter((p) => p.present).length;

  const handleAdd = async (userId: string, present: boolean) => {
    try {
      await add(userId, present);
      toast.success('Participante adicionado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao adicionar participante.');
      throw err;
    }
  };

  const handleToggle = async (presenca: Presenca, present: boolean) => {
    try {
      await setPresent(presenca, present);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar presença.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete);
      toast.success('Participante removido da chamada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover participante.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Se a aula carregou, volta para as aulas da turma; senão, para a lista de turmas. */}
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
            {presencas.length > 0
              ? `${presentes} presente(s) de ${presencas.length} participante(s).`
              : 'Adicione os participantes e marque quem esteve presente.'}
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
          <Can roles={WRITE_ROLES}>
            <button
              onClick={() => {
                setModalKey((key) => key + 1);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Adicionar Participante
            </button>
          </Can>
        </div>
      </div>

      <Frame className="w-full">
        <Table variant="card" exportEnabled={!isLoading && !error && presencas.length > 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Participante (ID)</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={3} />
            ) : error ? (
              <TableMessageRow colSpan={3}>
                <TableError error={error} onRetry={reload} />
              </TableMessageRow>
            ) : presencas.length === 0 ? (
              <TableMessageRow colSpan={3}>
                <EmptyState
                  icon={Users}
                  title="Nenhum participante na chamada"
                  description="Adicione participantes para registrar a presença desta aula."
                />
              </TableMessageRow>
            ) : (
              presencas.map((presenca) => (
                <PresencaRow
                  key={presenca.id}
                  presenca={presenca}
                  onToggle={handleToggle}
                  onDelete={(p) => {
                    setToDelete(p);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Frame>

      <PresencaModal
        key={`presenca-${modalKey}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Remover participante"
        description="Deseja remover este participante da chamada?"
        confirmLabel="Remover"
      />
    </div>
  );
}
