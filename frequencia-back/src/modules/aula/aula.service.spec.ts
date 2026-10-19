import { AppException } from '@/common/exceptions/app.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AulaService } from './aula.service';

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const TURMA_ID = '99999999-9999-4999-8999-999999999999';
const ALUNO_A = '22222222-2222-4222-8222-222222222222';
const ALUNO_B = '33333333-3333-4333-8333-333333333333';
const query = { page: 1, limit: 20, skip: 0, take: 20 };

function createPrismaMock() {
  const tx = { presenca: { upsert: vi.fn(), findMany: vi.fn() } };
  const prisma = {
    aula: { findUnique: vi.fn() },
    aluno: { findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  return { prisma, tx };
}

describe('AulaService.registrarPresencas', () => {
  it('faz upsert por (aula, aluno) dentro de uma transação', async () => {
    const { prisma, tx } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID, turma_id: TURMA_ID });
    prisma.aluno.findMany.mockResolvedValue([{ id: ALUNO_A }, { id: ALUNO_B }]);
    tx.presenca.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

    const service = new AulaService(prisma as never);
    const result = await service.registrarPresencas(AULA_ID, {
      presencas: [
        { aluno_id: ALUNO_A, present: false },
        { aluno_id: ALUNO_B, present: true },
      ],
    });

    expect(prisma.aluno.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [ALUNO_A, ALUNO_B] }, turma_id: TURMA_ID } }),
    );
    expect(tx.presenca.upsert).toHaveBeenCalledTimes(2);
    expect(tx.presenca.upsert).toHaveBeenCalledWith({
      where: { aula_id_aluno_id: { aula_id: AULA_ID, aluno_id: ALUNO_A } },
      create: { aula_id: AULA_ID, aluno_id: ALUNO_A, present: false },
      update: { present: false },
    });
    expect(result).toHaveLength(2);
  });

  it('recusa aluno que não é da turma da aula, sem gravar nada', async () => {
    const { prisma } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID, turma_id: TURMA_ID });
    prisma.aluno.findMany.mockResolvedValue([{ id: ALUNO_A }]); // ALUNO_B é de outra turma

    const service = new AulaService(prisma as never);

    await expect(
      service.registrarPresencas(AULA_ID, {
        presencas: [
          { aluno_id: ALUNO_A, present: true },
          { aluno_id: ALUNO_B, present: true },
        ],
      }),
    ).rejects.toBeInstanceOf(AppException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('lança 404 se a aula não existe', async () => {
    const { prisma } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue(null);

    const service = new AulaService(prisma as never);

    await expect(
      service.registrarPresencas(AULA_ID, { presencas: [{ aluno_id: ALUNO_A, present: true }] }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('AulaService.findPresencas (chamada)', () => {
  it('lista todos os alunos da turma, com present null para quem ainda não foi marcado', async () => {
    const { prisma } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID, turma_id: TURMA_ID });
    prisma.aluno.findMany.mockResolvedValue([
      { id: ALUNO_A, name: 'Ana', email: 'ana@x.com', presencas: [{ id: 'p1', present: false }] },
      { id: ALUNO_B, name: 'Bruno', email: 'bruno@x.com', presencas: [] },
    ]);
    prisma.aluno.count.mockResolvedValue(2);

    const service = new AulaService(prisma as never);
    const result = await service.findPresencas(AULA_ID, query as never);

    expect(result.items).toEqual([
      { aluno_id: ALUNO_A, name: 'Ana', email: 'ana@x.com', presenca_id: 'p1', present: false },
      { aluno_id: ALUNO_B, name: 'Bruno', email: 'bruno@x.com', presenca_id: null, present: null },
    ]);
    expect(result.meta.total).toBe(2);
  });
});
