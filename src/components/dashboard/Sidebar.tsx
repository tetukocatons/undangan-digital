// src/components/dashboard/Sidebar.tsx
'use client';

import { UserProfile } from '@/contexts/AuthContext'; // Impor tipe UserProfile

type SidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  profile: UserProfile | null; // <-- TAMBAHKAN PROPS profile
};

const menu = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'invitations', name: 'Undangan' },
  // Hapus menu yang akan dibuat dinamis
  // { id: 'invoice', name: 'Invoice' },
  // { id: 'tutorial', name: 'Tutorial' },
  { id: 'account', name: 'Akun' },
];

// Menu khusus untuk admin dan staff
const adminMenu = [
    { id: 'user-management', name: 'Manajemen User', roles: ['administrator'] },
    { id: 'theme-management', name: 'Manajemen Tema', roles: ['administrator', 'staff'] },
];

export default function Sidebar({ activeView, setActiveView, onLogout, profile }: SidebarProps) {
  return (
    <aside className="w-64 bg-brand-green text-brand-off-white min-h-screen p-4 hidden md:block">
      <h2 className="font-serif text-2xl font-bold mb-6">
        Arumaja<span className="text-brand-gold">.</span>
      </h2>
      <nav className="space-y-2">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={
              'w-full text-left px-4 py-2 rounded-lg ' +
              (activeView === item.id ? 'bg-brand-off-white/10 text-brand-gold' : 'hover:text-brand-gold')
            }
          >
            • {item.name}
          </button>
        ))}
      </nav>

      {/* Tampilkan menu admin jika role-nya cocok */}
      {profile && (profile.role === 'administrator' || profile.role === 'staff') && (
        <div className="mt-4 pt-4 border-t border-white/10">
            <p className="px-4 pb-2 text-sm font-semibold text-brand-off-white/50 uppercase tracking-wider">Admin Panel</p>
            {adminMenu.map(item => (
                // Hanya render jika role pengguna ada di dalam array roles item menu
                item.roles.includes(profile.role) && (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={
                          'w-full text-left px-4 py-2 rounded-lg ' +
                          (activeView === item.id ? 'bg-brand-off-white/10 text-brand-gold' : 'hover:text-brand-gold')
                        }
                    >
                        • {item.name}
                    </button>
                )
            ))}
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded-lg hover:text-brand-gold">
          Keluar
        </button>
      </div>
    </aside>
  );
}