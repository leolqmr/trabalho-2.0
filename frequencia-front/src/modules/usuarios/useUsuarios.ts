import { useAsync } from '../../hooks/useAsync';
import { usuarioService } from './usuario.service';

export function useUsuarios() {
  const { data: usuarios = [], isLoading, error, reload } = useAsync(() => usuarioService.getAll(), []);
  return { usuarios, isLoading, error, reload };
}
