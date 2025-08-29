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

// Komponen Ikon Hamburger
const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const UserManagement = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen User</h1><p>Halaman ini hanya untuk Administrator.</p></div>;
const ThemeManagement = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Tema</h1><p>Halaman ini untuk Admin dan Staff.</p></div>;

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<string>('invitations');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State untuk sidebar mobile
  const router = useRouter();

  const onLogout = () => {
    handleLogout(router);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'account':
        return <AccountSettings />;
      case 'create-invitation':
        return <InvitationForm setActiveView={setActiveView} />;
      case 'invitations':
        return <InvitationsView setActiveView={setActiveView} />;
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
            isOpen={isSidebarOpen} // Pass state
            toggle={() => setSidebarOpen(!isSidebarOpen)} // Pass toggle function
        />
        <main className="flex-1">
            {/* Header untuk Mobile dengan tombol Hamburger */}
            <div className="md:hidden bg-brand-green text-white p-4 flex items-center shadow-md">
                <button onClick={() => setSidebarOpen(true)}>
                    <MenuIcon />
                </button>
                <h1 className="font-serif text-xl font-bold ml-4">Dashboard</h1>
            </div>
            <div className="p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}