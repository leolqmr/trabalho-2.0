import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetSenhaSchema = z.object({
  password: z
    .string()
    .min(6, 'A senha deve ter ao menos 6 caracteres')
    .max(128)
    .describe('Nova senha'),
});

export class ResetSenhaDto extends createZodDto(ResetSenhaSchema) {}
