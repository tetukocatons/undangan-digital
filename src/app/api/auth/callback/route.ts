// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const dynamic = 'force-dynamic' // jangan di-cache

function readCookie(req: Request, name: string) {
  const raw = req.headers.get('cookie') ?? ''
  const found = raw.split(';').map(s => s.trim()).find(c => c.startsWith(name + '='))
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : undefined
}

export async function POST(req: Request) {
  const res = new NextResponse(null, { status: 200 })

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      // Jangan lempar error ke user; log saja di server dan pulangkan 200
      console.error('[api/auth/callback] Missing SUPABASE env')
      return res
    }

    const body = await req.json().catch(() => null) as { event?: string; session?: any } | null
    const session = body?.session ?? null

    const supabase = createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return readCookie(req, name)
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 })
        },
      },
    })

    // Jika tidak ada session (logout/expired), bersihkan cookie agar middleware tidak bingung
    if (!session?.access_token) {
      await supabase.auth.signOut() // aman dipanggil walau belum login
      return res
    }

    // Tulis/refresh cookie session
    await supabase.auth.setSession(session)
    return res
  } catch (e) {
    console.error('[api/auth/callback] Error:', e)
    // Tetap kembalikan 200 agar UX tidak rusak, tapi kalau ingin strict boleh ganti 204
    return res
  }
}