export interface Presenca {
  id: string;
  aula_id: string;
  /** `sub` (UUID) do usuário no Keycloak. */
  user_id: string;
  present: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresencaDto {
  aula_id: string;
  user_id: string;
  present: boolean;
}
