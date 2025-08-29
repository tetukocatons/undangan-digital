// src/app/(app)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleLogout } from '@/lib/logout'; // Impor fungsi logout
import Sidebar from '@/components/dashboard/Sidebar';
import AccountSettings from '@/components/dashboard/AccountSettings';
import InvitationsView from '@/components/dashboard/InvitationsView'; // Tambahkan ini jika ingin menampilkan undangan

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const router = useRouter();

  const onLogout = () => {
    handleLogout(router); // Gunakan fungsi logout yang diimpor
  };

  const renderContent = () => {
    if (activeView === 'account') return <AccountSettings />;
    if (activeView === 'invitations') return <InvitationsView />; // Tampilkan view undangan
    
    // Tampilan dashboard default
    return (
      <div className="p-6">
        <h1 className="font-serif text-3xl font-bold text-brand-green">Dashboard</h1>
        <p className="mt-2 text-brand-charcoal/80">
          Selamat datang, {profile?.full_name || user?.email}.
        </p>
        {/* Anda bisa menampilkan komponen DashboardView.tsx di sini jika diperlukan */}
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-brand-champagne">
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}