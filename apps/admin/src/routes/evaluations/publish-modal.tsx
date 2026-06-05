import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Schemas } from '@alphatrack/shared';
import { Button, Field, Input, Modal } from '@alphatrack/ui';
import type { Evaluation } from '../../hooks/useEvaluations';

interface PublishModalProps {
  evaluation: Evaluation;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

type FormValues = { libelle_confirmation: string };

export function PublishModal({
  evaluation,
  open,
  onClose,
  onConfirm,
  loading,
}: PublishModalProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(
      Schemas.publishEvaluationSchema.pick({ libelle_confirmation: true }),
    ),
    defaultValues: { libelle_confirmation: '' },
  });

  const typed = watch('libelle_confirmation');
  const matches = typed.trim() === evaluation.libelle;

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
      title="Publier l'évaluation"
      description="Les résultats seront visibles côté élève. Cette action est sensible."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            loading={loading || isSubmitting}
            disabled={!matches}
            onClick={() => {
              void handleSubmit(async () => {
                await onConfirm();
                reset();
                onClose();
              })();
            }}
          >
            Publier définitivement
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Pour confirmer, saisis exactement le libellé de l&apos;évaluation :
        </p>
        <p className="font-mono text-sm font-semibold text-slate-900 bg-surface-muted px-3 py-2 rounded-lg border border-surface-border">
          {evaluation.libelle}
        </p>
        <Field
          id="libelle_confirmation"
          label="Confirmation"
          error={errors.libelle_confirmation?.message}
          required
        >
          <Input
            id="libelle_confirmation"
            placeholder={evaluation.libelle}
            {...register('libelle_confirmation')}
            invalid={!!errors.libelle_confirmation}
          />
        </Field>
      </div>
    </Modal>
  );
}
