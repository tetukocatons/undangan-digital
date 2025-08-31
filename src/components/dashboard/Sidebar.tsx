// src/components/dashboard/Sidebar.tsx
'use client';

import { UserProfile } from '@/contexts/AuthContext';

type SidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  profile: UserProfile | null;
  isOpen: boolean;
  toggle: () => void;
};

// --- PERUBAHAN MENU SIDEBAR ---
const menu = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'manage-invitation', name: 'Undangan' },
  { id: 'guest-management', name: 'Tamu & RSVP' },
  { id: 'settings', name: 'Pengaturan' },
  { id: 'help', name: 'Bantuan' },
  { id: 'account', name: 'Akun Saya' },
];

const adminMenu = [
    { id: 'user-management', name: 'Manajemen User', roles: ['administrator'] },
    { id: 'theme-management', name: 'Manajemen Tema', roles: ['administrator', 'staff'] },
];

export default function Sidebar({ activeView, setActiveView, onLogout, profile, isOpen, toggle }: SidebarProps) {
  
  const handleItemClick = (view: string) => {
    setActiveView(view);
    if (isOpen) {
      toggle();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <h2 className="font-serif text-2xl font-bold mb-6">
        Arumaja<span className="text-brand-gold">.</span>
      </h2>
      <nav className="space-y-2 flex-grow">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={
              'w-full text-left px-4 py-2 rounded-lg transition-colors ' +
              (activeView === item.id ? 'bg-brand-off-white/10 text-brand-gold' : 'hover:text-brand-gold')
            }
          >
            • {item.name}
          </button>
        ))}
        {profile && (profile.role === 'administrator' || profile.role === 'staff') && (
        <div className="mt-4 pt-4 border-t border-white/10">
            <p className="px-4 pb-2 text-sm font-semibold text-brand-off-white/50 uppercase tracking-wider">Admin Panel</p>
            {adminMenu.map(item => (
                item.roles.includes(profile.role) && (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={
                          'w-full text-left px-4 py-2 rounded-lg transition-colors ' +
                          (activeView === item.id ? 'bg-brand-off-white/10 text-brand-gold' : 'hover:text-brand-gold')
                        }
                    >
                        • {item.name}
                    </button>
                )
            ))}
        </div>
        )}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded-lg hover:text-brand-gold transition-colors">
          Keluar
        </button>
      </div>
    </div>
  );
  
  return (
    <>
      <aside className="w-64 bg-brand-green text-brand-off-white min-h-screen p-4 hidden md:flex flex-col">
        {sidebarContent}
      </aside>

      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      ></div>

      <aside 
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-brand-green text-brand-off-white p-4 transform transition-transform md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}