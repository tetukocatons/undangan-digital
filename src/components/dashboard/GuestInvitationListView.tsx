// src/components/dashboard/GuestInvitationListView.tsx
'use client';

import React from 'react';
import Link from 'next/link';

type Invitation = {
  id: string;
  event_name: string;
  event_date: string;
};

type GuestInvitationListViewProps = {
    invitations: Invitation[];
    isLoading: boolean;
};

export default function GuestInvitationListView({ invitations, isLoading }: GuestInvitationListViewProps) {
    if (isLoading) {
        return <div className="text-center p-6 text-brand-charcoal/80">Memuat data undangan...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Tamu & RSVP</h1>
            <p className="text-brand-charcoal/80">Pilih undangan untuk melihat dan mengelola daftar tamu serta status RSVP.</p>
            
            {invitations.length > 0 ? (
                <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {invitations.map(inv => (
                            <div key={inv.id} className="border border-brand-champagne rounded-lg p-4 flex flex-col justify-between">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-brand-green">{inv.event_name}</h2>
                                    <p className="text-sm text-brand-charcoal/70 mt-1">
                                        {new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <Link 
                                    href={`/dashboard/invitation/${inv.id}/guests`}
                                    className="mt-4 text-center w-full bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90"
                                >
                                    Kelola Tamu
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center p-12 bg-white rounded-lg border border-brand-gold/30">
                    <p className="text-brand-charcoal/70">Anda belum memiliki undangan untuk dikelola tamunya.</p>
                </div>
            )}
        </div>
    );
}