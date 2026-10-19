import { createZodDto } from 'nestjs-zod';
import { CreateAlunoSchema } from './create-aluno.dto';

export const UpdateAlunoSchema = CreateAlunoSchema.partial();

export class UpdateAlunoDto extends createZodDto(UpdateAlunoSchema) {}
