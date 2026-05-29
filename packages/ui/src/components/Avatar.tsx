import { useMemo } from 'react';
import { cn } from '../lib/cn';

export interface AvatarProps {
  name: string;
  src?: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Palette d'arrière-plans dérivée du hash du nom (toujours la même par personne)
const BG_PALETTE = [
  'bg-lime-400 text-slate-900',
  'bg-slate-700 text-white',
  'bg-info text-white',
  'bg-warning text-slate-900',
  'bg-success text-white',
  'bg-slate-500 text-white',
];

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps): JSX.Element {
  const bg = useMemo(
    () => BG_PALETTE[hashStr(name) % BG_PALETTE.length] ?? BG_PALETTE[0]!,
    [name],
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-surface-base',
          sizeStyles[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold tracking-tight',
        bg,
        sizeStyles[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
