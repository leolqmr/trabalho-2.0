import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, UserX } from 'lucide-react';
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
import type { Aluno, CreateAlunoDto } from '../../modules/alunos/aluno.types';
import { AlunoModal } from '../../modules/alunos/components/AlunoModal';
import { AlunoRow } from '../../modules/alunos/components/AlunoRow';
import { useAlunos } from '../../modules/alunos/useAlunos';
import { turmaService } from '../../modules/turmas/turma.service';
import { useAsync } from '../../hooks/useAsync';
import { Can } from '../../components/auth/Can';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { Links, WRITE_ROLES } from '../../utils/enums';

export default function AlunosPage() {
  const { turmaId = '' } = useParams<{ turmaId: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alunoToEdit, setAlunoToEdit] = useState<Aluno | null>(null);
  const [newAlunoKey, setNewAlunoKey] = useState(0);
  const [alunoToDelete, setAlunoToDelete] = useState<Aluno | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: turma } = useAsync(() => turmaService.getById(turmaId).catch(() => null), [turmaId]);
  const { alunos, isLoading, error, reload, create, update, remove } = useAlunos(turmaId);

  const handleSave = async (dto: CreateAlunoDto) => {
    try {
      if (alunoToEdit) {
        await update(alunoToEdit.id, dto);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await create(dto);
        toast.success('Aluno cadastrado na turma!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar aluno.');
      throw err; // mantém o modal aberto
    }
  };

  const handleConfirmDelete = async () => {
    if (!alunoToDelete) return;
    try {
      await remove(alunoToDelete);
      toast.success('Aluno removido da turma.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover aluno.');
    }
  };

  const handleOpenCreate = () => {
    setAlunoToEdit(null);
    setNewAlunoKey((key) => key + 1);
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
            Alunos{turma ? ` — ${turma.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Cadastre os alunos uma vez. Em cada aula, eles já aparecem na chamada para marcar presente ou falta.
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
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Novo Aluno
            </button>
          </Can>
        </div>
      </div>

      <Frame className="w-full">
        <Table variant="card" exportEnabled={!isLoading && !error && alunos.length > 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
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
            ) : alunos.length === 0 ? (
              <TableMessageRow colSpan={3}>
                <EmptyState
                  icon={UserX}
                  title="Nenhum aluno cadastrado"
                  description="Cadastre os alunos desta turma para poder fazer a chamada das aulas."
                />
              </TableMessageRow>
            ) : (
              alunos.map((aluno) => (
                <AlunoRow
                  key={aluno.id}
                  aluno={aluno}
                  onEdit={(a) => {
                    setAlunoToEdit(a);
                    setIsModalOpen(true);
                  }}
                  onDelete={(a) => {
                    setAlunoToDelete(a);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Frame>

      <AlunoModal
        key={alunoToEdit?.id ?? `new-${newAlunoKey}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        alunoToEdit={alunoToEdit}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Remover aluno"
        description={`Deseja remover "${alunoToDelete?.name}" da turma? As presenças e faltas dele em todas as aulas também serão apagadas.`}
        confirmLabel="Remover"
      />
    </div>
  );
}
