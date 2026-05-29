import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Field, Input } from '@alphatrack/ui';
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
    <main className="min-h-screen bg-paper-base grid lg:grid-cols-12">
      {/* Colonne gauche : hero éditorial — 7/12 sur desktop, plein écran sur mobile */}
      <section className="lg:col-span-7 bg-ink-900 text-paper-base relative overflow-hidden flex flex-col p-8 lg:p-16">
        {/* Texture grain papier (SVG noise inline) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <p className="text-xs uppercase tracking-[0.3em] text-laurel-300 mb-2">
            Alpha Center · Back-office
          </p>

          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            <h1
              className="display text-5xl lg:text-7xl leading-[0.95] tracking-tight"
              style={{ fontStyle: 'italic', fontWeight: 400 }}
            >
              alpha<span className="text-laurel-500">Track</span>
            </h1>
            <p className="display text-2xl lg:text-3xl mt-6 text-ink-200 leading-snug max-w-xl">
              Le système qui transforme l&apos;exigence des concours en clarté pour chaque élève.
            </p>
          </div>

          <footer className="text-xs uppercase tracking-[0.2em] text-ink-300 mt-8">
            Yaoundé · Dschang &nbsp;—&nbsp; Préparation d&apos;élite
          </footer>
        </div>
      </section>

      {/* Colonne droite : formulaire — 5/12 sur desktop */}
      <section className="lg:col-span-5 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-400 mb-3">Connexion</p>
          <h2 className="display text-3xl text-ink-800 mb-1">Espace administrateur</h2>
          <p className="text-sm text-ink-500 leading-relaxed mb-8">
            Connecte-toi avec ton matricule personnel et ton mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Field
              id="matricule"
              label="Matricule"
              hint="Format : ADM-001"
              required
            >
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
                className="px-3 py-2 rounded-md bg-rouge-brique/10 border border-rouge-brique/30 text-rouge-brique text-sm"
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
              Se connecter
            </Button>
          </form>

          <p className="text-xs text-ink-300 mt-8 text-center">
            En cas d&apos;oubli du mot de passe, contacte le super-administrateur.
          </p>
        </div>
      </section>
    </main>
  );
}
