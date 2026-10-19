export type Perfil = 'PROFESSOR' | 'ALUNO';

export interface CreateUsuarioDto {
  name: string;
  email: string;
  password: string;
  perfil: Perfil;
  turma_id?: string;
}

export interface UsuarioCriado {
  id: string;
  name: string;
  email: string;
  perfil: Perfil;
  turma_id: string | null;
}

export interface UsuarioKeycloak {
  id: string;
  name: string;
  username: string;
  email: string | null;
  enabled: boolean;
  perfil: Perfil | 'SEM_PERFIL';
}
