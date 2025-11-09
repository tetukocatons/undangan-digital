// src/components/dashboard/InvitationManagementView.tsx
'use client';

import React, { useState } from 'react';
import ThemeSelector from './ThemeSelector';
import FeatureManagement from './FeatureManagement';
import InvitationDetailsForm from './InvitationDetailsForm';
import GiftManagement from './GiftManagement'; // <-- Impor komponen baru untuk Hadiah
import { Invitation } from '@/lib/types';

// Komponen Notifikasi untuk Undangan Draft
const DraftNotification = ({ invitationId, setActiveView }: { invitationId: string, setActiveView: (view: string, id?: string) => void }) => (
    <div className="text-center p-12 bg-yellow-50 border border-yellow-300 rounded-lg">
        <h3 className="font-serif text-xl font-bold text-yellow-800">Undangan Belum Selesai</h3>
        <p className="mt-2 text-yellow-700">
            Undangan ini masih dalam status **Draft**. <br/>
            Harap lanjutkan proses pembuatan dan pembayaran untuk dapat mengelola fitur dan tema undangan.
        </p>
        <button
            onClick={() => setActiveView('create-invitation', invitationId)}
            className="mt-4 bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90"
        >
            Lanjutkan Pembuatan Undangan
        </button>
    </div>
);


export default function InvitationManagementView({ 
    invitations, 
    isLoading, 
    refreshInvitations, 
    managedInvitationId,
    onInvitationChange,
    setActiveView
}: InvitationManagementViewProps) {
    // Tambahkan 'gift' ke tipe state untuk tab aktif
    const [activeTab, setActiveTab] = useState<'details' | 'features' | 'themes' | 'gift'>('details');
    
    const paidInvitations = invitations.filter(inv => inv.status === 'paid');
    const selectedInvitation = invitations.find(inv => inv.id === managedInvitationId);

    if (isLoading) {
        return <div className="text-center p-6 text-brand-charcoal/80">Memuat data...</div>;
    }
    
    if (paidInvitations.length === 0) {
        const draftInvitation = invitations.find(inv => inv.status === 'draft');
        return (
             <div className="space-y-6">
                 <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                 {draftInvitation ? (
                     <DraftNotification invitationId={draftInvitation.id} setActiveView={setActiveView} />
                 ) : (
                    <div className="text-center p-12 bg-white rounded-lg border border-brand-gold/30">
                        <p className="text-brand-charcoal/70">Anda belum memiliki undangan yang sudah terbayar untuk dikelola.</p>
                    </div>
                 )}
            </div>
        );
    }

    if (!selectedInvitation) {
         // Secara default, pilih undangan berbayar pertama jika belum ada yang dipilih
         const firstPaidId = paidInvitations[0]?.id;
         if (firstPaidId) {
             onInvitationChange(firstPaidId);
         }
         return <div className="p-6">Pilih undangan untuk dikelola.</div>;
    }

    if (selectedInvitation.status === 'draft') {
        return (
            <div className="space-y-6">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                <DraftNotification invitationId={selectedInvitation.id} setActiveView={setActiveView} />
            </div>
        );
    }

    const initialFeatures = {
        couple_enabled: selectedInvitation.couple_enabled, 
        story_enabled: selectedInvitation.story_enabled,
        gallery_enabled: selectedInvitation.gallery_enabled, 
        acara_enabled: selectedInvitation.acara_enabled,
        gift_enabled: selectedInvitation.gift_enabled,
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                 {paidInvitations.length > 1 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="inv-select" className="text-sm font-semibold text-brand-charcoal">Pilih Undangan:</label>
                        <select
                            id="inv-select"
                            value={selectedInvitation.id}
                            onChange={(e) => onInvitationChange(e.target.value)}
                            className="p-2 rounded-md bg-white border border-brand-gold/50 text-brand-charcoal"
                        >
                            {paidInvitations.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.event_name}</option>
                            ))}
                        </select>
                    </div>
                 )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <div className="border-b border-brand-gold/30 mb-6">
                    {/* Membuat navigasi tab bisa di-scroll di layar kecil */}
                    <nav className="flex space-x-4 overflow-x-auto pb-2 -mx-6 px-6">
                        <button onClick={() => setActiveTab('details')} className={`py-2 px-3 sm:px-4 font-semibold transition-colors flex-shrink-0 ${activeTab === 'details' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Informasi & Lokasi</button>
                        <button onClick={() => setActiveTab('features')} className={`py-2 px-3 sm:px-4 font-semibold transition-colors flex-shrink-0 ${activeTab === 'features' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Fitur Undangan</button>
                        <button onClick={() => setActiveTab('gift')} className={`py-2 px-3 sm:px-4 font-semibold transition-colors flex-shrink-0 ${activeTab === 'gift' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Hadiah Digital</button>
                        <button onClick={() => setActiveTab('themes')} className={`py-2 px-3 sm:px-4 font-semibold transition-colors flex-shrink-0 ${activeTab === 'themes' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Pilih Tema</button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'details' && <InvitationDetailsForm invitation={selectedInvitation} onUpdate={refreshInvitations} />}
                    {activeTab === 'features' && <FeatureManagement invitationId={selectedInvitation.id} initialFeatures={initialFeatures} onUpdate={refreshInvitations} />}
                    {activeTab === 'gift' && <GiftManagement invitation={selectedInvitation} onUpdate={refreshInvitations} />}
                    {activeTab === 'themes' && <ThemeSelector invitationId={selectedInvitation.id} currentThemeId={selectedInvitation.theme_id} onThemeUpdate={refreshInvitations} />}
                </div>
            </div>
        </div>
    );
}