'use client';

// frontend/src/lib/auth-context.tsx
//
// Client-side auth state: holds the JWT issued by the backend's `login`
// mutation (src/auth/auth.resolver.ts) in localStorage, and decodes its
// payload (id/email/role) so components can derive `canEdit` from the
// current user's role (Admin/Curator, per Design Document Section 3.2)
// without a round trip. The token itself is still verified server-side on
// every request — this decode is display-only, never trusted for access
// control on its own.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { graphqlRequest } from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'artium.token';

function decodeToken(token: string): AuthUser | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return { id: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      email
      role
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setUser(decodeToken(stored));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await graphqlRequest<{ login: { accessToken: string } }>(LOGIN_MUTATION, {
      email,
      password,
    });
    const accessToken = data.login.accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(decodeToken(accessToken));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Admin/Curator can create/edit Organization and Collection records
 *  (Design Document Section 3.2) — Contributors cannot. */
export function canManageOrgAndCollection(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'curator';
}
