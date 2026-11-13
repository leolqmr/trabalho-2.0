Você é um engenheiro de testes. Gere uma suíte de testes automatizados em **Vitest 4** (TypeScript) para o backend NestJS descrito abaixo.

## Técnicas obrigatórias

1. **Partições de equivalência:** para cada variável de entrada, identifique classes válidas e inválidas e teste um representante de cada uma.
2. **Análise de valores-limite:** teste os valores dos dois lados de cada fronteira.
3. **Cobertura dos critérios de aceitação:** todo critério (CAxx.y) deve ter pelo menos um teste.

Em cada teste, coloque um comentário indicando **qual critério de aceitação** ele cobre e **qual técnica** usa (partição, valor-limite ou fluxo). Exemplo: `// US02 CA02.4 — valor-limite: 6ª tentativa`.

## Regras

- Entregue **um único arquivo** `chamada-v1.test.ts`, que ficará em `frequencia-back/tests/v1-llm/`. Os imports relativos partem daí (ex.: `../../src/modules/chamada-codigo/chamada-codigo.service`).
- Use apenas `vitest` e as dependências que já aparecem no código abaixo (`@nestjs/common`, `zod`, `nestjs-zod`, `@prisma/client`). Não use banco de dados real: crie mocks do `PrismaService` com `vi.fn()`.
- Os resultados esperados devem vir dos **critérios de aceitação**, não do comportamento atual do código.
- Não altere o código de produção.
- Responda apenas com o arquivo completo, em um bloco de código.

## Histórias de usuário e critérios de aceitação

## US01 — Abrir e administrar uma chamada temporária

Como professor, quero abrir e encerrar uma janela de chamada com código temporário para receber presenças apenas no período autorizado.

- **CA01.1** A duração informada é um número inteiro entre **1 e 15 minutos**, inclusive; valores fora da faixa são rejeitados.
- **CA01.2** Uma chamada aberta gera código aleatório de **8 letras maiúsculas**, sem `I` ou `O`, e expira após a duração solicitada.
- **CA01.3** O código é mostrado apenas na resposta da abertura; sua consulta de status não expõe o código, o hash ou o salt.
- **CA01.4** Reabrir a chamada substitui o código e o prazo, reativa a janela e remove contadores anteriores de tentativa.
- **CA01.5** Abrir ou encerrar chamada para aula inexistente gera erro; encerrar sem janela existente também gera erro.
- **CA01.6** Encerrar a chamada fixa `encerradoEm`, impedindo registro posterior.


## US02 — Registrar presença com código

Como aluno, quero informar a chave durante a janela de chamada para registrar minha presença com segurança.

- **CA02.1** Somente usuário com e-mail identificado e matriculado na turma da aula pode registrar sua presença.
- **CA02.2** O código informado aceita espaços periféricos e letras minúsculas, mas deve conter exatamente oito letras do alfabeto permitido.
- **CA02.3** Um código correto, para chamada existente e ativa, registra a presença do aluno.
- **CA02.4** Código incorreto gera erro e consome uma tentativa; após cinco tentativas, a sexta é bloqueada mesmo que o código esteja correto.
- **CA02.5** Chamada encerrada ou expirada não aceita registro; o instante exato de expiração já é inválido.
- **CA02.6** Presença já registrada retorna sucesso sem duplicar presença ou consumir tentativa.
- **CA02.7** Uma falta anterior (`present: false`) pode ser atualizada para presença, sem criar outra linha.


## US03 — Consultar chamadas disponíveis

Como aluno, quero visualizar apenas as janelas de chamada disponíveis para as turmas em que estou matriculado.

- **CA03.1** Sem e-mail autenticado, a lista é vazia e não há consulta ao banco.
- **CA03.2** A consulta restringe os resultados a janelas abertas, não expiradas e vinculadas às turmas do aluno.
- **CA03.3** A resposta não expõe código, hash ou salt e informa se a presença já está registrada.
- **CA03.4** A consulta de status da aula retorna `null` sem janela, estado ativo/inativo com janela e quantidade de presentes; aula inexistente gera erro.


## US04 — Classificar risco de reprovação

Como professor, quero identificar o risco de reprovação por faltas para acompanhar alunos que precisam de atenção.

- **CA04.1** Faltas **abaixo de 15%** são `REGULAR`.
- **CA04.2** Faltas **entre 15% e 25%**, incluindo as fronteiras, são `ATENCAO`.
- **CA04.3** Faltas **acima de 25%** são `CRITICO`.
- **CA04.4** O percentual de faltas é calculado sobre aulas realizadas, arredondado para uma casa decimal; sem aulas realizadas, é zero.



## Código envolvido

### `frequencia-back/src/modules/chamada-codigo/chamada-codigo.service.ts`

```ts
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

  /** Centraliza o bloqueio usado em todas as operações concorrentes da mesma aula. */
  private async bloquearAula(tx: Prisma.TransactionClient, aulaId: string): Promise<{ id: string }[]> {
    return await tx.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "aulas" WHERE "id" = ${aulaId}::uuid FOR UPDATE
    `;
  }

  /** Ponto único de leitura do relógio para permitir testes determinísticos. */
  private agora(): Date {
    return new Date();
  }

  private estaAtiva(chamada: { expiraEm: Date; encerradoEm: Date | null }): boolean {
    return chamada.encerradoEm === null && chamada.expiraEm.getTime() > this.agora().getTime();
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
    const agora = this.agora();
    const expiraEm = new Date(agora.getTime() + dto.duracaoMinutos * 60_000);

    const chamada = await this.prisma.$transaction(async (tx) => {
      // Todas as operações por aula bloqueiam a mesma linha, evitando corrida
      // entre reabertura, encerramento e registro de um estudante.
      const aulas = await this.bloquearAula(tx, aulaId);
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
      const aulas = await this.bloquearAula(tx, aulaId);
      if (aulas.length === 0) throw new ResourceNotFoundException('Aula', aulaId);
      const chamada = await tx.chamadaCodigo.findUnique({ where: { aula_id: aulaId } });
      if (!chamada) throw new ResourceNotFoundException('Chamada por código', aulaId);
      await tx.chamadaCodigo.update({ where: { id: chamada.id }, data: { encerradoEm: this.agora() } });
    });
  }

  async listarAtivas(email?: string) {
    if (!email) return [];
    const chamadas = await this.prisma.chamadaCodigo.findMany({
      where: {
        expiraEm: { gt: this.agora() },
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

  /** Busca do contexto e da matrícula, independente do registro transacional. */
  private async buscarMatricula(chamadaId: string, email: string): Promise<{ aulaId: string; alunoId: string }> {
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
    return { aulaId: chamada.aula_id, alunoId: aluno.id };
  }

  /** Traduz estados persistidos pela transação em contrato HTTP da API. */
  private interpretarRegistro(resultado: 'expirada' | 'bloqueada' | 'invalida' | 'registrada', aulaId: string) {
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
    return { aula_id: aulaId, registrada: true };
  }

  async registrar(chamadaId: string, email: string | undefined, codigo: string) {
    if (!email) throw new AccessDeniedException('Confirme seu e-mail no Keycloak para registrar presença.');
    const { aulaId, alunoId } = await this.buscarMatricula(chamadaId, email);

    // Resultados de erro são valores para que tentativas inválidas sejam COMMITADAS.
    const resultado = await this.prisma.$transaction(async (tx) => {
      await this.bloquearAula(tx, aulaId);
      const atual = await tx.chamadaCodigo.findUnique({ where: { id: chamadaId } });
      if (!atual || !this.estaAtiva(atual)) return 'expirada' as const;

      const existente = await tx.presenca.findUnique({
        where: { aula_id_aluno_id: { aula_id: atual.aula_id, aluno_id: alunoId } },
        select: { present: true },
      });
      if (existente?.present) return 'registrada' as const;

      const tentativa = await tx.chamadaCodigoTentativa.upsert({
        where: { chamada_id_aluno_id: { chamada_id: atual.id, aluno_id: alunoId } },
        create: { chamada_id: atual.id, aluno_id: alunoId, total: 1 },
        update: { total: { increment: 1 } },
        select: { total: true },
      });
      if (tentativa.total > MAX_TENTATIVAS) return 'bloqueada' as const;
      if (!codigoConfere(codigo.trim().toUpperCase(), atual.codigoHash, atual.salt)) {
        return 'invalida' as const;
      }

      await tx.presenca.upsert({
        where: { aula_id_aluno_id: { aula_id: atual.aula_id, aluno_id: alunoId } },
        create: { aula_id: atual.aula_id, aluno_id: alunoId, present: true },
        update: { present: true },
      });
      return 'registrada' as const;
    });

    return this.interpretarRegistro(resultado, aulaId);
  }
}
```

### `frequencia-back/src/modules/chamada-codigo/dto/abrir-chamada-codigo.dto.ts`

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AbrirChamadaCodigoSchema = z.object({
  duracaoMinutos: z.number().int().min(1).max(15),
});

export class AbrirChamadaCodigoDto extends createZodDto(AbrirChamadaCodigoSchema) {}
```

### `frequencia-back/src/modules/chamada-codigo/dto/registrar-codigo.dto.ts`

```ts
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Sem I e O, letras que costumam ser confundidas em voz alta com outras letras.
export const RegistrarCodigoSchema = z.object({
  codigo: z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z]{8}$/, 'Digite as 8 letras do código.'),
});

export class RegistrarCodigoDto extends createZodDto(RegistrarCodigoSchema) {}
```

### `frequencia-back/src/modules/frequencia/frequencia.util.ts`

```ts
/** Limite de faltas (% das aulas realizadas): acima dele o aluno está em situação crítica. */
export const LIMITE_FALTAS_PERCENTUAL = 25;

/** A partir deste percentual (inclusive) o aluno entra em atenção. */
export const ATENCAO_FALTAS_PERCENTUAL = 15;

export type NivelFalta = 'REGULAR' | 'ATENCAO' | 'CRITICO';

export interface ResumoFrequencia {
  /** Aulas da turma que já tiveram chamada registrada. */
  aulas_realizadas: number;
  presencas: number;
  faltas: number;
  /** Faltas / aulas realizadas, em % com 1 casa decimal. */
  percentual_faltas: number;
  nivel: NivelFalta;
  limite_percentual: number;
}

/**
 * Regular: menos de 15% de faltas. Atenção: de 15% a 25%. Crítico: acima de 25%
 * (a partir de 26%; 25,5% já passa do limite, então também é crítico).
 */
export function nivelDeFalta(percentualFaltas: number): NivelFalta {
  if (percentualFaltas > LIMITE_FALTAS_PERCENTUAL) return 'CRITICO';
  if (percentualFaltas >= ATENCAO_FALTAS_PERCENTUAL) return 'ATENCAO';
  return 'REGULAR';
}

/**
 * Resume a frequência de um aluno. `marcacoes` são as presenças registradas
 * para ele (`present` true/false); `aulasRealizadas` é o total de aulas da
 * turma com chamada feita — o denominador do percentual de faltas.
 */
export function calcularResumo(
  marcacoes: { present: boolean }[],
  aulasRealizadas: number,
): ResumoFrequencia {
  const presencas = marcacoes.filter((m) => m.present).length;
  const faltas = marcacoes.length - presencas;
  const percentual_faltas =
    aulasRealizadas > 0 ? Math.round((faltas / aulasRealizadas) * 1000) / 10 : 0;

  return {
    aulas_realizadas: aulasRealizadas,
    presencas,
    faltas,
    percentual_faltas,
    nivel: nivelDeFalta(percentual_faltas),
    limite_percentual: LIMITE_FALTAS_PERCENTUAL,
  };
}
```

### `frequencia-back/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Turma {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  createdAt DateTime @default(now())
  aulas     Aula[]
  alunos    Aluno[]

  @@map("turmas")
}

model Aula {
  id          String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  date        DateTime
  turma_id    String     @db.Uuid
  turma       Turma      @relation(fields: [turma_id], references: [id], onDelete: Cascade)
  presencas   Presenca[]
  chamadaCodigo ChamadaCodigo?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([turma_id])
  @@map("aulas")
}

model Aluno {
  id        String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  email     String
  turma_id  String     @db.Uuid
  turma     Turma      @relation(fields: [turma_id], references: [id], onDelete: Cascade)
  presencas Presenca[]
  tentativasCodigo ChamadaCodigoTentativa[]
  createdAt DateTime   @default(now())

  @@unique([turma_id, email])
  @@map("alunos")
}

model ChamadaCodigo {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  aula_id     String   @unique @db.Uuid
  aula        Aula     @relation(fields: [aula_id], references: [id], onDelete: Cascade)
  codigoHash  String
  salt        String
  iniciadoEm  DateTime @default(now())
  expiraEm    DateTime
  encerradoEm DateTime?
  tentativas  ChamadaCodigoTentativa[]

  @@map("chamadas_codigo")
}

model ChamadaCodigoTentativa {
  id         String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  chamada_id String @db.Uuid
  chamada    ChamadaCodigo @relation(fields: [chamada_id], references: [id], onDelete: Cascade)
  aluno_id   String @db.Uuid
  aluno      Aluno @relation(fields: [aluno_id], references: [id], onDelete: Cascade)
  total      Int @default(0)

  @@unique([chamada_id, aluno_id])
  @@map("chamadas_codigo_tentativas")
}

model Presenca {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  aula_id   String   @db.Uuid
  aula      Aula     @relation(fields: [aula_id], references: [id], onDelete: Cascade)
  aluno_id  String   @db.Uuid
  aluno     Aluno    @relation(fields: [aluno_id], references: [id], onDelete: Cascade)
  present   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([aula_id, aluno_id])
  @@index([aula_id])
  @@map("presencas")
}
```
