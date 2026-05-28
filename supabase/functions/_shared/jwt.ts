// JWT custom HS256 — signature via Web Crypto natif (zéro dépendance externe).
// Format compatible PostgREST : on garde role='authenticated' pour que Supabase
// accepte le token côté API, et on ajoute app_role pour notre logique métier.

export type AppRole = 'admin' | 'saisie' | 'eleve';

export interface JwtPayload {
  sub: string;
  app_role: AppRole;
  sous_centre_id?: string;
}

const JWT_TTL_SECONDS = 60 * 60 * 8; // 8h

function base64UrlEncode(input: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  // Le JWT secret est le même que celui de Supabase Auth (pour que les tokens
  // signés ici soient acceptés par PostgREST), mais Supabase réserve le préfixe
  // SUPABASE_ pour ses propres injections — on passe donc par APP_JWT_SECRET.
  const secret = Deno.env.get('APP_JWT_SECRET');
  if (!secret) throw new Error('APP_JWT_SECRET manquant côté Edge Function');

  const now = Math.floor(Date.now() / 1000);

  const fullPayload: Record<string, unknown> = {
    // Claims standards Supabase / PostgREST
    role: 'authenticated',
    aud: 'authenticated',
    iss: 'alphatrack-edge',
    iat: now,
    exp: now + JWT_TTL_SECONDS,
    // Claims de notre app
    sub: payload.sub,
    app_role: payload.app_role,
  };
  if (payload.sous_centre_id) {
    fullPayload['sous_centre_id'] = payload.sous_centre_id;
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}
