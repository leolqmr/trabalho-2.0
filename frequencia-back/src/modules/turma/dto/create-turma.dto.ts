import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTurmaSchema = z.object({
  name: z.string().trim().min(1).max(200).describe('Nome da turma'),
});

export class CreateTurmaDto extends createZodDto(CreateTurmaSchema) {}
