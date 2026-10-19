import { Links } from './enums';

/** /turmas/:turmaId/aulas */
export const aulasPath = (turmaId: string) => `${Links.TURMAS}/${turmaId}/aulas`;

/** /turmas/:turmaId/aulas/:aulaId/frequencia */
export const frequenciaPath = (turmaId: string, aulaId: string) =>
  `${aulasPath(turmaId)}/${aulaId}/frequencia`;
