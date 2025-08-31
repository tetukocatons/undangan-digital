// src/components/dashboard/GuestManagementView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import GuestManager from './GuestManager'; // Kita akan menggunakan kembali GuestManager

type Invitation = {
  id: string;
  event_name: string;
};

type GuestManagementViewProps = {
    invitations: Invitation[];
    isLoading: boolean;
};

export default function GuestManagementView({ invitations, isLoading }: GuestManagementViewProps) {
    // Otomatis pilih undangan pertama (terbaru) sebagai default
    const [selectedEventId, setSelectedEventId] = useState<string | undefined>(
        invitations[0]?.id
    );

    const selectedEvent = useMemo(() => {
        return invitations.find(inv => inv.id === selectedEventId);
    }, [selectedEventId, invitations]);

    if (isLoading) {
        return <div className="text-center p-6">Memuat data...</div>;
    }
    
    if (invitations.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Tamu & RSVP</h1>
                <div className="text-center p-12 bg-white rounded-lg border border-brand-gold/30">
                    <p className="text-brand-charcoal/70">Anda belum memiliki undangan. Silakan buat undangan terlebih dahulu untuk mengelola tamu.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Tamu & RSVP</h1>
                 {invitations.length > 1 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="invitation-select" className="text-sm font-semibold text-brand-charcoal">Pilih Undangan:</label>
                        <select
                            id="invitation-select"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="p-2 rounded-md bg-white border border-brand-gold/50 text-brand-charcoal"
                        >
                            {invitations.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.event_name}</option>
                            ))}
                        </select>
                    </div>
                 )}
            </div>

            {/* Render GuestManager langsung di sini dengan eventId yang dipilih */}
            {selectedEvent ? (
                <GuestManager 
                    key={selectedEvent.id} // Key penting agar komponen re-render saat ganti undangan
                    eventId={selectedEvent.id} 
                    eventName={selectedEvent.event_name} 
                />
            ) : (
                <p>Silakan pilih undangan untuk dikelola.</p>
            )}
        </div>
    );
}