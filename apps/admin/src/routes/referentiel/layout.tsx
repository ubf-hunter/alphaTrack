import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@alphatrack/ui';

interface Tab {
  to: string;
  label: string;
}

const TABS: ReadonlyArray<Tab> = [
  { to: '/referentiel/concours', label: 'Concours' },
  { to: '/referentiel/matieres', label: 'Matières' },
  { to: '/referentiel/coefficients', label: 'Coefficients' },
  { to: '/referentiel/sous-centres', label: 'Sous-centres' },
];

export function ReferentielLayout(): JSX.Element {
  return (
    <div className="max-w-[1400px] mx-auto py-2">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Configuration
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Référentiel
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Concours, matières et leurs coefficients. Sous-centres et régions de
          composition. Ces données sont la fondation du système — toute évaluation s&apos;y rattache.
        </p>
      </header>

      {/* Sous-navigation — pills horizontales */}
      <nav className="flex flex-wrap gap-1 mb-6 p-1 bg-surface-base border border-surface-border rounded-2xl w-fit shadow-sm">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-surface-muted',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
