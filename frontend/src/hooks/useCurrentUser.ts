import { useEffect, useState } from "react";
import { api } from "../api";
import { supabase } from "../supabaseClient";

type MeResponse = { user?: { id: string; roles?: string[]; username?: string | null } };

export function useCurrentUser(): { userId: string | null; roles: string[]; username: string | null; loading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await api.get<MeResponse>("/auth/me");
        setUserId(me.user?.id ?? null);
        setRoles(me.user?.roles ?? []);
        setUsername(me.user?.username ?? null);
      } catch {
        setUserId(null);
        setRoles([]);
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };
    void run();

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void run();
    });
    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  return { userId, roles, username, loading };
}

