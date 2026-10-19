import { API_URL, fetchApi, getApiErrorMessage } from './api';

/** Envelope aplicado a toda resposta pelo TransformInterceptor do backend. */
interface ApiEnvelope<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
}

/** Formato de resposta paginada do backend (ver PaginatedResponseDto). */
export interface PaginatedResponse<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Faz a requisição, lança `Error` com a mensagem do NestJS em caso de falha e
 * devolve o `data` do envelope. Evita repetir o mesmo bloco em cada service.
 */
export async function request<T>(
  path: string,
  fallbackError: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const response = await fetchApi(`${API_URL}${path}`, {
    ...rest,
    ...(json !== undefined && {
      headers: { 'Content-Type': 'application/json', ...(rest.headers ?? {}) },
      body: JSON.stringify(json),
    }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, fallbackError));
  }

  // DELETE costuma devolver 204 sem corpo.
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;

  return (JSON.parse(text) as ApiEnvelope<T>).data;
}

/** Lista paginada: pede o máximo permitido (500) e devolve só os itens. */
export async function requestList<T>(path: string, fallbackError: string): Promise<T[]> {
  const sep = path.includes('?') ? '&' : '?';
  const page = await request<PaginatedResponse<T>>(`${path}${sep}limit=500`, fallbackError);
  return page.items;
}
