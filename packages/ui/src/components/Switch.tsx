import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md';
}

const trackSizes = {
  sm: 'w-9 h-5 after:w-3.5 after:h-3.5 after:top-[3px] after:left-[3px] peer-checked:after:translate-x-4',
  md: 'w-11 h-6 after:w-4 after:h-4 after:top-1 after:left-1 peer-checked:after:translate-x-5',
} as const;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size = 'md', className, ...props },
  ref,
) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          'relative bg-slate-200 rounded-full transition-colors duration-200',
          'peer-checked:bg-lime-400 peer-focus:ring-4 peer-focus:ring-lime-400/30',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          // Pastille blanche qui glisse
          'after:content-[""] after:absolute after:bg-white after:rounded-full',
          'after:transition-transform after:duration-200 after:shadow-sm',
          trackSizes[size],
        )}
      />
    </label>
  );
});
