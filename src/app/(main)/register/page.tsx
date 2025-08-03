// src/app/(main)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // State baru untuk error validasi real-time
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const router = useRouter();
  
  // Fungsi untuk validasi
  const validate = () => {
    const errors = { name: '', email: '', password: '' };
    let isValid = true;
    
    if (!name) {
      errors.name = 'Nama tidak boleh kosong.';
      isValid = false;
    }
    
    if (!email.includes('@')) {
      errors.email = 'Format email tidak valid.';
      isValid = false;
    }
    
    if (password.length < 8) {
      errors.password = 'Password harus minimal 8 karakter.';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Jalankan validasi sebelum submit
    if (!validate()) {
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: name },
        // Nomor WhatsApp akan disimpan di metadata, bukan phone
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.user) {
      // Simpan nomor whatsapp di tabel profiles jika perlu
      setMessage('Pendaftaran berhasil! Mengarahkan ke dashboard...');
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="bg-brand-champagne min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-brand-green">Arumaja<span className="text-brand-gold">.</span></h1>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-brand-charcoal">Register</h2>
          <p className="font-sans text-brand-charcoal/80 mt-1">Buat akun untuk menikmati layanan Arumaja.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-5 bg-white p-8 rounded-xl shadow-lg border border-brand-gold/20">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">Nama</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Nama Kamu"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) validate();
              }}
              required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md"
            />
            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">WhatsApp Aktif</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm bg-white border border-r-0 border-brand-gold rounded-l-md">+62</span>
              <input 
                type="tel" 
                id="whatsapp" 
                placeholder="81234xxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-r-md"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">E-Mail Aktif</label>
            <input 
              type="email" 
              id="email" 
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) validate();
              }}
              required
              className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md"
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-charcoal mb-1 font-sans">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password" 
                placeholder="Minimal 8 Karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) validate();
                }}
                required
                className="w-full p-3 pr-10 bg-brand-champagne border border-brand-gold rounded-md"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                {/* SVG Icon */}
              </button>
            </div>
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </div>
          {message && <p className="text-center text-sm font-medium text-brand-green">{message}</p>}
          {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 font-bold bg-brand-green text-brand-off-white rounded-md disabled:bg-gray-400">
              {loading ? 'Memproses...' : 'Selanjutnya'} &rarr;
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-brand-charcoal/80 pt-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-brand-gold hover:underline">Log in disini</Link>
        </p>
      </div>
    </div>
  );
}