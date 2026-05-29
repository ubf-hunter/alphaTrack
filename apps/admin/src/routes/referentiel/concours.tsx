import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  EmptyRow,
  Field,
  Icon,
  IconButton,
  Input,
  LoadingRow,
  Modal,
  Pill,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@alphatrack/ui';
import {
  useConcoursList,
  useCreateConcours,
  useDeleteConcours,
  useUpdateConcours,
  type Concours,
} from '../../hooks/useConcours';

const concoursFormSchema = z.object({
  sigle: z
    .string()
    .min(2, 'Au moins 2 caractères')
    .max(20, 'Maximum 20 caractères')
    .transform((v) => v.trim().toUpperCase()),
  nom: z
    .string()
    .min(3, 'Au moins 3 caractères')
    .max(120, 'Maximum 120 caractères'),
  description: z.string().max(400).optional(),
  actif: z.boolean(),
});

type ConcoursFormValues = z.infer<typeof concoursFormSchema>;

export function ConcoursRoute(): JSX.Element {
  const { data: list, isLoading, error } = useConcoursList();
  const create = useCreateConcours();
  const update = useUpdateConcours();
  const remove = useDeleteConcours();

  const [editing, setEditing] = useState<Concours | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Concours | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Liste des concours</h2>
          <p className="text-sm text-slate-500">
            {list ? `${list.length} concours configurés` : 'Chargement…'}
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          leftIcon={<Icon name="plus" />}
        >
          Nouveau concours
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {(error as Error).message}
        </div>
      )}

      <Table>
        <Thead>
          <Tr>
            <Th>Sigle</Th>
            <Th>Nom</Th>
            <Th>Description</Th>
            <Th>Statut</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && <LoadingRow colSpan={5} rows={3} />}
          {!isLoading && list?.length === 0 && (
            <EmptyRow colSpan={5} message="Aucun concours configuré. Crée le premier." />
          )}
          {list?.map((c) => (
            <Tr key={c.id}>
              <Td>
                <span className="font-mono font-semibold text-slate-900">{c.sigle}</span>
              </Td>
              <Td className="font-medium text-slate-800">{c.nom}</Td>
              <Td className="text-slate-500 max-w-md truncate">{c.description ?? '—'}</Td>
              <Td>
                <Pill tone={c.actif ? 'success' : 'neutral'}>
                  {c.actif ? 'Actif' : 'Inactif'}
                </Pill>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-1">
                  <IconButton label="Modifier" onClick={() => setEditing(c)}>
                    <Icon name="pencil" />
                  </IconButton>
                  <IconButton label="Supprimer" tone="danger" onClick={() => setToDelete(c)}>
                    <Icon name="trash" />
                  </IconButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Create modal */}
      <ConcoursFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={async (values) => {
          await create.mutateAsync({
            sigle: values.sigle,
            nom: values.nom,
            description: values.description ?? null,
            actif: values.actif,
          });
          setCreating(false);
        }}
        title="Nouveau concours"
        submitLabel="Créer"
        defaultValues={{ actif: true }}
      />

      {/* Edit modal */}
      {editing && (
        <ConcoursFormModal
          open={!!editing}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            await update.mutateAsync({
              id: editing.id,
              patch: {
                sigle: values.sigle,
                nom: values.nom,
                description: values.description ?? null,
                actif: values.actif,
              },
            });
            setEditing(null);
          }}
          title={`Modifier ${editing.sigle}`}
          submitLabel="Enregistrer"
          defaultValues={{
            sigle: editing.sigle,
            nom: editing.nom,
            description: editing.description ?? '',
            actif: editing.actif,
          }}
        />
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <Modal
          open={!!toDelete}
          onOpenChange={(o) => !o && setToDelete(null)}
          title={`Supprimer ${toDelete.sigle} ?`}
          description="Cette action est irréversible. Les évaluations historiques resteront cohérentes grâce au snapshot des coefficients."
          footer={
            <>
              <Button variant="ghost" onClick={() => setToDelete(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                loading={remove.isPending}
                onClick={async () => {
                  await remove.mutateAsync(toDelete.id);
                  setToDelete(null);
                }}
              >
                Supprimer
              </Button>
            </>
          }
        >
          <div className="text-sm text-slate-600">
            <p>Tu vas supprimer définitivement le concours :</p>
            <p className="mt-2 font-mono font-semibold text-slate-900">
              {toDelete.sigle} — {toDelete.nom}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface ConcoursFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ConcoursFormValues) => Promise<void>;
  title: string;
  submitLabel: string;
  defaultValues?: Partial<ConcoursFormValues>;
}

function ConcoursFormModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  defaultValues,
}: ConcoursFormModalProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ConcoursFormValues>({
    resolver: zodResolver(concoursFormSchema),
    defaultValues: {
      sigle: defaultValues?.sigle ?? '',
      nom: defaultValues?.nom ?? '',
      description: defaultValues?.description ?? '',
      actif: defaultValues?.actif ?? true,
    },
  });

  const actif = watch('actif');

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
          <Button
            type="submit"
            form="concours-form"
            loading={isSubmitting}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="concours-form"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <Field id="sigle" label="Sigle" hint="Ex. ENSPY, FMSB" error={errors.sigle?.message} required>
          <Input id="sigle" mono autoCapitalize="characters" {...register('sigle')} invalid={!!errors.sigle} />
        </Field>

        <Field id="nom" label="Nom complet" error={errors.nom?.message} required>
          <Input id="nom" {...register('nom')} invalid={!!errors.nom} />
        </Field>

        <Field id="description" label="Description" error={errors.description?.message}>
          <Input id="description" {...register('description')} invalid={!!errors.description} />
        </Field>

        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-muted border border-surface-border">
          <div>
            <p className="text-sm font-medium text-slate-700">Concours actif</p>
            <p className="text-xs text-slate-500">Inactif = caché du menu de création d&apos;évaluation</p>
          </div>
          <Switch
            checked={actif}
            onChange={(e) => setValue('actif', e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
