export interface Aula {
  id: string;
  /** ISO 8601. Tratada como data "pura" (UTC) — veja `formatAulaDate`. */
  date: string;
  turma_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAulaDto {
  /** Formato `YYYY-MM-DD` vindo do input de data. */
  date: string;
  turma_id: string;
}

export type UpdateAulaDto = Partial<Pick<CreateAulaDto, 'date'>>;

/** A data da aula é só um dia: formatamos em UTC para não "voltar" um dia no fuso do Brasil. */
export const formatAulaDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

/** Converte `YYYY-MM-DD` no ISO enviado ao backend. */
export const toAulaIso = (date: string) => `${date}T00:00:00.000Z`;
