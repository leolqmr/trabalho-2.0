import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text } from '@cincoders/cinnamon';
import { FormModal } from '../../../components/FormModal';

const schema = z.object({ password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.') });

interface SenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  nome: string;
}

/** Use `key={usuario.id}` ao renderizar para zerar o campo a cada usuário. */
export function SenhaModal({ isOpen, onClose, onSubmit, nome }: SenhaModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string }>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  const submit = handleSubmit(async ({ password }) => {
    await onSubmit(password);
    onClose();
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submit}
      title={`Nova senha de ${nome}`}
      titleVariant="headline"
      isSubmitting={isSubmitting}
      submitLabel="Salvar senha"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nova senha *
        </label>
        <input
          type="text"
          autoComplete="off"
          {...register('password')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.password && <Text variant="alarm">{errors.password.message}</Text>}
      </div>
    </FormModal>
  );
}
