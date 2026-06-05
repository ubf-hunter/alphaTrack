import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Utils } from '@alphatrack/shared';
import { Button, Card, Icon, LoadingRow, Pill } from '@alphatrack/ui';
import { useAuth } from '../../lib/auth-context';
import {
  useCalculerEvaluation,
  useChangeEvaluationStatut,
  useEvaluation,
  useEvaluationSaisieStats,
  useUpdateEvaluation,
} from '../../hooks/useEvaluations';
import {
  EVALUATION_STATUTS_ORDER,
  evalStatutLabel,
  evalStatutTone,
  NEXT_STATUT,
} from '../../lib/evaluation-statut';
import { EvaluationFormModal } from './form-modal';
import { PublishModal } from './publish-modal';

export function EvaluationDetailRoute(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const isAdmin = admin?.role === 'admin';

  const [editing, setEditing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const { data: evaluation, isLoading, error } = useEvaluation(id);
  const { data: saisieStats, isLoading: statsLoading } = useEvaluationSaisieStats(id);

  const update = useUpdateEvaluation();
  const changeStatut = useChangeEvaluationStatut();
  const calculer = useCalculerEvaluation();

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto py-8">
        <LoadingRow colSpan={1} rows={1} />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-[1000px] mx-auto py-8">
        <div className="px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {(error as Error)?.message ?? 'Évaluation introuvable.'}
        </div>
        <Link to="/evaluations" className="inline-block mt-4 text-sm text-slate-600 hover:text-slate-900">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const nextStatut = NEXT_STATUT[evaluation.statut];
  const canEdit = isAdmin && evaluation.statut === 'brouillon';
  const canSaisie =
    evaluation.statut === 'saisie' ||
    (isAdmin && ['saisie', 'calcule', 'brouillon', 'composition'].includes(evaluation.statut));
  const canResultats = ['calcule', 'publie', 'archive'].includes(evaluation.statut);
  const canCalculer = isAdmin && ['saisie', 'calcule'].includes(evaluation.statut);
  const canPublish = isAdmin && evaluation.statut === 'calcule';
  const canReopenSaisie = isAdmin && evaluation.statut === 'calcule';

  async function advanceStatut(): Promise<void> {
    if (!nextStatut) return;
    await changeStatut.mutateAsync({ id: evaluation!.id, statut: nextStatut });
  }

  return (
    <div className="max-w-[1000px] mx-auto py-2">
      <Link
        to="/evaluations"
        className="inline-block text-sm text-slate-500 hover:text-slate-800 mb-4"
      >
        ← Évaluations
      </Link>

      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Pill tone={evalStatutTone(evaluation.statut)}>
              {evalStatutLabel(evaluation.statut)}
            </Pill>
            <span className="text-xs font-mono text-slate-400">#{evaluation.numero}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {evaluation.libelle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Session {evaluation.session} · Yaoundé{' '}
            {Utils.formatDateLongFr(evaluation.date_yaounde)} · Dschang{' '}
            {Utils.formatDateLongFr(evaluation.date_dschang)}
          </p>
        </div>
        {canEdit && (
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Modifier
          </Button>
        )}
      </header>

      {/* Workflow stepper */}
      <Card padding="md" className="mb-6">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
          Cycle de vie
        </p>
        <div className="flex flex-wrap gap-2">
          {EVALUATION_STATUTS_ORDER.map((s, i) => {
            const currentIdx = EVALUATION_STATUTS_ORDER.indexOf(evaluation.statut);
            const done = i <= currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    done
                      ? 'bg-lime-400/20 text-lime-800'
                      : 'bg-surface-muted text-slate-400'
                  }`}
                >
                  {evalStatutLabel(s)}
                </span>
                {i < EVALUATION_STATUTS_ORDER.length - 1 && (
                  <span className="text-slate-300 hidden sm:inline">→</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Saisie progress */}
      {!statsLoading && saisieStats && (
        <Card padding="md" className="mb-6">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Avancement saisie
          </p>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {saisieStats.notesSaisies} / {saisieStats.notesAttendues} notes
            {saisieStats.tauxPct != null && (
              <span className="text-base font-normal text-slate-500 ml-2">
                ({saisieStats.tauxPct}%)
              </span>
            )}
          </p>
          {saisieStats.parSousCentre.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {saisieStats.parSousCentre.map((sc) => (
                <li key={sc.sous_centre_id} className="flex justify-between gap-4">
                  <span>
                    {sc.code} · {sc.nom}
                  </span>
                  <span className="font-mono">
                    {sc.saisies}/{sc.attendues}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {canSaisie && (
          <Link to={`/evaluations/${evaluation.id}/saisie`}>
            <Button leftIcon={<Icon name="pencil" />}>Saisir les notes</Button>
          </Link>
        )}
        {canResultats && (
          <Link to={`/evaluations/${evaluation.id}/resultats`}>
            <Button variant="ghost" leftIcon={<Icon name="grid" />}>
              Voir les classements
            </Button>
          </Link>
        )}
        {isAdmin && nextStatut && evaluation.statut !== 'calcule' && (
          <Button
            loading={changeStatut.isPending}
            onClick={() => void advanceStatut()}
          >
            {nextStatut === 'composition' && 'Lancer la composition'}
            {nextStatut === 'saisie' && 'Ouvrir la saisie'}
            {nextStatut === 'publie' && 'Publier'}
            {nextStatut === 'archive' && 'Archiver'}
          </Button>
        )}
        {canReopenSaisie && (
          <Button
            variant="ghost"
            loading={changeStatut.isPending}
            onClick={() =>
              void changeStatut.mutateAsync({ id: evaluation.id, statut: 'saisie' })
            }
          >
            Rouvrir la saisie
          </Button>
        )}
        {canCalculer && (
          <Button
            loading={calculer.isPending}
            onClick={() => void calculer.mutateAsync(evaluation.id)}
          >
            {evaluation.statut === 'calcule' ? 'Recalculer' : 'Calculer les rangs'}
          </Button>
        )}
        {canPublish && (
          <Button variant="danger" onClick={() => setPublishOpen(true)}>
            Publier les résultats
          </Button>
        )}
      </div>

      {(changeStatut.error || calculer.error) && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {((changeStatut.error ?? calculer.error) as Error).message}
        </div>
      )}

      {editing && (
        <EvaluationFormModal
          open={editing}
          onClose={() => setEditing(false)}
          title="Modifier l'évaluation"
          submitLabel="Enregistrer"
          evaluation={evaluation}
          onSubmit={async (values) => {
            await update.mutateAsync({ id: evaluation.id, patch: values });
            setEditing(false);
          }}
        />
      )}

      {publishOpen && (
        <PublishModal
          evaluation={evaluation}
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          loading={changeStatut.isPending}
          onConfirm={async () => {
            await changeStatut.mutateAsync({
              id: evaluation.id,
              statut: 'publie',
              publie_par: admin?.id ?? null,
            });
            navigate(`/evaluations/${evaluation.id}`);
          }}
        />
      )}
    </div>
  );
}
