import { AppException } from '@/common/exceptions/app.exception';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { TurmaService } from './turma.service';

const TURMA_ID = '11111111-1111-4111-8111-111111111111';
const ALUNO_ID = '22222222-2222-4222-8222-222222222222';
const query = { page: 1, limit: 20, skip: 0, take: 20 };

function createPrismaMock() {
  return {
    turma: { findUnique: vi.fn().mockResolvedValue({ id: TURMA_ID }) },
    aula: { count: vi.fn().mockResolvedValue(4) },
    aluno: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe('TurmaService (alunos da turma)', () => {
  it('lista os alunos da turma por ordem de nome, com o resumo de faltas de cada um', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findMany.mockResolvedValue([
      {
        id: ALUNO_ID,
        name: 'Ana',
        presencas: [{ present: true }, { present: true }, { present: true }, { present: false }],
      },
    ]);
    prisma.aluno.count.mockResolvedValue(1);
    const service = new TurmaService(prisma as never);

    const result = await service.findAlunos(TURMA_ID, query as never);

    expect(prisma.aluno.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { turma_id: TURMA_ID }, orderBy: { name: 'asc' } }),
    );
    expect(result.items).toHaveLength(1);
    // 1 falta em 4 aulas realizadas = 25% => no limite, situação crítica.
    expect(result.items[0].resumo).toMatchObject({
      aulas_realizadas: 4,
      presencas: 3,
      faltas: 1,
      percentual_faltas: 25,
      nivel: 'CRITICO',
    });
    expect(result.items[0]).not.toHaveProperty('presencas');
    expect(result.meta.total).toBe(1);
  });

  it('cadastra um aluno novo na turma', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findUnique.mockResolvedValue(null);
    prisma.aluno.create.mockResolvedValue({ id: ALUNO_ID });
    const service = new TurmaService(prisma as never);

    await service.createAluno(TURMA_ID, { name: 'Ana', email: 'ana@x.com' });

    expect(prisma.aluno.create).toHaveBeenCalledWith({
      data: { turma_id: TURMA_ID, name: 'Ana', email: 'ana@x.com' },
    });
  });

  it('recusa e-mail repetido na mesma turma com 409', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findUnique.mockResolvedValue({ id: ALUNO_ID });
    const service = new TurmaService(prisma as never);

    const erro = await service
      .createAluno(TURMA_ID, { name: 'Ana', email: 'ana@x.com' })
      .catch((e: AppException) => e);

    expect(erro).toBeInstanceOf(AppException);
    expect(erro.getStatus()).toBe(409);
    expect(prisma.aluno.create).not.toHaveBeenCalled();
  });

  it('lança 404 ao criar aluno em turma inexistente', async () => {
    const prisma = createPrismaMock();
    prisma.turma.findUnique.mockResolvedValue(null);
    const service = new TurmaService(prisma as never);

    await expect(
      service.createAluno(TURMA_ID, { name: 'Ana', email: 'ana@x.com' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it('lança 404 ao remover aluno que não é da turma', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findFirst.mockResolvedValue(null);
    const service = new TurmaService(prisma as never);

    await expect(service.removeAluno(TURMA_ID, ALUNO_ID)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(prisma.aluno.delete).not.toHaveBeenCalled();
  });
});
