// src/app/(app)/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { handleLogout } from '@/lib/logout';
import Sidebar from '@/components/dashboard/Sidebar';
import AccountSettings from '@/components/dashboard/AccountSettings';
import InvitationsView from '@/components/dashboard/InvitationsView';
import InvitationForm from '@/components/dashboard/InvitationForm';
import InvitationManagementView from '@/components/dashboard/InvitationManagementView';
import GuestManagementView from '@/components/dashboard/GuestManagementView';
import { SupabaseClient } from '@supabase/supabase-js';
import { Invitation } from '@/lib/types';

// ... (Komponen MenuIcon, SettingsView, HelpView, dan tipe Invitation tetap sama) ...
const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const SettingsView = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Pengaturan</h1><p>Halaman untuk pengaturan umum akan tersedia di sini.</p></div>;
const HelpView = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Bantuan</h1><p>Halaman pusat bantuan dan FAQ akan tersedia di sini.</p></div>;

// --- KOMPONEN BARU UNTUK BANNER ADMIN ---
const AdminBanner = ({ role }: { role: string }) => (
  <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold text-sm w-full">
    Anda login sebagai: <span className="font-bold capitalize">{role}</span>
  </div>
);


export default function DashboardPage() {
  const { user, profile, isLoading: isAuthLoading, supabase } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!supabase) return;
    setIsLoadingData(true);
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invitations:', error);
        setInvitations([]);
    } else {
        const fetchedInvitations = data as Invitation[];
        setInvitations(fetchedInvitations);
    }
    setIsLoadingData(false);
  }, [supabase]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const onLogout = () => {
    handleLogout(router, supabase);
  };
  
  const handleManageInvitation = (invitationId: string) => {
    setActiveInvitationId(invitationId);
    setActiveView('manage-invitation');
  };
  
  const handleSetView = async (view: string, id?: string) => {
      if (view === 'dashboard') {
          await fetchInvitations();
      }
      
      if (view === 'manage-invitation' && !activeInvitationId && invitations.length > 0) {
          const firstPaid = invitations.find(inv => inv.status === 'paid');
          setActiveInvitationId(firstPaid ? firstPaid.id : invitations[0].id);
      }
      
      if (id) {
          setActiveInvitationId(id);
      } else if (view === 'create-invitation') {
          setActiveInvitationId(null);
      }

      setActiveView(view);
  }

  const renderContent = () => {
    // ... (Isi switch case tetap sama)
    switch (activeView) {
      case 'dashboard':
        return <InvitationsView 
                  invitations={invitations}
                  isLoading={isLoadingData}
                  refreshInvitations={fetchInvitations}
                  setActiveView={handleSetView} 
                  onManageInvitation={handleManageInvitation}
               />;
      case 'manage-invitation':
        return <InvitationManagementView
                  invitations={invitations}
                  isLoading={isLoadingData}
                  refreshInvitations={fetchInvitations}
                  managedInvitationId={activeInvitationId}
                  onInvitationChange={setActiveInvitationId}
                  setActiveView={handleSetView}
               />;
      case 'guest-management':
        return <GuestManagementView
                  invitations={invitations}
                  isLoading={isLoadingData}
               />;
      case 'settings': return <SettingsView />;
      case 'help': return <HelpView />;
      case 'account': return <AccountSettings />;
      case 'create-invitation':
        return <InvitationForm 
                 setActiveView={(view, id) => { fetchInvitations().then(() => handleSetView(view, id)); }} 
                 invitationId={activeInvitationId || undefined} 
               />;
      default:
        return <div className="p-6">Selamat Datang!</div>;
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-champagne">
      {/* --- BANNER DITAMPILKAN SECARA KONDISIONAL DI SINI --- */}
      {profile && profile.role !== 'customer' && <AdminBanner role={profile.role} />}
      
      <div className="flex">
        <Sidebar 
            activeView={activeView} 
            setActiveView={handleSetView} 
            onLogout={onLogout} 
            profile={profile}
            isOpen={isSidebarOpen}
            toggle={() => setSidebarOpen(!isSidebarOpen)}
            invitations={invitations}
        />
        <div className="flex-1 flex flex-col h-screen">
          <header className="md:hidden bg-brand-green text-white p-4 flex items-center shadow-md sticky top-0 z-20">
              <button onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
              <h1 className="font-serif text-xl font-bold ml-4">Dashboard</h1>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}