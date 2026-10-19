'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Hardcoded admin credentials ─────────────────────────────────────────────
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@2026';
const SESSION_KEY = 'sslc_admin_session';

interface AuthContextType {
  user: { username: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.username) setUser(parsed);
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    if (
      username.trim().toLowerCase() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      const session = { username: ADMIN_USERNAME };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
    } else {
      throw new Error('Invalid username or password.');
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
