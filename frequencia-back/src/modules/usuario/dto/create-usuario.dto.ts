import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PERFIS = ['PROFESSOR', 'ALUNO'] as const;

export const CreateUsuarioSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome').max(200).describe('Nome completo'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('E-mail inválido')
    .max(254)
    .describe('E-mail (login)'),
  password: z
    .string()
    .min(6, 'A senha deve ter ao menos 6 caracteres')
    .max(128)
    .describe('Senha inicial'),
  perfil: z.enum(PERFIS).describe('PROFESSOR (acesso total) ou ALUNO (vê só a própria frequência)'),
  turma_id: z
    .string()
    .uuid()
    .optional()
    .describe('Somente ALUNO: já matricula o aluno nesta turma (mesmo e-mail)'),
});

export class CreateUsuarioDto extends createZodDto(CreateUsuarioSchema) {}
