import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'seal';
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
    'bg-ink-700 text-paper-base hover:bg-ink-800 active:bg-ink-900 ' +
    'disabled:bg-ink-300 disabled:text-paper-soft ' +
    'focus-visible:ring-2 focus-visible:ring-laurel-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-base',
  secondary:
    'bg-paper-soft text-ink-700 border border-paper-edge hover:bg-paper-edge hover:border-ink-300 ' +
    'active:bg-ink-50 disabled:opacity-60 ' +
    'focus-visible:ring-2 focus-visible:ring-ink-400 focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-800 ' +
    'active:bg-ink-100 disabled:opacity-50 ' +
    'focus-visible:ring-2 focus-visible:ring-ink-300',
  danger:
    'bg-rouge-brique text-paper-base hover:bg-[#8a2622] active:bg-[#6f1f1c] ' +
    'disabled:opacity-60 ' +
    'focus-visible:ring-2 focus-visible:ring-rouge-brique focus-visible:ring-offset-2',
  seal:
    'bg-laurel-500 text-ink-900 border border-laurel-700 hover:bg-laurel-300 ' +
    'active:bg-laurel-700 active:text-paper-base disabled:opacity-50 ' +
    'focus-visible:ring-2 focus-visible:ring-laurel-700 focus-visible:ring-offset-2 ' +
    'shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
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
        'inline-flex items-center justify-center font-medium rounded-md',
        'transition-colors duration-150 outline-none select-none',
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
