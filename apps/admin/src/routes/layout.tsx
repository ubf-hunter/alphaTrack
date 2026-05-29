import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button, cn } from '@alphatrack/ui';
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    to: '/evaluations',
    label: 'Évaluations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </svg>
    ),
  },
  {
    to: '/eleves',
    label: 'Élèves',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    to: '/referentiel',
    label: 'Référentiel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M4 4h16v6H4zM4 14h16v6H4z" />
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

  return (
    <div className="min-h-screen flex bg-paper-base">
      {/* Sidebar verticale 72px — pure icônes, label au tooltip natif */}
      <aside className="w-[72px] shrink-0 bg-ink-900 text-paper-base flex flex-col items-center py-5 gap-2">
        <div className="w-10 h-10 rounded-md bg-laurel-500 flex items-center justify-center text-ink-900 font-display font-bold text-lg mb-3">
          α
        </div>

        <nav className="flex-1 flex flex-col gap-1 w-full px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center h-10 rounded-md transition-colors',
                  'text-ink-200 hover:text-paper-base hover:bg-ink-700',
                  isActive && 'bg-ink-700 text-laurel-300',
                )
              }
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          title="Se déconnecter"
          className="w-10 h-10 rounded-md flex items-center justify-center text-ink-300 hover:text-paper-base hover:bg-ink-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
            <path d="M10 17l-5-5 5-5M5 12h12" />
          </svg>
          <span className="sr-only">Se déconnecter</span>
        </button>
      </aside>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 px-6 border-b border-paper-edge flex items-center justify-between bg-paper-base">
          <div className="text-xs text-ink-400 uppercase tracking-[0.18em]">
            Session active
          </div>
          <div className="flex items-center gap-3">
            {admin && (
              <div className="text-right">
                <p className="text-sm font-medium text-ink-700 leading-tight">
                  {admin.matricule}
                </p>
                <p className="text-xs text-ink-400 uppercase tracking-wider leading-tight">
                  {admin.role === 'admin' ? 'Super-administrateur' : 'Responsable saisie'}
                </p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
