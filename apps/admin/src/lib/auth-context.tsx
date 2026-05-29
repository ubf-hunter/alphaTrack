import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Auth } from '@alphatrack/shared';
import {
  clearSession,
  getStoredAdmin,
  getStoredToken,
  storeSession,
  type StoredAdmin,
} from './auth-storage';
import { loginAdmin } from './auth-api';

export interface AuthState {
  admin: StoredAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (matricule: string, password: string) => Promise<StoredAdmin>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [admin, setAdmin] = useState<StoredAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au montage, on hydrate depuis localStorage et on vérifie l'expiration.
  useEffect(() => {
    const token = getStoredToken();
    const stored = getStoredAdmin();
    if (token && stored) {
      const decoded = Auth.decodeJwt(token);
      if (decoded && !Auth.isExpired(decoded)) {
        setAdmin(stored);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (matricule: string, password: string) => {
    const { token, admin: loggedAdmin } = await loginAdmin(matricule, password);
    storeSession(token, loggedAdmin);
    setAdmin(loggedAdmin);
    return loggedAdmin;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAdmin(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      admin,
      isAuthenticated: admin !== null,
      isLoading,
      login,
      logout,
    }),
    [admin, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  }
  return ctx;
}
