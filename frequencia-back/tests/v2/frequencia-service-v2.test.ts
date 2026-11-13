/** V2: complementa ausência de testes do FrequenciaService na V1. */
import { describe, expect, it, vi } from 'vitest';
import { FrequenciaService } from '../../src/modules/frequencia/frequencia.service';

const TURMA = '33333333-3333-4333-8333-333333333333';
const ALUNO = '44444444-4444-4444-8444-444444444444';
const EMAIL = 'aluno@example.com';
const aulaAntiga = new Date('2026-11-02T10:00:00.000Z');
const aulaNova = new Date('2026-11-09T10:00:00.000Z');
const aluno = {
  id: ALUNO, name: 'Aluno Teste', email: EMAIL, turma_id: TURMA,
  turma: { id: TURMA, name: 'EDOO' },
  presencas: [
    { present: false, aula: { id: 'aula-velha', date: aulaAntiga } },
    { present: true, aula: { id: 'aula-nova', date: aulaNova } },
  ],
};

describe('V2 - consulta e cálculo de frequência do aluno', () => {
  // US04-CA03 — partição inválida; oráculo a conferir com critério de aceitação.
  it('EVO10 [partição inválida] detalhe de aluno não matriculado gera 404', async () => {
    const prisma = { aluno: { findFirst: vi.fn().mockResolvedValue(null) },
      aula: { count: vi.fn() } };
    const service = new FrequenciaService(prisma as never);
    await expect(service.detalhe(TURMA, ALUNO)).rejects.toThrow();
    expect(prisma.aula.count).not.toHaveBeenCalled();
  });
  // US04-CA03 — partição válida; oráculo a conferir com critério de aceitação.
  it('EVO11 [partição válida] detalhe agrega faltas e ordena histórico desc', async () => {
    const prisma = { aluno: { findFirst: vi.fn().mockResolvedValue(aluno) },
      aula: { count: vi.fn().mockResolvedValue(4) } };
    const saida = await new FrequenciaService(prisma as never).detalhe(TURMA, ALUNO);
    expect(saida.resumo).toMatchObject({ aulas_realizadas: 4, presencas: 1,
      faltas: 1, percentual_faltas: 25, nivel: 'ATENCAO' });
    expect(saida.historico.map((h) => h.aula_id)).toEqual(['aula-nova', 'aula-velha']);
    expect(prisma.aluno.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: ALUNO, turma_id: TURMA },
    }));
  });
  // US04-CA03 — partição inválida; oráculo a conferir com critério de aceitação.
  it('EVO12 [partição inválida] minhas sem e-mail não consulta dados', async () => {
    const prisma = { aluno: { findMany: vi.fn() }, aula: { count: vi.fn() } };
    const saida = await new FrequenciaService(prisma as never).minhas();
    expect(saida).toEqual([]);
    expect(prisma.aluno.findMany).not.toHaveBeenCalled();
  });
  // US04-CA03 — partição válida; oráculo a conferir com critério de aceitação.
  it('EVO13 [partição válida] minhas lista apenas turmas do e-mail informado', async () => {
    const prisma = { aluno: { findMany: vi.fn().mockResolvedValue([aluno]) },
      aula: { count: vi.fn().mockResolvedValue(2) } };
    const saida = await new FrequenciaService(prisma as never).minhas(EMAIL);
    expect(saida).toHaveLength(1);
    expect(saida[0].aluno.email).toBe(EMAIL);
    expect(prisma.aluno.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { email: EMAIL } }));
  });
  // US04-CA02 — limite; oráculo a conferir com critério de aceitação.
  it('EVO14 [limite] zero aulas realizadas retorna 0% sem NaN', async () => {
    const prisma = { aluno: { findMany: vi.fn().mockResolvedValue([{ ...aluno, presencas: [] }]) },
      aula: { count: vi.fn().mockResolvedValue(0) } };
    const [saida] = await new FrequenciaService(prisma as never).minhas(EMAIL);
    expect(saida.resumo.percentual_faltas).toBe(0);
    expect(Number.isFinite(saida.resumo.percentual_faltas)).toBe(true);
  });
});
