import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { TurmaService } from './turma.service';

const TURMA_ID = '11111111-1111-4111-8111-111111111111';
const query = { page: 1, limit: 20, skip: 0, take: 20 };

describe('TurmaService.findAlunos', () => {
  it('agrupa as presenças por aluno e conta presenças e faltas', async () => {
    const prisma = {
      turma: { findUnique: vi.fn().mockResolvedValue({ id: TURMA_ID }) },
      presenca: {
        findMany: vi.fn().mockResolvedValue([
          { user_id: 'b', present: true },
          { user_id: 'a', present: true },
          { user_id: 'a', present: false },
          { user_id: 'a', present: true },
        ]),
      },
    };
    const service = new TurmaService(prisma as never);

    const result = await service.findAlunos(TURMA_ID, query as never);

    expect(prisma.presenca.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { aula: { turma_id: TURMA_ID } } }),
    );
    expect(result.items).toEqual([
      { user_id: 'a', total_aulas: 3, presencas: 2, faltas: 1 },
      { user_id: 'b', total_aulas: 1, presencas: 1, faltas: 0 },
    ]);
    expect(result.meta.total).toBe(2);
  });

  it('lança 404 se a turma não existe', async () => {
    const prisma = { turma: { findUnique: vi.fn().mockResolvedValue(null) }, presenca: {} };
    const service = new TurmaService(prisma as never);

    await expect(service.findAlunos(TURMA_ID, query as never)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
  });
});
