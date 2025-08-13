// src/app/(main)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email atau password salah.');
      } else {
        setError(signInError.message);
      }
      setLoading(false);
    } else {
      setMessage('Login berhasil! Mengarahkan ke dashboard...');
      router.push(next);
    }
  };

  return (
    <div className="bg-brand-champagne min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl font-bold text-brand-green">
            Arumaja<span className="text-brand-gold">.</span>
          </h1>
          <h2 className="font-serif text-2xl font-bold text-brand-charcoal mt-2">Welcome Back</h2>
          <p className="font-sans text-brand-charcoal/80">Masuk untuk melanjutkan dan mengatur undangan Anda.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal mb-1">Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" placeholder="kamu@mail.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-charcoal mb-1">Password</label>
            <div className="relative">
              <input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md pr-12" placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-brand-green/80 hover:text-brand-green">
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-700 text-sm">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-gold text-brand-green font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-60">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Belum punya akun? <Link href="/register" className="text-brand-green underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
