'use client'; // <-- Penting! Tandai sebagai Client Component karena ada interaktivitas

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // <-- Impor client kita

export default function RegisterPage() {
  // State untuk menyimpan input dari pengguna
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State untuk menampilkan status loading dan pesan
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fungsi yang dijalankan saat tombol "Daftar" diklik
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman me-refresh
    setLoading(true);
    setMessage('');

    // Kirim data email dan password ke Supabase untuk didaftarkan
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      // Jika ada error, tampilkan pesannya
      setMessage('Error: ' + error.message);
    } else {
      // Jika berhasil, tampilkan pesan sukses
      setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">Buat Akun Baru</h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password (minimal 6 karakter)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-brand-pink rounded-md hover:bg-brand-pink/90 disabled:bg-gray-400"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}