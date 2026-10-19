/** A data da aula é só um dia: formatamos em UTC para não "voltar" um dia no fuso do Brasil. */
export const formatDataAula = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const formatPercentual = (valor: number) =>
  `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
