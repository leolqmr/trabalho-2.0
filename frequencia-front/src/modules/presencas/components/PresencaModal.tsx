import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import { FormModal } from '../../../components/FormModal';

const presencaFormSchema = z.object({
  email: z.string().trim().min(1, 'O e-mail é obrigatório.').email('Informe um e-mail válido.'),
  situacao: z.enum(['presente', 'falta']),
});

type PresencaFormValues = z.infer<typeof presencaFormSchema>;

interface PresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, present: boolean) => Promise<void>;
}

/** Adiciona um aluno à chamada da aula, já definindo se está presente ou faltou. */
export function PresencaModal({ isOpen, onClose, onSubmit }: PresencaModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PresencaFormValues>({
    resolver: zodResolver(presencaFormSchema),
    defaultValues: { email: '', situacao: 'presente' },
  });

  const submitPresenca = handleSubmit(async (values) => {
    await onSubmit(values.email, values.situacao === 'presente');
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitPresenca}
      title="Adicionar Aluno"
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel="Adicionar"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          E-mail do aluno *
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="aluno@cin.ufpe.br"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.email && <Text variant="alarm">{errors.email.message}</Text>}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Situação
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm has-[:checked]:border-green-600 has-[:checked]:bg-green-50 has-[:checked]:text-green-700 dark:border-gray-700 dark:text-gray-300 dark:has-[:checked]:bg-green-950/40 dark:has-[:checked]:text-green-400">
            <input type="radio" value="presente" {...register('situacao')} className="sr-only" />
            Presente
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm has-[:checked]:border-red-600 has-[:checked]:bg-red-50 has-[:checked]:text-red-700 dark:border-gray-700 dark:text-gray-300 dark:has-[:checked]:bg-red-950/40 dark:has-[:checked]:text-red-400">
            <input type="radio" value="falta" {...register('situacao')} className="sr-only" />
            Falta
          </label>
        </div>
      </fieldset>
    </FormModal>
  );
}
