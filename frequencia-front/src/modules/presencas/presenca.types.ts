export interface Presenca {
  id: string;
  aula_id: string;
  /** E-mail do aluno (identifica o aluno na chamada). */
  email: string | null;
  /** Registros antigos podem ter só o id do usuário. */
  user_id: string | null;
  present: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Uma marcação da chamada (corpo do POST /aulas/:id/presencas). */
export interface MarcacaoPresenca {
  email: string;
  present: boolean;
}
