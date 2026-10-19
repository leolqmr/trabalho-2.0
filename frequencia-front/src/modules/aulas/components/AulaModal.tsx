import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import type { Aula } from '../aula.types';
import { FormModal } from '../../../components/FormModal';

const aulaFormSchema = z.object({
  date: z.string().min(1, 'A data da aula é obrigatória.'),
});

type AulaFormValues = z.infer<typeof aulaFormSchema>;

interface AulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => Promise<void>;
  aulaToEdit?: Aula | null;
}

export function AulaModal({ isOpen, onClose, onSubmit, aulaToEdit }: AulaModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: { date: aulaToEdit?.date.slice(0, 10) ?? '' },
  });

  const submitAula = handleSubmit(async (values) => {
    await onSubmit(values.date);
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitAula}
      title={aulaToEdit ? 'Editar Aula' : 'Nova Aula'}
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel={aulaToEdit ? 'Salvar Alterações' : 'Criar Aula'}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Data da aula *
        </label>
        <input
          type="date"
          {...register('date')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.date && <Text variant="alarm">{errors.date.message}</Text>}
      </div>
    </FormModal>
  );
}
