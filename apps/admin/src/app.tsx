import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { readEnv } from './lib/env';
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequirePasswordChanged,
} from './routes/guards';
import { LoginRoute } from './routes/login';
import { AdminLayout } from './routes/layout';
import { DashboardRoute } from './routes/dashboard';
import { ChangePasswordRoute } from './routes/change-password';
import { ReferentielLayout } from './routes/referentiel/layout';
import { ConcoursRoute } from './routes/referentiel/concours';
import { MatieresRoute } from './routes/referentiel/matieres';
import { CoefficientsRoute } from './routes/referentiel/coefficients';
import { SousCentresRoute } from './routes/referentiel/sous-centres';
import { ElevesListRoute } from './routes/eleves/list';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App(): JSX.Element {
  const envCheck = readEnv();
  if (!envCheck.ok) {
    return <ConfigError missing={envCheck.missing} />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginRoute />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/changer-mot-de-passe"
              element={
                <RequireAuth>
                  <ChangePasswordRoute />
                </RequireAuth>
              }
            />
            <Route
              element={
                <RequireAuth>
                  <RequirePasswordChanged>
                    <AdminLayout />
                  </RequirePasswordChanged>
                </RequireAuth>
              }
            >
              <Route index element={<DashboardRoute />} />
              <Route path="evaluations" element={<PlaceholderRoute title="Évaluations" />} />
              <Route path="eleves" element={<ElevesListRoute />} />
              <Route path="referentiel" element={<ReferentielLayout />}>
                <Route index element={<Navigate to="concours" replace />} />
                <Route path="concours" element={<ConcoursRoute />} />
                <Route path="matieres" element={<MatieresRoute />} />
                <Route path="coefficients" element={<CoefficientsRoute />} />
                <Route path="sous-centres" element={<SousCentresRoute />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function PlaceholderRoute({ title }: { title: string }): JSX.Element {
  return (
    <div className="max-w-4xl">
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
        {title}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">À venir</h1>
      <p className="text-slate-500">
        Module en construction. Sera livré dans la prochaine itération de la Phase 1.
      </p>
    </div>
  );
}

function ConfigError({ missing }: { missing: ReadonlyArray<string> }): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-muted p-6">
      <div className="max-w-lg w-full">
        <p className="text-xs uppercase tracking-wider text-danger mb-2 font-semibold">
          Configuration manquante
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
          Variables d&apos;environnement absentes
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          Le client Supabase n&apos;a pas pu être initialisé. Les variables suivantes sont
          requises dans <code className="font-mono text-slate-700">.env</code> à la racine
          du monorepo :
        </p>
        <ul className="font-mono text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-6">
          {missing.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 leading-relaxed">
          Après avoir corrigé le <code className="font-mono">.env</code>, arrête et relance{' '}
          <code className="font-mono">pnpm dev:admin</code> (Vite ne recharge pas les
          variables d&apos;env à chaud).
        </p>
      </div>
    </main>
  );
}
