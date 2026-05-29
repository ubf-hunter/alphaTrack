import { forwardRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface FieldProps {
  /** Identifiant unique du champ — sert à brancher le label sur l'input */
  id: string;
  label: string;
  /** Texte d'aide affiché en italique sous le label */
  hint?: string | undefined;
  /** Message d'erreur — affiché en rouge brique sous le champ */
  error?: string | undefined;
  /** Marque le champ comme requis (astérisque laurel à côté du label) */
  required?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, label, hint, error, required, children, className },
  ref,
) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.12em] text-ink-600"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-laurel-700">
            *
          </span>
        )}
      </label>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs italic text-ink-400 -mt-0.5">
          {hint}
        </p>
      )}

      <div
        data-described-by={describedBy}
        data-invalid={error ? 'true' : undefined}
        className="contents"
      >
        {children}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-rouge-brique mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  );
});
