"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import type { AuthUserDto } from "@/types/api";

export type LoginInput =
  | { provider: "google"; callbackUrl?: string }
  | { provider: "credentials"; email: string; password: string; callbackUrl?: string };

type AuthContextValue = {
  user: AuthUserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (input?: LoginInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function sessionUserToDto(sessionUser: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): AuthUserDto | null {
  if (!sessionUser?.email) return null;
  return {
    id: String(sessionUser.id ?? ""),
    name: String(sessionUser.name ?? "User"),
    email: String(sessionUser.email),
    avatar: sessionUser.image ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const login = useCallback(async (input?: LoginInput) => {
    if (!input) {
      await signIn("google", { callbackUrl: "/dashboard" });
      return { ok: true as const };
    }
    if (input.provider === "google") {
      await signIn("google", { callbackUrl: input.callbackUrl ?? "/dashboard" });
      return { ok: true as const };
    }

    const callbackUrl = input.callbackUrl ?? "/dashboard";

    const res = await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      return { ok: false as const, error: "Invalid email or password" };
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/login" });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const u = session?.user;
    const dto = u ? sessionUserToDto(u) : null;
    const backendToken = u?.backendToken ?? null;

    return {
      user: dto,
      token: backendToken,
      isAuthenticated: status === "authenticated",
      isHydrated: status !== "loading",
      login,
      logout,
    };
  }, [session, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
