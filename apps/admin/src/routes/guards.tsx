import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

/** Bloque l'accès si non authentifié → redirige vers /login. */
export function RequireAuth({ children }: { children: ReactNode }): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Force le passage par /changer-mot-de-passe au premier login. */
export function RequirePasswordChanged({ children }: { children: ReactNode }): JSX.Element {
  const { admin } = useAuth();
  const location = useLocation();

  if (admin?.must_change_password && location.pathname !== '/changer-mot-de-passe') {
    return <Navigate to="/changer-mot-de-passe" replace />;
  }
  return <>{children}</>;
}

/** Bloque l'accès si déjà authentifié (ex. /login quand connecté). */
export function RedirectIfAuthenticated({
  children,
  to = '/',
}: {
  children: ReactNode;
  to?: string;
}): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to={to} replace />;
  return <>{children}</>;
}

function FullPageLoader(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="inline-block w-6 h-6 border-2 border-ink-400 border-r-transparent rounded-full animate-spin" />
    </div>
  );
}
