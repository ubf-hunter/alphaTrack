import type { EvaluationStatut } from '@alphatrack/shared';

export function evalStatutLabel(statut: string): string {
  return (
    {
      brouillon: 'Brouillon',
      composition: 'En composition',
      saisie: 'Saisie en cours',
      calcule: 'Calculée',
      publie: 'Publiée',
      archive: 'Archivée',
    }[statut] ?? statut
  );
}

export function evalStatutTone(
  statut: string,
): 'neutral' | 'lime' | 'success' | 'warning' | 'info' | 'danger' | 'dark' {
  switch (statut as EvaluationStatut) {
    case 'publie':
      return 'success';
    case 'calcule':
      return 'info';
    case 'saisie':
      return 'warning';
    case 'archive':
      return 'neutral';
    default:
      return 'dark';
  }
}

/** Transitions avant en avant dans le workflow standard. */
export const NEXT_STATUT: Partial<Record<EvaluationStatut, EvaluationStatut>> = {
  brouillon: 'composition',
  composition: 'saisie',
  calcule: 'publie',
  publie: 'archive',
};

export const EVALUATION_STATUTS_ORDER: EvaluationStatut[] = [
  'brouillon',
  'composition',
  'saisie',
  'calcule',
  'publie',
  'archive',
];
