/** Uma linha da chamada: um aluno da turma e sua situação nesta aula. */
export interface ChamadaItem {
  aluno_id: string;
  name: string;
  email: string;
  /** Id do registro de presença; null enquanto o aluno não foi marcado. */
  presenca_id: string | null;
  /** true = presente, false = falta, null = ainda não marcado. */
  present: boolean | null;
}

/** Uma marcação da chamada (corpo do POST /aulas/:id/presencas). */
export interface MarcacaoPresenca {
  aluno_id: string;
  present: boolean;
}
