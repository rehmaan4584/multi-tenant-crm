'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '@/lib/api';
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  setAuth,
} from '@/lib/auth-storage';
import type { AuthUser, LoginResponse } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setUser(getStoredUser());
    setIsReady(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const organizationId =
        process.env.NEXT_PUBLIC_DEMO_ORG_ID ??
        '00000000-0000-0000-0000-000000000001';

      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, organizationId }),
      });
      setAuth(res.accessToken, res.user);
      setToken(res.accessToken);
      setUser(res.user);
      router.push('/customers');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, token, isReady, login, logout }),
    [user, token, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
