import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import type { CreateUsuarioDto } from '../usuario.types';

const schema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório.'),
  email: z.string().trim().min(1, 'O e-mail é obrigatório.').email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  perfil: z.enum(['PROFESSOR', 'ALUNO']),
  turma_id: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface UsuarioFormProps {
  turmas: { id: string; name: string }[];
  onSubmit: (data: CreateUsuarioDto) => Promise<void>;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300';

export function UsuarioForm({ turmas, onSubmit }: UsuarioFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', perfil: 'ALUNO', turma_id: '' },
  });
  const perfil = watch('perfil');

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      name: v.name,
      email: v.email,
      password: v.password,
      perfil: v.perfil,
      turma_id: v.perfil === 'ALUNO' && v.turma_id ? v.turma_id : undefined,
    });
    reset({ name: '', email: '', password: '', perfil: v.perfil, turma_id: v.turma_id });
  });

  return (
    <form onSubmit={submit} className="grid max-w-xl gap-4">
      <div>
        <label className={labelClass}>Tipo de login *</label>
        <select {...register('perfil')} className={inputClass}>
          <option value="ALUNO">Aluno (vê só a própria frequência)</option>
          <option value="PROFESSOR">Professor (acesso total)</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Nome *</label>
        <input type="text" {...register('name')} className={inputClass} placeholder="Ana Souza" />
        {errors.name && <Text variant="alarm">{errors.name.message}</Text>}
      </div>
      <div>
        <label className={labelClass}>E-mail (será o login) *</label>
        <input type="email" {...register('email')} className={inputClass} />
        {errors.email && <Text variant="alarm">{errors.email.message}</Text>}
      </div>
      <div>
        <label className={labelClass}>Senha inicial *</label>
        <input type="password" {...register('password')} className={inputClass} />
        {errors.password && <Text variant="alarm">{errors.password.message}</Text>}
      </div>
      {perfil === 'ALUNO' && (
        <div>
          <label className={labelClass}>Matricular na turma (opcional)</label>
          <select {...register('turma_id')} className={inputClass}>
            <option value="">— não matricular agora —</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Criando…' : 'Criar login'}
      </button>
    </form>
  );
}
