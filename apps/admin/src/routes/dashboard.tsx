import { Card, KpiCard, Pill } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';
import { useDashboardStats } from '../hooks/useDashboardStats';

export function DashboardRoute(): JSX.Element {
  const { admin } = useAuth();
  const { data, isLoading, error } = useDashboardStats();

  return (
    <div className="max-w-7xl">
      {/* En-tête */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            Bonjour, {admin?.matricule} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Voici l&apos;état du système et de la dernière évaluation.
          </p>
        </div>
        {data?.derniereEvalStatut && (
          <Pill tone={evalStatutTone(data.derniereEvalStatut)}>
            Dernière éval · {evalStatutLabel(data.derniereEvalStatut)}
          </Pill>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          Impossible de charger les statistiques : {(error as Error).message}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Élèves inscrits"
          value={data?.totalEleves ?? 0}
          caption={`${data?.totalInscriptions ?? 0} inscriptions actives`}
          loading={isLoading}
          icon={iconUsers}
        />
        <KpiCard
          label="Évaluations en cours"
          value={data?.evaluationsEnCours ?? 0}
          caption="Brouillon, composition, saisie, calcul"
          loading={isLoading}
          icon={iconClipboard}
        />
        <KpiCard
          label="Évaluations publiées"
          value={data?.evaluationsPubliees ?? 0}
          caption="Visibles côté élève"
          loading={isLoading}
          icon={iconCheck}
        />
        <KpiCard
          tone="accent"
          label="Taux de saisie"
          value={data?.tauxSaisie != null ? `${data.tauxSaisie}%` : '—'}
          caption={
            data?.derniereEvalLibelle ?? 'Aucune évaluation pour le moment'
          }
          loading={isLoading}
          icon={iconBolt}
        />
      </div>

      {/* Bloc d'accueil — message Phase 1.1bis */}
      <Card tone="dark" padding="lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-900 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-lime-300 font-semibold uppercase tracking-wider mb-1">
              Phase 1.1bis · Auth opérationnelle
            </p>
            <h2 className="text-xl font-bold text-white mb-2">
              Tu es connecté en tant que {admin?.matricule}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Le token JWT est en place, le client Supabase l&apos;injecte automatiquement
              dans les appels. Les statistiques ci-dessus viennent de ton instance Cloud en
              temps réel. La prochaine étape : modules CRUD du référentiel (concours,
              matières, sous-centres).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function evalStatutLabel(statut: string): string {
  return (
    {
      brouillon: 'Brouillon',
      composition: 'En composition',
      saisie: 'Saisie en cours',
      calcule: 'Calculée',
      publie: 'Publiée',
      archive: 'Archivée',
    }[statut] ?? statut
  );
}

function evalStatutTone(
  statut: string,
): 'neutral' | 'lime' | 'success' | 'warning' | 'info' | 'danger' | 'dark' {
  switch (statut) {
    case 'publie':
      return 'success';
    case 'calcule':
      return 'info';
    case 'saisie':
      return 'warning';
    case 'archive':
      return 'neutral';
    default:
      return 'dark';
  }
}

const iconUsers = (
  <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  </span>
);
const iconClipboard = (
  <span className="w-9 h-9 rounded-xl bg-info/15 text-info flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </svg>
  </span>
);
const iconCheck = (
  <span className="w-9 h-9 rounded-xl bg-success/15 text-success flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);
const iconBolt = (
  <span className="w-9 h-9 rounded-xl bg-slate-900 text-lime-400 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  </span>
);
