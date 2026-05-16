"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { getRedirectResult, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Resolve any pending Google redirect sign-in
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => {
        if (u) {
          // Fire-and-forget: sync Firebase user into Prisma
          fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoUrl: u.photoURL,
            }),
          }).catch(() => {});
        }
        setUser(u);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
