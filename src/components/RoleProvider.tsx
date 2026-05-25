"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "@/lib/types";

const RoleContext = createContext<{
  profile: UserProfile | null;
  loading: boolean;
  refresh: () => void;
}>({ profile: null, loading: true, refresh: () => {} });

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <RoleContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
