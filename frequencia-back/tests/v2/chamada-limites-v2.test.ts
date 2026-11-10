/**
 * Sprint 3, V2 (melhorias originadas da análise de lacunas V1).
 * Cada melhoria é mapeada em docs/testes/matriz-rastreabilidade.md.
 */
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChamadaCodigoService } from '../../src/modules/chamada-codigo/chamada-codigo.service';
import { RegistrarCodigoSchema } from '../../src/modules/chamada-codigo/dto/registrar-codigo.dto';

const AULA = '11111111-1111-4111-8111-111111111111';
const CHAMADA = '22222222-2222-4222-8222-222222222222';
const TURMA = '33333333-3333-4333-8333-333333333333';
const ALUNO = '44444444-4444-4444-8444-444444444444';
const EMAIL = 'aluno@example.com';
const AGORA = new Date('2026-11-09T15:00:00.000Z');
const CODIGO = 'ABCDEFGH';
const SALT = 'abcdefghijklmnop';
const HASH = createHash('sha256').update(`${SALT}:${CODIGO}`).digest('hex');

function montarRegistro(opts: { tentativa?: number; presente?: boolean; encerrado?: boolean; expiraEm?: Date } = {}) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: AULA }]),
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
      id: CHAMADA, aula_id: AULA, salt: SALT, codigoHash: HASH,
      expiraEm: opts.expiraEm ?? new Date(AGORA.getTime() + 60_000),
      encerradoEm: opts.encerrado ? AGORA : null,
    }) },
    presenca: {
      findUnique: vi.fn().mockResolvedValue(opts.presente ? { present: true } : null),
      upsert: vi.fn().mockResolvedValue({ present: true }),
    },
    chamadaCodigoTentativa: { upsert: vi.fn().mockResolvedValue({ total: opts.tentativa ?? 1 }) },
  };
  const prisma = {
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({ aula_id: AULA, aula: { turma_id: TURMA } }) },
    aluno: { findUnique: vi.fn().mockResolvedValue({ id: ALUNO }) },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(tx)),
  };
  return { service: new ChamadaCodigoService(prisma as never), prisma, tx };
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(AGORA); });
afterEach(() => { vi.useRealTimers(); });

describe('V2 - fronteiras, idempotência e relógio', () => {
  // US01-CA01 — limites 7/8/9; oráculo a conferir com critério de aceitação.
  it('EVO15 [limites 7/8/9] aceita 8 letras e rejeita 7 e 9', () => {
    expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFG' }).success).toBe(false);
    expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFGH' }).success).toBe(true);
    expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFGHJ' }).success).toBe(false);
  });
  // US02-CA04 — limite; oráculo a conferir com critério de aceitação.
  it('EVO01 [limite] a quinta tentativa ainda pode registrar código correto', async () => {
    const { service, tx } = montarRegistro({ tentativa: 5 });
    expect(await service.registrar(CHAMADA, EMAIL, CODIGO)).toEqual({ aula_id: AULA, registrada: true });
    expect(tx.presenca.upsert).toHaveBeenCalledTimes(1);
  });
  // US02-CA04 — limite; oráculo a conferir com critério de aceitação.
  it('EVO02 [limite] a sexta tentativa é bloqueada mesmo com código correto', async () => {
    const { service, tx } = montarRegistro({ tentativa: 6 });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow(/Limite de tentativas/i);
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA02 — fronteira; oráculo a conferir com critério de aceitação.
  it('EVO03 [fronteira] expiração exatamente no momento atual é recusada', async () => {
    const { service, tx } = montarRegistro({ expiraEm: AGORA });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow(/expirou|encerrada/i);
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA02 — partição; oráculo a conferir com critério de aceitação.
  it('EVO04 [partição] encerrada manualmente, embora dentro do prazo, é recusada', async () => {
    const { service, tx } = montarRegistro({ encerrado: true });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow(/expirou|encerrada/i);
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA05 — partição; oráculo a conferir com critério de aceitação.
  it('EVO05 [partição] presença já registrada não consome nova tentativa', async () => {
    const { service, tx } = montarRegistro({ presente: true });
    expect(await service.registrar(CHAMADA, EMAIL, 'ZZZZZZZZ')).toEqual({ aula_id: AULA, registrada: true });
    expect(tx.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA03 — normalização; oráculo a conferir com critério de aceitação.
  it('EVO06 [normalização] a regra aceita espaços e caixa baixa', async () => {
    const { service, tx } = montarRegistro();
    await expect(service.registrar(CHAMADA, EMAIL, ' abcdefgh ')).resolves.toEqual({ aula_id: AULA, registrada: true });
    expect(tx.presenca.upsert).toHaveBeenCalledTimes(1);
  });
  // US03-CA03 — consulta; oráculo a conferir com critério de aceitação.
  it('EVO07 [consulta] status da chamada não encontrada retorna null', async () => {
    const prisma = { aula: { findUnique: vi.fn().mockResolvedValue({ id: AULA }) },
      chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(null) },
      presenca: { count: vi.fn() } };
    const service = new ChamadaCodigoService(prisma as never);
    expect(await service.status(AULA)).toBeNull();
    expect(prisma.presenca.count).not.toHaveBeenCalled();
  });
  // US03-CA03 — fronteira; oráculo a conferir com critério de aceitação.
  it('EVO08 [fronteira] status expira exatamente agora e conta presentes', async () => {
    const prisma = { aula: { findUnique: vi.fn().mockResolvedValue({ id: AULA }) },
      chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
        id: CHAMADA, iniciadoEm: AGORA, expiraEm: AGORA, encerradoEm: null,
      }) },
      presenca: { count: vi.fn().mockResolvedValue(3) } };
    const saida = await new ChamadaCodigoService(prisma as never).status(AULA);
    expect(saida?.ativa).toBe(false);
    expect(saida?.presentes).toBe(3);
    expect(prisma.presenca.count).toHaveBeenCalledWith({ where: { aula_id: AULA, present: true } });
  });
  // US03-CA02 — partição; oráculo a conferir com critério de aceitação.
  it('EVO09 [partição] relistagem identifica aluno já presente', async () => {
    const prisma = { chamadaCodigo: { findMany: vi.fn().mockResolvedValue([{
      id: CHAMADA, expiraEm: new Date(AGORA.getTime() + 60_000),
      aula: { id: AULA, date: AGORA, turma: { id: TURMA, name: 'EDOO' }, presencas: [{ present: true }] },
    }]) } };
    const [saida] = await new ChamadaCodigoService(prisma as never).listarAtivas(EMAIL);
    expect(saida.registrada).toBe(true);
    expect(saida.aula.turma.id).toBe(TURMA);
  });
});
