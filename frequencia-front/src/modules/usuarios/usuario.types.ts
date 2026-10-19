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
