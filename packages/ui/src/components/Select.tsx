import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  options: ReadonlyArray<SelectOption>;
  invalid?: boolean;
  /** Texte affiché quand value est vide */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, invalid = false, placeholder, className, value, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        value={value ?? ''}
        className={cn(
          'w-full h-11 pl-4 pr-9 rounded-xl bg-surface-base text-slate-800 text-sm',
          'border transition-all duration-150 outline-none appearance-none',
          'disabled:bg-surface-muted disabled:text-slate-400 disabled:cursor-not-allowed',
          invalid
            ? 'border-danger focus:border-danger focus:ring-4 focus:ring-red-100'
            : 'border-surface-border focus:border-slate-400 focus:ring-4 focus:ring-slate-100',
          !value && 'text-slate-400',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron — caché à l'option native via appearance-none */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        aria-hidden
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
});
