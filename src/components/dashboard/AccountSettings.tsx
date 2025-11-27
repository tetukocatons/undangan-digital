// src/components/dashboard/AccountSettings.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettings() {
  const { user, profile, isLoading, supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setEmail(user.email || '');
    if (profile) setFullName(profile.full_name || '');
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Perubahan berhasil disimpan.');
      // Refresh data profile di AuthContext setelah update
      // Ini adalah contoh, Anda mungkin perlu implementasi fungsi refresh di AuthContext
      // auth.refreshProfile(); 
    }
    setLoading(false);
  };

  if (isLoading) {
    return <div>Memuat data akun...</div>;
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-brand-green">Pengaturan Akun</h2>
        {/* --- PERUBAHAN DI SINI --- */}
        {/* Tampilkan role hanya jika bukan 'customer' */}
        {profile && profile.role !== 'customer' && (
          <span className="bg-brand-gold text-brand-green text-xs font-bold px-2 py-1 rounded-md capitalize">
            {profile.role}
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Email</label>
          <input 
            value={email} 
            disabled 
            className="w-full p-3 bg-gray-200 border border-brand-champagne rounded-md cursor-not-allowed text-gray-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Lengkap</label>
          <input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 bg-white border border-brand-gold/50 rounded-md focus:border-brand-gold focus:ring-brand-gold/50 outline-none" 
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        {message && <p className="text-green-700 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}