// src/components/dashboard/AccountSettings.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function AccountSettings() {
  const { user, profile, isLoading } = useAuth();
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

    // Update nama lengkap di tabel profiles
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Perubahan berhasil disimpan.');
    }
    setLoading(false);
  };

  if (isLoading) {
    return <div>Memuat data akun...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h2 className="font-serif text-2xl font-bold text-brand-green">Pengaturan Akun</h2>
      <p className="text-sm text-brand-charcoal/70">Role: {profile?.role || 'customer'}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Email</label>
          <input 
            value={email} 
            disabled 
            className="w-full p-3 bg-gray-200 border border-brand-gold rounded-md cursor-not-allowed" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Lengkap</label>
          <input 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 bg-white border border-brand-gold rounded-md" 
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
        {message && <p className="text-green-700 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}