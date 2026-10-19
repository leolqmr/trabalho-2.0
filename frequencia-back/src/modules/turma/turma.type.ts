/** Aluno de uma turma, derivado das presenças registradas nas aulas dela. */
export interface AlunoDaTurma {
  user_id: string;
  total_aulas: number;
  presencas: number;
  faltas: number;
}
