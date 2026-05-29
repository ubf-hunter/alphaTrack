import { forwardRef, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/**
 * Primitives de tableau stylées Tailwind v4 — pas de bibliothèque tierce.
 * Pour les usages simples (référentiel). Pour les listes longues triables on
 * basculera sur TanStack Table en module élèves.
 */

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  function Table({ className, ...props }, ref) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-base overflow-hidden">
        <table
          ref={ref}
          className={cn('w-full text-sm border-collapse', className)}
          {...props}
        />
      </div>
    );
  },
);

export const Thead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function Thead({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={cn('bg-surface-muted border-b border-surface-border', className)}
        {...props}
      />
    );
  },
);

export const Tbody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function Tbody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn('divide-y divide-surface-border', className)}
        {...props}
      />
    );
  },
);

export const Tr = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function Tr({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={cn('hover:bg-surface-muted/40 transition-colors', className)}
        {...props}
      />
    );
  },
);

export const Th = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function Th({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={cn(
          'text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Td = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function Td({ className, ...props }, ref) {
    return (
      <td
        ref={ref}
        className={cn('px-4 py-3 text-slate-700 align-middle', className)}
        {...props}
      />
    );
  },
);

export interface EmptyRowProps {
  colSpan: number;
  message?: string;
}

export function EmptyRow({ colSpan, message = 'Aucun élément' }: EmptyRowProps): JSX.Element {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}

export interface LoadingRowProps {
  colSpan: number;
  rows?: number;
}

export function LoadingRow({ colSpan, rows = 3 }: LoadingRowProps): JSX.Element {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={colSpan} className="px-4 py-4">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}
