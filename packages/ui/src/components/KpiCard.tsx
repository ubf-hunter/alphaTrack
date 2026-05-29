import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Indicateur de delta (vs période précédente). +12% / -3 / etc. */
  delta?: { value: string; positive?: boolean } | undefined;
  /** Sous-titre ou description courte sous la value */
  caption?: string | undefined;
  /** Icône colorée en haut à droite */
  icon?: ReactNode | undefined;
  /** Si true, affiche un skeleton (loading) */
  loading?: boolean;
  /** accent = card lime, dark = card slate, light = card blanche */
  tone?: 'light' | 'dark' | 'accent';
  className?: string;
}

const toneStyles = {
  light: 'bg-surface-base border border-surface-border text-slate-800',
  dark: 'bg-slate-900 text-white border border-slate-800',
  accent: 'bg-lime-400 text-slate-900 border border-lime-500',
} as const;

const labelTone = {
  light: 'text-slate-500',
  dark: 'text-slate-300',
  accent: 'text-slate-700',
} as const;

const captionTone = {
  light: 'text-slate-400',
  dark: 'text-slate-400',
  accent: 'text-slate-700',
} as const;

export function KpiCard({
  label,
  value,
  delta,
  caption,
  icon,
  loading = false,
  tone = 'light',
  className,
}: KpiCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 shadow-sm flex flex-col gap-3',
        toneStyles[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('text-xs font-medium uppercase tracking-wider', labelTone[tone])}>
          {label}
        </span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        {loading ? (
          <span className="inline-block h-9 w-20 rounded-md bg-slate-200/60 animate-pulse" />
        ) : (
          <span className="text-3xl font-bold tracking-tight tabular">{value}</span>
        )}
        {delta && !loading && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded-md',
              delta.positive
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger',
            )}
          >
            {delta.value}
          </span>
        )}
      </div>

      {caption && (
        <p className={cn('text-xs', captionTone[tone])}>{caption}</p>
      )}
    </div>
  );
}
