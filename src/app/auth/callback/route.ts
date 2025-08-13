import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
        remove(name: string, options: any) { cookieStore.set(name, '', { ...options, maxAge: 0 }); },
      },
    }
  );

  const { event, session } = await req.json();

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await supabase.auth.setSession(session);
  }
  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
