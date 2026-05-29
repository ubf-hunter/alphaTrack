import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar, cn, Input } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';

interface NavItem {
  to: string;
  label: string;
  icon: JSX.Element;
}

const NAV: ReadonlyArray<NavItem> = [
  {
    to: '/',
    label: 'Tableau de bord',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/evaluations',
    label: 'Évaluations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    to: '/eleves',
    label: 'Élèves',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: '/referentiel',
    label: 'Référentiel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
];

export function AdminLayout(): JSX.Element {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate('/login', { replace: true });
  }

  const fullName = admin ? `${admin.matricule}` : '';

  return (
    <div className="h-screen flex bg-surface-muted overflow-hidden">
      {/* Sidebar slate sombre avec coins arrondis — fixe (le layout est h-screen) */}
      <aside className="w-[76px] shrink-0 p-3 pr-0">
        <div className="h-full bg-slate-900 rounded-3xl flex flex-col items-center py-5 px-3 gap-2">
          {/* Logo */}
          <div className="w-11 h-11 rounded-2xl bg-lime-400 flex items-center justify-center text-slate-900 font-bold text-xl mb-4 shadow-glow-lime">
            α
          </div>

          {/* Nav principale */}
          <nav className="flex-1 flex flex-col gap-1 w-full">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-150 mx-auto',
                    'text-slate-400 hover:text-white hover:bg-slate-800',
                    isActive && 'bg-lime-400 text-slate-900 hover:bg-lime-300 hover:text-slate-900',
                  )
                }
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bouton logout en bas */}
          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span className="sr-only">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Zone principale — header reste fixe, seul main scroll */}
      <div className="flex-1 flex flex-col min-w-0 p-3 overflow-hidden">
        {/* Topbar — fixe en haut (shrink-0 pour ne pas être compressée) */}
        <header className="shrink-0 bg-surface-base rounded-2xl px-5 py-3 border border-surface-border flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Rechercher un élève, une évaluation, un sous-centre…"
              className="h-10 bg-surface-muted border-transparent"
              leftIcon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications icon */}
            <button
              type="button"
              className="w-10 h-10 rounded-xl border border-surface-border bg-surface-base text-slate-500 hover:bg-surface-muted hover:text-slate-700 flex items-center justify-center transition-colors"
              title="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 003.4 0" />
              </svg>
            </button>

            {/* Admin chip */}
            <div className="flex items-center gap-3 pl-3 border-l border-surface-border">
              {admin && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {admin.matricule}
                  </p>
                  <p className="text-xs text-slate-400 leading-tight">
                    {admin.role === 'admin' ? 'Super-administrateur' : 'Responsable saisie'}
                  </p>
                </div>
              )}
              <Avatar name={fullName} size="md" />
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto mt-3 px-2 sm:px-4 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
