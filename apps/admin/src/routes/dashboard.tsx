import { Card } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';

export function DashboardRoute(): JSX.Element {
  const { admin } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-400 mb-2">
        Tableau de bord
      </p>
      <h1 className="display text-4xl text-ink-800 mb-1">
        Bonjour, {admin?.matricule}
      </h1>
      <p className="text-ink-500 mb-10 max-w-2xl">
        Vue d&apos;ensemble du système. Les KPI temps réel arriveront dans la prochaine
        itération avec la création d&apos;une évaluation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">Élèves inscrits</p>
          <p className="display text-4xl tabular text-ink-700">—</p>
          <p className="text-xs text-ink-300 mt-1">Session 2025-2026</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">Évaluations en cours</p>
          <p className="display text-4xl tabular text-ink-700">—</p>
          <p className="text-xs text-ink-300 mt-1">Brouillon · Saisie · Calculé</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">Taux de saisie</p>
          <p className="display text-4xl tabular text-ink-700">—</p>
          <p className="text-xs text-ink-300 mt-1">Sur la dernière évaluation</p>
        </Card>
      </div>

      <Card tone="soft" className="mt-10">
        <p className="text-xs uppercase tracking-wider text-laurel-700 mb-2">Phase 1.1</p>
        <h2 className="display text-2xl text-ink-700 mb-2">Auth opérationnelle</h2>
        <p className="text-sm text-ink-500 leading-relaxed max-w-2xl">
          Tu es connecté en tant que <strong>{admin?.matricule}</strong> (
          {admin?.role === 'admin' ? 'super-administrateur' : 'responsable saisie'}). Le
          token JWT est en place, le client Supabase l&apos;injecte automatiquement dans les
          appels. La prochaine étape : modules CRUD du référentiel (concours, matières,
          sous-centres).
        </p>
      </Card>
    </div>
  );
}
