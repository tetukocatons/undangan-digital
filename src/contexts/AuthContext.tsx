// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

type Profile = { id: string; email: string | null; role: 'admin' | 'customer' | string };

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProfile(u: User | null) {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    setProfile((data as Profile) || null);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(session ?? null);
      setUser(session?.user ?? null);
      await fetchProfile(session?.user ?? null);
      setIsLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
      await fetchProfile(session?.user ?? null);

      // Sinkronkan cookie untuk middleware via route handler server
      await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, session }),
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
