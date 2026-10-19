import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { FrequenciaService } from './frequencia.service';

const TURMA = { id: 't1', name: 'Engenharia de Software' };

function alunoMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    name: 'Ana',
    email: 'ana@x.com',
    turma_id: TURMA.id,
    turma: TURMA,
    presencas: [
      { present: true, aula: { id: 'au1', date: new Date('2026-10-01T00:00:00Z') } },
      { present: false, aula: { id: 'au2', date: new Date('2026-10-08T00:00:00Z') } },
      { present: true, aula: { id: 'au3', date: new Date('2026-10-15T00:00:00Z') } },
      { present: false, aula: { id: 'au4', date: new Date('2026-10-22T00:00:00Z') } },
    ],
    ...overrides,
  };
}

function createPrismaMock() {
  return {
    aluno: { findFirst: vi.fn(), findMany: vi.fn() },
    aula: { count: vi.fn().mockResolvedValue(4) },
  };
}

describe('FrequenciaService.minhas', () => {
  it('devolve a frequência de cada turma em que o e-mail do usuário é aluno', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findMany.mockResolvedValue([alunoMock()]);
    const service = new FrequenciaService(prisma as never);

    const result = await service.minhas('ana@x.com');

    expect(prisma.aluno.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'ana@x.com' } }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].turma).toEqual(TURMA);
    expect(result[0].resumo).toMatchObject({
      faltas: 2,
      presencas: 2,
      percentual_faltas: 50,
      nivel: 'CRITICO',
    });
    // histórico do mais recente para o mais antigo
    expect(result[0].historico.map((h) => h.aula_id)).toEqual(['au4', 'au3', 'au2', 'au1']);
  });

  it('sem e-mail verificado no token não consulta o banco e devolve lista vazia', async () => {
    const prisma = createPrismaMock();
    const service = new FrequenciaService(prisma as never);

    await expect(service.minhas(undefined)).resolves.toEqual([]);
    expect(prisma.aluno.findMany).not.toHaveBeenCalled();
  });
});

describe('FrequenciaService.detalhe', () => {
  it('só encontra o aluno dentro da turma informada', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findFirst.mockResolvedValue(alunoMock());
    const service = new FrequenciaService(prisma as never);

    await service.detalhe('t1', 'a1');

    expect(prisma.aluno.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'a1', turma_id: 't1' } }),
    );
  });

  it('lança 404 se o aluno não é dessa turma', async () => {
    const prisma = createPrismaMock();
    prisma.aluno.findFirst.mockResolvedValue(null);
    const service = new FrequenciaService(prisma as never);

    await expect(service.detalhe('t1', 'a1')).rejects.toBeInstanceOf(ResourceNotFoundException);
  });
});
