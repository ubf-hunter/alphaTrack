export const EVALUATION_STATUTS = [
  'brouillon',
  'composition',
  'saisie',
  'calcule',
  'publie',
  'archive',
] as const;
export type EvaluationStatut = (typeof EVALUATION_STATUTS)[number];

export const ADMIN_ROLES = ['admin', 'saisie'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const STATUT_PAIEMENT = ['paye', 'partiel', 'non_paye'] as const;
export type StatutPaiement = (typeof STATUT_PAIEMENT)[number];

export const SEXE = ['M', 'F'] as const;
export type Sexe = (typeof SEXE)[number];

export const NOTE_MIN = 0;
export const NOTE_MAX = 20;

export const PASSWORD_POLICY = {
  minLength: 10,
  requireUpperCase: true,
  requireDigit: true,
  requireSpecial: true,
} as const;

export const ACCES_CODE_LENGTH = 6;

export const LOCKOUT = {
  maxAttempts: 5,
  windowMinutes: 15,
} as const;

export const JWT_TTL_HOURS = 8;
