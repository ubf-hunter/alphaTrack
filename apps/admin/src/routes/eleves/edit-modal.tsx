import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Avatar,
  Button,
  Field,
  Icon,
  Input,
  Modal,
  Pill,
} from '@alphatrack/ui';
import {
  useUpdateEleve,
  useResetEleveCode,
  useEtablissementsList,
  type EleveListItem,
} from '../../hooks/useEleves';
import { InscriptionsSection } from './inscriptions-section';
import { ShareCodeBlock } from './share-code-block';

const editSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(80),
  prenom: z.string().min(1, 'Prénom requis').max(80),
  sexe: z.enum(['M', 'F']),
  date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format : YYYY-MM-DD'),
  telephone: z
    .string()
    .regex(/^\+?\d{6,15}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  etablissement_origine: z
    .string()
    .max(160, 'Maximum 160 caractères')
    .optional()
    .or(z.literal('')),
});

type EditFormValues = z.infer<typeof editSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  eleve: EleveListItem;
}

export function EditEleveModal({ open, onClose, eleve }: Props): JSX.Element {
  const update = useUpdateEleve();
  const resetCode = useResetEleveCode();
  const etablissements = useEtablissementsList();
  const [serverError, setServerError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      date_naissance: eleve.date_naissance,
      telephone: eleve.telephone ?? '',
      email: eleve.email ?? '',
      etablissement_origine: eleve.etablissement_origine ?? '',
    },
  });

  // Re-sync quand on change d'élève (cas peu courant mais propre)
  useEffect(() => {
    reset({
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      date_naissance: eleve.date_naissance,
      telephone: eleve.telephone ?? '',
      email: eleve.email ?? '',
      etablissement_origine: eleve.etablissement_origine ?? '',
    });
  }, [
    eleve.id,
    reset,
    eleve.nom,
    eleve.prenom,
    eleve.sexe,
    eleve.date_naissance,
    eleve.telephone,
    eleve.email,
    eleve.etablissement_origine,
  ]);

  const sexeValue = watch('sexe');

  async function onSubmit(values: EditFormValues): Promise<void> {
    setServerError(null);
    try {
      await update.mutateAsync({
        id: eleve.id,
        patch: {
          nom: values.nom.trim(),
          prenom: values.prenom.trim(),
          sexe: values.sexe,
          date_naissance: values.date_naissance,
          telephone: values.telephone || null,
          email: values.email || null,
          etablissement_origine: values.etablissement_origine?.trim() || null,
        },
      });
      onClose();
    } catch (err) {
      setServerError((err as Error).message);
    }
  }

  function handleClose(): void {
    reset();
    setServerError(null);
    setNewCode(null);
    setConfirmReset(false);
    onClose();
  }

  async function handleResetCode(): Promise<void> {
    try {
      const code = await resetCode.mutateAsync(eleve.id);
      setNewCode(code);
      setConfirmReset(false);
    } catch (err) {
      setServerError((err as Error).message);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && handleClose()}
      title={`Modifier ${eleve.prenom} ${eleve.nom}`}
      description={`Matricule ${eleve.matricule} — créé le ${formatDate(eleve.created_at)}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Fermer
          </Button>
          <Button
            type="submit"
            form="edit-eleve-form"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Enregistrer les modifications
          </Button>
        </>
      }
    >
      {/* En-tête identité */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl bg-surface-muted border border-surface-border">
        <Avatar name={`${eleve.prenom} ${eleve.nom}`} src={eleve.photo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-900 truncate">
            {eleve.prenom} {eleve.nom}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="font-mono text-sm text-slate-600">{eleve.matricule}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-500">
              {eleve.sexe === 'F' ? 'Féminin' : 'Masculin'}
            </span>
          </div>
        </div>
      </div>

      {/* Form profil */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          Informations personnelles
        </h3>
        <form
          id="edit-eleve-form"
          onSubmit={(e: FormEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="edit-prenom" label="Prénom" error={errors.prenom?.message} required>
              <Input id="edit-prenom" {...register('prenom')} invalid={!!errors.prenom} />
            </Field>
            <Field id="edit-nom" label="Nom" error={errors.nom?.message} required>
              <Input id="edit-nom" {...register('nom')} invalid={!!errors.nom} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="edit-sexe" label="Sexe" required>
              <div className="grid grid-cols-2 gap-2">
                <SexeChip
                  value="M"
                  current={sexeValue}
                  onClick={() => setValue('sexe', 'M', { shouldDirty: true })}
                  label="Masculin"
                />
                <SexeChip
                  value="F"
                  current={sexeValue}
                  onClick={() => setValue('sexe', 'F', { shouldDirty: true })}
                  label="Féminin"
                />
              </div>
            </Field>
            <Field
              id="edit-date_naissance"
              label="Date de naissance"
              error={errors.date_naissance?.message}
              required
            >
              <Input
                id="edit-date_naissance"
                type="date"
                {...register('date_naissance')}
                invalid={!!errors.date_naissance}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="edit-telephone" label="Téléphone" error={errors.telephone?.message}>
              <Input
                id="edit-telephone"
                type="tel"
                placeholder="+237600000000"
                {...register('telephone')}
                invalid={!!errors.telephone}
                mono
              />
            </Field>
            <Field id="edit-email" label="Email" error={errors.email?.message}>
              <Input
                id="edit-email"
                type="email"
                {...register('email')}
                invalid={!!errors.email}
              />
            </Field>
          </div>

          <Field
            id="edit-etablissement"
            label="Établissement d'origine"
            hint="Lycée ou collège fréquenté avant Alpha Center"
            error={errors.etablissement_origine?.message}
          >
            <Input
              id="edit-etablissement"
              list="edit-etablissements-suggestions"
              placeholder="Ex. Lycée Général Leclerc, Yaoundé"
              {...register('etablissement_origine')}
              invalid={!!errors.etablissement_origine}
              autoComplete="off"
            />
            {(etablissements.data?.length ?? 0) > 0 && (
              <datalist id="edit-etablissements-suggestions">
                {etablissements.data!.map((etb) => (
                  <option key={etb} value={etb} />
                ))}
              </datalist>
            )}
          </Field>

          {serverError && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
            >
              {serverError}
            </div>
          )}
        </form>
      </section>

      {/* Section inscriptions */}
      <section className="mb-6 pt-6 border-t border-surface-border">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          Inscriptions aux concours
        </h3>
        <InscriptionsSection eleveId={eleve.id} eleveName={`${eleve.prenom} ${eleve.nom}`} />
      </section>

      {/* Section sécurité — reset code d'accès */}
      <section className="pt-6 border-t border-surface-border">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          Sécurité
        </h3>

        {newCode ? (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl bg-success/20 text-success flex items-center justify-center shrink-0">
                <Icon name="circle-check" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 mb-1">
                  Nouveau code d&apos;accès généré
                </p>
                <p className="text-sm text-slate-600">
                  L&apos;ancien code ne fonctionne plus. Communique le nouveau par un canal
                  sûr — il ne sera plus jamais affiché après fermeture.
                </p>
              </div>
            </div>
            <ShareCodeBlock
              matricule={eleve.matricule}
              prenom={eleve.prenom}
              nom={eleve.nom}
              code={newCode}
              telephone={eleve.telephone}
            />
          </div>
        ) : confirmReset ? (
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="lock" className="text-warning shrink-0 mt-0.5 w-5 h-5" />
              <p className="text-sm text-warning leading-relaxed">
                Confirmer la régénération du code d&apos;accès de{' '}
                <strong>{eleve.prenom} {eleve.nom}</strong> ? L&apos;ancien code cessera
                immédiatement de fonctionner.
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={resetCode.isPending}
                onClick={() => void handleResetCode()}
              >
                Régénérer maintenant
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted border border-surface-border">
            <div className="flex items-center gap-3">
              <Icon name="lock" className="text-slate-400 w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-slate-800">Code d&apos;accès au portail</p>
                <p className="text-xs text-slate-500">
                  Le code en clair n&apos;est pas affichable (bcrypt). Utilise ce bouton si
                  l&apos;élève l&apos;a perdu.
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
              Régénérer
            </Button>
          </div>
        )}
      </section>

      {/* Récap inscriptions actuelles */}
      {eleve.inscriptions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Concours actuels :
          </span>
          {eleve.inscriptions.map((i) => (
            <Pill key={i.id} tone="lime" size="sm">
              {i.concours?.sigle ?? '?'}
            </Pill>
          ))}
        </div>
      )}
    </Modal>
  );
}

function SexeChip({
  value,
  current,
  onClick,
  label,
}: {
  value: 'M' | 'F';
  current: string;
  onClick: () => void;
  label: string;
}): JSX.Element {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
