// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Buat Supabase client yang bisa berjalan di server-side (Middleware, Server Components, dll.)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Ambil data pengguna dari sesi
  const { data: { user } } = await supabase.auth.getUser();

  // Jika tidak ada user dan path adalah halaman yang diproteksi, redirect ke login
  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada user dan mereka mencoba mengakses halaman login/register, redirect ke dashboard
  if (user && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

// Konfigurasi untuk menentukan rute mana yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path, kecuali untuk:
     * - file di dalam /public (contoh: /favicon.ico)
     * - path API Supabase
     * - path Next.js internal (_next)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};