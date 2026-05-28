import { NOTE_MAX, NOTE_MIN } from '../constants';

export interface NoteCoef {
  readonly note: number;
  readonly coefficient: number;
  readonly absent?: boolean;
}

export function calculerMoyenne(notes: ReadonlyArray<NoteCoef>): number | null {
  if (notes.length === 0) return null;

  const notesPriseEnCompte = notes.filter((n) => !n.absent || n.note !== undefined);
  if (notesPriseEnCompte.length === 0) return null;

  const sommeCoefs = notesPriseEnCompte.reduce((s, n) => s + n.coefficient, 0);
  if (sommeCoefs === 0) return null;

  const sommePondere = notesPriseEnCompte.reduce(
    (s, n) => s + (n.absent ? 0 : n.note) * n.coefficient,
    0,
  );
  return sommePondere / sommeCoefs;
}

export function isNonClasse(notes: ReadonlyArray<NoteCoef>): boolean {
  return notes.length === 0 || notes.every((n) => n.absent === true);
}

export function formatMoyenne(moyenne: number | null): string {
  if (moyenne === null) return '—';
  return moyenne.toFixed(2).replace('.', ',') + ' / 20';
}

export function noteEstValide(n: number): boolean {
  return n >= NOTE_MIN && n <= NOTE_MAX;
}
