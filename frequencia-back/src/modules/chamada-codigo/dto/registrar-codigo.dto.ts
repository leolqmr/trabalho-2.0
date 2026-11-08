import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Sem I e O, letras que costumam ser confundidas em voz alta com outras letras.
export const RegistrarCodigoSchema = z.object({
  codigo: z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z]{8}$/, 'Digite as 8 letras do código.'),
});

export class RegistrarCodigoDto extends createZodDto(RegistrarCodigoSchema) {}
