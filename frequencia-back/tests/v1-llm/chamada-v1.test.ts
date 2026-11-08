/**
 * Sprint 3 - V1 gerada por LLM; preservar sem ajustes manuais após o commit.
 * Contexto: US01–US04 e os arquivos de implementação, sem utilizar IDs da matriz.
 * Esta é a primeira proposta de suíte, preservada para avaliação por medição.
 */
import { describe, expect, it, vi } from 'vitest';
import { AbrirChamadaCodigoSchema } from '../../src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto';
import { RegistrarCodigoSchema } from '../../src/modules/chamada-codigo/dto/registrar-codigo.dto';
import { ChamadaCodigoService, gerarCodigo } from '../../src/modules/chamada-codigo/chamada-codigo.service';
import { calcularResumo, nivelDeFalta } from '../../src/modules/frequencia/frequencia.util';

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const CHAMADA_ID = '22222222-2222-4222-8222-222222222222';
const TURMA_ID = '33333333-3333-4333-8333-333333333333';

// US01 CA01.1: partição válida
it('aceita duração de cinco minutos', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 5 }).success).toBe(true);
});

// US01 CA01.1: partição inválida inferior
it('rejeita duração zero', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 0 }).success).toBe(false);
});

// US01 CA01.2: partição de formato
it('gera uma senha de oito letras sem I ou O', () => {
  expect(gerarCodigo()).toMatch(/^[A-HJ-NP-Z]{8}$/);
});

// US02 CA02.2: normalização e partição de tamanho válido
it('normaliza letras minúsculas e espaços externos', () => {
  expect(RegistrarCodigoSchema.parse({ codigo: ' abcdefgh ' }).codigo).toBe('ABCDEFGH');
});

// US02 CA02.2: partição de tamanho inválido
it('rejeita código de sete letras', () => {
  expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFG' }).success).toBe(false);
});

// US02 CA02.1: partição sem email
it('rejeita presença se o aluno não tem email autenticado', async () => {
  const service = new ChamadaCodigoService({} as never);
  await expect(service.registrar(CHAMADA_ID, undefined, 'ABCDEFGH')).rejects.toThrow();
});

// US02 CA02.1: partição aluno fora da turma
it('rejeita aluno não matriculado', async () => {
  const prisma = {
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({ aula_id: AULA_ID, aula: { turma_id: TURMA_ID } }) },
    aluno: { findUnique: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(),
  };
  const service = new ChamadaCodigoService(prisma as never);
  await expect(service.registrar(CHAMADA_ID, 'outra@ufpe.br', 'ABCDEFGH')).rejects.toThrow('matriculado');
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

// US02 CA02.5: estado expirado
it('rejeita chamada expirada', async () => {
  const prisma = {
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({ aula_id: AULA_ID, aula: { turma_id: TURMA_ID } }) },
    aluno: { findUnique: vi.fn().mockResolvedValue({ id: 'aluno' }) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      $queryRaw: vi.fn(),
      chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
        id: CHAMADA_ID, aula_id: AULA_ID, expiraEm: new Date(0), encerradoEm: null,
      }) },
    })),
  };
  await expect(new ChamadaCodigoService(prisma as never).registrar(CHAMADA_ID, 'a@ufpe.br', 'ABCDEFGH'))
    .rejects.toThrow('expirou');
});

// US03 CA03.1: ausência de email
it('devolve lista vazia sem email', async () => {
  const service = new ChamadaCodigoService({} as never);
  expect(await service.listarAtivas()).toEqual([]);
});

// US03 CA03.4: inexistência de aula
it('rejeita consulta de status de aula inexistente', async () => {
  const prisma = { aula: { findUnique: vi.fn().mockResolvedValue(null) } };
  await expect(new ChamadaCodigoService(prisma as never).status(AULA_ID)).rejects.toThrow('Aula');
});

// US04 CA04.1: partição regular
it('classifica zero por cento como regular', () => {
  expect(nivelDeFalta(0)).toBe('REGULAR');
});

// US04 CA04.2: partição atenção
it('classifica vinte por cento como atenção', () => {
  expect(nivelDeFalta(20)).toBe('ATENCAO');
});

// US04 CA04.3: partição crítica
it('classifica trinta por cento como crítico', () => {
  expect(nivelDeFalta(30)).toBe('CRITICO');
});

// US04 CA04.4: sem chamadas
it('calcula percentual zero sem aulas', () => {
  expect(calcularResumo([], 0).percentual_faltas).toBe(0);
});
