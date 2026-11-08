import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AccessDeniedException } from '@/common/exceptions/access-denied.exception';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/exceptions/error-code.enum';
import { ResourceNotFoundException } from '@/common/exceptions/resource-not-found.exception';
import { PrismaService } from '@/database/prisma.service';
import type { AbrirChamadaCodigoDto } from './dto/abrir-chamada-codigo.dto';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const TAMANHO_CODIGO = 8;
const MAX_TENTATIVAS = 5;

export function gerarCodigo(): string {
  return Array.from({ length: TAMANHO_CODIGO }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
}

function hashCodigo(codigo: string, salt: string): Buffer {
  return createHash('sha256').update(`${salt}:${codigo}`).digest();
}

function codigoConfere(codigo: string, hash: string, salt: string): boolean {
  const armazenado = Buffer.from(hash, 'hex');
  const informado = hashCodigo(codigo, salt);
  return armazenado.length === informado.length && timingSafeEqual(armazenado, informado);
}

@Injectable()
export class ChamadaCodigoService {
  constructor(private readonly prisma: PrismaService) {}

  private estaAtiva(chamada: { expiraEm: Date; encerradoEm: Date | null }): boolean {
    return chamada.encerradoEm === null && chamada.expiraEm.getTime() > Date.now();
  }

  async status(aulaId: string) {
    const aula = await this.prisma.aula.findUnique({ where: { id: aulaId }, select: { id: true } });
    if (!aula) throw new ResourceNotFoundException('Aula', aulaId);

    const chamada = await this.prisma.chamadaCodigo.findUnique({ where: { aula_id: aulaId } });
    if (!chamada) return null;

    const presentes = await this.prisma.presenca.count({ where: { aula_id: aulaId, present: true } });
    return {
      id: chamada.id,
      iniciadoEm: chamada.iniciadoEm,
      expiraEm: chamada.expiraEm,
      encerradoEm: chamada.encerradoEm,
      ativa: this.estaAtiva(chamada),
      presentes,
    };
  }

  async abrir(aulaId: string, dto: AbrirChamadaCodigoDto) {
    const codigo = gerarCodigo();
    const salt = randomBytes(16).toString('hex');
    const codigoHash = hashCodigo(codigo, salt).toString('hex');
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + dto.duracaoMinutos * 60_000);

    const chamada = await this.prisma.$transaction(async (tx) => {
      // Todas as operações por aula bloqueiam a mesma linha, evitando corrida
      // entre reabertura, encerramento e registro de um estudante.
      const aulas = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "aulas" WHERE "id" = ${aulaId}::uuid FOR UPDATE
      `;
      if (aulas.length === 0) throw new ResourceNotFoundException('Aula', aulaId);

      const anterior = await tx.chamadaCodigo.findUnique({ where: { aula_id: aulaId } });
      if (anterior) {
        await tx.chamadaCodigoTentativa.deleteMany({ where: { chamada_id: anterior.id } });
      }
      return tx.chamadaCodigo.upsert({
        where: { aula_id: aulaId },
        create: { aula_id: aulaId, codigoHash, salt, iniciadoEm: agora, expiraEm },
        update: { codigoHash, salt, iniciadoEm: agora, expiraEm, encerradoEm: null },
      });
    });

    // A chave é revelada UMA ÚNICA VEZ, somente ao professor que abriu a janela.
    return { id: chamada.id, codigo, iniciadoEm: agora, expiraEm, encerradoEm: null, ativa: true };
  }

  async encerrar(aulaId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const aulas = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "aulas" WHERE "id" = ${aulaId}::uuid FOR UPDATE
      `;
      if (aulas.length === 0) throw new ResourceNotFoundException('Aula', aulaId);
      const chamada = await tx.chamadaCodigo.findUnique({ where: { aula_id: aulaId } });
      if (!chamada) throw new ResourceNotFoundException('Chamada por código', aulaId);
      await tx.chamadaCodigo.update({ where: { id: chamada.id }, data: { encerradoEm: new Date() } });
    });
  }

  async listarAtivas(email?: string) {
    if (!email) return [];
    const chamadas = await this.prisma.chamadaCodigo.findMany({
      where: {
        expiraEm: { gt: new Date() },
        encerradoEm: null,
        aula: { turma: { alunos: { some: { email } } } },
      },
      select: {
        id: true,
        expiraEm: true,
        aula: {
          select: {
            id: true,
            date: true,
            turma: { select: { id: true, name: true } },
            presencas: { where: { aluno: { email } }, select: { present: true } },
          },
        },
      },
      orderBy: { expiraEm: 'asc' },
    });

    return chamadas.map((chamada) => ({
      id: chamada.id,
      expiraEm: chamada.expiraEm,
      aula: { id: chamada.aula.id, date: chamada.aula.date, turma: chamada.aula.turma },
      registrada: chamada.aula.presencas.some((presenca) => presenca.present),
    }));
  }

  async registrar(chamadaId: string, email: string | undefined, codigo: string) {
    if (!email) throw new AccessDeniedException('Confirme seu e-mail no Keycloak para registrar presença.');

    const chamada = await this.prisma.chamadaCodigo.findUnique({
      where: { id: chamadaId },
      select: { aula_id: true, aula: { select: { turma_id: true } } },
    });
    if (!chamada) throw new ResourceNotFoundException('Chamada por código', chamadaId);

    const aluno = await this.prisma.aluno.findUnique({
      where: { turma_id_email: { turma_id: chamada.aula.turma_id, email } },
      select: { id: true },
    });
    if (!aluno) throw new AccessDeniedException('Você não está matriculado nesta turma.');

    // Resultados de erro são valores para que tentativas inválidas sejam COMMITADAS.
    const resultado = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT "id" FROM "aulas" WHERE "id" = ${chamada.aula_id}::uuid FOR UPDATE
      `;
      const atual = await tx.chamadaCodigo.findUnique({ where: { id: chamadaId } });
      if (!atual || !this.estaAtiva(atual)) return 'expirada' as const;

      const existente = await tx.presenca.findUnique({
        where: { aula_id_aluno_id: { aula_id: atual.aula_id, aluno_id: aluno.id } },
        select: { present: true },
      });
      if (existente?.present) return 'registrada' as const;

      const tentativa = await tx.chamadaCodigoTentativa.upsert({
        where: { chamada_id_aluno_id: { chamada_id: atual.id, aluno_id: aluno.id } },
        create: { chamada_id: atual.id, aluno_id: aluno.id, total: 1 },
        update: { total: { increment: 1 } },
        select: { total: true },
      });
      if (tentativa.total > MAX_TENTATIVAS) return 'bloqueada' as const;
      if (!codigoConfere(codigo.trim().toUpperCase(), atual.codigoHash, atual.salt)) {
        return 'invalida' as const;
      }

      await tx.presenca.upsert({
        where: { aula_id_aluno_id: { aula_id: atual.aula_id, aluno_id: aluno.id } },
        create: { aula_id: atual.aula_id, aluno_id: aluno.id, present: true },
        update: { present: true },
      });
      return 'registrada' as const;
    });

    if (resultado === 'expirada') {
      throw new AppException(ErrorCode.CONFLICT, 'A chamada foi encerrada ou expirou.', HttpStatus.CONFLICT);
    }
    if (resultado === 'bloqueada') {
      throw new AppException(
        ErrorCode.ACCESS_DENIED,
        'Limite de tentativas atingido. Procure o professor.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (resultado === 'invalida') {
      throw new AppException(ErrorCode.VALIDATION_FAILED, 'Código incorreto. Confira as letras.', HttpStatus.BAD_REQUEST);
    }
    return { aula_id: chamada.aula_id, registrada: true };
  }
}
