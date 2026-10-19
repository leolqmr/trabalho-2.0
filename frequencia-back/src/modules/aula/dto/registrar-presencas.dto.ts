import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MarcacaoPresencaSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido')
    .max(254)
    .describe('E-mail do aluno'),
  present: z.boolean().describe('true = presente, false = falta'),
});

export const RegistrarPresencasSchema = z.object({
  presencas: z
    .array(MarcacaoPresencaSchema)
    .min(1, 'Informe ao menos uma marcação')
    .max(500)
    .refine((marcacoes) => new Set(marcacoes.map((m) => m.email)).size === marcacoes.length, {
      message: 'Há alunos repetidos na lista de presenças',
    })
    .describe('Marcações de presença/falta feitas na chamada'),
});

export class RegistrarPresencasDto extends createZodDto(RegistrarPresencasSchema) {}
