/** Sprint 3 / V2 — casos T01-T39 da matriz de rastreabilidade.
 * Os mocks verificam contratos com Prisma, não substituem integração PostgreSQL.
 */
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChamadaCodigoService, gerarCodigo } from '../../src/modules/chamada-codigo/chamada-codigo.service';
import { AbrirChamadaCodigoSchema } from '../../src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto';
import { RegistrarCodigoSchema } from '../../src/modules/chamada-codigo/dto/registrar-codigo.dto';

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const CHAMADA_ID = '22222222-2222-4222-8222-222222222222';
const TURMA_ID = '33333333-3333-4333-8333-333333333333';
const ALUNO_ID = '44444444-4444-4444-8444-444444444444';
const EMAIL = 'aluno@ufpe.br';
const CODIGO = 'ABCDEFGH';
const SALT = 'salt-de-teste';
const AGORA = new Date('2026-11-08T12:00:00.000Z');
const HASH = createHash('sha256').update(`${SALT}:${CODIGO}`).digest('hex');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(AGORA);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fixtureAbrir(temAula = true, anterior: null | { id: string; codigoHash?: string } = null) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue(temAula ? [{ id: AULA_ID }] : []),
    chamadaCodigo: {
      findUnique: vi.fn().mockResolvedValue(anterior),
      upsert: vi.fn().mockResolvedValue({ id: CHAMADA_ID }),
      update: vi.fn().mockResolvedValue({}),
    },
    chamadaCodigoTentativa: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
  };
  const db = { $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)) };
  return { tx, db, service: new ChamadaCodigoService(db as never) };
}

function fixtureEncerrar(temAula = true, chamada: null | { id: string } = { id: CHAMADA_ID }) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue(temAula ? [{ id: AULA_ID }] : []),
    chamadaCodigo: {
      findUnique: vi.fn().mockResolvedValue(chamada),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  const db = { $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)) };
  return { tx, db, service: new ChamadaCodigoService(db as never) };
}

type Estado = 'ativa' | 'expirada' | 'exata' | 'encerrada';
function fixtureRegistro(op: {
  chamadaExiste?: boolean;
  matriculado?: boolean;
  estado?: Estado;
  presente?: boolean | null;
  total?: number;
} = {}) {
  const { chamadaExiste = true, matriculado = true, estado = 'ativa', presente = null, total = 1 } = op;
  const chamada = {
    id: CHAMADA_ID,
    aula_id: AULA_ID,
    expiraEm: new Date(AGORA.getTime() + (estado === 'expirada' ? -1 : estado === 'exata' ? 0 : 60000)),
    encerradoEm: estado === 'encerrada' ? new Date(AGORA.getTime() - 1000) : null,
    codigoHash: HASH,
    salt: SALT,
  };
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: AULA_ID }]),
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(chamada) },
    presenca: {
      findUnique: vi.fn().mockResolvedValue(presente === null ? null : { present: presente }),
      upsert: vi.fn().mockResolvedValue({ present: true }),
    },
    chamadaCodigoTentativa: { upsert: vi.fn().mockResolvedValue({ total }) },
  };
  const db = {
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(chamadaExiste ? {
      aula_id: AULA_ID, aula: { turma_id: TURMA_ID },
    } : null) },
    aluno: { findUnique: vi.fn().mockResolvedValue(matriculado ? { id: ALUNO_ID } : null) },
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  return { tx, db, service: new ChamadaCodigoService(db as never) };
}

function fixtureStatus(chamada: Record<string, unknown> | null, aulaExiste = true, presentes = 3) {
  const db = {
    aula: { findUnique: vi.fn().mockResolvedValue(aulaExiste ? { id: AULA_ID } : null) },
    chamadaCodigo: { findUnique: vi.fn().mockResolvedValue(chamada) },
    presenca: { count: vi.fn().mockResolvedValue(presentes) },
  };
  return { db, service: new ChamadaCodigoService(db as never) };
}

function fixtureListar(presencas: Array<{ present: boolean }> = []) {
  const db = {
    chamadaCodigo: { findMany: vi.fn().mockResolvedValue([{
      id: CHAMADA_ID,
      expiraEm: new Date(AGORA.getTime() + 60000),
      aula: {
        id: AULA_ID,
        date: new Date('2026-11-08T10:00:00Z'),
        turma: { id: TURMA_ID, name: 'Estruturas de Dados' },
        presencas,
      },
    }]) },
  };
  return { db, service: new ChamadaCodigoService(db as never) };
}

// US01 CA01.1 — limites / partições da duração
it('T01 [VL 0] rejeita 0 minuto', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 0 }).success).toBe(false);
});
it('T02 [VL 1] aceita 1 minuto', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 1 }).success).toBe(true);
});
it('T03 [PE interior] aceita 8 minutos', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 8 }).success).toBe(true);
});
it('T04 [VL 15] aceita 15 minutos', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 15 }).success).toBe(true);
});
it('T05 [VL 16] rejeita 16 minutos', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 16 }).success).toBe(false);
});
it('T06 [PE não inteiro] rejeita fração de minuto', () => {
  expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 1.5 }).success).toBe(false);
});

// US01 CA01.2 — código e expiração
it('T07 [PE formato] gera somente oito letras permitidas', () => {
  for (let i = 0; i < 128; i++) expect(gerarCodigo()).toMatch(/^[A-HJ-NP-Z]{8}$/);
});
it('T08 [VL duração mínima] abre janela com prazo de exatamente 60 segundos', async () => {
  const { service } = fixtureAbrir();
  const aberto = await service.abrir(AULA_ID, { duracaoMinutos: 1 });
  expect(aberto.iniciadoEm).toEqual(AGORA);
  expect(aberto.expiraEm.getTime() - aberto.iniciadoEm.getTime()).toBe(60000);
});

// US01 CA01.3 — sigilo
it('T09 [PE segredo] status não expõe código, hash ou salt', async () => {
  const { service } = fixtureStatus({
    id: CHAMADA_ID, iniciadoEm: AGORA, expiraEm: new Date(AGORA.getTime() + 60000),
    encerradoEm: null, codigoHash: HASH, salt: SALT,
  });
  const status = await service.status(AULA_ID);
  expect(status).toMatchObject({ id: CHAMADA_ID, ativa: true });
  expect(JSON.stringify(status)).not.toMatch(/codigo|codigoHash|salt/i);
});

// US01 CA01.4 — ciclo de vida
it('T10 [FL primeira abertura] cria janela usando upsert e retorna a chave apenas na abertura', async () => {
  const { service, tx } = fixtureAbrir();
  const abertura = await service.abrir(AULA_ID, { duracaoMinutos: 5 });
  expect(abertura.codigo).toMatch(/^[A-HJ-NP-Z]{8}$/);
  expect(tx.chamadaCodigo.upsert).toHaveBeenCalledWith(expect.objectContaining({
    create: expect.objectContaining({ aula_id: AULA_ID, codigoHash: expect.any(String), salt: expect.any(String) }),
  }));
  expect(tx.chamadaCodigoTentativa.deleteMany).not.toHaveBeenCalled();
});
it('T11 [FL reabertura] limpa contadores, altera hash, desbloqueia e renova prazo', async () => {
  const { service, tx } = fixtureAbrir(true, { id: CHAMADA_ID, codigoHash: '0'.repeat(64) });
  const abertura = await service.abrir(AULA_ID, { duracaoMinutos: 15 });
  expect(tx.chamadaCodigoTentativa.deleteMany).toHaveBeenCalledWith({ where: { chamada_id: CHAMADA_ID } });
  expect(tx.chamadaCodigo.upsert).toHaveBeenCalledWith(expect.objectContaining({
    update: expect.objectContaining({ encerradoEm: null, expiraEm: abertura.expiraEm, codigoHash: expect.any(String) }),
  }));
  const argumentos = tx.chamadaCodigo.upsert.mock.calls[0]?.[0] as { update: { codigoHash: string } };
  expect(argumentos.update.codigoHash).not.toBe('0'.repeat(64));
  expect(abertura.expiraEm.getTime() - AGORA.getTime()).toBe(900000);
});

// US01 CA01.5 / CA01.6 — erros e encerramento
it('T12 [PE aula inexistente] recusa abertura em aula inexistente', async () => {
  await expect(fixtureAbrir(false).service.abrir(AULA_ID, { duracaoMinutos: 1 }))
    .rejects.toThrow('Aula');
  await expect(fixtureEncerrar(false).service.encerrar(AULA_ID)).rejects.toThrow('Aula');
});
it('T13 [PE janela inexistente] recusa encerramento sem chamada', async () => {
  await expect(fixtureEncerrar(true, null).service.encerrar(AULA_ID)).rejects.toThrow('Chamada por código');
});
it('T14 [FL encerramento] salva timestamp do encerramento', async () => {
  const { service, tx } = fixtureEncerrar();
  await service.encerrar(AULA_ID);
  expect(tx.chamadaCodigo.update).toHaveBeenCalledWith({
    where: { id: CHAMADA_ID }, data: { encerradoEm: AGORA },
  });
});

// US02 CA02.1 — autenticação e matrícula
it('T15 [PE email ausente] recusa sem consultar banco', async () => {
  await expect(new ChamadaCodigoService({} as never).registrar(CHAMADA_ID, undefined, CODIGO))
    .rejects.toThrow('e-mail');
});
it('T16 [PE não matriculado] impede acesso e não abre transação', async () => {
  const { service, db } = fixtureRegistro({ matriculado: false });
  await expect(service.registrar(CHAMADA_ID, EMAIL, CODIGO)).rejects.toThrow('matriculado');
  expect(db.$transaction).not.toHaveBeenCalled();
});
it('T17 [PE matriculado] verifica matrícula na turma correta', async () => {
  const { service, db } = fixtureRegistro();
  expect(await service.registrar(CHAMADA_ID, EMAIL, CODIGO)).toMatchObject({ registrada: true });
  expect(db.aluno.findUnique).toHaveBeenCalledWith({
    where: { turma_id_email: { turma_id: TURMA_ID, email: EMAIL } }, select: { id: true },
  });
  await expect(fixtureRegistro({ chamadaExiste: false }).service.registrar(CHAMADA_ID, EMAIL, CODIGO))
    .rejects.toThrow('Chamada por código');
});

// US02 CA02.2 — normalização e tamanho
it('T18 [PE normalização] aceita minúsculas e espaços periféricos', async () => {
  expect(RegistrarCodigoSchema.parse({ codigo: ' abcdefgh ' }).codigo).toBe(CODIGO);
  const { service } = fixtureRegistro();
  expect(await service.registrar(CHAMADA_ID, EMAIL, ' abcdefgh ')).toMatchObject({ registrada: true });
});
it('T19 [VL 7] rejeita sete caracteres', () => {
  expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFG' }).success).toBe(false);
});
it('T20 [VL 8] aceita oito caracteres', () => {
  expect(RegistrarCodigoSchema.safeParse({ codigo: CODIGO }).success).toBe(true);
});
it('T21 [VL 9] rejeita nove caracteres', () => {
  expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFGHJ' }).success).toBe(false);
});
it('T22 [PE proibido] rejeita letras I e O', () => {
  expect(RegistrarCodigoSchema.safeParse({ codigo: 'ABCDEFIO' }).success).toBe(false);
});

// US02 CA02.3 / CA02.4 — autenticação do código e cinco tentativas
it('T23 [PE correto] faz upsert com present true e sucesso', async () => {
  const { service, tx } = fixtureRegistro();
  expect(await service.registrar(CHAMADA_ID, EMAIL, CODIGO)).toEqual({ aula_id: AULA_ID, registrada: true });
  expect(tx.presenca.upsert).toHaveBeenCalledWith({
    where: { aula_id_aluno_id: { aula_id: AULA_ID, aluno_id: ALUNO_ID } },
    create: { aula_id: AULA_ID, aluno_id: ALUNO_ID, present: true },
    update: { present: true },
  });
});
it('T24 [PE incorreto] consome tentativa e emite erro 400', async () => {
  const { service, tx } = fixtureRegistro();
  const erro = await service.registrar(CHAMADA_ID, EMAIL, 'HGFEDCBA').catch((e: unknown) => e);
  expect((erro as { getStatus(): number }).getStatus()).toBe(400);
  expect(tx.chamadaCodigoTentativa.upsert).toHaveBeenCalledOnce();
  expect(tx.presenca.upsert).not.toHaveBeenCalled();
});
it('T25 [VL 5] aceita código correto na quinta tentativa', async () => {
  const { service, tx } = fixtureRegistro({ total: 5 });
  expect(await service.registrar(CHAMADA_ID, EMAIL, CODIGO)).toMatchObject({ registrada: true });
  expect(tx.presenca.upsert).toHaveBeenCalledOnce();
});
it('T26 [VL 6] bloqueia código correto na sexta tentativa com 429', async () => {
  const { service, tx } = fixtureRegistro({ total: 6 });
  const erro = await service.registrar(CHAMADA_ID, EMAIL, CODIGO).catch((e: unknown) => e);
  expect((erro as { getStatus(): number }).getStatus()).toBe(429);
  expect(tx.presenca.upsert).not.toHaveBeenCalled();
});

// US02 CA02.5 — estados de chamada
it('T27 [PE encerrada] rejeita janela encerrada com 409', async () => {
  const { service } = fixtureRegistro({ estado: 'encerrada' });
  const erro = await service.registrar(CHAMADA_ID, EMAIL, CODIGO).catch((e: unknown) => e);
  expect((erro as { getStatus(): number }).getStatus()).toBe(409);
});
it('T28 [VL instante exato] rejeita chamada no exato momento da expiração', async () => {
  const { service } = fixtureRegistro({ estado: 'exata' });
  const erro = await service.registrar(CHAMADA_ID, EMAIL, CODIGO).catch((e: unknown) => e);
  expect((erro as { getStatus(): number }).getStatus()).toBe(409);
  const expirou = fixtureRegistro({ estado: 'expirada' });
  await expect(expirou.service.registrar(CHAMADA_ID, EMAIL, CODIGO)).rejects.toThrow('expirou');
  const ausente = fixtureRegistro();
  ausente.tx.chamadaCodigo.findUnique.mockResolvedValue(null);
  await expect(ausente.service.registrar(CHAMADA_ID, EMAIL, CODIGO)).rejects.toThrow('expirou');
});
it('T29 [PE ativa] janela ativa permite validar código e contar tentativa', async () => {
  const { service, tx } = fixtureRegistro({ estado: 'ativa' });
  expect(await service.registrar(CHAMADA_ID, EMAIL, CODIGO)).toMatchObject({ registrada: true });
  expect(tx.chamadaCodigoTentativa.upsert).toHaveBeenCalledOnce();
});

// US02 CA02.6 / CA02.7 — idempotência e atualização
it('T30 [FL já presente] retorna sucesso sem contar tentativa ou duplicar', async () => {
  const { service, tx } = fixtureRegistro({ presente: true });
  expect(await service.registrar(CHAMADA_ID, EMAIL, 'HGFEDCBA')).toMatchObject({ registrada: true });
  expect(tx.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
  expect(tx.presenca.upsert).not.toHaveBeenCalled();
});
it('T31 [FL falta anterior] converte presença false para true sem duplicação', async () => {
  const { service, tx } = fixtureRegistro({ presente: false });
  expect(await service.registrar(CHAMADA_ID, EMAIL, CODIGO)).toMatchObject({ registrada: true });
  expect(tx.presenca.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: { present: true } }));
});

// US03 CA03.1 — anonimato
it('T32 [PE sem email] não consulta chamadas se usuário não tem email', async () => {
  const { service, db } = fixtureListar();
  expect(await service.listarAtivas()).toEqual([]);
  expect(db.chamadaCodigo.findMany).not.toHaveBeenCalled();
});

// US03 CA03.2 — filtros de acesso e data
it('T33 [PE matriculado/ativo] consulta exige vínculo, tempo e janela não encerrada', async () => {
  const { service, db } = fixtureListar();
  await service.listarAtivas(EMAIL);
  expect(db.chamadaCodigo.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: {
      expiraEm: { gt: AGORA }, encerradoEm: null,
      aula: { turma: { alunos: { some: { email: EMAIL } } } },
    },
    orderBy: { expiraEm: 'asc' },
  }));
});

// US03 CA03.3 — proibição de vazamento e presença false/true
it('T34 [PE não registrada] devolve registrada false e nenhum segredo', async () => {
  const { service } = fixtureListar([{ present: false }]);
  const lista = await service.listarAtivas(EMAIL);
  expect(lista).toHaveLength(1);
  expect(lista[0].registrada).toBe(false);
  expect(JSON.stringify(lista)).not.toMatch(/codigo|hash|salt/i);
});
it('T35 [PE registrada] devolve registrada true e nenhum segredo', async () => {
  const { service } = fixtureListar([{ present: true }]);
  const lista = await service.listarAtivas(EMAIL);
  expect(lista[0].registrada).toBe(true);
  expect(JSON.stringify(lista)).not.toMatch(/codigo|hash|salt/i);
});

// US03 CA03.4 — status sem janela, ativo e inativo
it('T36 [PE aula inexistente] recusa status', async () => {
  await expect(fixtureStatus(null, false).service.status(AULA_ID)).rejects.toThrow('Aula');
});
it('T37 [PE chamada inexistente] retorna null', async () => {
  expect(await fixtureStatus(null).service.status(AULA_ID)).toBeNull();
});
it('T38 [FL ativa] exibe atividade e quantidade de presentes', async () => {
  const { service, db } = fixtureStatus({
    id: CHAMADA_ID, iniciadoEm: AGORA, expiraEm: new Date(AGORA.getTime() + 60000), encerradoEm: null,
  }, true, 3);
  expect(await service.status(AULA_ID)).toMatchObject({ ativa: true, presentes: 3 });
  expect(db.presenca.count).toHaveBeenCalledWith({ where: { aula_id: AULA_ID, present: true } });
});
it('T39 [FL inativa] identifica encerramento e expiração', async () => {
  const encerrada = fixtureStatus({
    id: CHAMADA_ID, iniciadoEm: AGORA, expiraEm: new Date(AGORA.getTime() + 60000), encerradoEm: AGORA,
  });
  const expirada = fixtureStatus({
    id: CHAMADA_ID, iniciadoEm: AGORA, expiraEm: AGORA, encerradoEm: null,
  });
  expect((await encerrada.service.status(AULA_ID))?.ativa).toBe(false);
  expect((await expirada.service.status(AULA_ID))?.ativa).toBe(false);
});
