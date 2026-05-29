// Appels HTTP aux Edge Functions d'auth. Pas via supabase-js parce qu'on veut
// gérer finement les codes 401/429 et avoir des erreurs typées.

import { ENV } from './env';
import type { StoredAdmin } from './auth-storage';

export interface LoginAdminResponse {
  token: string;
  admin: StoredAdmin;
}

export interface AuthError {
  status: number;
  message: string;
}

async function callEdge<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ENV.SUPABASE_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ENV.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = { error: res.statusText };
  }

  if (!res.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Erreur ${res.status}`;
    const err: AuthError = { status: res.status, message };
    throw err;
  }

  return payload as T;
}

export function loginAdmin(matricule: string, password: string): Promise<LoginAdminResponse> {
  return callEdge<LoginAdminResponse>('login-admin', { matricule, password });
}
