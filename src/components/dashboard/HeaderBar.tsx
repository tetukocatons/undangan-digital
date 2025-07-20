'use client';

import { User } from '@supabase/supabase-js';

type HeaderBarProps = {
    title: string;
    onMenuClick: () => void;
    user: User | null;
};

// --- SVG ICONS ---
const icons = {
  menu: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
};

export default function HeaderBar({ title, onMenuClick, user }: HeaderBarProps) {
    return (
        <header className="bg-brand-champagne/80 backdrop-blur-sm sticky top-0 z-20 p-4 flex items-center justify-between border-b border-brand-gold/20">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden text-brand-green">
                    {icons.menu}
                </button>
                <h1 className="font-serif text-3xl font-bold text-brand-green">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <input type="text" placeholder="Search..." className="bg-white border border-brand-gold/30 rounded-full py-2 px-4 pl-10 text-sm w-40 md:w-64 focus:ring-brand-gold focus:border-brand-gold" />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-charcoal/50">{icons.search}</div>
                </div>
                <button className="text-brand-green/70 hover:text-brand-green">{icons.bell}</button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center font-bold text-brand-green">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm">{user?.email}</p>
                        <p className="text-xs text-brand-charcoal/60">Customer</p>
                    </div>
                </div>
            </div>
        </header>
    );
}