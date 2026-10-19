import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import type { CreateTurmaDto, Turma } from '../turma.types';
import { FormModal } from '../../../components/FormModal';

const turmaFormSchema = z.object({
  name: z.string().trim().min(1, 'O nome da turma é obrigatório.'),
});

type TurmaFormValues = z.infer<typeof turmaFormSchema>;

interface TurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTurmaDto) => Promise<void>;
  turmaToEdit?: Turma | null;
}

/** Use `key={turmaToEdit?.id ?? 'new'}` ao renderizar, igual ao TodoModal. */
export function TurmaModal({ isOpen, onClose, onSubmit, turmaToEdit }: TurmaModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: { name: turmaToEdit?.name ?? '' },
  });

  const submitTurma = handleSubmit(async (values) => {
    await onSubmit({ name: values.name });
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitTurma}
      title={turmaToEdit ? 'Editar Turma' : 'Nova Turma'}
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel={turmaToEdit ? 'Salvar Alterações' : 'Criar Turma'}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Ex: Turma A - 2026.2"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.name && <Text variant="alarm">{errors.name.message}</Text>}
      </div>
    </FormModal>
  );
}
