// src/components/dashboard/AccountSettings.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettings() {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { setEmail(user?.email || ''); }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Perubahan disimpan (mock).');
  };

  return (
    <div className="p-6 w-full">
      <h2 className="font-serif text-2xl font-bold text-brand-green">Pengaturan Akun</h2>
      <p className="text-sm text-brand-charcoal/70">Role: {profile?.role || 'customer'}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Lengkap</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 bg-brand-champagne border border-brand-gold rounded-md" />
        </div>
        <button className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90">Simpan</button>
        {message && <p className="text-green-700 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
