"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServices } from "@/container/ServicesProvider.tsx";
import type { UserProfile } from "@/domain/UserProfile.ts";

export interface AuthState {
  // loading – ще не відомо, чи є вхід; guest – гість; user – користувач увійшов
  status: "loading" | "guest" | "user";
  userId: string | null;
  // null, поки профіль завантажується (або якщо його немає)
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authService, sync } = useServices();
  const [state, setState] = useState<AuthState>({ status: "loading", userId: null, profile: null });

  useEffect(() => {
    let latestChange = 0;
    const unsubscribe = authService.onAuthChange((userId) => {
      const change = ++latestChange;
      if (userId === null) {
        sync.stopUser();
        setState({ status: "guest", userId: null, profile: null });
        return;
      }
      sync.startUser(userId);
      setState({ status: "user", userId, profile: null });
      authService
        .getProfile(userId)
        .then((profile) => {
          if (change === latestChange) setState({ status: "user", userId, profile });
        })
        .catch(() => undefined);
    });
    return unsubscribe;
  }, [authService, sync]);

  return <AuthContext value={state}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth має використовуватись усередині AuthProvider");
  return state;
}
