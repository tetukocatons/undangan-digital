// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Buat klien Supabase di sisi server
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ini terjadi jika `set` dipanggil dari Server Component.
            // Bisa diabaikan jika Anda memiliki middleware yang me-refresh sesi.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Ini terjadi jika `delete` dipanggil dari Server Component.
            // Bisa diabaikan jika Anda memiliki middleware yang me-refresh sesi.
          }
        },
      },
    }
  )
}