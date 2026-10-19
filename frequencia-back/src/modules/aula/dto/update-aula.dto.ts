import { createZodDto } from 'nestjs-zod';
import { CreateAulaSchema } from './create-aula.dto';

export const UpdateAulaSchema = CreateAulaSchema.pick({ date: true }).partial();

export class UpdateAulaDto extends createZodDto(UpdateAulaSchema) {}
