// src/app/(main)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // <-- KEMBALIKAN IMPORT INI

export default function RegisterPage() {
  const supabase = createClient(); // Buat instance client langsung
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      if (data.session) {
        setMessage('Pendaftaran berhasil! Mengarahkan ke dashboard...');
        router.push('/dashboard');
      } else {
        setMessage('Pendaftaran berhasil. Silakan cek email untuk verifikasi akun Anda.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-brand-champagne min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="font-serif text-4xl font-bold text-brand-green">
            Arumaja<span className="text-brand-gold">.</span>
          </h1>
          <h2 className="font-serif text-2xl font-bold text-brand-charcoal mt-2">Create Account</h2>
          <p className="font-sans text-brand-charcoal/80">Daftar untuk mulai membuat undangan Anda.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-brand-charcoal mb-1">Nama Lengkap</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" placeholder="Nama Lengkap Anda" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" placeholder="kamu@mail.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-charcoal mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="wa" className="block text-sm font-medium text-brand-charcoal mb-1">WhatsApp (opsional)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-white text-brand-green border border-r-0 border-brand-gold rounded-l-md">+62</span>
              <input id="wa" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-r-md" placeholder="81234xxxx" />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-700 text-sm">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-brand-gold text-brand-green font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-60">
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Sudah punya akun? <Link href="/login" className="text-brand-green underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}