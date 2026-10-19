import { format } from 'date-fns';

/**
 * Aulas são guardadas como DateTime no backend, mas o usuário só escolhe o
 * dia. Gravamos ao meio-dia UTC: assim o dia exibido não muda em nenhum fuso
 * entre UTC-11 e UTC+11 (meia-noite local viraria o dia anterior/seguinte).
 */
export const fromDateInputValue = (value: string): string => `${value}T12:00:00.000Z`;

/** ISO do backend -> valor de `<input type="date">` (yyyy-MM-dd, no fuso local). */
export const toDateInputValue = (iso: string): string => format(new Date(iso), 'yyyy-MM-dd');

/** 19/10/2026 */
export const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('pt-BR');

/** segunda-feira */
export const formatWeekday = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long' });
