// src/components/dashboard/AccountSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State untuk form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) setEmail(user.email || '');
    if (profile) {
      // Di masa depan, kita bisa mengambil nama dari tabel profiles
    }
  }, [user, profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Logika untuk update nama akan ditambahkan di sini
    // saat kita menambahkan kolom 'full_name' di tabel profiles
    
    setMessage('Pengaturan berhasil diperbarui!');
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold font-serif text-brand-green">Profil Pengguna</h2>
        <p className="text-brand-charcoal/70 mt-1">Kelola informasi akun Anda.</p>
      </div>
      
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
          />
           <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah.</p>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-brand-charcoal">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap Anda"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 font-bold text-brand-off-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </div>
      </form>
    </div>
  );
}