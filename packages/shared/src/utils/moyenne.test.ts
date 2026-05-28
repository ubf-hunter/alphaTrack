import { describe, expect, it } from 'vitest';
import { calculerMoyenne, formatMoyenne, isNonClasse, noteEstValide } from './moyenne';

describe('calculerMoyenne', () => {
  it('moyenne pondérée simple', () => {
    const notes = [
      { note: 14, coefficient: 5 },
      { note: 12, coefficient: 5 },
      { note: 10, coefficient: 3 },
    ];
    const expected = (14 * 5 + 12 * 5 + 10 * 3) / (5 + 5 + 3);
    expect(calculerMoyenne(notes)).toBeCloseTo(expected, 6);
  });

  it('un absent compte 0 dans la moyenne (RG5 partiel)', () => {
    const notes = [
      { note: 14, coefficient: 5 },
      { note: 0, coefficient: 5, absent: true },
    ];
    expect(calculerMoyenne(notes)).toBeCloseTo((14 * 5 + 0) / 10, 6);
  });

  it('retourne null si tableau vide', () => {
    expect(calculerMoyenne([])).toBeNull();
  });

  it('retourne null si somme des coefs vaut 0', () => {
    expect(calculerMoyenne([{ note: 10, coefficient: 0 }])).toBeNull();
  });
});

describe('isNonClasse', () => {
  it('vide = non classé', () => {
    expect(isNonClasse([])).toBe(true);
  });

  it('tout en absent = non classé (RG5 total)', () => {
    expect(
      isNonClasse([
        { note: 0, coefficient: 5, absent: true },
        { note: 0, coefficient: 5, absent: true },
      ]),
    ).toBe(true);
  });

  it('au moins une note présente = classé', () => {
    expect(
      isNonClasse([
        { note: 12, coefficient: 5 },
        { note: 0, coefficient: 5, absent: true },
      ]),
    ).toBe(false);
  });
});

describe('formatMoyenne', () => {
  it('formate avec virgule française et /20', () => {
    expect(formatMoyenne(14.567)).toBe('14,57 / 20');
  });
  it('— pour null', () => {
    expect(formatMoyenne(null)).toBe('—');
  });
});

describe('noteEstValide', () => {
  it.each([0, 10, 20, 14.5])('%s est valide', (n) => {
    expect(noteEstValide(n)).toBe(true);
  });
  it.each([-1, 20.01, 21, 100])('%s est invalide', (n) => {
    expect(noteEstValide(n)).toBe(false);
  });
});
