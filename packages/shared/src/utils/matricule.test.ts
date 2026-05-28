import { describe, expect, it } from 'vitest';
import {
  genererCodeAcces,
  genererMatriculeAdmin,
  genererMatriculeEleve,
} from './matricule';

describe('genererMatriculeEleve', () => {
  it('format AC-YY-NNNN', () => {
    expect(genererMatriculeEleve('2025-2026', 1)).toBe('AC-25-0001');
    expect(genererMatriculeEleve('2025-2026', 42)).toBe('AC-25-0042');
    expect(genererMatriculeEleve('2025-2026', 9999)).toBe('AC-25-9999');
  });
});

describe('genererMatriculeAdmin', () => {
  it('format ADM-NNN', () => {
    expect(genererMatriculeAdmin(1)).toBe('ADM-001');
    expect(genererMatriculeAdmin(101)).toBe('ADM-101');
  });
});

describe('genererCodeAcces', () => {
  it('6 chiffres entre 100000 et 999999', () => {
    for (let i = 0; i < 50; i++) {
      const c = genererCodeAcces();
      expect(c).toMatch(/^\d{6}$/);
      expect(parseInt(c, 10)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(c, 10)).toBeLessThanOrEqual(999999);
    }
  });
});
