import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** dark = sidebar/hero card (slate fond), light = standard, accent = lime fond */
  tone?: 'light' | 'dark' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const toneStyles = {
  light: 'bg-surface-base border border-surface-border text-slate-800',
  dark: 'bg-slate-900 text-white border border-slate-800',
  accent: 'bg-lime-400 text-slate-900 border border-lime-500',
} as const;

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone = 'light', padding = 'md', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl shadow-sm',
        toneStyles[tone],
        paddingStyles[padding],
        className,
      )}
      {...props}
    />
  );
});
