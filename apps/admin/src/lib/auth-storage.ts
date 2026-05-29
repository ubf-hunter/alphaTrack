// Stockage du JWT et des infos admin courant.
// localStorage pour MVP — à terme, on basculera sur cookie httpOnly (XSS-safe).

const TOKEN_KEY = 'alphatrack.admin.token';
const ADMIN_KEY = 'alphatrack.admin.user';

export interface StoredAdmin {
  id: string;
  matricule: string;
  role: 'admin' | 'saisie';
  sous_centre_id: string | null;
  must_change_password: boolean;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredAdmin(): StoredAdmin | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdmin;
  } catch {
    return null;
  }
}

export function storeSession(token: string, admin: StoredAdmin): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_KEY);
}
