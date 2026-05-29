import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** État d'erreur — applique le style invalide (bord rouge brique) */
  invalid?: boolean;
  /** Si true, utilise la fonte mono (matricules, codes, IDs) */
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, mono = false, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-md bg-paper-base text-ink-800',
        'border transition-colors duration-150 outline-none',
        'placeholder:text-ink-300',
        'disabled:bg-paper-soft disabled:text-ink-400 disabled:cursor-not-allowed',
        invalid
          ? 'border-rouge-brique focus:border-rouge-brique focus:ring-2 focus:ring-rouge-brique/20'
          : 'border-paper-edge focus:border-ink-500 focus:ring-2 focus:ring-ink-300/30',
        mono && 'font-mono tracking-wide',
        'tabular',
        className,
      )}
      {...props}
    />
  );
});
