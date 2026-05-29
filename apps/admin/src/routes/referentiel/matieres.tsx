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
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@alphatrack/ui';
import {
  useCreateMatiere,
  useDeleteMatiere,
  useMatieresList,
  useUpdateMatiere,
  type Matiere,
} from '../../hooks/useMatieres';

const matiereFormSchema = z.object({
  code: z
    .string()
    .min(2, 'Au moins 2 caractères')
    .max(10, 'Maximum 10 caractères')
    .regex(/^[A-Z0-9]+$/, 'Lettres majuscules et chiffres uniquement')
    .transform((v) => v.trim().toUpperCase()),
  nom: z.string().min(2).max(80),
});

type MatiereFormValues = z.infer<typeof matiereFormSchema>;

export function MatieresRoute(): JSX.Element {
  const { data: list, isLoading, error } = useMatieresList();
  const create = useCreateMatiere();
  const update = useUpdateMatiere();
  const remove = useDeleteMatiere();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Matiere | null>(null);
  const [toDelete, setToDelete] = useState<Matiere | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Catalogue des matières</h2>
          <p className="text-sm text-slate-500">
            {list ? `${list.length} matières dans le catalogue` : 'Chargement…'}
          </p>
        </div>
        <Button onClick={() => setCreating(true)} leftIcon={<Icon name="plus" />}>
          Nouvelle matière
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
            <Th>Code</Th>
            <Th>Nom</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && <LoadingRow colSpan={3} rows={4} />}
          {!isLoading && list?.length === 0 && (
            <EmptyRow colSpan={3} message="Aucune matière. Crée la première." />
          )}
          {list?.map((m) => (
            <Tr key={m.id}>
              <Td>
                <span className="font-mono font-semibold text-slate-900">{m.code}</span>
              </Td>
              <Td className="font-medium text-slate-800">{m.nom}</Td>
              <Td>
                <div className="flex items-center justify-end gap-1">
                  <IconButton label="Modifier" onClick={() => setEditing(m)}>
                    <Icon name="pencil" />
                  </IconButton>
                  <IconButton label="Supprimer" tone="danger" onClick={() => setToDelete(m)}>
                    <Icon name="trash" />
                  </IconButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <MatiereFormModal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nouvelle matière"
        submitLabel="Créer"
        onSubmit={async (values) => {
          await create.mutateAsync(values);
          setCreating(false);
        }}
      />

      {editing && (
        <MatiereFormModal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={`Modifier ${editing.code}`}
          submitLabel="Enregistrer"
          defaultValues={{ code: editing.code, nom: editing.nom }}
          onSubmit={async (values) => {
            await update.mutateAsync({ id: editing.id, patch: values });
            setEditing(null);
          }}
        />
      )}

      {toDelete && (
        <Modal
          open={!!toDelete}
          onOpenChange={(o) => !o && setToDelete(null)}
          title={`Supprimer ${toDelete.code} ?`}
          description="Échec si la matière est utilisée dans un coefficient ou une note (FK)."
          footer={
            <>
              <Button variant="ghost" onClick={() => setToDelete(null)}>Annuler</Button>
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
          <p className="text-sm text-slate-600">
            Tu vas supprimer la matière <span className="font-mono font-semibold">{toDelete.code}</span> — {toDelete.nom}.
          </p>
        </Modal>
      )}
    </div>
  );
}

interface MatiereFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MatiereFormValues) => Promise<void>;
  title: string;
  submitLabel: string;
  defaultValues?: Partial<MatiereFormValues>;
}

function MatiereFormModal({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel,
  defaultValues,
}: MatiereFormModalProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MatiereFormValues>({
    resolver: zodResolver(matiereFormSchema),
    defaultValues: {
      code: defaultValues?.code ?? '',
      nom: defaultValues?.nom ?? '',
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
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" form="matiere-form" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="matiere-form"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <Field id="code" label="Code" hint="Ex. MATH, PHY, CHIM" error={errors.code?.message} required>
          <Input id="code" mono autoCapitalize="characters" {...register('code')} invalid={!!errors.code} />
        </Field>

        <Field id="nom" label="Nom complet" error={errors.nom?.message} required>
          <Input id="nom" {...register('nom')} invalid={!!errors.nom} />
        </Field>
      </form>
    </Modal>
  );
}
