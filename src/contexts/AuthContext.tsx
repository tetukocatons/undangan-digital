// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk profile, sesuaikan dengan tabel 'profiles' Anda
type UserProfile = {
  id: string;
  full_name: string;
  role: string;
  // tambahkan properti lain jika ada
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null; // Tambahkan profile
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // State untuk profile
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ?? null);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Ambil profil jika ada user
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        setProfile(userProfile as UserProfile | null);
      }
      setIsLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session ?? null);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Ambil profil saat state auth berubah
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(userProfile as UserProfile | null);
        } else {
          setProfile(null); // Kosongkan profile saat logout
        }

        setIsLoading(false);

        try {
          await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        } catch {}
        
        router.refresh();
      }
    );

    return () => { subscription?.unsubscribe(); };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}