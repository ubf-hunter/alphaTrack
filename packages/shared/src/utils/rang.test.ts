import { describe, expect, it } from 'vitest';
import { formatRang, formatRangAvecEffectif } from './rang';

describe('formatRang', () => {
  it('retourne 1ᵉʳ pour le rang 1 masculin', () => {
    expect(formatRang(1, 'M')).toBe('1ᵉʳ');
  });

  it('retourne 1ʳᵉ pour le rang 1 féminin', () => {
    expect(formatRang(1, 'F')).toBe('1ʳᵉ');
  });

  it('retourne 1ᵉʳ par défaut pour le rang 1 sans sexe précisé', () => {
    expect(formatRang(1)).toBe('1ᵉʳ');
  });

  it('retourne Nᵉ pour les rangs > 1', () => {
    expect(formatRang(2)).toBe('2ᵉ');
    expect(formatRang(5)).toBe('5ᵉ');
    expect(formatRang(120)).toBe('120ᵉ');
  });
});

describe('formatRangAvecEffectif', () => {
  it('formate avec effectif', () => {
    expect(formatRangAvecEffectif(5, 120)).toBe('5ᵉ / 120');
  });

  it('respecte le féminin pour 1', () => {
    expect(formatRangAvecEffectif(1, 50, 'F')).toBe('1ʳᵉ / 50');
  });
});
