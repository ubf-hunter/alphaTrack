import { Card, KpiCard, Pill } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';
import { useDashboardStats } from '../hooks/useDashboardStats';

export function DashboardRoute(): JSX.Element {
  const { admin } = useAuth();
  const { data, isLoading, error } = useDashboardStats();

  return (
    <div className="max-w-[1400px] mx-auto py-2">
      {/* En-tête */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1 truncate">
            Bonjour, {admin?.matricule} <span aria-hidden>👋</span>
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
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm">
          Impossible de charger les statistiques :{' '}
          <span className="font-mono">{(error as Error).message}</span>
        </div>
      )}

      {data && Object.keys(data.errors).length > 0 && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-warning/10 border border-warning/30 text-warning text-sm">
          <p className="font-semibold mb-1">Diagnostic — certaines requêtes ont échoué :</p>
          <ul className="font-mono text-xs space-y-0.5">
            {Object.entries(data.errors).map(([table, msg]) => (
              <li key={table}>
                · <span className="font-semibold">{table}</span> : {msg}
              </li>
            ))}
          </ul>
          <p className="text-xs mt-2 text-warning/80">
            Détails complets dans la console du navigateur (F12).
          </p>
        </div>
      )}

      {/* KPI grid responsive : 1 col mobile · 2 cols sm · 4 cols xl */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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
          caption={data?.derniereEvalLibelle ?? 'Aucune évaluation pour le moment'}
          loading={isLoading}
          icon={iconBolt}
        />
      </section>

      {/* Bloc d'accueil — message Phase 1.1bis */}
      <Card tone="dark" padding="lg" className="overflow-hidden relative">
        {/* Halo lime décoratif */}
        <div
          aria-hidden
          className="absolute -bottom-16 -right-16 w-64 h-64 bg-lime-400 rounded-full blur-3xl opacity-20 pointer-events-none"
        />

        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-900 shrink-0 shadow-glow-lime">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-lime-300 font-semibold uppercase tracking-wider mb-1.5">
              Phase 1.1bis · Auth opérationnelle
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
              Tu es connecté en tant que{' '}
              <span className="font-mono text-lime-300">{admin?.matricule}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Le token JWT est en place, le client Supabase l&apos;injecte
              automatiquement dans les appels. Les statistiques ci-dessus viennent de
              ton instance Cloud en temps réel. Prochaine étape : modules CRUD du
              référentiel (concours, matières, sous-centres).
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
  <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  </span>
);
const iconClipboard = (
  <span className="w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    </svg>
  </span>
);
const iconCheck = (
  <span className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);
const iconBolt = (
  <span className="w-10 h-10 rounded-xl bg-slate-900 text-lime-400 flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-[18px] h-[18px]">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  </span>
);
