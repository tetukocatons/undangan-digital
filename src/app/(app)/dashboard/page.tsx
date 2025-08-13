// src/app/(app)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import AccountSettings from '@/components/dashboard/AccountSettings';

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

const handleLogout = async () => {
  // 1) sign out di client
  await supabase.auth.signOut();

  // 2) sinkronkan ke server agar cookie sb-… dihapus
  try {
    await fetch('/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'SIGNED_OUT', session: null }),
    });
  } catch (e) {
    // abaikan error network kecil; logout masih sah di client
  }

  // 3) arahkan ke login, dan cegah kembali ke dashboard via back
  router.replace('/login');
};

  const renderContent = () => {
    if (activeView === 'account') return <AccountSettings />;
    return (
      <div className="p-6">
        <h1 className="font-serif text-3xl font-bold text-brand-green">Dashboard</h1>
        <p className="mt-2 text-brand-charcoal/80">Selamat datang, {user?.email}.</p>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-brand-champagne">
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
}
