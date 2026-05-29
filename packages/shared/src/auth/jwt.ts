// Décodage minimal d'un JWT (sans vérif de signature — c'est PostgREST qui vérifie).
// Sert juste à lire les claims côté front pour router selon le rôle.

import type { AdminRole } from '../constants';

export interface DecodedJwt {
  sub: string;
  app_role: AdminRole | 'eleve';
  sous_centre_id?: string;
  exp: number;
  iat: number;
  iss?: string;
  aud?: string;
  role?: string;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return atob(padded + '='.repeat(padLen));
}

export function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1]!);
    return JSON.parse(json) as DecodedJwt;
  } catch {
    return null;
  }
}

export function isExpired(decoded: DecodedJwt, skewSeconds = 30): boolean {
  return decoded.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}
