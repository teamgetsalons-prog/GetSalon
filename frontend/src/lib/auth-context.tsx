"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSession, logout as authLogout } from "./auth";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getSession();
      setUser(res.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null); // instant UI feedback
    // Never let a slow backend strand the user mid-logout; the cookie
    // clear almost always completes well inside the cap.
    await Promise.race([
      authLogout(),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
    try {
      sessionStorage.setItem("gs-logged-out", "1");
    } catch {}
    // Full navigation, not a client-side push: it drops all in-memory
    // state (dashboard data, admin lists) and guarantees the visitor
    // leaves any authenticated panel they were on.
    window.location.replace("/");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}