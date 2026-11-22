"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/domain";

export interface LocalUser {
  id: string;
  email: string;
  display_name: string;
  avatar_emoji?: string;
  phone?: string;
  line_id?: string;
  note?: string;
  verified?: boolean;
  reputation?: number;
}

const LOCAL_USER_KEY = "reunite_active_user";

export function getLocalActiveUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalActiveUser(user: LocalUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("reunite_auth_changed"));
}

export function clearLocalActiveUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_USER_KEY);
  window.dispatchEvent(new Event("reunite_auth_changed"));
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);

  const refreshAuth = useCallback(() => {
    setAuthVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAuth() {
      // 1. Check Supabase auth session
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        setSession(data.session);
        setLoading(false);
        return;
      }

      // 2. If no Supabase session, check local active user
      const local = getLocalActiveUser();
      if (local) {
        const mockSession: Session = {
          access_token: "local-session-token",
          token_type: "bearer",
          expires_in: 86400 * 30,
          refresh_token: "local-refresh-token",
          user: {
            id: local.id,
            email: local.email,
            app_metadata: {},
            user_metadata: { display_name: local.display_name },
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as unknown as User,
        };
        setSession(mockSession);
        setProfile({
          id: local.id,
          display_name: local.display_name || local.email.split("@")[0],
          avatar_emoji: local.avatar_emoji || "😊",
          reputation: local.reputation ?? 5.0,
          verified: local.verified ?? true,
          created_at: new Date().toISOString(),
        });
      } else {
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
    }

    loadAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      if (s) {
        setSession(s);
      } else {
        // If supabase logged out, fallback to check local
        const local = getLocalActiveUser();
        if (local) {
          setSession({
            access_token: "local-session-token",
            token_type: "bearer",
            expires_in: 86400 * 30,
            refresh_token: "local-refresh-token",
            user: {
              id: local.id,
              email: local.email,
              app_metadata: {},
              user_metadata: { display_name: local.display_name },
              aud: "authenticated",
              created_at: new Date().toISOString(),
            } as unknown as User,
          });
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    const handleCustomAuth = () => {
      loadAuth();
    };

    window.addEventListener("reunite_auth_changed", handleCustomAuth);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("reunite_auth_changed", handleCustomAuth);
    };
  }, [authVersion]);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    // If local active user is stored and matches userId, load profile from it or Supabase
    const local = getLocalActiveUser();
    if (local && local.id === userId) {
      setProfile({
        id: local.id,
        display_name: local.display_name || local.email.split("@")[0],
        avatar_emoji: local.avatar_emoji || "😊",
        reputation: local.reputation ?? 5.0,
        verified: local.verified ?? true,
        created_at: new Date().toISOString(),
      });
    }

    let cancelled = false;
    void (async () => {
      try {
        const [p, r] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId),
        ]);
        if (cancelled) return;
        if (p.data) {
          // If Supabase returned profile, merge with local changes if any
          const localUser = getLocalActiveUser();
          if (localUser && localUser.id === userId && localUser.avatar_emoji) {
            setProfile({ ...p.data, ...localUser });
          } else {
            setProfile(p.data);
          }
        }
        setIsAdmin((r.data ?? []).some((x) => x.role === "admin"));
      } catch {
        // Fallback already handled
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, authVersion]);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    userId,
    profile,
    isAdmin,
    loading,
    refreshAuth,
  };
}
