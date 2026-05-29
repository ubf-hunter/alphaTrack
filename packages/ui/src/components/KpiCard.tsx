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
  light:
    'bg-surface-base border border-surface-border text-slate-900 shadow-sm hover:shadow-md transition-shadow',
  dark:
    'bg-slate-900 text-white border border-slate-800 shadow-md',
  accent:
    'bg-lime-400 text-slate-900 border border-lime-500 shadow-md',
} as const;

const labelTone = {
  light: 'text-slate-500',
  dark: 'text-slate-300',
  accent: 'text-slate-700',
} as const;

const captionTone = {
  light: 'text-slate-400',
  dark: 'text-slate-400',
  accent: 'text-slate-700/80',
} as const;

const skeletonTone = {
  light: 'bg-slate-200',
  dark: 'bg-slate-700',
  accent: 'bg-lime-500/40',
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
        'rounded-2xl p-6 flex flex-col gap-4 min-h-[148px]',
        toneStyles[tone],
        className,
      )}
    >
      {/* Header : label + icon */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.08em] leading-tight',
            labelTone[tone],
          )}
        >
          {label}
        </span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>

      {/* Valeur principale + delta */}
      <div className="flex-1 flex items-end gap-2 flex-wrap">
        {loading ? (
          <span
            className={cn(
              'inline-block h-10 w-24 rounded-lg animate-pulse',
              skeletonTone[tone],
            )}
          />
        ) : (
          <span className="text-4xl font-bold tracking-tight tabular leading-none">
            {value}
          </span>
        )}
        {delta && !loading && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-md leading-none',
              delta.positive
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger',
            )}
          >
            {delta.value}
          </span>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className={cn('text-xs leading-relaxed', captionTone[tone])}>
          {caption}
        </p>
      )}
    </div>
  );
}
