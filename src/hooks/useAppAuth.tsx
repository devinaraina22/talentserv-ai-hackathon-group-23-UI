"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@clerk/nextjs";
import { getE2eToken, isE2eClient } from "@/lib/e2e";

type AppAuth = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
};

const E2eAuthContext = createContext<AppAuth>({
  isLoaded: true,
  isSignedIn: true,
  getToken: getE2eToken,
});

export function E2eAuthProvider({ children }: { children: React.ReactNode }) {
  const value: AppAuth = {
    isLoaded: true,
    isSignedIn: true,
    getToken: getE2eToken,
  };
  return <E2eAuthContext.Provider value={value}>{children}</E2eAuthContext.Provider>;
}

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const clerk = useAuth();
  const value: AppAuth = {
    isLoaded: clerk.isLoaded,
    isSignedIn: !!clerk.isSignedIn,
    getToken: clerk.getToken,
  };
  return <E2eAuthContext.Provider value={value}>{children}</E2eAuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  if (isE2eClient()) {
    return <E2eAuthProvider>{children}</E2eAuthProvider>;
  }
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

export function useAppAuth(): AppAuth {
  return useContext(E2eAuthContext);
}
