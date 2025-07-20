'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Impor komponen-komponen yang sudah kita pisah
import Sidebar, { adminMenu, customerMenu } from '@/components/dashboard/Sidebar';
import HeaderBar from '@/components/dashboard/HeaderBar';
import CustomerEventManager from '@/components/dashboard/CustomerEventManager';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState('customer'); // Default ke customer
  const [activeView, setActiveView] = useState('events');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        // Di masa depan, di sini Anda akan memeriksa role user dari database
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = userRole === 'admin' ? adminMenu : customerMenu;
  
  const renderContent = () => {
    if (userRole === 'admin') {
      // Tampilkan konten admin di sini
      return <div>Admin Content Placeholder</div>;
    } else { // customer
      switch (activeView) {
        case 'events': return <CustomerEventManager />;
        case 'themes': return <div><h2 className="font-serif text-xl font-bold">Pilih Tema</h2></div>;
        case 'settings': return <div><h2 className="font-serif text-xl font-bold">Pengaturan Akun</h2></div>;
        default: return <CustomerEventManager />;
      }
    }
  };
  
  const pageTitle = menuItems.find(item => item.id === activeView)?.name || "Dashboard";

  if (!user) {
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