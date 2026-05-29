import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

/**
 * Système d'icônes maison léger : tracés SVG stroke 2, line round.
 * Pas de dépendance Lucide pour garder le bundle compact.
 */

export type IconName =
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'check'
  | 'x'
  | 'search'
  | 'chevron-right'
  | 'chevron-down'
  | 'bell'
  | 'log-out'
  | 'users'
  | 'school'
  | 'book'
  | 'grid'
  | 'pin'
  | 'lock'
  | 'circle'
  | 'circle-check';

const PATHS: Record<IconName, JSX.Element> = {
  plus: <path d="M12 5v14M5 12h14" />,
  pencil: (
    <>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
      <path d="m15 5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  'chevron-right': <polyline points="9 18 15 12 9 6" />,
  'chevron-down': <polyline points="6 9 12 15 18 9" />,
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  'log-out': (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  school: (
    <>
      <path d="M14 22v-4a2 2 0 0 0-4 0v4" />
      <path d="M18 10v12M6 10v12" />
      <path d="m12 2 8 5-8 5-8-5 8-5z" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13z" />
      <circle cx="12" cy="9" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="9" />,
  'circle-check': (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
};

export interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  name: IconName;
  /** Taille en px ou classe Tailwind par défaut w-4 h-4 */
  size?: number;
}

export function Icon({ name, size, className, ...props }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={cn(!size && 'w-4 h-4', className)}
      aria-hidden
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
