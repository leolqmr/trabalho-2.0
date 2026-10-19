import { KeyRound, Trash2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableMessageRow,
  TableRow,
  TableSkeletonRows,
} from '@cincoders/cinnamon';
import { EmptyState } from '../../../components/EmptyState';
import { TableError } from '../../../components/TableError';
import type { UsuarioKeycloak } from '../usuario.types';

const PERFIL_LABEL: Record<UsuarioKeycloak['perfil'], string> = {
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
  SEM_PERFIL: 'Sem perfil',
};

interface UsuariosTableProps {
  usuarios: UsuarioKeycloak[];
  isLoading: boolean;
  error: Error | null | undefined;
  onRetry: () => void;
  /** `sub` do login atual: ele não pode apagar o próprio acesso. */
  currentUserId?: string;
  onResetPassword: (u: UsuarioKeycloak) => void;
  onDelete: (u: UsuarioKeycloak) => void;
}

export function UsuariosTable({
  usuarios,
  isLoading,
  error,
  onRetry,
  currentUserId,
  onResetPassword,
  onDelete,
}: UsuariosTableProps) {
  return (
    <Table variant="card">
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Login (e-mail)</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeletonRows columns={4} />
        ) : error ? (
          <TableMessageRow colSpan={4}>
            <TableError error={error} onRetry={onRetry} />
          </TableMessageRow>
        ) : usuarios.length === 0 ? (
          <TableMessageRow colSpan={4}>
            <EmptyState icon={Users} title="Nenhum login" description="Crie o primeiro acima." />
          </TableMessageRow>
        ) : (
          usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{u.name}</div>
              </TableCell>
              <TableCell>{u.email ?? u.username}</TableCell>
              <TableCell>{PERFIL_LABEL[u.perfil]}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onResetPassword(u)}
                    title="Definir nova senha"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4" />
                    Nova senha
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    disabled={u.id === currentUserId}
                    title={u.id === currentUserId ? 'Você não pode apagar o próprio login' : 'Apagar login'}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
