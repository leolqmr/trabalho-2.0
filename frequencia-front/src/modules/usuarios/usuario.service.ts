import { request } from '../../services/http';
import type { CreateUsuarioDto, UsuarioCriado } from './usuario.types';

export class UsuarioService {
  create(dto: CreateUsuarioDto): Promise<UsuarioCriado> {
    return request<UsuarioCriado>('/usuarios', 'Erro ao criar login', { method: 'POST', json: dto });
  }
}

export const usuarioService = new UsuarioService();
