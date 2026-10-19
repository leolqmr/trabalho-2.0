import { request, requestList } from '../../services/http';
import type { CreateUsuarioDto, UsuarioCriado, UsuarioKeycloak } from './usuario.types';

export class UsuarioService {
  getAll(): Promise<UsuarioKeycloak[]> {
    return requestList<UsuarioKeycloak>('/usuarios', 'Erro ao buscar logins');
  }

  create(dto: CreateUsuarioDto): Promise<UsuarioCriado> {
    return request<UsuarioCriado>('/usuarios', 'Erro ao criar login', { method: 'POST', json: dto });
  }
}

export const usuarioService = new UsuarioService();
