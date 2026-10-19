import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { RefreshCw } from 'lucide-react';
import { Frame, Text, toast } from '@cincoders/cinnamon';
import { SenhaModal } from '../../modules/usuarios/components/SenhaModal';
import { UsuarioForm } from '../../modules/usuarios/components/UsuarioForm';
import { UsuariosTable } from '../../modules/usuarios/components/UsuariosTable';
import { usuarioService } from '../../modules/usuarios/usuario.service';
import type { CreateUsuarioDto, UsuarioKeycloak } from '../../modules/usuarios/usuario.types';
import { useUsuarios } from '../../modules/usuarios/useUsuarios';
import { useTurmas } from '../../modules/turmas/useTurmas';
import { ConfirmDialog } from '../../components/ConfirmDialog';

interface Credencial {
  email: string;
  password: string;
}

export default function UsuariosPage() {
  const auth = useAuth();
  const { turmas } = useTurmas();
  const { usuarios, isLoading, error, reload } = useUsuarios();
  const [criado, setCriado] = useState<Credencial | null>(null);
  const [senhaDe, setSenhaDe] = useState<UsuarioKeycloak | null>(null);
  const [apagar, setApagar] = useState<UsuarioKeycloak | null>(null);

  const handleCreate = async (dto: CreateUsuarioDto) => {
    try {
      const u = await usuarioService.create(dto);
      setCriado({ email: u.email, password: dto.password });
      toast.success(`Login criado: ${u.email}`);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao criar login.');
      throw err;
    }
  };

  const handleSenha = async (password: string) => {
    if (!senhaDe) return;
    try {
      await usuarioService.resetPassword(senhaDe.id, password);
      setCriado({ email: senhaDe.email ?? senhaDe.username, password });
      toast.success('Senha alterada.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao alterar a senha.');
      throw err;
    }
  };

  const handleApagar = async () => {
    if (!apagar) return;
    try {
      await usuarioService.remove(apagar.id);
      toast.success('Login apagado.');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao apagar login.');
    }
  };

  return (
    <Frame className="p-6">
      <h1 className="mb-1 text-2xl font-semibold">Logins</h1>
      <Text variant="description" className="mb-6">
        Crie, veja e apague os acessos de professores e alunos. O aluno entra com o e-mail
        cadastrado aqui e vê apenas a própria frequência.
      </Text>

      <UsuarioForm turmas={turmas} onSubmit={handleCreate} />

      {criado && (
        <div className="mt-6 max-w-xl rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200">
          <p className="font-semibold">Anote e entregue ao usuário (esta senha não aparece de novo):</p>
          <p className="mt-1">
            Login: <code className="font-mono">{criado.email}</code>
          </p>
          <p>
            Senha: <code className="font-mono">{criado.password}</code>
          </p>
          <button
            onClick={() => setCriado(null)}
            className="mt-2 text-xs underline cursor-pointer"
          >
            Ocultar
          </button>
        </div>
      )}

      <div className="mt-10 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Logins cadastrados ({usuarios.length})</h2>
        <button
          onClick={reload}
          title="Recarregar"
          disabled={isLoading}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        currentUserId={auth.user?.profile?.sub}
        onResetPassword={setSenhaDe}
        onDelete={setApagar}
      />

      <SenhaModal
        key={senhaDe?.id ?? 'none'}
        isOpen={senhaDe !== null}
        onClose={() => setSenhaDe(null)}
        onSubmit={handleSenha}
        nome={senhaDe?.name ?? ''}
      />
      <ConfirmDialog
        open={apagar !== null}
        onOpenChange={(open) => !open && setApagar(null)}
        onConfirm={handleApagar}
        title="Apagar login"
        description={`Apagar o login de "${apagar?.name}"? A pessoa não conseguirá mais entrar. O cadastro na turma e as presenças são mantidos.`}
        confirmLabel="Apagar"
      />
    </Frame>
  );
}
