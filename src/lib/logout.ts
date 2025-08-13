// src/lib/logout.ts
'use client'

import { supabase } from '@/lib/supabaseClient'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export async function handleLogout(router: AppRouterInstance) {
  // 1) sign out di client
  await supabase.auth.signOut()

  // 2) sinkronkan cookie di server (bersihkan sb-* cookies)
  try {
    await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
    })
  } catch {
    // biarkan silent; tidak mengganggu UX
  }

  // 3) arahkan ke login & cegah back ke dashboard
  router.replace('/login')
}