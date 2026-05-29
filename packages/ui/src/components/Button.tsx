import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-lime-400 text-slate-900 hover:bg-lime-300 active:bg-lime-500 ' +
    'disabled:bg-slate-200 disabled:text-slate-400 ' +
    'focus-visible:ring-4 focus-visible:ring-lime-400/30',
  secondary:
    'bg-surface-base text-slate-700 border border-surface-border hover:bg-surface-muted ' +
    'hover:border-slate-300 active:bg-surface-subtle ' +
    'disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-slate-200',
  ghost:
    'bg-transparent text-slate-600 hover:bg-surface-muted hover:text-slate-800 ' +
    'active:bg-surface-subtle disabled:opacity-50 ' +
    'focus-visible:ring-2 focus-visible:ring-slate-300',
  danger:
    'bg-danger text-white hover:bg-[#dc2626] active:bg-[#b91c1c] ' +
    'disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-red-400/30',
  dark:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 ' +
    'disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-slate-400/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold tracking-tight',
        'transition-all duration-150 outline-none select-none',
        'disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
});
