import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAlunoSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do aluno').max(200).describe('Nome do aluno'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido')
    .max(254)
    .describe('E-mail do aluno'),
});

export class CreateAlunoDto extends createZodDto(CreateAlunoSchema) {}
