import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Si true, utilise la fonte mono (matricules, codes, IDs) */
  mono?: boolean;
  /** Icône à gauche du champ (lucide ou SVG inline) */
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, mono = false, leftIcon, className, ...props },
  ref,
) {
  const inputClass = cn(
    'w-full h-11 px-4 rounded-xl bg-surface-base text-slate-800',
    'border transition-all duration-150 outline-none text-sm',
    'placeholder:text-slate-400',
    'disabled:bg-surface-muted disabled:text-slate-400 disabled:cursor-not-allowed',
    invalid
      ? 'border-danger focus:border-danger focus:ring-4 focus:ring-red-100'
      : 'border-surface-border focus:border-slate-400 focus:ring-4 focus:ring-slate-100',
    mono && 'font-mono tracking-wide',
    'tabular',
    leftIcon && 'pl-11',
    className,
  );

  if (leftIcon) {
    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {leftIcon}
        </span>
        <input ref={ref} className={inputClass} {...props} />
      </div>
    );
  }

  return <input ref={ref} className={inputClass} {...props} />;
});
