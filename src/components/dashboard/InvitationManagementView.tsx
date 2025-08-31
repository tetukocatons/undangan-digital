// src/components/dashboard/InvitationManagementView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import FeatureManagement from './FeatureManagement';
import InvitationDetailsForm from './InvitationDetailsForm';

type Invitation = {
  id: string; event_name: string; event_date: string; theme_id: string | null;
  bride_name: string; groom_name: string; slug: string; location: string;
  latitude: number | null; longitude: number | null; couple_enabled: boolean;
  story_enabled: boolean; gallery_enabled: boolean; acara_enabled: boolean; gift_enabled: boolean;
};

type InvitationManagementViewProps = {
    invitations: Invitation[];
    isLoading: boolean;
    refreshInvitations: () => void;
    // ID undangan yang sedang aktif dikelola
    managedInvitationId: string | null; 
    // Fungsi untuk mengubah ID undangan yang dikelola
    onInvitationChange: (id: string) => void;
};

export default function InvitationManagementView({ 
    invitations, 
    isLoading, 
    refreshInvitations, 
    managedInvitationId,
    onInvitationChange
}: InvitationManagementViewProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'features' | 'themes'>('details');

    const selectedInvitation = invitations.find(inv => inv.id === managedInvitationId);

    if (isLoading) {
        return <div className="text-center p-6 text-brand-charcoal/80">Memuat data...</div>;
    }

    if (!selectedInvitation) {
        return (
            <div className="space-y-6">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                <div className="text-center p-12 bg-white rounded-lg border border-brand-gold/30">
                     <p className="text-brand-charcoal/70">Anda belum memiliki undangan. Silakan buat undangan baru dari menu Dashboard.</p>
                </div>
            </div>
        );
    }
    
    const initialFeatures = {
        couple_enabled: selectedInvitation.couple_enabled, story_enabled: selectedInvitation.story_enabled,
        gallery_enabled: selectedInvitation.gallery_enabled, acara_enabled: selectedInvitation.acara_enabled,
        gift_enabled: selectedInvitation.gift_enabled,
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h1 className="font-serif text-3xl font-bold text-brand-green">Manajemen Undangan</h1>
                 {invitations.length > 1 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="inv-select" className="text-sm font-semibold text-brand-charcoal">Pilih Undangan:</label>
                        <select
                            id="inv-select"
                            value={selectedInvitation.id}
                            onChange={(e) => onInvitationChange(e.target.value)}
                            className="p-2 rounded-md bg-white border border-brand-gold/50 text-brand-charcoal"
                        >
                            {invitations.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.event_name}</option>
                            ))}
                        </select>
                    </div>
                 )}
            </div>
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <div className="border-b border-brand-gold/30 mb-6">
                    <nav className="flex space-x-4">
                        <button onClick={() => setActiveTab('details')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'details' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Informasi & Lokasi</button>
                        <button onClick={() => setActiveTab('features')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'features' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Fitur Undangan</button>
                        <button onClick={() => setActiveTab('themes')} className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'themes' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}>Pilih Tema</button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'details' && <InvitationDetailsForm invitation={selectedInvitation} onUpdate={refreshInvitations} />}
                    {activeTab === 'features' && <FeatureManagement invitationId={selectedInvitation.id} initialFeatures={initialFeatures} onUpdate={refreshInvitations} />}
                    {activeTab === 'themes' && <ThemeSelector invitationId={selectedInvitation.id} currentThemeId={selectedInvitation.theme_id} onThemeUpdate={refreshInvitations} />}
                </div>
            </div>
        </div>
    );
}