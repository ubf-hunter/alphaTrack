import { forwardRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface FieldProps {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, label, hint, error, required, children, className },
  ref,
) {
  return (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-lime-600">
            *
          </span>
        )}
      </label>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-400 -mt-0.5">
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-danger mt-0.5 font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
});
