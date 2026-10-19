import { useMemo, useState } from 'react';
import { Plus, Search, RefreshCw, FolderOpen } from 'lucide-react';
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
import type { CreateTurmaDto, Turma } from '../../modules/turmas/turma.types';
import { TurmaModal } from '../../modules/turmas/components/TurmaModal';
import { TurmaRow } from '../../modules/turmas/components/TurmaRow';
import { useTurmas } from '../../modules/turmas/useTurmas';
import { Can } from '../../components/auth/Can';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { WRITE_ROLES } from '../../utils/enums';

export default function TurmasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [turmaToEdit, setTurmaToEdit] = useState<Turma | null>(null);
  const [newTurmaKey, setNewTurmaKey] = useState(0);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { turmas, isLoading, error, reload, create, update, remove } = useTurmas();

  const handleSave = async (dto: CreateTurmaDto) => {
    try {
      if (turmaToEdit) {
        await update(turmaToEdit.id, dto);
        toast.success('Turma atualizada com sucesso!');
      } else {
        await create(dto);
        toast.success('Turma criada com sucesso!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar turma.');
      throw err; // mantém o modal aberto
    }
  };

  const handleConfirmDelete = async () => {
    if (!turmaToDelete) return;
    try {
      await remove(turmaToDelete);
      toast.success('Turma removida com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover turma.');
    }
  };

  const handleOpenCreate = () => {
    setTurmaToEdit(null);
    setNewTurmaKey((key) => key + 1);
    setIsModalOpen(true);
  };

  const filtered = useMemo(
    () => turmas.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [turmas, searchTerm],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Turmas
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Selecione uma turma para ver as aulas e fazer a chamada.
          </p>
        </div>

        <Can roles={WRITE_ROLES}>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nova Turma
          </button>
        </Can>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <button
          onClick={reload}
          title="Recarregar dados"
          disabled={isLoading}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Frame className="w-full">
        <Table variant="card" exportEnabled={!isLoading && !error && filtered.length > 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Turma</TableHead>
              <TableHead>Criada em</TableHead>
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
            ) : filtered.length === 0 ? (
              <TableMessageRow colSpan={3}>
                <EmptyState
                  icon={FolderOpen}
                  title="Nenhuma turma encontrada"
                  description={
                    searchTerm ? 'Tente outro termo de busca.' : 'Comece criando a primeira turma.'
                  }
                />
              </TableMessageRow>
            ) : (
              filtered.map((turma) => (
                <TurmaRow
                  key={turma.id}
                  turma={turma}
                  aulasHref={`/turmas/${turma.id}/aulas`}
                  alunosHref={`/turmas/${turma.id}/alunos`}
                  onEdit={(t) => {
                    setTurmaToEdit(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={(t) => {
                    setTurmaToDelete(t);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Frame>

      <TurmaModal
        key={turmaToEdit?.id ?? `new-${newTurmaKey}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        turmaToEdit={turmaToEdit}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir turma"
        description={`Deseja realmente excluir "${turmaToDelete?.name}"? Todas as aulas e presenças dela também serão removidas.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
