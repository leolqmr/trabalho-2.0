/** Aluno de uma turma, identificado pelo e-mail, derivado das presenças registradas nas aulas dela. */
export interface AlunoDaTurma {
  email: string;
  total_aulas: number;
  presencas: number;
  faltas: number;
}
