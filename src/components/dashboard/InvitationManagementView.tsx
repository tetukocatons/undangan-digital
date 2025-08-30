// src/components/dashboard/InvitationManagementView.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ThemeSelector from './ThemeSelector';

type Invitation = {
  id: string;
  event_name: string;
  event_date: string;
  theme_id: string | null;
};

type InvitationManagementViewProps = {
    invitations: Invitation[];
    isLoading: boolean;
    refreshInvitations: () => void;
};

export default function InvitationManagementView({ invitations, isLoading, refreshInvitations }: InvitationManagementViewProps) {
    const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

    if (isLoading) {
        return <div className="text-center p-6 text-brand-charcoal/80">Memuat data undangan...</div>;
    }

    if (!selectedInvitation) {
        return (
            <div className="space-y-6">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                <p className="text-brand-charcoal/80">Pilih undangan yang ingin Anda kelola untuk mengatur tema dan daftar tamu.</p>
                
                {invitations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-brand-green">{inv.event_name}</h2>
                                    <p className="text-sm text-brand-charcoal/70 mt-1">
                                        {new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedInvitation(inv)}
                                    className="mt-4 w-full bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90"
                                >
                                    Kelola
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center p-12 text-brand-charcoal/70">Anda belum memiliki undangan. Silakan buat di halaman Dashboard.</p>
                )}
            </div>
        );
    }

    // Jika sudah ada undangan yang dipilih
    return (
        <div>
            <button onClick={() => setSelectedInvitation(null)} className="text-sm text-brand-green hover:underline mb-4">
                &larr; Kembali ke Daftar Undangan
            </button>
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <h1 className="font-serif text-xl font-bold text-brand-green">{selectedInvitation.event_name}</h1>
                <div className="mt-4 border-t pt-4">
                    <Link 
                        href={`/dashboard/invitation/${selectedInvitation.id}/guests`}
                        className="inline-block bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90"
                    >
                        Kelola Daftar Tamu
                    </Link>
                </div>
                <ThemeSelector 
                    invitationId={selectedInvitation.id}
                    currentThemeId={selectedInvitation.theme_id}
                    onThemeUpdate={() => {
                        // Refresh data dan reset view untuk melihat perubahan
                        refreshInvitations();
                        setSelectedInvitation(null);
                    }}
                />
            </div>
        </div>
    );
}