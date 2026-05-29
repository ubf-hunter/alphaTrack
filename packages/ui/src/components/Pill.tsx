import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PillProps {
  children: ReactNode;
  tone?: 'neutral' | 'lime' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

const toneStyles = {
  neutral: 'bg-slate-100 text-slate-700',
  lime: 'bg-lime-100 text-lime-800',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  dark: 'bg-slate-900 text-white',
} as const;

const sizeStyles = {
  sm: 'h-5 px-2 text-[10px]',
  md: 'h-6 px-2.5 text-xs',
} as const;

export function Pill({
  children,
  tone = 'neutral',
  size = 'md',
  className,
}: PillProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wider rounded-full',
        toneStyles[tone],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
