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

const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const SettingsView = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Pengaturan</h1><p>Halaman untuk pengaturan umum akan tersedia di sini.</p></div>;
const HelpView = () => <div className="p-6"><h1 className="font-serif text-3xl font-bold text-brand-green">Bantuan</h1><p>Halaman pusat bantuan dan FAQ akan tersedia di sini.</p></div>;

type Invitation = {
  id: string; event_name: string; event_date: string; status: string; slug: string;
  package: string; theme_id: string | null; bride_name: string; groom_name: string;
  location: string; latitude: number | null; longitude: number | null;
  couple_enabled: boolean; story_enabled: boolean; gallery_enabled: boolean;
  acara_enabled: boolean; gift_enabled: boolean;
};

export default function DashboardPage() {
  const { user, profile, isLoading: isAuthLoading, supabase } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [managedInvitationId, setManagedInvitationId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
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
        if (!managedInvitationId && fetchedInvitations.length > 0) {
            setManagedInvitationId(fetchedInvitations[0].id);
        }
    }
    setIsLoadingData(false);
  }, [supabase, managedInvitationId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const onLogout = () => {
    handleLogout(router, supabase);
  };
  
  const handleManageInvitation = (invitationId: string) => {
    setManagedInvitationId(invitationId);
    setActiveView('manage-invitation');
  };
  
  const handleSetView = (view: string) => {
      // Saat pindah ke menu "Undangan", pastikan ID default sudah siap
      if (view === 'manage-invitation' && !managedInvitationId && invitations.length > 0) {
          setManagedInvitationId(invitations[0].id);
      }
      setActiveView(view);
  }

  const renderContent = () => {
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
                  managedInvitationId={managedInvitationId}
                  onInvitationChange={setManagedInvitationId}
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
        return <InvitationForm setActiveView={() => { fetchInvitations(); handleSetView('dashboard'); }} />;
      default:
        return <div className="p-6">Selamat Datang!</div>;
    }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-champagne">
      <div className="flex">
        <Sidebar 
            activeView={activeView} 
            setActiveView={handleSetView} 
            onLogout={onLogout} 
            profile={profile}
            isOpen={isSidebarOpen}
            toggle={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1">
            <div className="md:hidden bg-brand-green text-white p-4 flex items-center shadow-md">
                <button onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
                <h1 className="font-serif text-xl font-bold ml-4">Dashboard</h1>
            </div>
            <div className="p-4 sm:p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}