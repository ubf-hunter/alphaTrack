import { useMemo, useState } from 'react';
import {
  Button,
  Icon,
  IconButton,
  Pill,
  Select,
  type SelectOption,
} from '@alphatrack/ui';
import { Utils } from '@alphatrack/shared';
import {
  useCreateInscription,
  useDeleteInscription,
  useInscriptionsByEleve,
  useUpdateInscription,
  type InscriptionDetail,
} from '../../hooks/useInscriptions';
import { useConcoursList } from '../../hooks/useConcours';
import { useSousCentresList } from '../../hooks/useSousCentres';

interface Props {
  eleveId: string;
  eleveName: string;
}

export function InscriptionsSection({ eleveId, eleveName }: Props): JSX.Element {
  const inscriptions = useInscriptionsByEleve(eleveId);
  const concours = useConcoursList();
  const sousCentres = useSousCentresList();

  const create = useCreateInscription();
  const update = useUpdateInscription();
  const remove = useDeleteInscription();

  const [adding, setAdding] = useState(false);
  const [newConcoursId, setNewConcoursId] = useState('');
  const [newSousCentreId, setNewSousCentreId] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<InscriptionDetail | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Concours déjà inscrits sur la session courante — pour éviter les doublons
  const session = Utils.sessionAnneeCourante();
  const alreadyInscribed = useMemo(() => {
    return new Set(
      (inscriptions.data ?? [])
        .filter((i) => i.session === session)
        .map((i) => i.concours_id),
    );
  }, [inscriptions.data, session]);

  const concoursOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: '— Choisir un concours —' },
      ...(concours.data ?? [])
        .filter((c) => c.actif)
        .map((c) => ({
          value: c.id,
          label: alreadyInscribed.has(c.id)
            ? `${c.sigle} · déjà inscrit`
            : `${c.sigle} · ${c.nom}`,
          disabled: alreadyInscribed.has(c.id),
        })),
    ],
    [concours.data, alreadyInscribed],
  );

  const sousCentreOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: '— Choisir un sous-centre —' },
      ...(sousCentres.data ?? []).map((sc) => ({
        value: sc.id,
        label: `${sc.code} · ${sc.nom}`,
      })),
    ],
    [sousCentres.data],
  );

  async function handleAdd(): Promise<void> {
    setActionError(null);
    if (!newConcoursId || !newSousCentreId) return;
    try {
      await create.mutateAsync({
        eleve_id: eleveId,
        concours_id: newConcoursId,
        sous_centre_id: newSousCentreId,
        session,
        statut_paiement: 'non_paye',
      });
      setNewConcoursId('');
      setNewSousCentreId('');
      setAdding(false);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handlePaiementChange(
    id: string,
    statut: 'paye' | 'partiel' | 'non_paye',
  ): Promise<void> {
    setActionError(null);
    try {
      await update.mutateAsync({ id, patch: { statut_paiement: statut } });
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleToggleActif(id: string, current: boolean): Promise<void> {
    setActionError(null);
    try {
      await update.mutateAsync({ id, patch: { actif: !current } });
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleDelete(insc: InscriptionDetail): Promise<void> {
    setActionError(null);
    try {
      await remove.mutateAsync(insc.id);
      setConfirmingDelete(null);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const list = inscriptions.data ?? [];

  return (
    <div className="space-y-3">
      {actionError && (
        <div
          role="alert"
          className="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
        >
          {actionError}
        </div>
      )}

      {inscriptions.isLoading ? (
        <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
      ) : list.length === 0 ? (
        <div className="px-4 py-6 rounded-2xl border border-dashed border-surface-border text-center">
          <p className="text-sm text-slate-500">Aucune inscription pour l&apos;instant.</p>
          <p className="text-xs text-slate-400 mt-1">
            Ajoute un concours pour qu&apos;il puisse composer.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((insc) => (
            <li
              key={insc.id}
              className="p-4 rounded-2xl border border-surface-border bg-surface-base hover:border-slate-300 transition-colors"
            >
              {confirmingDelete?.id === insc.id ? (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-slate-700">
                    Supprimer l&apos;inscription{' '}
                    <span className="font-mono font-semibold">{insc.concours?.sigle}</span> ? Les
                    notes associées seront supprimées en cascade.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingDelete(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={remove.isPending}
                      onClick={() => void handleDelete(insc)}
                    >
                      Confirmer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      {insc.concours?.sigle ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {insc.concours?.nom ?? 'Concours inconnu'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {insc.sous_centre?.region?.nom} · {insc.sous_centre?.nom} (
                        <span className="font-mono">{insc.sous_centre?.code}</span>) ·{' '}
                        Session {insc.session}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!insc.actif && <Pill tone="neutral">Inactive</Pill>}
                    <PaiementSelect
                      value={insc.statut_paiement}
                      onChange={(v) => void handlePaiementChange(insc.id, v)}
                    />
                    <IconButton
                      label={insc.actif ? 'Désactiver' : 'Réactiver'}
                      onClick={() => void handleToggleActif(insc.id, insc.actif)}
                    >
                      <Icon name={insc.actif ? 'circle' : 'circle-check'} />
                    </IconButton>
                    <IconButton
                      label="Supprimer"
                      tone="danger"
                      onClick={() => setConfirmingDelete(insc)}
                    >
                      <Icon name="trash" />
                    </IconButton>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Bloc ajout d'inscription */}
      {adding ? (
        <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">
            Nouvelle inscription · Session {session}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Select
              value={newConcoursId}
              onChange={(e) => setNewConcoursId(e.target.value)}
              options={concoursOptions}
            />
            <Select
              value={newSousCentreId}
              onChange={(e) => setNewSousCentreId(e.target.value)}
              options={sousCentreOptions}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setNewConcoursId('');
                setNewSousCentreId('');
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              loading={create.isPending}
              disabled={!newConcoursId || !newSousCentreId}
              onClick={() => void handleAdd()}
            >
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Icon name="plus" />}
          onClick={() => setAdding(true)}
          disabled={
            (concours.data ?? []).filter(
              (c) => c.actif && !alreadyInscribed.has(c.id),
            ).length === 0
          }
        >
          Inscrire {eleveName} à un autre concours
        </Button>
      )}
    </div>
  );
}

function PaiementSelect({
  value,
  onChange,
}: {
  value: 'paye' | 'partiel' | 'non_paye';
  onChange: (v: 'paye' | 'partiel' | 'non_paye') => void;
}): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'paye' | 'partiel' | 'non_paye')}
      className={`
        h-8 px-2.5 pr-7 rounded-lg text-xs font-semibold cursor-pointer
        border outline-none appearance-none
        bg-no-repeat bg-[length:14px] bg-[position:right_4px_center]
        bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2364748b'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpolyline%20points='6%209%2012%2015%2018%209'/%3E%3C/svg%3E")]
        ${value === 'paye'
          ? 'bg-success/15 text-success border-success/30'
          : value === 'partiel'
            ? 'bg-warning/15 text-warning border-warning/30'
            : 'bg-danger/15 text-danger border-danger/30'
        }
      `.trim()}
    >
      <option value="paye">Payé</option>
      <option value="partiel">Partiel</option>
      <option value="non_paye">Non payé</option>
    </select>
  );
}
