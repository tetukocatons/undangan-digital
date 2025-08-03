// src/app/(main)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      // Berikan pesan error yang lebih spesifik
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Email atau password yang Anda masukkan salah.');
      } else {
        setError(signInError.message);
      }
      setLoading(false); // <-- PENTING: Matikan loading state saat error
    } else {
      setMessage('Login berhasil! Mengarahkan ke dashboard...');
      // Arahkan ke dashboard. Middleware akan menangani sisanya.
      router.push('/dashboard');
      // Tidak perlu set loading ke false di sini karena akan pindah halaman
    }
  };

  return (
    <div className="bg-brand-champagne min-h-screen flex items-center justify-center p-4">
      
      <div className="w-full max-w-md space-y-4">

        <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-brand-green">
              Arumaja<span className="text-brand-gold">.</span>
            </h1>
        </div>

        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-brand-charcoal">
            Welcome Back
          </h2>
          <p className="font-sans text-brand-charcoal/80 mt-1">
            Masuk untuk melanjutkan dan mengatur undangan Anda.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 bg-white p-8 rounded-xl shadow-lg border border-brand-gold/20">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">E-Mail</label>
            <input 
              type="email" 
              id="email" 
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md text-brand-charcoal focus:ring-brand-green focus:border-brand-green transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password" 
                placeholder="Minimal 8 Karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 pr-10 bg-brand-champagne border border-brand-gold rounded-md text-brand-charcoal focus:ring-brand-green focus:border-brand-green transition-all duration-300"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-charcoal/60 hover:text-brand-green"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* SVG Icon (Omitted for brevity) */}
              </button>
            </div>
          </div>

          {/* Perbarui cara menampilkan error dan message */}
          {message && !error && <p className="text-center text-sm font-medium text-brand-green">{message}</p>}
          {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 font-bold bg-brand-green text-brand-off-white rounded-md hover:opacity-90 transition-all duration-300 disabled:bg-gray-400"
            >
              {loading ? 'Memeriksa...' : 'Masuk'}
              {!loading && <span>&rarr;</span>}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-brand-charcoal/80 pt-4">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-brand-gold hover:underline transition-all duration-300">
                Daftar disini
            </Link>
        </p>
      </div>
    </div>
  );
}