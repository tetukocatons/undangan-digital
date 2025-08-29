// src/app/(app)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleLogout } from '@/lib/logout';
import Sidebar from '@/components/dashboard/Sidebar';
import AccountSettings from '@/components/dashboard/AccountSettings';
import InvitationsView from '@/components/dashboard/InvitationsView';
import InvitationForm from '@/components/dashboard/InvitationForm';

// Komponen placeholder untuk halaman admin (jika ada)
const UserManagement = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen User</h1><p>Halaman ini hanya untuk Administrator.</p></div>;
const ThemeManagement = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Tema</h1><p>Halaman ini untuk Admin dan Staff.</p></div>;

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();
  // State ini bertindak sebagai "pengontrol" untuk menampilkan view yang benar
  const [activeView, setActiveView] = useState<string>('invitations');
  const router = useRouter();

  const onLogout = () => {
    handleLogout(router);
  };

  // Fungsi ini memilih komponen mana yang akan ditampilkan berdasarkan state 'activeView'
  const renderContent = () => {
    switch (activeView) {
      case 'account':
        return <AccountSettings />;
      
      case 'create-invitation':
        // Menampilkan form saat 'activeView' adalah 'create-invitation'
        // dan memberikan fungsi untuk kembali ke 'invitations'
        return <InvitationForm setActiveView={setActiveView} />;
      
      case 'invitations':
        // Tampilan default: menampilkan daftar undangan
        return <InvitationsView setActiveView={setActiveView} />;
      
      // Tampilan khusus untuk Admin & Staff (jika diperlukan)
      case 'user-management':
        if (profile?.role === 'administrator') return <UserManagement />;
        return <DefaultDashboardView />;
      
      case 'theme-management':
        if (profile?.role === 'administrator' || profile?.role === 'staff') return <ThemeManagement />;
        return <DefaultDashboardView />;

      default:
        return <DefaultDashboardView />;
    }
  };

  // Komponen kecil untuk tampilan dashboard default
  const DefaultDashboardView = () => (
    <div className="p-6">
      <h1 className="font-serif text-3xl font-bold text-brand-green">Dashboard</h1>
      <p className="mt-2 text-brand-charcoal/80">
        Selamat datang, {profile?.full_name || user?.email}.
        <span className="ml-2 capitalize bg-brand-gold/20 text-brand-gold font-bold py-1 px-2 rounded-md text-sm">
          {profile?.role}
        </span>
      </p>
    </div>
  );

  // Tampilkan loading indicator jika sesi otentikasi masih diproses
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-champagne">
      <div className="flex">
        <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            onLogout={onLogout} 
            profile={profile} 
        />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}