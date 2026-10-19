import { Link } from 'react-router-dom';
import { RefreshCw, UserPlus, Users } from 'lucide-react';
import {
  Frame,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableMessageRow,
  TableRow,
  TableSkeletonRows,
  Text,
} from '@cincoders/cinnamon';
import { useUsuarios } from '../../modules/usuarios/useUsuarios';
import type { UsuarioKeycloak } from '../../modules/usuarios/usuario.types';
import { EmptyState } from '../../components/EmptyState';
import { TableError } from '../../components/TableError';
import { Links } from '../../utils/enums';

const PERFIL_LABEL: Record<UsuarioKeycloak['perfil'], string> = {
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
  SEM_PERFIL: 'Sem perfil',
};

/** Equipe = todos os logins cadastrados no Keycloak (professores e alunos). Só ADMIN. */
export default function TeamPage() {
  const { usuarios, isLoading, error, reload } = useUsuarios();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <Text variant="title">Gerenciamento de Equipe</Text>
          <Text variant="description">
            Todos os logins cadastrados no Keycloak: professores e alunos.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            title="Recarregar"
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to={Links.USUARIOS}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            <UserPlus className="h-4 w-4" />
            Novo login
          </Link>
        </div>
      </div>

      <Frame className="w-full">
        <Table variant="card">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={4} />
            ) : error ? (
              <TableMessageRow colSpan={4}>
                <TableError error={error} onRetry={reload} />
              </TableMessageRow>
            ) : usuarios.length === 0 ? (
              <TableMessageRow colSpan={4}>
                <EmptyState icon={Users} title="Nenhum login encontrado" description="Crie o primeiro login." />
              </TableMessageRow>
            ) : (
              usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{u.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{u.username}</div>
                  </TableCell>
                  <TableCell>{u.email ?? '—'}</TableCell>
                  <TableCell>{PERFIL_LABEL[u.perfil]}</TableCell>
                  <TableCell>{u.enabled ? 'Ativo' : 'Desativado'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Frame>
    </div>
  );
}
