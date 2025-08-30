// src/components/dashboard/ThemeSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Theme = {
    id: string;
    name: string;
    preview_url?: string;
};

type ThemeSelectorProps = {
    invitationId: string;
    currentThemeId: string | null;
    onThemeUpdate: () => void; // Callback untuk refresh data
};

export default function ThemeSelector({ invitationId, currentThemeId, onThemeUpdate }: ThemeSelectorProps) {
    const { supabase } = useAuth();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(currentThemeId);

    useEffect(() => {
        const fetchThemes = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('themes').select('*').eq('is_public', true);
            if (error) console.error("Gagal memuat tema:", error);
            else setThemes(data as Theme[]);
            setLoading(false);
        };
        fetchThemes();
    }, [supabase]);

    const handleSaveTheme = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('events')
            .update({ theme_id: selectedTheme })
            .eq('id', invitationId);

        if (error) {
            alert(`Gagal menyimpan tema: ${error.message}`);
        } else {
            alert('Tema berhasil disimpan!');
            onThemeUpdate(); // Panggil callback untuk refresh
        }
        setSaving(false);
    };

    return (
        <div className="mt-6">
            <h2 className="font-serif text-2xl font-bold text-brand-green">Pilih Tema Undangan</h2>
            <p className="mt-1 text-brand-charcoal/80">Pilih desain yang paling Anda sukai untuk undangan ini.</p>
            {loading ? <div className="text-center p-8">Memuat tema...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {themes.map(theme => (
                        <div key={theme.id} onClick={() => setSelectedTheme(theme.id)} className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedTheme === theme.id ? 'border-brand-gold bg-brand-champagne' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                            <div className="w-full h-48 bg-gray-200 rounded-md">
                                <img src={theme.preview_url || 'https://placehold.co/400x300/F4EFE6/2A4032?text=Preview'} alt={theme.name} className="w-full h-full object-cover rounded-md"/>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-brand-green mt-4 text-center">{theme.name}</h3>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSaveTheme} 
                    disabled={!selectedTheme || saving || selectedTheme === currentThemeId} 
                    className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Tema'}
                </button>
            </div>
        </div>
    );
}