'use client';

import Link from 'next/link';
import { User } from '@supabase/supabase-js';

// --- Type Definitions ---
type Invitation = {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
};

type DashboardViewProps = {
    user: User | null;
    stats: { invitationsCreated: number; guestsCount: number; wishesCount: number; };
    invitations: Invitation[];
};

// --- SVG Icons ---
const Icon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
const icons = {
  invitationCreated: <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  guests: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  wishes: <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
};

export default function DashboardView({ user, stats, invitations }: DashboardViewProps) {
    return (
        <div className="space-y-8">
            {/* User Status Card */}
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm space-y-4">
                <h2 className="font-serif text-3xl font-bold text-brand-charcoal">
                    {user?.user_metadata?.full_name || user?.email}
                </h2>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <span className="font-semibold bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-sm">
                        Free Trial
                    </span>
                    <Link href="/pricing" className="bg-brand-green text-brand-off-white font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity">
                        Upgrade Akun Saya
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-2xl font-bold text-brand-charcoal">Invitations by Date</h3>
                    {/* Date filter can be added here */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-brand-gold/30 shadow-sm flex items-center gap-4">
                        <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green">{icons.invitationCreated}</div>
                        <div>
                            <p className="font-bold text-2xl text-brand-charcoal">{stats.invitationsCreated}</p>
                            <p className="text-sm text-brand-charcoal/70">Undangan Dibuat</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-brand-gold/30 shadow-sm flex items-center gap-4">
                        <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green">{icons.guests}</div>
                        <div>
                            <p className="font-bold text-2xl text-brand-charcoal">{stats.guestsCount}</p>
                            <p className="text-sm text-brand-charcoal/70">Tamu Undangan</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-brand-gold/30 shadow-sm flex items-center gap-4">
                        <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green">{icons.wishes}</div>
                        <div>
                            <p className="font-bold text-2xl text-brand-charcoal">{stats.wishesCount}</p>
                            <p className="text-sm text-brand-charcoal/70">Ucapan & Do'a</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Invitations Table */}
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-4">Undangan Terakhir</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-brand-champagne">
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Acara</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Tanggal</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations && invitations.length > 0 ? (
                                invitations.map(inv => (
                                    <tr key={inv.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                        <td className="p-3 font-semibold">{inv.event_name}</td>
                                        <td className="p-3">{new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-6 text-brand-charcoal/70">Belum ada undangan yang dibuat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};