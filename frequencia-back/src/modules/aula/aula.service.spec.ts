import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { AulaService } from './aula.service';

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const ALUNO_A = 'ana@cin.ufpe.br';
const ALUNO_B = 'bruno@cin.ufpe.br';

function createPrismaMock() {
  const tx = {
    presenca: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
  const prisma = {
    aula: { findUnique: vi.fn() },
    presenca: { findFirst: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  };
  return { prisma, tx };
}

describe('AulaService.registrarPresencas', () => {
  it('cria quem não tem registro e atualiza quem já tem (idempotente por aluno)', async () => {
    const { prisma, tx } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID });
    // ALUNO_A já tem registro; ALUNO_B não.
    tx.presenca.findMany
      .mockResolvedValueOnce([{ id: 'p-a', email: ALUNO_A }])
      .mockResolvedValueOnce([{ id: 'p-a' }, { id: 'p-b' }]);

    const service = new AulaService(prisma as never);
    const result = await service.registrarPresencas(AULA_ID, {
      presencas: [
        { email: ALUNO_A, present: false },
        { email: ALUNO_B, present: true },
      ],
    });

    expect(tx.presenca.update).toHaveBeenCalledWith({
      where: { id: 'p-a' },
      data: { present: false },
    });
    expect(tx.presenca.create).toHaveBeenCalledWith({
      data: { aula_id: AULA_ID, email: ALUNO_B, present: true },
    });
    expect(tx.presenca.create).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
  });

  it('lança 404 se a aula não existe, sem abrir transação', async () => {
    const { prisma } = createPrismaMock();
    prisma.aula.findUnique.mockResolvedValue(null);

    const service = new AulaService(prisma as never);

    await expect(
      service.registrarPresencas(AULA_ID, { presencas: [{ email: ALUNO_A, present: true }] }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('AulaService.removePresenca', () => {
  it('lança 404 se a presença não pertence à aula', async () => {
    const { prisma } = createPrismaMock();
    prisma.presenca.findFirst.mockResolvedValue(null);

    const service = new AulaService(prisma as never);

    await expect(
      service.removePresenca(AULA_ID, '33333333-3333-4333-8333-333333333333'),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
    expect(prisma.presenca.delete).not.toHaveBeenCalled();
  });
});
