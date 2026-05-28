// Génération de JWT custom signés avec le secret Supabase.
// Claims minimaux : sub, role, sous_centre_id (optionnel), iat, exp.

import { create, getNumericDate, type Header, type Payload } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

export interface CustomClaims extends Payload {
  sub: string;
  role: 'admin' | 'saisie' | 'eleve';
  sous_centre_id?: string;
}

const JWT_TTL_SECONDS = 60 * 60 * 8; // 8h

async function importKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signJwt(claims: Omit<CustomClaims, 'iat' | 'exp'>): Promise<string> {
  const secret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!secret) throw new Error('SUPABASE_JWT_SECRET manquant');

  const key = await importKey(secret);
  const header: Header = { alg: 'HS256', typ: 'JWT' };
  const payload: CustomClaims = {
    ...claims,
    iat: getNumericDate(0),
    exp: getNumericDate(JWT_TTL_SECONDS),
  };

  return await create(header, payload, key);
}
