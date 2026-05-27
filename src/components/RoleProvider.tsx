"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";
import { useAppAuth } from "@/hooks/useAppAuth";
import type { UserProfile } from "@/lib/types";

const ROLE_CACHE_KEY = "medibook_role_profile_v1";

const RoleContext = createContext<{
  profile: UserProfile | null;
  loading: boolean;
  refresh: () => void;
}>({ profile: null, loading: true, refresh: () => {} });

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAppAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    if (!isLoaded) return;

    let hasCached = false;
    const cached = sessionStorage.getItem(ROLE_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserProfile;
        setProfile(parsed);
        setLoading(false);
        hasCached = true;
      } catch {
        sessionStorage.removeItem(ROLE_CACHE_KEY);
      }
    }

    clientApiFetch(getToken, "/api/user/role")
      .then((r) => r.json())
      .then((d) => {
        const next = d.profile ?? null;
        setProfile(next);
        if (next) sessionStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(next));
        else sessionStorage.removeItem(ROLE_CACHE_KEY);
      })
      .catch(() => {
        if (!hasCached) setProfile(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [isLoaded]);

  return (
    <RoleContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
