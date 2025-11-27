// src/components/dashboard/FeatureManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type InvitationFeatures = {
    couple_enabled: boolean;
    story_enabled: boolean; // Ganti dari quotes_enabled jika lebih sesuai
    gallery_enabled: boolean;
    acara_enabled: boolean;
    gift_enabled: boolean; // Tambahan fitur hadiah
};

type FeatureManagementProps = {
    invitationId: string;
    initialFeatures: Partial<InvitationFeatures>;
    onUpdate: () => void;
};

// Nama fitur yang lebih mudah dibaca untuk ditampilkan di UI
const featureLabels: { [key in keyof InvitationFeatures]: string } = {
    couple_enabled: 'Informasi Mempelai',
    story_enabled: 'Cerita Kami',
    gallery_enabled: 'Galeri Foto',
    acara_enabled: 'Detail Acara',
    gift_enabled: 'Kirim Hadiah Digital',
};

export default function FeatureManagement({ invitationId, initialFeatures, onUpdate }: FeatureManagementProps) {
    const { supabase } = useAuth();
    const [features, setFeatures] = useState<Partial<InvitationFeatures>>(initialFeatures);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setFeatures(initialFeatures);
    }, [initialFeatures]);

    const handleToggle = (feature: keyof InvitationFeatures) => {
        setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setMessage('');
        const { error } = await supabase
            .from('events')
            .update(features)
            .eq('id', invitationId);

        if (error) {
            setMessage(`Gagal menyimpan: ${error.message}`);
        } else {
            setMessage('Perubahan berhasil disimpan!');
            onUpdate(); // Memanggil refresh data di parent
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000); // Hilangkan pesan setelah 3 detik
    };
    
    // Mengecek apakah ada perubahan dari state awal
    const hasChanges = JSON.stringify(features) !== JSON.stringify(initialFeatures);

    return (
        <div className="mt-8 border-t pt-6">
            <h2 className="font-serif text-2xl font-bold text-brand-green">Fitur Undangan</h2>
            <p className="mt-1 text-brand-charcoal/80">Aktifkan atau non-aktifkan bagian yang akan tampil di halaman undangan Anda.</p>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.keys(featureLabels).map(key => {
                    const featureKey = key as keyof InvitationFeatures;
                    return (
                        <div key={featureKey} className="flex items-center justify-between bg-brand-champagne/50 p-4 rounded-lg">
                            <span className="font-semibold text-brand-charcoal">{featureLabels[featureKey]}</span>
                            <button
                                onClick={() => handleToggle(featureKey)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${features[featureKey] ? 'bg-brand-green' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${features[featureKey] ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-end items-center gap-4">
                 {message && <p className="text-sm text-brand-green">{message}</p>}
                <button
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || saving}
                    className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan Fitur'}
                </button>
            </div>
        </div>
    );
}