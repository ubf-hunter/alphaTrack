import * as Dialog from '@radix-ui/react-dialog';
import { type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  /** sm = 400px, md = 520px (défaut), lg = 720px, xl = 920px */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Footer fixe en bas (boutons annuler/confirmer typiquement) */
  footer?: ReactNode | undefined;
}

const sizeStyles = {
  sm: 'max-w-[400px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[920px]',
} as const;

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  footer,
}: ModalProps): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100vw-2rem)] bg-surface-base rounded-2xl shadow-lg',
            'flex flex-col max-h-[calc(100vh-2rem)]',
            sizeStyles[size],
          )}
        >
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-surface-border shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-bold tracking-tight text-slate-900 truncate">
                {title}
              </Dialog.Title>
              {/* Radix exige toujours une Description (a11y). Si pas fournie, on
                  reprend le titre en sr-only pour satisfaire le warning. */}
              <Dialog.Description
                className={description ? 'text-sm text-slate-500 mt-0.5' : 'sr-only'}
              >
                {description ?? title}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:bg-surface-muted hover:text-slate-700 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </header>

          <div className="overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <footer className="px-6 py-4 border-t border-surface-border bg-surface-muted/50 rounded-b-2xl shrink-0 flex items-center justify-end gap-2">
              {footer}
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
