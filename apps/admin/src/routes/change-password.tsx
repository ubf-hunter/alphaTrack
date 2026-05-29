import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Schemas } from '@alphatrack/shared';
import { Button, Card, Field, Input } from '@alphatrack/ui';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

type FormValues = Schemas.ChangePassword;

export function ChangePasswordRoute(): JSX.Element {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(Schemas.changePasswordSchema),
    mode: 'onBlur',
  });

  async function onSubmit(values: FormValues): Promise<void> {
    setServerError(null);
    if (!admin) return;

    const { data, error } = await supabase.rpc('change_admin_password', {
      p_admin_id: admin.id,
      p_ancien: values.ancien,
      p_nouveau: values.nouveau,
    });

    if (error) {
      setServerError(error.message);
      return;
    }
    if (data === false) {
      setServerError('Ancien mot de passe incorrect.');
      return;
    }

    logout();
    navigate('/login', {
      replace: true,
      state: { notice: 'Mot de passe mis à jour. Reconnecte-toi avec le nouveau.' },
    });
  }

  return (
    <main className="min-h-screen bg-surface-muted flex items-center justify-center p-6 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 bg-lime-300 rounded-full blur-3xl opacity-30 pointer-events-none"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-lime-400 text-xl font-bold">α</span>
          </div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">alphaTrack</p>
        </div>

        <Card padding="lg" className="shadow-lg">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-100 text-lime-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Première connexion
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              Définis ton mot de passe
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Min. 10 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
            </p>
          </div>

          <form
            onSubmit={(e: FormEvent) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field
              id="ancien"
              label="Mot de passe actuel"
              error={errors.ancien?.message}
              required
            >
              <Input
                id="ancien"
                type="password"
                autoComplete="current-password"
                {...register('ancien')}
                invalid={!!errors.ancien}
              />
            </Field>

            <Field
              id="nouveau"
              label="Nouveau mot de passe"
              error={errors.nouveau?.message}
              required
            >
              <Input
                id="nouveau"
                type="password"
                autoComplete="new-password"
                {...register('nouveau')}
                invalid={!!errors.nouveau}
              />
            </Field>

            <Field
              id="confirmation"
              label="Confirmation"
              error={errors.confirmation?.message}
              required
            >
              <Input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                {...register('confirmation')}
                invalid={!!errors.confirmation}
              />
            </Field>

            {serverError && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
              >
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              Mettre à jour →
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
