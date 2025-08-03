// src/app/(app)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Impor komponen-komponen
import Sidebar, { adminMenu, customerMenu } from '@/components/dashboard/Sidebar';
import HeaderBar from '@/components/dashboard/HeaderBar';
import CustomerEventManager from '@/components/dashboard/CustomerEventManager';
import AccountSettings from '@/components/dashboard/AccountSettings'; // <-- Impor komponen baru

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth(); 
  const [activeView, setActiveView] = useState('events');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const userRole = profile?.role || 'customer'; 
  const menuItems = userRole === 'admin' ? adminMenu : customerMenu;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  const renderContent = () => {
    if (userRole === 'admin') {
      return <div>Admin Content Placeholder for {activeView}</div>;
    } else { // customer
      switch (activeView) {
        case 'events': return <CustomerEventManager />;
        case 'themes': return <div><h2 className="font-serif text-xl font-bold">Pilih Tema</h2></div>;
        case 'settings': return <AccountSettings />; // <-- Ganti placeholder dengan komponen baru
        default: return <CustomerEventManager />;
      }
    }
  };
  
  const pageTitle = menuItems.find(item => item.id === activeView)?.name || "Dashboard";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-champagne"><p>Loading...</p></div>;
  }

  return (
    <div className="bg-brand-champagne text-brand-charcoal font-sans">
        <div className="flex min-h-screen">
            <Sidebar 
                menuItems={menuItems} 
                activeView={activeView} 
                setActiveView={setActiveView}
                isSidebarOpen={isSidebarOpen}
                onLogout={handleLogout}
            />
            <div className="flex-1 flex flex-col">
                <HeaderBar title={pageTitle} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} user={user} />
                <main className="flex-1 p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden"></div>}
    </div>
  );
}