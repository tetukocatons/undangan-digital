// src/lib/logout.ts
'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { SupabaseClient } from '@supabase/supabase-js';

export async function handleLogout(router: AppRouterInstance, supabase: SupabaseClient) {
  // Gunakan klien supabase yang dilewatkan sebagai argumen
  await supabase.auth.signOut();
  
  // Arahkan ke login. Middleware akan menangani pembersihan cookie di sisi server.
  router.replace('/login');
}