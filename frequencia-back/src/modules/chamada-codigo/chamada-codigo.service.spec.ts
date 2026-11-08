import { gerarCodigo, ChamadaCodigoService } from './chamada-codigo.service';

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const CHAMADA_ID = '22222222-2222-4222-8222-222222222222';
const TURMA_ID = '33333333-3333-4333-8333-333333333333';
const ALUNO_ID = '44444444-4444-4444-8444-444444444444';

describe('gerarCodigo', () => {
  it('gera oito letras sem caracteres ambíguos', () => {
    for (let i = 0; i < 30; i++) expect(gerarCodigo()).toMatch(/^[A-HJ-NP-Z]{8}$/);
  });
});

describe('ChamadaCodigoService', () => {
  it('não disponibiliza código em consultas de aluno e só retorna aulas matriculadas', async () => {
    const prisma = {
      chamadaCodigo: {
        findMany: vi.fn().mockResolvedValue([{
          id: CHAMADA_ID,
          expiraEm: new Date(Date.now() + 60000),
          aula: {
            id: AULA_ID, date: new Date('2026-11-07'),
            turma: { id: TURMA_ID, name: 'Estruturas de Dados' },
            presencas: [],
          },
        }]),
      },
    };
    const service = new ChamadaCodigoService(prisma as never);
    const resultado = await service.listarAtivas('aluno@cin.ufpe.br');
    expect(prisma.chamadaCodigo.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        aula: { turma: { alunos: { some: { email: 'aluno@cin.ufpe.br' } } } },
      }),
    }));
    expect(resultado).toHaveLength(1);
    expect(JSON.stringify(resultado)).not.toContain('codigoHash');
    expect(JSON.stringify(resultado)).not.toContain('salt');
  });

  it('nega registro sem email verificado', async () => {
    const service = new ChamadaCodigoService({} as never);
    await expect(service.registrar(CHAMADA_ID, undefined, 'ABCDEFGH')).rejects.toThrow();
  });

  it('nega registro para quem não é da turma', async () => {
    const prisma = {
      chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
        aula_id: AULA_ID, aula: { turma_id: TURMA_ID },
      }) },
      aluno: { findUnique: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn(),
    };
    const service = new ChamadaCodigoService(prisma as never);
    await expect(service.registrar(CHAMADA_ID, 'outro@cin.ufpe.br', 'ABCDEFGH')).rejects.toThrow();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('não registra após a expiração', async () => {
    const prisma = {
      chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
        aula_id: AULA_ID, aula: { turma_id: TURMA_ID },
      }) },
      aluno: { findUnique: vi.fn().mockResolvedValue({ id: ALUNO_ID }) },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({
        $queryRaw: vi.fn(),
        chamadaCodigo: { findUnique: vi.fn().mockResolvedValue({
          id: CHAMADA_ID, aula_id: AULA_ID, expiraEm: new Date(0), encerradoEm: null,
        }) },
      })),
    };
    const service = new ChamadaCodigoService(prisma as never);
    await expect(service.registrar(CHAMADA_ID, 'aluno@cin.ufpe.br', 'ABCDEFGH')).rejects.toThrow(/expirou/);
  });
});
