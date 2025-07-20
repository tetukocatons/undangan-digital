'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for UI feedback
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
      setError(signInError.message);
      setLoading(false);
    } else {
      setMessage('Login berhasil! Mengarahkan ke dashboard...');
      router.push('/dashboard');
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
          {/* Email Input */}
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

          {/* Password Input with Show/Hide Toggle */}
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
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                    <path d="M2 10s3.923-5.5 8-5.5 8 5.5 8 5.5-3.923 5.5-8 5.5S2 10 2 10zm4.5 0a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Display Messages */}
          {message && <p className="text-center text-sm font-medium text-brand-green">{message}</p>}
          {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

          {/* Primary Button */}
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
        
        {/* Bottom Link */}
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
