import { Frame, Text, toast } from '@cincoders/cinnamon';
import { UsuarioForm } from '../../modules/usuarios/components/UsuarioForm';
import { usuarioService } from '../../modules/usuarios/usuario.service';
import type { CreateUsuarioDto } from '../../modules/usuarios/usuario.types';
import { useTurmas } from '../../modules/turmas/useTurmas';

export default function UsuariosPage() {
  const { turmas } = useTurmas();

  const handleCreate = async (dto: CreateUsuarioDto) => {
    try {
      const u = await usuarioService.create(dto);
      toast.success(`Login criado: ${u.email} (${u.perfil === 'PROFESSOR' ? 'professor' : 'aluno'})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao criar login.');
      throw err;
    }
  };

  return (
    <Frame className="p-6">
      <h1 className="mb-1 text-2xl font-semibold">Logins</h1>
      <Text variant="description" className="mb-6">
        Crie acessos para professores e alunos. O aluno entra com o e-mail cadastrado aqui e vê
        apenas a própria frequência.
      </Text>
      <UsuarioForm turmas={turmas} onSubmit={handleCreate} />
    </Frame>
  );
}
