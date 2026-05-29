import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Field, Input } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';
import type { AuthError } from '../lib/auth-api';

interface LocationState {
  from?: string;
}

export function LoginRoute(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(matricule.trim().toUpperCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.message ?? 'Erreur de connexion');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-muted flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grille subtile en fond — pattern tech */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(216 220 229) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Halo lime en haut à droite */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 bg-lime-300 rounded-full blur-3xl opacity-30 pointer-events-none"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + branding */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-lime-400 text-xl font-bold">α</span>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              alphaTrack
            </p>
            <p className="text-xs text-slate-400 leading-tight">Back-office</p>
          </div>
        </div>

        <Card padding="lg" className="shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              Bon retour 👋
            </h1>
            <p className="text-sm text-slate-500">
              Connecte-toi avec ton matricule et ton mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Field id="matricule" label="Matricule" hint="Format : ADM-001" required>
              <Input
                id="matricule"
                name="matricule"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="ADM-001"
                autoComplete="username"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
                disabled={pending}
                mono
                required
              />
            </Field>

            <Field id="password" label="Mot de passe" required>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                disabled={pending}
                required
              />
            </Field>

            {error && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={pending}
              disabled={!matricule || !password}
              className="mt-2"
            >
              Se connecter →
            </Button>
          </form>
        </Card>

        <p className="text-xs text-slate-400 mt-6 text-center">
          En cas d&apos;oubli du mot de passe, contacte le super-administrateur.
        </p>
      </div>
    </main>
  );
}
