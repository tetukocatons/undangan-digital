'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';

// --- Type Definitions ---
type MenuItem = {
  id: string;
  name: string;
  icon: JSX.Element;
};

type SidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
};

// --- SVG Icons ---
const Icon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const icons = {
  dashboard: <Icon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  invitations: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  invoice: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  tutorial: <Icon path="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />,
  profile: <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  logout: <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
};

// --- Menu Definitions ---
export const mainMenu: MenuItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: icons.dashboard },
    { id: 'invitations', name: 'Undangan Saya', icon: icons.invitations },
    { id: 'invoice', name: 'Invoice', icon: icons.invoice },
    { id: 'tutorial', name: 'Tutorial', icon: icons.tutorial },
];
export const accountMenu: MenuItem[] = [
    { id: 'profile', name: 'Edit Profil', icon: icons.profile },
];

export default function Sidebar({ activeView, setActiveView, onLogout }: SidebarProps) {
    return (
        <aside className="bg-brand-green text-brand-off-white w-64 min-h-screen flex-col hidden md:flex">
            <div className="p-6 text-center border-b border-brand-off-white/10">
                <Link href="/">
                    <h1 className="font-serif text-3xl font-bold text-brand-off-white">
                        Arumaja<span className="text-brand-gold">.</span>
                    </h1>
                </Link>
            </div>
            <nav className="flex-grow p-4 space-y-6">
                <div>
                    <h3 className="px-4 text-xs font-semibold uppercase text-brand-off-white/50 mb-2">Main Menu</h3>
                    {mainMenu.map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-300 ${activeView === item.id ? 'text-brand-gold bg-brand-off-white/10' : 'hover:text-brand-gold'}`}>
                            {item.icon}
                            <span className="font-semibold">{item.name}</span>
                        </button>
                    ))}
                </div>
                <div>
                    <h3 className="px-4 text-xs font-semibold uppercase text-brand-off-white/50 mb-2">Account</h3>
                    {accountMenu.map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-300 ${activeView === item.id ? 'text-brand-gold bg-brand-off-white/10' : 'hover:text-brand-gold'}`}>
                            {item.icon}
                            <span className="font-semibold">{item.name}</span>
                        </button>
                    ))}
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-300 hover:text-red-400">
                        {icons.logout}
                        <span className="font-semibold">Log Out</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}