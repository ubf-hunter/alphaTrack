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

    // Mot de passe changé → on déconnecte pour forcer une nouvelle session propre.
    logout();
    navigate('/login', {
      replace: true,
      state: { notice: 'Mot de passe mis à jour. Reconnecte-toi avec le nouveau.' },
    });
  }

  return (
    <main className="min-h-screen bg-paper-base flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.2em] text-laurel-700 mb-2">
          Première connexion
        </p>
        <h1 className="display text-3xl text-ink-800 mb-1">Définis ton mot de passe</h1>
        <p className="text-sm text-ink-500 leading-relaxed mb-8">
          Le mot de passe initial doit être remplacé. Choisis-en un d&apos;au moins 10
          caractères, avec une majuscule, un chiffre et un caractère spécial.
        </p>

        <Card>
          <form
            onSubmit={(e: FormEvent) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col gap-5"
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
              hint="Min. 10 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial"
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
                className="px-3 py-2 rounded-md bg-rouge-brique/10 border border-rouge-brique/30 text-rouge-brique text-sm"
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Mettre à jour
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
