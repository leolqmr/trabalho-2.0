import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAulaSchema = z.object({
  turma_id: z.string().uuid().describe('Id da turma'),
  date: z.coerce.date().describe('Data da aula (ISO 8601)'),
});

export class CreateAulaDto extends createZodDto(CreateAulaSchema) {}
