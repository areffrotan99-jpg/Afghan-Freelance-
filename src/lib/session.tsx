import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'accountant';
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: AuthUser | null }>('/api/auth/me');
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    if (!navigator.onLine) {
      throw new Error('برای ورود به سیستم به اینترنت نیاز است.');
    }
    const data = await api.post<{ user: AuthUser }>('/api/auth/login', { username, password });
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* نادیده گرفتن */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout, refresh }), [user, ready, login, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
