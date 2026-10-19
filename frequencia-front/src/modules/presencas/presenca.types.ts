export interface Presenca {
  id: string;
  aula_id: string;
  /** `sub` (UUID) do usuário no Keycloak. */
  user_id: string;
  present: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Uma marcação da chamada (corpo do POST /aulas/:id/presencas). */
export interface MarcacaoPresenca {
  user_id: string;
  present: boolean;
}
