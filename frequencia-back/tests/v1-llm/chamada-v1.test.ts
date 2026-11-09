import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ChamadaCodigoService,
  gerarCodigo,
} from '../../src/modules/chamada-codigo/chamada-codigo.service';
import { AbrirChamadaCodigoSchema } from '../../src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto';
import { RegistrarCodigoSchema } from '../../src/modules/chamada-codigo/dto/registrar-codigo.dto';
import { calcularResumo, nivelDeFalta } from '../../src/modules/frequencia/frequencia.util';
import { AccessDeniedException } from '../../src/common/exceptions/access-denied.exception';
import { ResourceNotFoundException } from '../../src/common/exceptions/resource-not-found.exception';

// ---------------------------------------------------------------------------
// Constantes e utilitários
// ---------------------------------------------------------------------------

const AULA_ID = '11111111-1111-4111-8111-111111111111';
const TURMA_ID = '22222222-2222-4222-8222-222222222222';
const CHAMADA_ID = '33333333-3333-4333-8333-333333333333';
const ALUNO_ID = '44444444-4444-4444-8444-444444444444';
const EMAIL = 'aluno@ufpe.br';

const AGORA = new Date('2026-03-10T10:00:00.000Z');
const MINUTO = 60_000;

const FORMATO_CODIGO = /^[A-HJ-NP-Z]{8}$/;

type PrismaMock = ReturnType<typeof criarPrismaMock>;

/** Mock do PrismaService. O cliente transacional (`tx`) é o próprio mock. */
function criarPrismaMock() {
  const prisma = {
    $queryRaw: vi.fn().mockResolvedValue([{ id: AULA_ID }]),
    $transaction: vi.fn(),
    aula: { findUnique: vi.fn() },
    aluno: { findUnique: vi.fn() },
    chamadaCodigo: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    chamadaCodigoTentativa: {
      upsert: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    presenca: {
      findUnique: vi.fn(),
      upsert: vi.fn().mockResolvedValue({}),
      create: vi.fn(),
      count: vi.fn(),
    },
  };
  prisma.$transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => cb(prisma));
  return prisma;
}

function criarServico(prisma: PrismaMock) {
  return new ChamadaCodigoService(prisma as never);
}

/** Executa `abrir` num mock isolado e devolve o código revelado e o que foi persistido. */
async function abrirChamada(duracaoMinutos = 10) {
  const prisma = criarPrismaMock();
  prisma.chamadaCodigo.findUnique.mockResolvedValue(null);
  prisma.chamadaCodigo.upsert.mockImplementation(async ({ create }: { create: Record<string, unknown> }) => ({
    id: CHAMADA_ID,
    encerradoEm: null,
    ...create,
  }));
  const resposta = await criarServico(prisma).abrir(AULA_ID, { duracaoMinutos } as never);
  const persistido = prisma.chamadaCodigo.upsert.mock.calls[0][0].create as {
    codigoHash: string;
    salt: string;
    expiraEm: Date;
  };
  return { resposta, persistido, prisma };
}

/** Gera um código válido no alfabeto, diferente do informado. */
function outroCodigo(codigo: string): string {
  return (codigo[0] === 'A' ? 'B' : 'A') + codigo.slice(1);
}

interface CenarioRegistro {
  codigoHash: string;
  salt: string;
  expiraEm?: Date;
  encerradoEm?: Date | null;
  presencaExistente?: { present: boolean } | null;
  tentativasAnteriores?: number;
  alunoMatriculado?: boolean;
  chamadaExiste?: boolean;
}

/** Prepara o mock para o fluxo de `registrar`, com contador de tentativas com estado. */
function prepararRegistro(c: CenarioRegistro) {
  const prisma = criarPrismaMock();
  const chamada = {
    id: CHAMADA_ID,
    aula_id: AULA_ID,
    aula: { turma_id: TURMA_ID },
    codigoHash: c.codigoHash,
    salt: c.salt,
    iniciadoEm: AGORA,
    expiraEm: c.expiraEm ?? new Date(AGORA.getTime() + 10 * MINUTO),
    encerradoEm: c.encerradoEm ?? null,
  };
  prisma.chamadaCodigo.findUnique.mockResolvedValue(c.chamadaExiste === false ? null : chamada);
  prisma.aluno.findUnique.mockResolvedValue(c.alunoMatriculado === false ? null : { id: ALUNO_ID });

  let presenca = c.presencaExistente ?? null;
  prisma.presenca.findUnique.mockImplementation(async () => presenca);
  prisma.presenca.upsert.mockImplementation(async () => {
    presenca = { present: true };
    return { aula_id: AULA_ID, aluno_id: ALUNO_ID, present: true };
  });

  const contador = { total: c.tentativasAnteriores ?? 0 };
  prisma.chamadaCodigoTentativa.upsert.mockImplementation(async () => {
    contador.total += 1;
    return { total: contador.total };
  });

  return { prisma, servico: criarServico(prisma), contador };
}

// Relógio determinístico: apenas `Date` é falsificado, promessas seguem normais.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(AGORA);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ===========================================================================
// US01 — Abrir e administrar uma chamada temporária
// ===========================================================================

describe('US01 — Abrir e administrar uma chamada temporária', () => {
  describe('CA01.1 — duração entre 1 e 15 minutos (inteiro)', () => {
    it('aceita 1 minuto', () => {
      // US01 CA01.1 — valor-limite: limite inferior válido (1)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 1 }).success).toBe(true);
    });

    it('rejeita 0 minutos', () => {
      // US01 CA01.1 — valor-limite: logo abaixo do limite inferior (0)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 0 }).success).toBe(false);
    });

    it('aceita 15 minutos', () => {
      // US01 CA01.1 — valor-limite: limite superior válido (15)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 15 }).success).toBe(true);
    });

    it('rejeita 16 minutos', () => {
      // US01 CA01.1 — valor-limite: logo acima do limite superior (16)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 16 }).success).toBe(false);
    });

    it('aceita valor intermediário (8)', () => {
      // US01 CA01.1 — partição: inteiro válido dentro da faixa
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 8 }).success).toBe(true);
    });

    it('rejeita valor negativo', () => {
      // US01 CA01.1 — partição: inteiro inválido abaixo da faixa
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: -5 }).success).toBe(false);
    });

    it('rejeita valor muito acima da faixa', () => {
      // US01 CA01.1 — partição: inteiro inválido acima da faixa
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 60 }).success).toBe(false);
    });

    it('rejeita número não inteiro', () => {
      // US01 CA01.1 — partição: número fracionário dentro da faixa
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 7.5 }).success).toBe(false);
    });

    it('rejeita fração próxima do limite inferior', () => {
      // US01 CA01.1 — valor-limite: 1.5 (não inteiro, ao lado de 1)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: 1.5 }).success).toBe(false);
    });

    it('rejeita tipo não numérico', () => {
      // US01 CA01.1 — partição: tipo inválido (string)
      expect(AbrirChamadaCodigoSchema.safeParse({ duracaoMinutos: '5' }).success).toBe(false);
    });

    it('rejeita ausência da duração', () => {
      // US01 CA01.1 — partição: campo ausente
      expect(AbrirChamadaCodigoSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('CA01.2 — código de 8 letras maiúsculas sem I/O e expiração', () => {
    it('a abertura devolve código com 8 letras do alfabeto permitido', async () => {
      // US01 CA01.2 — partição: código gerado na abertura
      const { resposta } = await abrirChamada();
      expect(resposta.codigo).toMatch(FORMATO_CODIGO);
      expect(resposta.codigo).toHaveLength(8);
    });

    it('nenhum código gerado contém I, O ou caracteres fora do alfabeto', () => {
      // US01 CA01.2 — partição: amostra grande de códigos gerados
      for (let i = 0; i < 2000; i++) {
        const codigo = gerarCodigo();
        expect(codigo).toMatch(FORMATO_CODIGO);
        expect(codigo).not.toMatch(/[IO]/);
      }
    });

    it('os códigos são aleatórios (não se repetem em sequência)', () => {
      // US01 CA01.2 — fluxo: geração aleatória
      const codigos = new Set(Array.from({ length: 50 }, () => gerarCodigo()));
      expect(codigos.size).toBeGreaterThan(45);
    });

    it('expira após 1 minuto quando a duração é 1', async () => {
      // US01 CA01.2 — valor-limite: duração mínima
      const { resposta, persistido } = await abrirChamada(1);
      expect(resposta.expiraEm.getTime()).toBe(AGORA.getTime() + 1 * MINUTO);
      expect(persistido.expiraEm.getTime()).toBe(AGORA.getTime() + 1 * MINUTO);
      expect(resposta.ativa).toBe(true);
    });

    it('expira após 15 minutos quando a duração é 15', async () => {
      // US01 CA01.2 — valor-limite: duração máxima
      const { resposta, persistido } = await abrirChamada(15);
      expect(resposta.expiraEm.getTime()).toBe(AGORA.getTime() + 15 * MINUTO);
      expect(persistido.expiraEm.getTime()).toBe(AGORA.getTime() + 15 * MINUTO);
    });

    it('fica ativa 1 ms antes do prazo e inativa exatamente no prazo', async () => {
      // US01 CA01.2 — valor-limite: instantes ao redor da expiração
      const { persistido } = await abrirChamada(5);
      const prisma = criarPrismaMock();
      prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID });
      prisma.chamadaCodigo.findUnique.mockResolvedValue({
        id: CHAMADA_ID,
        aula_id: AULA_ID,
        iniciadoEm: AGORA,
        expiraEm: persistido.expiraEm,
        encerradoEm: null,
        codigoHash: persistido.codigoHash,
        salt: persistido.salt,
      });
      prisma.presenca.count.mockResolvedValue(0);
      const servico = criarServico(prisma);

      vi.setSystemTime(persistido.expiraEm.getTime() - 1);
      expect((await servico.status(AULA_ID))?.ativa).toBe(true);

      vi.setSystemTime(persistido.expiraEm.getTime());
      expect((await servico.status(AULA_ID))?.ativa).toBe(false);
    });
  });

  describe('CA01.3 — o código só aparece na resposta da abertura', () => {
    it('a resposta da abertura expõe o código, mas não hash nem salt', async () => {
      // US01 CA01.3 — partição: resposta de abertura
      const { resposta } = await abrirChamada();
      expect(resposta).toHaveProperty('codigo');
      expect(resposta).not.toHaveProperty('codigoHash');
      expect(resposta).not.toHaveProperty('salt');
    });

    it('o código não é persistido em texto puro', async () => {
      // US01 CA01.3 — fluxo: persistência guarda apenas hash e salt
      const { resposta, prisma } = await abrirChamada();
      const args = prisma.chamadaCodigo.upsert.mock.calls[0][0];
      expect(JSON.stringify(args)).not.toContain(resposta.codigo);
    });

    it('a consulta de status não expõe código, hash ou salt', async () => {
      // US01 CA01.3 — partição: resposta de status
      const prisma = criarPrismaMock();
      prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID });
      prisma.chamadaCodigo.findUnique.mockResolvedValue({
        id: CHAMADA_ID,
        aula_id: AULA_ID,
        codigo: 'ABCDEFGH',
        codigoHash: 'deadbeef',
        salt: 'cafebabe',
        iniciadoEm: AGORA,
        expiraEm: new Date(AGORA.getTime() + 5 * MINUTO),
        encerradoEm: null,
      });
      prisma.presenca.count.mockResolvedValue(3);

      const status = await criarServico(prisma).status(AULA_ID);
      expect(status).not.toBeNull();
      expect(status).not.toHaveProperty('codigo');
      expect(status).not.toHaveProperty('codigoHash');
      expect(status).not.toHaveProperty('salt');
      expect(JSON.stringify(status)).not.toMatch(/ABCDEFGH|deadbeef|cafebabe/);
    });
  });

  describe('CA01.4 — reabrir substitui código e prazo, reativa e zera tentativas', () => {
    function prepararReabertura() {
      const prisma = criarPrismaMock();
      const anterior = {
        id: CHAMADA_ID,
        aula_id: AULA_ID,
        codigoHash: 'hash-antigo',
        salt: 'salt-antigo',
        iniciadoEm: new Date(AGORA.getTime() - 30 * MINUTO),
        expiraEm: new Date(AGORA.getTime() - 20 * MINUTO),
        encerradoEm: new Date(AGORA.getTime() - 25 * MINUTO),
      };
      prisma.chamadaCodigo.findUnique.mockResolvedValue(anterior);
      prisma.chamadaCodigo.upsert.mockImplementation(async ({ update }: { update: Record<string, unknown> }) => ({
        ...anterior,
        ...update,
      }));
      return { prisma, anterior };
    }

    it('remove os contadores de tentativa da janela anterior', async () => {
      // US01 CA01.4 — fluxo: reabertura com janela existente
      const { prisma } = prepararReabertura();
      await criarServico(prisma).abrir(AULA_ID, { duracaoMinutos: 10 } as never);
      expect(prisma.chamadaCodigoTentativa.deleteMany).toHaveBeenCalledWith({
        where: { chamada_id: CHAMADA_ID },
      });
    });

    it('substitui hash, salt e prazo e limpa encerradoEm', async () => {
      // US01 CA01.4 — fluxo: reabertura de janela encerrada
      const { prisma, anterior } = prepararReabertura();
      const resposta = await criarServico(prisma).abrir(AULA_ID, { duracaoMinutos: 10 } as never);
      const { update } = prisma.chamadaCodigo.upsert.mock.calls[0][0];

      expect(update.codigoHash).not.toBe(anterior.codigoHash);
      expect(update.salt).not.toBe(anterior.salt);
      expect(update.encerradoEm).toBeNull();
      expect((update.expiraEm as Date).getTime()).toBe(AGORA.getTime() + 10 * MINUTO);
      expect(resposta.ativa).toBe(true);
      expect(resposta.encerradoEm).toBeNull();
      expect(resposta.expiraEm.getTime()).toBe(AGORA.getTime() + 10 * MINUTO);
    });

    it('duas aberturas seguidas geram códigos diferentes', async () => {
      // US01 CA01.4 — fluxo: o novo código substitui o anterior
      const primeira = await abrirChamada();
      const segunda = await abrirChamada();
      expect(segunda.resposta.codigo).not.toBe(primeira.resposta.codigo);
      expect(segunda.persistido.codigoHash).not.toBe(primeira.persistido.codigoHash);
    });

    it('o código antigo deixa de valer após a reabertura', async () => {
      // US01 CA01.4 — fluxo: registro com código da janela anterior
      const antiga = await abrirChamada();
      const nova = await abrirChamada();
      const { servico, prisma } = prepararRegistro({
        codigoHash: nova.persistido.codigoHash,
        salt: nova.persistido.salt,
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, antiga.resposta.codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('primeira abertura não tenta apagar tentativas inexistentes', async () => {
      // US01 CA01.4 — partição: abertura sem janela anterior
      const { prisma } = await abrirChamada();
      expect(prisma.chamadaCodigoTentativa.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('CA01.5 — erros para aula inexistente ou janela inexistente', () => {
    it('abrir chamada para aula inexistente gera erro', async () => {
      // US01 CA01.5 — partição: aula inexistente (abrir)
      const prisma = criarPrismaMock();
      prisma.$queryRaw.mockResolvedValue([]);
      await expect(
        criarServico(prisma).abrir(AULA_ID, { duracaoMinutos: 5 } as never),
      ).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(prisma.chamadaCodigo.upsert).not.toHaveBeenCalled();
    });

    it('encerrar chamada de aula inexistente gera erro', async () => {
      // US01 CA01.5 — partição: aula inexistente (encerrar)
      const prisma = criarPrismaMock();
      prisma.$queryRaw.mockResolvedValue([]);
      await expect(criarServico(prisma).encerrar(AULA_ID)).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(prisma.chamadaCodigo.update).not.toHaveBeenCalled();
    });

    it('encerrar aula sem janela existente gera erro', async () => {
      // US01 CA01.5 — partição: aula existente sem janela
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findUnique.mockResolvedValue(null);
      await expect(criarServico(prisma).encerrar(AULA_ID)).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(prisma.chamadaCodigo.update).not.toHaveBeenCalled();
    });

    it('encerrar aula com janela existente não gera erro', async () => {
      // US01 CA01.5 — partição: aula e janela existentes (classe válida)
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findUnique.mockResolvedValue({ id: CHAMADA_ID, aula_id: AULA_ID });
      await expect(criarServico(prisma).encerrar(AULA_ID)).resolves.toBeUndefined();
    });
  });

  describe('CA01.6 — encerrar fixa encerradoEm e impede registro posterior', () => {
    it('encerrar grava encerradoEm com o instante atual', async () => {
      // US01 CA01.6 — fluxo: encerramento
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findUnique.mockResolvedValue({ id: CHAMADA_ID, aula_id: AULA_ID });
      await criarServico(prisma).encerrar(AULA_ID);
      expect(prisma.chamadaCodigo.update).toHaveBeenCalledWith({
        where: { id: CHAMADA_ID },
        data: { encerradoEm: AGORA },
      });
    });

    it('após o encerramento, registro com código correto é recusado', async () => {
      // US01 CA01.6 — fluxo: registro em janela encerrada dentro do prazo
      const { resposta, persistido } = await abrirChamada(10);
      const { servico, prisma } = prepararRegistro({
        codigoHash: persistido.codigoHash,
        salt: persistido.salt,
        expiraEm: persistido.expiraEm,
        encerradoEm: AGORA,
      });
      vi.setSystemTime(AGORA.getTime() + MINUTO);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, resposta.codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });
  });
});

// ===========================================================================
// US02 — Registrar presença com código
// ===========================================================================

describe('US02 — Registrar presença com código', () => {
  let codigo: string;
  let codigoHash: string;
  let salt: string;

  beforeEach(async () => {
    const aberta = await abrirChamada(10);
    codigo = aberta.resposta.codigo;
    codigoHash = aberta.persistido.codigoHash;
    salt = aberta.persistido.salt;
  });

  describe('CA02.1 — apenas aluno identificado e matriculado', () => {
    it('sem e-mail identificado o registro é negado', async () => {
      // US02 CA02.1 — partição: e-mail ausente (undefined)
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, undefined, codigo)).rejects.toBeInstanceOf(AccessDeniedException);
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('com e-mail vazio o registro é negado', async () => {
      // US02 CA02.1 — valor-limite: e-mail string vazia
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, '', codigo)).rejects.toBeInstanceOf(AccessDeniedException);
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('aluno não matriculado na turma da aula é negado', async () => {
      // US02 CA02.1 — partição: e-mail identificado, sem matrícula
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, alunoMatriculado: false });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toBeInstanceOf(AccessDeniedException);
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
      expect(prisma.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
    });

    it('a matrícula é verificada na turma da aula com o e-mail informado', async () => {
      // US02 CA02.1 — fluxo: busca pela chave turma + e-mail
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      await servico.registrar(CHAMADA_ID, EMAIL, codigo);
      expect(prisma.aluno.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { turma_id_email: { turma_id: TURMA_ID, email: EMAIL } } }),
      );
    });

    it('aluno matriculado com e-mail identificado consegue registrar', async () => {
      // US02 CA02.1 — partição: classe válida
      const { servico } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
    });

    it('chamada inexistente gera erro', async () => {
      // US02 CA02.1 — partição: chamada informada não existe
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, chamadaExiste: false });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toBeInstanceOf(ResourceNotFoundException);
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });
  });

  describe('CA02.2 — formato do código informado', () => {
    const valida = (c: unknown) => RegistrarCodigoSchema.safeParse({ codigo: c });

    it('aceita 8 letras maiúsculas do alfabeto', () => {
      // US02 CA02.2 — partição: código válido canônico
      const r = valida('ABCDEFGH');
      expect(r.success).toBe(true);
      expect(r.data?.codigo).toBe('ABCDEFGH');
    });

    it('aceita letras minúsculas, normalizando para maiúsculas', () => {
      // US02 CA02.2 — partição: minúsculas
      const r = valida('abcdefgh');
      expect(r.success).toBe(true);
      expect(r.data?.codigo).toBe('ABCDEFGH');
    });

    it('aceita espaços periféricos, removendo-os', () => {
      // US02 CA02.2 — partição: espaços nas bordas
      const r = valida('   zyxwvuts  ');
      expect(r.success).toBe(true);
      expect(r.data?.codigo).toBe('ZYXWVUTS');
    });

    it('aceita espaços periféricos combinados com caixa mista', () => {
      // US02 CA02.2 — partição: espaços + caixa mista
      const r = valida('\taBcDeFgH \n');
      expect(r.success).toBe(true);
      expect(r.data?.codigo).toBe('ABCDEFGH');
    });

    it('rejeita 7 letras', () => {
      // US02 CA02.2 — valor-limite: um caractere a menos (7)
      expect(valida('ABCDEFG').success).toBe(false);
    });

    it('rejeita 9 letras', () => {
      // US02 CA02.2 — valor-limite: um caractere a mais (9)
      expect(valida('ABCDEFGHJ').success).toBe(false);
    });

    it('rejeita 7 letras mesmo com espaços completando 8 caracteres', () => {
      // US02 CA02.2 — valor-limite: espaço periférico não conta como letra
      expect(valida('ABCDEFG ').success).toBe(false);
    });

    it('rejeita código vazio', () => {
      // US02 CA02.2 — valor-limite: tamanho zero
      expect(valida('').success).toBe(false);
      expect(valida('        ').success).toBe(false);
    });

    it('rejeita a letra I', () => {
      // US02 CA02.2 — partição: letra fora do alfabeto (I)
      expect(valida('ABCDEFGI').success).toBe(false);
      expect(valida('abcdefgi').success).toBe(false);
    });

    it('rejeita a letra O', () => {
      // US02 CA02.2 — partição: letra fora do alfabeto (O)
      expect(valida('ABCDEFGO').success).toBe(false);
      expect(valida('abcdefgo').success).toBe(false);
    });

    it('aceita as letras vizinhas de I e O (H, J, N, P)', () => {
      // US02 CA02.2 — valor-limite: letras adjacentes às excluídas
      expect(valida('HJNPHJNP').success).toBe(true);
    });

    it('aceita as letras extremas do alfabeto (A e Z)', () => {
      // US02 CA02.2 — valor-limite: extremos do alfabeto
      expect(valida('AAAAZZZZ').success).toBe(true);
    });

    it('rejeita dígitos', () => {
      // US02 CA02.2 — partição: caractere numérico
      expect(valida('ABCDEFG1').success).toBe(false);
    });

    it('rejeita espaço interno', () => {
      // US02 CA02.2 — partição: espaço no meio do código
      expect(valida('ABCD EFGH').success).toBe(false);
      expect(valida('ABC EFGH').success).toBe(false);
    });

    it('rejeita letras acentuadas e símbolos', () => {
      // US02 CA02.2 — partição: caracteres fora de A-Z
      expect(valida('ABCDEFGÁ').success).toBe(false);
      expect(valida('ABCDEFG-').success).toBe(false);
    });

    it('rejeita valor que não é texto', () => {
      // US02 CA02.2 — partição: tipo inválido
      expect(valida(12345678).success).toBe(false);
      expect(RegistrarCodigoSchema.safeParse({}).success).toBe(false);
    });

    it('o serviço aceita o código correto em minúsculas e com espaços periféricos', async () => {
      // US02 CA02.2 — fluxo: normalização no registro
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, `  ${codigo.toLowerCase()}  `)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('CA02.3 — código correto em chamada ativa registra presença', () => {
    it('registra a presença do aluno com present: true', async () => {
      // US02 CA02.3 — fluxo: caminho feliz
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      const r = await servico.registrar(CHAMADA_ID, EMAIL, codigo);

      expect(r).toEqual({ aula_id: AULA_ID, registrada: true });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
      const args = prisma.presenca.upsert.mock.calls[0][0];
      expect(args.where).toEqual({ aula_id_aluno_id: { aula_id: AULA_ID, aluno_id: ALUNO_ID } });
      expect(args.create).toEqual({ aula_id: AULA_ID, aluno_id: ALUNO_ID, present: true });
      expect(args.update).toEqual({ present: true });
    });

    it('registra quando faltam 1 ms para expirar', async () => {
      // US02 CA02.3 — valor-limite: último instante válido da janela
      const expiraEm = new Date(AGORA.getTime() + 10 * MINUTO);
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, expiraEm });
      vi.setSystemTime(expiraEm.getTime() - 1);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('CA02.4 — código incorreto consome tentativa; 6ª é bloqueada', () => {
    it('código incorreto gera erro e não registra presença', async () => {
      // US02 CA02.4 — partição: código válido no formato, porém incorreto
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('código incorreto consome uma tentativa', async () => {
      // US02 CA02.4 — fluxo: contagem de tentativas
      const { servico, prisma, contador } = prepararRegistro({ codigoHash, salt });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      expect(prisma.chamadaCodigoTentativa.upsert).toHaveBeenCalledTimes(1);
      expect(contador.total).toBe(1);
    });

    it('5ª tentativa (após 4 erros) com código correto ainda registra', async () => {
      // US02 CA02.4 — valor-limite: 5ª tentativa (última permitida)
      const { servico, prisma, contador } = prepararRegistro({ codigoHash, salt });
      for (let i = 0; i < 4; i++) {
        await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      }
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(contador.total).toBe(5);
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
    });

    it('6ª tentativa (após 5 erros) é bloqueada mesmo com código correto', async () => {
      // US02 CA02.4 — valor-limite: 6ª tentativa
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      for (let i = 0; i < 5; i++) {
        await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      }
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('o bloqueio da 6ª tentativa é um erro distinto do de código incorreto', async () => {
      // US02 CA02.4 — partição: tentativa bloqueada × tentativa inválida
      const { servico } = prepararRegistro({ codigoHash, salt });
      const erros: unknown[] = [];
      for (let i = 0; i < 6; i++) {
        erros.push(await servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo)).catch((e: unknown) => e));
      }
      const quinta = erros[4] as Error;
      const sexta = erros[5] as Error;
      expect(quinta).toBeInstanceOf(Error);
      expect(sexta).toBeInstanceOf(Error);
      expect(sexta.message).not.toBe(quinta.message);
    });

    it('com 5 tentativas já consumidas, nova tentativa correta é bloqueada', async () => {
      // US02 CA02.4 — valor-limite: contador persistido em 5
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, tentativasAnteriores: 5 });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('com 4 tentativas já consumidas, nova tentativa correta registra', async () => {
      // US02 CA02.4 — valor-limite: contador persistido em 4
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, tentativasAnteriores: 4 });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
    });

    it('a tentativa incorreta é efetivada (a transação não é revertida por exceção)', async () => {
      // US02 CA02.4 — fluxo: o consumo da tentativa precisa persistir
      const { servico, prisma } = prepararRegistro({ codigoHash, salt });
      let transacaoFalhou = false;
      prisma.$transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
        try {
          return await cb(prisma);
        } catch (e) {
          transacaoFalhou = true;
          throw e;
        }
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      expect(transacaoFalhou).toBe(false);
      expect(prisma.chamadaCodigoTentativa.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('CA02.5 — chamada encerrada ou expirada não aceita registro', () => {
    it('chamada encerrada recusa código correto', async () => {
      // US02 CA02.5 — partição: janela encerrada antes do prazo
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, encerradoEm: AGORA });
      vi.setSystemTime(AGORA.getTime() + 1);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('chamada expirada há tempo recusa código correto', async () => {
      // US02 CA02.5 — partição: janela expirada
      const expiraEm = new Date(AGORA.getTime() - 5 * MINUTO);
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, expiraEm });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('o instante exato da expiração já é inválido', async () => {
      // US02 CA02.5 — valor-limite: agora === expiraEm
      const expiraEm = new Date(AGORA.getTime() + 10 * MINUTO);
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, expiraEm });
      vi.setSystemTime(expiraEm);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('1 ms após a expiração também é inválido', async () => {
      // US02 CA02.5 — valor-limite: agora = expiraEm + 1 ms
      const expiraEm = new Date(AGORA.getTime() + 10 * MINUTO);
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, expiraEm });
      vi.setSystemTime(expiraEm.getTime() + 1);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('janela encerrada/expirada não consome tentativa', async () => {
      // US02 CA02.5 — fluxo: recusa antes da contagem de tentativas
      const { servico, prisma } = prepararRegistro({ codigoHash, salt, encerradoEm: AGORA });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      expect(prisma.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
    });
  });

  describe('CA02.6 — presença já registrada', () => {
    it('retorna sucesso sem duplicar presença nem consumir tentativa', async () => {
      // US02 CA02.6 — partição: aluno já presente
      const { servico, prisma } = prepararRegistro({
        codigoHash,
        salt,
        presencaExistente: { present: true },
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
      expect(prisma.presenca.create).not.toHaveBeenCalled();
      expect(prisma.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
    });

    it('registrar duas vezes seguidas consome tentativa apenas uma vez', async () => {
      // US02 CA02.6 — fluxo: segundo envio após registro bem-sucedido
      const { servico, prisma, contador } = prepararRegistro({ codigoHash, salt });
      await servico.registrar(CHAMADA_ID, EMAIL, codigo);
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
      expect(contador.total).toBe(1);
    });

    it('presença já registrada não é afetada pelo limite de tentativas', async () => {
      // US02 CA02.6 — valor-limite: já presente com 5 tentativas consumidas
      const { servico, prisma } = prepararRegistro({
        codigoHash,
        salt,
        presencaExistente: { present: true },
        tentativasAnteriores: 5,
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.chamadaCodigoTentativa.upsert).not.toHaveBeenCalled();
    });
  });

  describe('CA02.7 — falta anterior pode virar presença', () => {
    it('atualiza a linha existente para present: true sem criar outra', async () => {
      // US02 CA02.7 — partição: presença existente com present: false
      const { servico, prisma } = prepararRegistro({
        codigoHash,
        salt,
        presencaExistente: { present: false },
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, codigo)).resolves.toEqual({
        aula_id: AULA_ID,
        registrada: true,
      });
      expect(prisma.presenca.create).not.toHaveBeenCalled();
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
      const args = prisma.presenca.upsert.mock.calls[0][0];
      // A chave única (aula, aluno) garante que a linha existente é a atualizada.
      expect(args.where).toEqual({ aula_id_aluno_id: { aula_id: AULA_ID, aluno_id: ALUNO_ID } });
      expect(args.update).toEqual({ present: true });
    });

    it('falta anterior com código incorreto continua falta', async () => {
      // US02 CA02.7 — partição: falta anterior + código incorreto
      const { servico, prisma } = prepararRegistro({
        codigoHash,
        salt,
        presencaExistente: { present: false },
      });
      await expect(servico.registrar(CHAMADA_ID, EMAIL, outroCodigo(codigo))).rejects.toThrow();
      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });
  });
});

// ===========================================================================
// US03 — Consultar chamadas disponíveis
// ===========================================================================

describe('US03 — Consultar chamadas disponíveis', () => {
  function linhaFindMany(presencas: { present: boolean }[]) {
    return {
      id: CHAMADA_ID,
      expiraEm: new Date(AGORA.getTime() + 5 * MINUTO),
      codigoHash: 'hash-secreto',
      salt: 'salt-secreto',
      aula: {
        id: AULA_ID,
        date: new Date('2026-03-10T00:00:00.000Z'),
        turma: { id: TURMA_ID, name: 'Turma A' },
        presencas,
      },
    };
  }

  describe('CA03.1 — sem e-mail, lista vazia sem consultar o banco', () => {
    it('e-mail undefined retorna [] sem consulta', async () => {
      // US03 CA03.1 — partição: e-mail ausente
      const prisma = criarPrismaMock();
      await expect(criarServico(prisma).listarAtivas(undefined)).resolves.toEqual([]);
      expect(prisma.chamadaCodigo.findMany).not.toHaveBeenCalled();
    });

    it('e-mail vazio retorna [] sem consulta', async () => {
      // US03 CA03.1 — valor-limite: e-mail string vazia
      const prisma = criarPrismaMock();
      await expect(criarServico(prisma).listarAtivas('')).resolves.toEqual([]);
      expect(prisma.chamadaCodigo.findMany).not.toHaveBeenCalled();
    });

    it('com e-mail, o banco é consultado', async () => {
      // US03 CA03.1 — partição: e-mail presente (classe válida)
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([]);
      await criarServico(prisma).listarAtivas(EMAIL);
      expect(prisma.chamadaCodigo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('CA03.2 — filtro por janelas abertas, não expiradas e da turma do aluno', () => {
    it('a consulta filtra por expiraEm > agora, encerradoEm nulo e matrícula do aluno', async () => {
      // US03 CA03.2 — fluxo: filtro da consulta
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([]);
      await criarServico(prisma).listarAtivas(EMAIL);

      const { where } = prisma.chamadaCodigo.findMany.mock.calls[0][0];
      expect(where.encerradoEm).toBeNull();
      expect(where.expiraEm).toEqual({ gt: AGORA });
      expect(where.aula).toEqual({ turma: { alunos: { some: { email: EMAIL } } } });
    });

    it('a fronteira de expiração é estrita (gt), excluindo expiraEm === agora', async () => {
      // US03 CA03.2 — valor-limite: janela que expira exatamente agora
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([]);
      await criarServico(prisma).listarAtivas(EMAIL);
      const { where } = prisma.chamadaCodigo.findMany.mock.calls[0][0];
      expect(where.expiraEm).not.toHaveProperty('gte');
      expect(where.expiraEm.gt.getTime()).toBe(AGORA.getTime());
    });
  });

  describe('CA03.3 — resposta sem segredos e com indicador de registro', () => {
    it('não expõe código, hash ou salt', async () => {
      // US03 CA03.3 — partição: item da lista
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([linhaFindMany([])]);
      const [item] = await criarServico(prisma).listarAtivas(EMAIL);

      expect(item).not.toHaveProperty('codigo');
      expect(item).not.toHaveProperty('codigoHash');
      expect(item).not.toHaveProperty('salt');
      expect(JSON.stringify(item)).not.toMatch(/hash-secreto|salt-secreto/);
    });

    it('a consulta não seleciona código, hash ou salt', async () => {
      // US03 CA03.3 — fluxo: projeção da consulta
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([]);
      await criarServico(prisma).listarAtivas(EMAIL);
      const { select } = prisma.chamadaCodigo.findMany.mock.calls[0][0];
      expect(select).not.toHaveProperty('codigoHash');
      expect(select).not.toHaveProperty('salt');
      expect(select).not.toHaveProperty('codigo');
    });

    it('informa registrada: true quando há presença do aluno', async () => {
      // US03 CA03.3 — partição: presença registrada
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([linhaFindMany([{ present: true }])]);
      const [item] = await criarServico(prisma).listarAtivas(EMAIL);
      expect(item.registrada).toBe(true);
    });

    it('informa registrada: false quando não há marcação', async () => {
      // US03 CA03.3 — partição: sem marcação
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([linhaFindMany([])]);
      const [item] = await criarServico(prisma).listarAtivas(EMAIL);
      expect(item.registrada).toBe(false);
    });

    it('informa registrada: false quando a marcação é falta', async () => {
      // US03 CA03.3 — partição: marcação com present: false
      const prisma = criarPrismaMock();
      prisma.chamadaCodigo.findMany.mockResolvedValue([linhaFindMany([{ present: false }])]);
      const [item] = await criarServico(prisma).listarAtivas(EMAIL);
      expect(item.registrada).toBe(false);
    });

    it('devolve id, expiraEm e dados da aula e turma', async () => {
      // US03 CA03.3 — fluxo: formato da resposta
      const prisma = criarPrismaMock();
      const linha = linhaFindMany([]);
      prisma.chamadaCodigo.findMany.mockResolvedValue([linha]);
      const [item] = await criarServico(prisma).listarAtivas(EMAIL);
      expect(item).toEqual({
        id: CHAMADA_ID,
        expiraEm: linha.expiraEm,
        aula: { id: AULA_ID, date: linha.aula.date, turma: { id: TURMA_ID, name: 'Turma A' } },
        registrada: false,
      });
    });
  });

  describe('CA03.4 — status da aula', () => {
    function prepararStatus(chamada: Record<string, unknown> | null, presentes = 0) {
      const prisma = criarPrismaMock();
      prisma.aula.findUnique.mockResolvedValue({ id: AULA_ID });
      prisma.chamadaCodigo.findUnique.mockResolvedValue(chamada);
      prisma.presenca.count.mockResolvedValue(presentes);
      return prisma;
    }

    const chamadaBase = () => ({
      id: CHAMADA_ID,
      aula_id: AULA_ID,
      codigoHash: 'h',
      salt: 's',
      iniciadoEm: AGORA,
      expiraEm: new Date(AGORA.getTime() + 5 * MINUTO),
      encerradoEm: null as Date | null,
    });

    it('aula inexistente gera erro', async () => {
      // US03 CA03.4 — partição: aula inexistente
      const prisma = criarPrismaMock();
      prisma.aula.findUnique.mockResolvedValue(null);
      await expect(criarServico(prisma).status(AULA_ID)).rejects.toBeInstanceOf(ResourceNotFoundException);
    });

    it('retorna null quando a aula não tem janela', async () => {
      // US03 CA03.4 — partição: aula sem janela
      const prisma = prepararStatus(null);
      await expect(criarServico(prisma).status(AULA_ID)).resolves.toBeNull();
    });

    it('janela aberta e não expirada é ativa e informa presentes', async () => {
      // US03 CA03.4 — partição: janela ativa
      const prisma = prepararStatus(chamadaBase(), 7);
      const status = await criarServico(prisma).status(AULA_ID);
      expect(status).toMatchObject({ id: CHAMADA_ID, ativa: true, presentes: 7, encerradoEm: null });
    });

    it('janela encerrada é inativa', async () => {
      // US03 CA03.4 — partição: janela encerrada
      const prisma = prepararStatus({ ...chamadaBase(), encerradoEm: AGORA }, 2);
      const status = await criarServico(prisma).status(AULA_ID);
      expect(status?.ativa).toBe(false);
      expect(status?.presentes).toBe(2);
    });

    it('janela expirada é inativa', async () => {
      // US03 CA03.4 — partição: janela expirada
      const prisma = prepararStatus({ ...chamadaBase(), expiraEm: new Date(AGORA.getTime() - MINUTO) });
      expect((await criarServico(prisma).status(AULA_ID))?.ativa).toBe(false);
    });

    it('janela que expira exatamente agora é inativa', async () => {
      // US03 CA03.4 — valor-limite: expiraEm === agora
      const prisma = prepararStatus({ ...chamadaBase(), expiraEm: new Date(AGORA) });
      expect((await criarServico(prisma).status(AULA_ID))?.ativa).toBe(false);
    });

    it('janela que expira 1 ms após agora é ativa', async () => {
      // US03 CA03.4 — valor-limite: expiraEm = agora + 1 ms
      const prisma = prepararStatus({ ...chamadaBase(), expiraEm: new Date(AGORA.getTime() + 1) });
      expect((await criarServico(prisma).status(AULA_ID))?.ativa).toBe(true);
    });

    it('conta apenas presenças (present: true) da aula', async () => {
      // US03 CA03.4 — fluxo: contagem de presentes
      const prisma = prepararStatus(chamadaBase(), 0);
      const status = await criarServico(prisma).status(AULA_ID);
      expect(status?.presentes).toBe(0);
      expect(prisma.presenca.count).toHaveBeenCalledWith({ where: { aula_id: AULA_ID, present: true } });
    });
  });
});

// ===========================================================================
// US04 — Classificar risco de reprovação
// ===========================================================================

describe('US04 — Classificar risco de reprovação', () => {
  describe('CA04.1 — abaixo de 15% é REGULAR', () => {
    it('0% é REGULAR', () => {
      // US04 CA04.1 — valor-limite: mínimo possível
      expect(nivelDeFalta(0)).toBe('REGULAR');
    });

    it('7% é REGULAR', () => {
      // US04 CA04.1 — partição: representante da faixa regular
      expect(nivelDeFalta(7)).toBe('REGULAR');
    });

    it('14,9% é REGULAR', () => {
      // US04 CA04.1 — valor-limite: imediatamente abaixo de 15 (1 casa decimal)
      expect(nivelDeFalta(14.9)).toBe('REGULAR');
    });
  });

  describe('CA04.2 — entre 15% e 25%, inclusive, é ATENCAO', () => {
    it('15% é ATENCAO', () => {
      // US04 CA04.2 — valor-limite: fronteira inferior inclusiva
      expect(nivelDeFalta(15)).toBe('ATENCAO');
    });

    it('15,1% é ATENCAO', () => {
      // US04 CA04.2 — valor-limite: logo acima da fronteira inferior
      expect(nivelDeFalta(15.1)).toBe('ATENCAO');
    });

    it('20% é ATENCAO', () => {
      // US04 CA04.2 — partição: representante da faixa de atenção
      expect(nivelDeFalta(20)).toBe('ATENCAO');
    });

    it('24,9% é ATENCAO', () => {
      // US04 CA04.2 — valor-limite: logo abaixo da fronteira superior
      expect(nivelDeFalta(24.9)).toBe('ATENCAO');
    });

    it('25% é ATENCAO', () => {
      // US04 CA04.2 — valor-limite: fronteira superior inclusiva
      expect(nivelDeFalta(25)).toBe('ATENCAO');
    });
  });

  describe('CA04.3 — acima de 25% é CRITICO', () => {
    it('25,1% é CRITICO', () => {
      // US04 CA04.3 — valor-limite: imediatamente acima de 25
      expect(nivelDeFalta(25.1)).toBe('CRITICO');
    });

    it('50% é CRITICO', () => {
      // US04 CA04.3 — partição: representante da faixa crítica
      expect(nivelDeFalta(50)).toBe('CRITICO');
    });

    it('100% é CRITICO', () => {
      // US04 CA04.3 — valor-limite: máximo possível
      expect(nivelDeFalta(100)).toBe('CRITICO');
    });
  });

  describe('CA04.4 — cálculo do percentual sobre aulas realizadas', () => {
    const marcacoes = (presentes: number, faltas: number) => [
      ...Array.from({ length: presentes }, () => ({ present: true })),
      ...Array.from({ length: faltas }, () => ({ present: false })),
    ];

    it('sem aulas realizadas o percentual é zero', () => {
      // US04 CA04.4 — valor-limite: aulasRealizadas = 0
      const r = calcularResumo([], 0);
      expect(r.percentual_faltas).toBe(0);
      expect(r.nivel).toBe('REGULAR');
      expect(r.aulas_realizadas).toBe(0);
    });

    it('com 1 aula realizada e 1 falta, o percentual é 100', () => {
      // US04 CA04.4 — valor-limite: aulasRealizadas = 1
      const r = calcularResumo(marcacoes(0, 1), 1);
      expect(r.percentual_faltas).toBe(100);
      expect(r.nivel).toBe('CRITICO');
    });

    it('sem faltas o percentual é zero', () => {
      // US04 CA04.4 — partição: apenas presenças
      const r = calcularResumo(marcacoes(10, 0), 10);
      expect(r.percentual_faltas).toBe(0);
      expect(r.presencas).toBe(10);
      expect(r.faltas).toBe(0);
      expect(r.nivel).toBe('REGULAR');
    });

    it('arredonda para uma casa decimal (1/3 → 33,3)', () => {
      // US04 CA04.4 — partição: dízima arredondada para baixo
      expect(calcularResumo(marcacoes(2, 1), 3).percentual_faltas).toBe(33.3);
    });

    it('arredonda para uma casa decimal (2/3 → 66,7)', () => {
      // US04 CA04.4 — partição: dízima arredondada para cima
      expect(calcularResumo(marcacoes(1, 2), 3).percentual_faltas).toBe(66.7);
    });

    it('arredonda para uma casa decimal (1/7 → 14,3)', () => {
      // US04 CA04.4 — partição: arredondamento comum
      const r = calcularResumo(marcacoes(6, 1), 7);
      expect(r.percentual_faltas).toBe(14.3);
      expect(r.nivel).toBe('REGULAR');
    });

    it('o denominador é o total de aulas realizadas, não o de marcações', () => {
      // US04 CA04.4 — fluxo: aulas realizadas sem marcação do aluno
      const r = calcularResumo(marcacoes(0, 1), 4);
      expect(r.percentual_faltas).toBe(25);
      expect(r.aulas_realizadas).toBe(4);
    });

    it('3 faltas em 20 aulas = 15% → ATENCAO', () => {
      // US04 CA04.2/CA04.4 — valor-limite: 15% calculado
      const r = calcularResumo(marcacoes(17, 3), 20);
      expect(r.percentual_faltas).toBe(15);
      expect(r.nivel).toBe('ATENCAO');
    });

    it('5 faltas em 20 aulas = 25% → ATENCAO', () => {
      // US04 CA04.2/CA04.4 — valor-limite: 25% calculado
      const r = calcularResumo(marcacoes(15, 5), 20);
      expect(r.percentual_faltas).toBe(25);
      expect(r.nivel).toBe('ATENCAO');
    });

    it('2 faltas em 14 aulas = 14,3% → REGULAR', () => {
      // US04 CA04.1/CA04.4 — valor-limite: logo abaixo de 15% após arredondamento
      const r = calcularResumo(marcacoes(12, 2), 14);
      expect(r.percentual_faltas).toBe(14.3);
      expect(r.nivel).toBe('REGULAR');
    });

    it('1 falta em 4 aulas = 25% → ATENCAO, 2 faltas em 7 aulas = 28,6% → CRITICO', () => {
      // US04 CA04.3/CA04.4 — valor-limite: ao redor de 25% calculado
      expect(calcularResumo(marcacoes(3, 1), 4).nivel).toBe('ATENCAO');
      const r = calcularResumo(marcacoes(5, 2), 7);
      expect(r.percentual_faltas).toBe(28.6);
      expect(r.nivel).toBe('CRITICO');
    });

    it('25,3% (≈ 19/75) é CRITICO', () => {
      // US04 CA04.3/CA04.4 — valor-limite: menor valor > 25 com denominador realista
      const r = calcularResumo(marcacoes(56, 19), 75);
      expect(r.percentual_faltas).toBe(25.3);
      expect(r.nivel).toBe('CRITICO');
    });

    it('o resumo informa presenças, faltas e limite de 25%', () => {
      // US04 CA04.4 — fluxo: estrutura do resumo
      const r = calcularResumo(marcacoes(8, 2), 10);
      expect(r).toEqual({
        aulas_realizadas: 10,
        presencas: 8,
        faltas: 2,
        percentual_faltas: 20,
        nivel: 'ATENCAO',
        limite_percentual: 25,
      });
    });
  });
});