'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

export default function SupabaseProvider({
  children,
  serverSession,
}: {
  children: ReactNode
  serverSession: Session | null
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        // Jika token berubah (login/logout/refresh), refresh tree server
        if (session?.access_token !== serverSession?.access_token) {
          router.refresh()
        }
      })
    return () => subscription?.unsubscribe()
  }, [router, supabase, serverSession?.access_token])

  return <>{children}</>
}