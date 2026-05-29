import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante de couleur */
  tone?: 'neutral' | 'danger';
  size?: 'sm' | 'md';
  /** Label accessible (required) */
  label: string;
  children: ReactNode;
}

const sizes = {
  sm: 'w-7 h-7 rounded-md',
  md: 'w-9 h-9 rounded-lg',
} as const;

const tones = {
  neutral: 'text-slate-500 hover:bg-surface-muted hover:text-slate-700',
  danger: 'text-slate-400 hover:bg-danger/10 hover:text-danger',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tone = 'neutral', size = 'md', label, children, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
