import type { Sexe } from '../constants';

export function formatRang(rang: number, sexe?: Sexe): string {
  if (rang === 1) return sexe === 'F' ? '1ʳᵉ' : '1ᵉʳ';
  return `${rang}ᵉ`;
}

export function formatRangAvecEffectif(
  rang: number,
  effectif: number,
  sexe?: Sexe,
): string {
  return `${formatRang(rang, sexe)} / ${effectif}`;
}
