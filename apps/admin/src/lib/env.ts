// Accès aux variables d'env Vite. Évaluation paresseuse pour ne pas crasher
// au chargement du module — on veut un message d'erreur visible côté UI plutôt
// qu'une page blanche silencieuse.

export interface AppEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export interface EnvResult {
  ok: true;
  env: AppEnv;
}
export interface EnvError {
  ok: false;
  missing: ReadonlyArray<string>;
}

export function readEnv(): EnvResult | EnvError {
  const missing: string[] = [];
  const url = import.meta.env['VITE_SUPABASE_URL'];
  const key = import.meta.env['VITE_SUPABASE_ANON_KEY'];
  if (!url || url.length === 0) missing.push('VITE_SUPABASE_URL');
  if (!key || key.length === 0) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) return { ok: false, missing };
  return {
    ok: true,
    env: {
      SUPABASE_URL: url as string,
      SUPABASE_ANON_KEY: key as string,
    },
  };
}

const result = readEnv();
if (!result.ok) {
  console.error(
    `[alphaTrack] Variables d'env manquantes : ${result.missing.join(', ')}. ` +
      `Vérifie /.env (racine du monorepo) et redémarre pnpm dev:admin.`,
  );
}

/** ENV — accès direct quand on est sûr que la config est bonne (post-guard). */
export const ENV: AppEnv = result.ok
  ? result.env
  : { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' };
