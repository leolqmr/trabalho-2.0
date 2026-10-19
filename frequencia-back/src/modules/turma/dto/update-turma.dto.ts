import { createZodDto } from 'nestjs-zod';
import { CreateTurmaSchema } from './create-turma.dto';

export const UpdateTurmaSchema = CreateTurmaSchema.partial();

export class UpdateTurmaDto extends createZodDto(UpdateTurmaSchema) {}
