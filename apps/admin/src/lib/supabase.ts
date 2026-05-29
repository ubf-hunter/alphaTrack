import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@alphatrack/shared';
import { ENV } from './env';
import { getStoredToken } from './auth-storage';

// Wrapper fetch qui injecte automatiquement le JWT custom (admin) dans
// l'en-tête Authorization à chaque requête. Lit le token depuis le storage
// au moment de l'appel — pas besoin de recréer le client à chaque login.
function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      // Notre JWT custom (login-admin) est géré à la main — on désactive le
      // gestionnaire de session built-in qui s'attend à un flux email/OTP.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: authenticatedFetch,
    },
  },
);
