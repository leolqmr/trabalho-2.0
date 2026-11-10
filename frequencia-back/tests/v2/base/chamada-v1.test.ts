/**
 * Sprint 3, V1 produzida por LLM. NÃO editar depois de fixada no commit V1.
 * Requisitos: US01 (abertura/código), US02 (registro), US03 (consulta).
 * Técnicas anotadas por cenário; histórico da geração em docs/testes/llm-log.md.
 */
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChamadaCodigoService, gerarCodigo } from '../../../src/modules/chamada-codigo/chamada-codigo.service';
import { AbrirChamadaCodigoSchema } from '../../../src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto';
import { RegistrarCodigoSchema } from '../../../src/modules/chamada-codigo/dto/registrar-codigo.dto';

const AULA = '11111111-1111-4111-8111-111111111111';
const CHAMADA = '22222222-2222-4222-8222-222222222222';
const TURMA = '33333333-3333-4333-8333-333333333333';
const ALUNO = '44444444-4444-4444-8444-444444444444';
const EMAIL = 'aluno@example.com';
const CODIGO = 'ABCDEFGH';
const SALT = '1234567890abcdef';
const AGORA = new Date('2026-11-09T15:00:00.000Z');
const HASH = createHash('sha256').update(`${SALT}:${CODIGO}`).digest('hex');

function abertura(anterior: { id: string } | null = null, aulaExiste = true) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue(aulaExiste ? [{ id: AULA }] : []),
    chamadaCodigo: {
      findUnique: vi.fn().mockResolvedValue(anterior),
      upsert: vi.fn().mockResolvedValue({ id: CHAMADA }),
    },
    chamadaCodigoTentativa: { deleteMany: vi.fn() },
  };
  const prisma = { $transaction: vi.fn(async (cb: (x: unknown) => Promise<unknown>) => cb(tx)) };
  return { service: new ChamadaCodigoService(prisma as never), prisma, tx };
}

function registro(opts: {
  emailExiste?: boolean; chamadaExiste?: boolean; matriculado?: boolean;
  expirada?: boolean; encerrada?: boolean; tentativa?: number;
  existente?: boolean; codigo?: string;
} = {}) {
  const atual = {
    id: CHAMADA, aula_id: AULA, salt: SALT, codigoHash: HASH,
    expiraEm: new Date(AGORA.getTime() + (opts.expirada ? -1 : 60_000)),
    encerradoEm: opts.encerrada ? AGORA : null,
  };
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: AULA }]),
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(atual) },
    presenca: {
      findUnique: vi.fn().mockResolvedValue(opts.existente ? { present: true } : null),
      upsert: vi.fn().mockResolvedValue({ present: true }),
    },
    chamadaCodigoTentativa: {
      upsert: vi.fn().mockResolvedValue({ total: opts.tentativa ?? 1 }),
    },
  };
  const prisma = {
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(
      opts.chamadaExiste === false ? null : { aula_id: AULA, aula: { turma_id: TURMA } },
    ) },
    aluno: { findUnique: vi.fn().mockResolvedValue(opts.matriculado === false ? null : { id: ALUNO }) },
    $transaction: vi.fn(async (cb: (x: unknown) => Promise<unknown>) => cb(tx)),
  };
  return { service: new ChamadaCodigoService(prisma as never), prisma, tx, codigo: opts.codigo ?? CODIGO };
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(AGORA); });
afterEach(() => { vi.useRealTimers(); });

describe('US01 - código de chamada', () => {
  // US01-CA01 — partição válida; oráculo a conferir com critério de aceitação.
  it('CT01 [partição válida] gera oito letras não ambíguas', () => {
    for (let i = 0; i < 30; i++) expect(gerarCodigo()).toMatch(/^[A-HJ-NP-Z]{8}$/);
  });
  // US01-CA02 — limite 1 minuto; oráculo a conferir com critério de aceitação.
  it('CT02 [limite 1 minuto] aceita duração mínima', () => {
    expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 1 }).success).toBe(true);
  });
  // US01-CA02 — limite 15 minutos; oráculo a conferir com critério de aceitação.
  it('CT03 [limite 15 minutos] aceita duração máxima', () => {
    expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 15 }).success).toBe(true);
  });
  // US01-CA02 — limite 0; oráculo a conferir com critério de aceitação.
  it('CT04 [limite 0] rejeita duração inferior a 1 minuto', () => {
    expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 0 }).success).toBe(false);
  });
  // US01-CA02 — limite 16; oráculo a conferir com critério de aceitação.
  it('CT05 [limite 16] rejeita duração superior a 15 minutos', () => {
    expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 16 }).success).toBe(false);
  });
  // US01-CA02 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT06 [partição inválida] rejeita duração não inteira', () => {
    expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 2.5 }).success).toBe(false);
  });
  // US02-CA03 — partição válida; oráculo a conferir com critério de aceitação.
  it('CT07 [partição válida] normaliza letras minúsculas e espaços', () => {
    const p = RegistrarCodigoSchema.safeParse({ codigo: ' abcdefgh ' });
    expect(p.success).toBe(true);
    if (p.success) expect(p.data.codigo).toBe(CODIGO);
  });
  // US02-CA03 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT08 [partição inválida] recusa I/O e tamanho errado', () => {
    expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCIOFGH' }).success).toBe(false);
    expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEF' }).success).toBe(false);
  });
  // US01-CA03 — regra; oráculo a conferir com critério de aceitação.
  it('CT09 [regra] abre com expiração correta e sem vazar hash/salt', async () => {
    const { service, tx } = abertura();
    const saida = await service.abrir(AULA, { duracaoMinutos: 5 });
    expect(saida.codigo).toMatch(/^[A-HJ-NP-Z]{8}$/);
    expect(saida.expiraEm.getTime()).toBe(AGORA.getTime() + 5 * 60_000);
    expect(saida).not.toHaveProperty('codigoHash');
    expect(saida).not.toHaveProperty('salt');
    const gravacao = tx.chamadaCodigo.upsert.mock.calls[0][0];
    expect(gravacao.create.codigoHash).toMatch(/^[a-f0-9]{64}$/);
    expect(gravacao.create).not.toHaveProperty('codigo');
  });
  // US01-CA04 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT10 [partição inválida] não abre chamada para aula inexistente', async () => {
    const { service, tx } = abertura(null, false);
    await expect(service.abrir(AULA, { duracaoMinutos: 3 })).rejects.toThrow();
    expect(tx.chamadaCodigo.upsert).not.toHaveBeenCalled();
  });
});

describe('US02 - registro de presença', () => {
  // US02-CA01 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT11 [partição inválida] recusa usuário sem e-mail', async () => {
    const { service, prisma } = registro();
    await expect(service.registrar(CHAMADA, undefined, CODIGO)).rejects.toThrow(/e-mail/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  // US02-CA01 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT12 [partição inválida] recusa chamada inexistente', async () => {
    const { service, prisma } = registro({ chamadaExiste: false });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  // US02-CA01 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT13 [partição inválida] recusa aluno não matriculado', async () => {
    const { service, prisma } = registro({ matriculado: false });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow(/matriculado/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  // US02-CA02 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT14 [partição inválida] recusa janela expirada e não marca presença', async () => {
    const { service, tx } = registro({ expirada: true });
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).rejects.toThrow(/expirou|encerrada/i);
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA03 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT15 [partição inválida] recusa código incorreto e não marca presença', async () => {
    const { service, tx } = registro({ codigo: 'ZZZZZZZZ' });
    await expect(service.registrar(CHAMADA, EMAIL, 'ZZZZZZZZ')).rejects.toThrow(/incorreto/i);
    expect(tx.presenca.upsert).not.toHaveBeenCalled();
  });
  // US02-CA05 — partição válida; oráculo a conferir com critério de aceitação.
  it('CT16 [partição válida] aceita código correto e cria presença', async () => {
    const { service, tx } = registro();
    await expect(service.registrar(CHAMADA, EMAIL, CODIGO)).resolves.toEqual({ aula_id: AULA, registrada: true });
    expect(tx.presenca.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: { aula_id: AULA, aluno_id: ALUNO, present: true },
    }));
  });
});

describe('US03 - consulta de janela por aluno', () => {
  // US03-CA01 — partição inválida; oráculo a conferir com critério de aceitação.
  it('CT17 [partição inválida] e-mail ausente retorna lista vazia', async () => {
    const prisma = { chamadaCodigo: { findMany: vi.fn() } };
    const service = new ChamadaCodigoService(prisma as never);
    expect(await service.listarAtivas()).toEqual([]);
    expect(prisma.chamadaCodigo.findMany).not.toHaveBeenCalled();
  });
  // US03-CA02 — partição válida; oráculo a conferir com critério de aceitação.
  it('CT18 [partição válida] consulta turmas matriculadas sem expor segredos', async () => {
    const prisma = { chamadaCodigo: { findMany: vi.fn().mockResolvedValue([{
      id: CHAMADA, expiraEm: new Date(AGORA.getTime() + 60_000),
      aula: { id: AULA, date: AGORA, turma: { id: TURMA, name: 'EDOO' }, presencas: [] },
    }]) } };
    const service = new ChamadaCodigoService(prisma as never);
    const retorno = await service.listarAtivas(EMAIL);
    expect(retorno).toHaveLength(1);
    expect(retorno[0].registrada).toBe(false);
    expect(JSON.stringify(retorno)).not.toMatch(/codigoHash|salt/);
    expect(prisma.chamadaCodigo.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ aula: { turma: { alunos: { some: { email: EMAIL } } } } }),
    }));
  });
});
