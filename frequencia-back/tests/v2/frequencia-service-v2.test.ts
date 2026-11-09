/**
 * Sprint 3 — ampliação posterior à v1 oficial (117 casos).
 * Lacuna: a v1 só exercitava calcularResumo/nivelDeFalta diretamente;
 * os caminhos de consulta, autorização por matrícula e consolidação em
 * FrequenciaService não faziam parte do escopo estrutural original.
 *
 * Os testes são unitários com doubles Prisma. Eles NÃO provam integração
 * real com PostgreSQL, autenticação HTTP ou isolamento multitenant completo.
 */
import { describe, expect, it, vi } from 'vitest';
import { ResourceNotFoundException } from '../../src/common/exceptions/resource-not-found.exception';
import { FrequenciaService } from '../../src/modules/frequencia/frequencia.service';

const TURMA_A = { id: 'turma-a', name: 'Algoritmos' };
const TURMA_B = { id: 'turma-b', name: 'Banco de Dados' };

function criarAluno(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: 'aluno-a',
    name: 'Ana',
    email: 'ana@universidade.br',
    turma_id: TURMA_A.id,
    createdAt: new Date('2026-11-01T12:00:00Z'),
    turma: TURMA_A,
    presencas: [
      { present: false, aula: { id: 'aula-antiga', date: new Date('2026-11-01T08:00:00Z') } },
      { present: true, aula: { id: 'aula-nova', date: new Date('2026-11-08T08:00:00Z') } },
    ],
    ...overrides,
  };
}

function criarCenario() {
  const prisma = {
    aluno: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    aula: {
      count: vi.fn().mockResolvedValue(2),
    },
  };
  return { prisma, service: new FrequenciaService(prisma as never) };
}

describe('Sprint 3 — v2 posterior: consolidação de frequência (US04)', () => {
  it('sem email autenticado, retorna lista vazia e não acessa dados pessoais', async () => {
    // US04 — partição: identidade ausente
    const { prisma, service } = criarCenario();
    await expect(service.minhas(undefined)).resolves.toEqual([]);
    expect(prisma.aluno.findMany).not.toHaveBeenCalled();
    expect(prisma.aula.count).not.toHaveBeenCalled();
  });

  it('email vazio também não consulta o cadastro', async () => {
    // US04 — partição inválida adicional
    const { prisma, service } = criarCenario();
    await expect(service.minhas('')).resolves.toEqual([]);
    expect(prisma.aluno.findMany).not.toHaveBeenCalled();
  });

  it('com email e sem matrículas retorna [] e não conta aulas', async () => {
    // US04 — partição: aluno sem vínculo
    const { prisma, service } = criarCenario();
    await expect(service.minhas('ana@universidade.br')).resolves.toEqual([]);
    expect(prisma.aluno.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'ana@universidade.br' },
    }));
    expect(prisma.aula.count).not.toHaveBeenCalled();
  });

  it('consulta somente o email informado e calcula risco por aulas realizadas', async () => {
    // US04 — partição: 1 falta em 2 aulas = 50%, CRITICO
    const { prisma, service } = criarCenario();
    prisma.aluno.findMany.mockResolvedValue([criarAluno()]);
    const lista = await service.minhas('ana@universidade.br');
    expect(prisma.aluno.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'ana@universidade.br' },
    }));
    expect(prisma.aula.count).toHaveBeenCalledWith({
      where: { turma_id: TURMA_A.id, presencas: { some: {} } },
    });
    expect(lista).toHaveLength(1);
    expect(lista[0].resumo).toMatchObject({
      aulas_realizadas: 2,
      presencas: 1,
      faltas: 1,
      percentual_faltas: 50,
      nivel: 'CRITICO',
    });
  });

  it('histórico vem do mais recente para o mais antigo sem alterar estado de presença', async () => {
    // US04 — fluxo: ordenação e preservação de valores
    const { prisma, service } = criarCenario();
    prisma.aluno.findMany.mockResolvedValue([criarAluno()]);
    const [item] = await service.minhas('ana@universidade.br');
    expect(item.historico).toEqual([
      { aula_id: 'aula-nova', date: new Date('2026-11-08T08:00:00Z'), present: true },
      { aula_id: 'aula-antiga', date: new Date('2026-11-01T08:00:00Z'), present: false },
    ]);
  });

  it('em duas turmas, mantém dois resumos independentes e os denominadores respectivos', async () => {
    // US04 — partição: múltiplas matrículas
    const { prisma, service } = criarCenario();
    prisma.aluno.findMany.mockResolvedValue([
      criarAluno(),
      criarAluno({
        id: 'aluno-b', turma_id: TURMA_B.id, turma: TURMA_B,
        presencas: [{ present: true, aula: { id: 'aula-b', date: new Date('2026-11-02') } }],
      }),
    ]);
    prisma.aula.count.mockImplementation(async ({ where }: { where: { turma_id: string } }) =>
      where.turma_id === TURMA_A.id ? 2 : 4,
    );
    const lista = await service.minhas('ana@universidade.br');
    expect(lista).toHaveLength(2);
    expect(lista[0].turma).toEqual(TURMA_A);
    expect(lista[0].resumo.percentual_faltas).toBe(50);
    expect(lista[1].turma).toEqual(TURMA_B);
    expect(lista[1].resumo).toMatchObject({
      aulas_realizadas: 4, presencas: 1, faltas: 0, percentual_faltas: 0, nivel: 'REGULAR',
    });
  });

  it('aluno sem marcações tem percentual zero mesmo se houver aulas registradas', async () => {
    // US04 — partição: aluno novo sem registros de presença
    const { prisma, service } = criarCenario();
    prisma.aluno.findMany.mockResolvedValue([criarAluno({ presencas: [] })]);
    prisma.aula.count.mockResolvedValue(5);
    const [item] = await service.minhas('ana@universidade.br');
    expect(item.historico).toEqual([]);
    expect(item.resumo).toMatchObject({
      aulas_realizadas: 5, presencas: 0, faltas: 0,
      percentual_faltas: 0, nivel: 'REGULAR',
    });
  });

  it('sem aulas realizadas, não divide por zero', async () => {
    // US04 — valor-limite: denominador zero
    const { prisma, service } = criarCenario();
    prisma.aluno.findMany.mockResolvedValue([criarAluno({ presencas: [] })]);
    prisma.aula.count.mockResolvedValue(0);
    const [item] = await service.minhas('ana@universidade.br');
    expect(item.resumo.percentual_faltas).toBe(0);
    expect(item.resumo.nivel).toBe('REGULAR');
  });

  it('detalhe restringe a busca ao aluno e à turma especificados', async () => {
    // US04 — partição: consulta vinculada à turma
    const { prisma, service } = criarCenario();
    prisma.aluno.findFirst.mockResolvedValue(criarAluno());
    const result = await service.detalhe(TURMA_A.id, 'aluno-a');
    expect(prisma.aluno.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { turma_id: TURMA_A.id, id: 'aluno-a' },
    }));
    expect(result.aluno).toEqual({ id: 'aluno-a', name: 'Ana', email: 'ana@universidade.br' });
    expect(result.resumo.nivel).toBe('CRITICO');
  });

  it('detalhe recusa aluno fora da turma com exceção de recurso não encontrado', async () => {
    // US04 — partição inválida: matrícula não encontrada
    const { prisma, service } = criarCenario();
    prisma.aluno.findFirst.mockResolvedValue(null);
    await expect(service.detalhe(TURMA_B.id, 'aluno-a')).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    );
    expect(prisma.aula.count).not.toHaveBeenCalled();
  });

  it('detalhe mantém a regra de atenção exatamente no limite de 25%', async () => {
    // US04 — valor-limite: 1 falta em 4 aulas = 25%, ATENCAO
    const { prisma, service } = criarCenario();
    prisma.aluno.findFirst.mockResolvedValue(criarAluno({
      presencas: [{ present: false, aula: { id: 'aula-limite', date: new Date('2026-11-04') } }],
    }));
    prisma.aula.count.mockResolvedValue(4);
    const result = await service.detalhe(TURMA_A.id, 'aluno-a');
    expect(result.resumo).toMatchObject({
      aulas_realizadas: 4, faltas: 1, percentual_faltas: 25, nivel: 'ATENCAO',
    });
  });
});
