import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface chaude (paper-soft) vs blanche (paper-base, défaut) */
  tone?: 'base' | 'soft';
  /** Padding intérieur — none/sm/md/lg */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone = 'base', padding = 'md', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-paper-edge shadow-sm',
        tone === 'soft' ? 'bg-paper-soft' : 'bg-paper-base',
        paddingStyles[padding],
        className,
      )}
      {...props}
    />
  );
});
