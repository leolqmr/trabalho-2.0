import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import { FormModal } from '../../../components/FormModal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const presencaFormSchema = z.object({
  user_id: z.string().trim().regex(UUID_REGEX, 'Informe um ID de usuário válido (UUID).'),
  present: z.boolean(),
});

type PresencaFormValues = z.infer<typeof presencaFormSchema>;

interface PresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, present: boolean) => Promise<void>;
}

/** Adiciona um participante à chamada da aula. */
export function PresencaModal({ isOpen, onClose, onSubmit }: PresencaModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PresencaFormValues>({
    resolver: zodResolver(presencaFormSchema),
    defaultValues: { user_id: '', present: true },
  });

  const submitPresenca = handleSubmit(async (values) => {
    await onSubmit(values.user_id, values.present);
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitPresenca}
      title="Adicionar Participante"
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel="Adicionar"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ID do usuário *
        </label>
        <input
          type="text"
          {...register('user_id')}
          placeholder="00000000-0000-0000-0000-000000000000"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.user_id && <Text variant="alarm">{errors.user_id.message}</Text>}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input type="checkbox" {...register('present')} className="h-4 w-4 accent-red-600" />
        Já marcar como presente
      </label>
    </FormModal>
  );
}
