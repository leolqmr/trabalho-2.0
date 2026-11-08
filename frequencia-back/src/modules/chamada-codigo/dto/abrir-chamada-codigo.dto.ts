import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AbrirChamadaCodigoSchema = z.object({
  duracaoMinutos: z.number().int().min(1).max(15),
});

export class AbrirChamadaCodigoDto extends createZodDto(AbrirChamadaCodigoSchema) {}
