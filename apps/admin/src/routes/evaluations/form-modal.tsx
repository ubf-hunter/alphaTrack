import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Schemas, Utils } from '@alphatrack/shared';
import { Button, Field, Input, Modal } from '@alphatrack/ui';
import { z } from 'zod';
import type { Evaluation } from '../../hooks/useEvaluations';

const formSchema = Schemas.evaluationCreateSchema;
type FormValues = z.infer<typeof formSchema>;

interface EvaluationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  title: string;
  submitLabel: string;
  evaluation?: Evaluation | null;
}

export function EvaluationFormModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  evaluation,
}: EvaluationFormModalProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: evaluation
      ? {
          libelle: evaluation.libelle,
          numero: evaluation.numero,
          session: evaluation.session,
          date_yaounde: evaluation.date_yaounde,
          date_dschang: evaluation.date_dschang,
        }
      : {
          libelle: '',
          numero: 1,
          session: Utils.sessionAnneeCourante(),
          date_yaounde: '',
          date_dschang: '',
        },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" form="evaluation-form" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="evaluation-form"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <Field id="libelle" label="Libellé" error={errors.libelle?.message} required>
          <Input
            id="libelle"
            placeholder="Blanc n°3 — Mai 2026"
            {...register('libelle')}
            invalid={!!errors.libelle}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="numero" label="Numéro" error={errors.numero?.message} required>
            <Input
              id="numero"
              type="number"
              min={1}
              {...register('numero', { valueAsNumber: true })}
              invalid={!!errors.numero}
            />
          </Field>
          <Field id="session" label="Session" hint="YYYY-YYYY" error={errors.session?.message} required>
            <Input id="session" mono {...register('session')} invalid={!!errors.session} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            id="date_yaounde"
            label="Date Yaoundé"
            error={errors.date_yaounde?.message}
            required
          >
            <Input id="date_yaounde" type="date" {...register('date_yaounde')} invalid={!!errors.date_yaounde} />
          </Field>
          <Field
            id="date_dschang"
            label="Date Dschang"
            error={errors.date_dschang?.message}
            required
          >
            <Input id="date_dschang" type="date" {...register('date_dschang')} invalid={!!errors.date_dschang} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
