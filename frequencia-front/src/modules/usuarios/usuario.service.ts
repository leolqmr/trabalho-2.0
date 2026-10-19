import { request, requestList } from '../../services/http';
import type { CreateUsuarioDto, UsuarioCriado, UsuarioKeycloak } from './usuario.types';

export class UsuarioService {
  getAll(): Promise<UsuarioKeycloak[]> {
    return requestList<UsuarioKeycloak>('/usuarios', 'Erro ao buscar logins');
  }

  create(dto: CreateUsuarioDto): Promise<UsuarioCriado> {
    return request<UsuarioCriado>('/usuarios', 'Erro ao criar login', { method: 'POST', json: dto });
  }

  remove(id: string): Promise<void> {
    return request<void>(`/usuarios/${id}`, 'Erro ao apagar login', { method: 'DELETE' });
  }

  resetPassword(id: string, password: string): Promise<void> {
    return request<void>(`/usuarios/${id}/senha`, 'Erro ao alterar a senha', {
      method: 'PUT',
      json: { password },
    });
  }
}

export const usuarioService = new UsuarioService();
