import type { AccessRole } from './access-role.enum';

export interface CurrentUser {
  userId?: string;
  /** E-mail verificado do token (minúsculo). Liga o usuário logado ao cadastro de aluno. */
  email?: string;
  role: AccessRole;
}
