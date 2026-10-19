import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import type { Aluno, CreateAlunoDto } from '../aluno.types';
import { FormModal } from '../../../components/FormModal';

const alunoFormSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório.'),
  email: z.string().trim().min(1, 'O e-mail é obrigatório.').email('Informe um e-mail válido.'),
});

type AlunoFormValues = z.infer<typeof alunoFormSchema>;

interface AlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlunoDto) => Promise<void>;
  alunoToEdit?: Aluno | null;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

/** Use `key={alunoToEdit?.id ?? 'new'}` ao renderizar, igual ao TodoModal. */
export function AlunoModal({ isOpen, onClose, onSubmit, alunoToEdit }: AlunoModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoFormSchema),
    defaultValues: { name: alunoToEdit?.name ?? '', email: alunoToEdit?.email ?? '' },
  });

  const submitAluno = handleSubmit(async (values) => {
    await onSubmit({ name: values.name, email: values.email });
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitAluno}
      title={alunoToEdit ? 'Editar Aluno' : 'Novo Aluno'}
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel={alunoToEdit ? 'Salvar Alterações' : 'Cadastrar Aluno'}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome *</label>
        <input type="text" {...register('name')} placeholder="Ex: Ana Souza" className={inputClass} />
        {errors.name && <Text variant="alarm">{errors.name.message}</Text>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          E-mail *
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="aluno@cin.ufpe.br"
          className={inputClass}
        />
        {errors.email && <Text variant="alarm">{errors.email.message}</Text>}
      </div>
    </FormModal>
  );
}
