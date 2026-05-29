import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Field,
  Icon,
  Input,
  Modal,
  Pill,
  Select,
  type SelectOption,
} from '@alphatrack/ui';
import { Utils } from '@alphatrack/shared';
import { useCreateEleve, type CreateEleveResult } from '../../hooks/useEleves';
import { useCreateInscription } from '../../hooks/useInscriptions';
import { useConcoursList } from '../../hooks/useConcours';
import { useSousCentresList } from '../../hooks/useSousCentres';
import { ShareCodeBlock } from './share-code-block';

const formSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(80),
  prenom: z.string().min(1, 'Prénom requis').max(80),
  sexe: z.enum(['M', 'F']),
  date_naissance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format : YYYY-MM-DD'),
  telephone: z
    .string()
    .regex(/^\+?\d{6,15}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  // Inscription optionnelle à la création
  concours_id: z.string().uuid().optional().or(z.literal('')),
  sous_centre_id: z.string().uuid().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateEleveModal({ open, onClose }: Props): JSX.Element {
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateEleveResult | null>(null);

  const concours = useConcoursList();
  const sousCentres = useSousCentresList();
  const create = useCreateEleve();
  const createInscription = useCreateInscription();

  const concoursOptions: SelectOption[] = [
    { value: '', label: '— Aucun pour l’instant —' },
    ...(concours.data ?? [])
      .filter((c) => c.actif)
      .map((c) => ({ value: c.id, label: `${c.sigle} · ${c.nom}` })),
  ];

  const sousCentreOptions: SelectOption[] = [
    { value: '', label: '— Choisir —' },
    ...(sousCentres.data ?? []).map((sc) => ({
      value: sc.id,
      label: `${sc.code} · ${sc.nom}`,
    })),
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      sexe: 'M',
      date_naissance: '',
      telephone: '',
      email: '',
      concours_id: '',
      sous_centre_id: '',
    },
  });

  const sexeValue = watch('sexe');
  const concoursValue = watch('concours_id');
  const sousCentreValue = watch('sous_centre_id');

  async function onSubmit(values: FormValues): Promise<void> {
    setServerError(null);
    const session = Utils.sessionAnneeCourante();

    try {
      const result = await create.mutateAsync({
        nom: values.nom.trim(),
        prenom: values.prenom.trim(),
        sexe: values.sexe,
        date_naissance: values.date_naissance,
        telephone: values.telephone || undefined,
        email: values.email || undefined,
        session,
      });

      // Inscription optionnelle créée dans la foulée
      if (values.concours_id && values.sous_centre_id) {
        try {
          await createInscription.mutateAsync({
            eleve_id: result.eleve.id,
            concours_id: values.concours_id,
            sous_centre_id: values.sous_centre_id,
            session,
            statut_paiement: 'non_paye',
          });
        } catch (e) {
          // On garde l'élève créé même si l'inscription échoue —
          // l'admin pourra la créer plus tard depuis l'édition.
          console.warn('Inscription initiale échouée', e);
        }
      }

      setCreated(result);
    } catch (err) {
      setServerError((err as Error).message);
    }
  }

  function handleClose(): void {
    reset();
    setCreated(null);
    setServerError(null);
    onClose();
  }

  // Vue de révélation du code après création réussie
  if (created) {
    return (
      <Modal
        open={open}
        onOpenChange={(o) => !o && handleClose()}
        title="Élève créé ✓"
        description="Note bien le code d'accès — il ne sera plus jamais affiché."
        size="lg"
        footer={<Button onClick={handleClose}>Terminé</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
            <p className="text-sm text-slate-700 mb-4">
              <strong>{created.eleve.prenom} {created.eleve.nom}</strong> a été créé(e) avec succès.
            </p>
            <ShareCodeBlock
              matricule={created.eleve.matricule}
              prenom={created.eleve.prenom}
              nom={created.eleve.nom}
              code={created.code_acces_clair}
              telephone={created.eleve.telephone}
            />
          </div>

          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-2 text-sm">
            <Icon name="lock" className="text-warning shrink-0 mt-0.5" />
            <p className="text-warning leading-relaxed">
              Le code est stocké en version hachée (bcrypt) — il ne pourra plus être affiché
              après fermeture. Communique-le par un canal sûr maintenant.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && handleClose()}
      title="Nouvel élève"
      description="Le matricule et le code d'accès seront générés automatiquement."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit" form="eleve-form" loading={isSubmitting}>
            Créer l&apos;élève
          </Button>
        </>
      }
    >
      <form
        id="eleve-form"
        onSubmit={(e: FormEvent) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="prenom" label="Prénom" error={errors.prenom?.message} required>
            <Input id="prenom" {...register('prenom')} invalid={!!errors.prenom} />
          </Field>
          <Field id="nom" label="Nom" error={errors.nom?.message} required>
            <Input id="nom" {...register('nom')} invalid={!!errors.nom} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="sexe" label="Sexe" required>
            <div className="grid grid-cols-2 gap-2">
              <SexeRadio
                value="M"
                current={sexeValue}
                onChange={(v) => setValue('sexe', v)}
                label="Masculin"
              />
              <SexeRadio
                value="F"
                current={sexeValue}
                onChange={(v) => setValue('sexe', v)}
                label="Féminin"
              />
            </div>
          </Field>
          <Field
            id="date_naissance"
            label="Date de naissance"
            error={errors.date_naissance?.message}
            required
          >
            <Input
              id="date_naissance"
              type="date"
              {...register('date_naissance')}
              invalid={!!errors.date_naissance}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="telephone" label="Téléphone" hint="Format : +237..." error={errors.telephone?.message}>
            <Input
              id="telephone"
              type="tel"
              placeholder="+237600000000"
              {...register('telephone')}
              invalid={!!errors.telephone}
              mono
            />
          </Field>
          <Field id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="optionnel"
              {...register('email')}
              invalid={!!errors.email}
            />
          </Field>
        </div>

        <div className="mt-2 p-4 rounded-xl bg-surface-muted border border-surface-border">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Inscription initiale (optionnelle)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field id="concours_id" label="Concours">
              <Select
                value={concoursValue ?? ''}
                onChange={(e) => setValue('concours_id', e.target.value)}
                options={concoursOptions}
              />
            </Field>
            <Field id="sous_centre_id" label="Sous-centre">
              <Select
                value={sousCentreValue ?? ''}
                onChange={(e) => setValue('sous_centre_id', e.target.value)}
                options={sousCentreOptions}
              />
            </Field>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Les deux champs doivent être remplis ensemble pour créer l&apos;inscription, ou
            laissés vides pour ne pas inscrire l&apos;élève à un concours tout de suite. Tu
            pourras ajouter d&apos;autres inscriptions (multi-concours) depuis l&apos;édition.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
          >
            {serverError}
          </div>
        )}

        <Pill tone="info" size="sm" className="self-start">
          Session : {Utils.sessionAnneeCourante()}
        </Pill>
      </form>
    </Modal>
  );
}

function SexeRadio({
  value,
  current,
  onChange,
  label,
}: {
  value: 'M' | 'F';
  current: string;
  onChange: (v: 'M' | 'F') => void;
  label: string;
}): JSX.Element {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`
        h-11 px-4 rounded-xl border-2 text-sm font-semibold transition-all
        ${isActive
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-surface-base text-slate-600 border-surface-border hover:border-slate-300'
        }
      `.trim()}
    >
      {label}
    </button>
  );
}

