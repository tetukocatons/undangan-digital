// src/components/dashboard/InvitationDetailsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from './LocationPicker';
import { Invitation } from '@/lib/types';

type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export default function InvitationDetailsForm({ invitation, onUpdate }: InvitationDetailsFormProps) {
    const { supabase } = useAuth();
    const [formData, setFormData] = useState(invitation);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const [slugError, setSlugError] = useState('');
    const [initialSlug, setInitialSlug] = useState('');

    useEffect(() => {
        const slugPart = invitation.slug ? invitation.slug.replace('.arumaja.id', '') : '';
        const eventDate = invitation.event_date ? new Date(invitation.event_date).toISOString().split('T')[0] : '';
        const initialData = { ...invitation, slug: slugPart, event_date: eventDate };
        setFormData(initialData);
        setInitialSlug(slugPart);
        setSlugStatus('available');
    }, [invitation]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if(!supabase) return;
            const slug = formData.slug;
            if (slug === initialSlug) {
                setSlugStatus('available'); return;
            }
            if (!slug || slug.length < 3) {
                setSlugStatus('idle'); return;
            }
            setSlugStatus('checking'); setSlugError('');
            try {
                const { data, error } = await supabase.from('events').select('id').eq('slug', `${slug}.arumaja.id`).maybeSingle();
                if (error) throw error;
                if (data) {
                    setSlugStatus('unavailable');
                    setSlugError('URL ini sudah digunakan.');
                } else {
                    setSlugStatus('available');
                }
            } catch (err) {
                setSlugStatus('idle');
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [formData.slug, initialSlug, supabase]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === 'slug') {
            processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        }
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleLocationChange = (location: { address: string; lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, location: location.address, latitude: location.lat, longitude: location.lng }));
    };

    const handleSaveChanges = async () => {
        if (slugStatus === 'unavailable') {
            alert('URL undangan tidak tersedia. Silakan ganti dengan yang lain.');
            return;
        }
        if(!supabase) return;
        setSaving(true);
        setMessage('');
        
        const { error } = await supabase
            .from('events')
            .update({ ...formData, slug: `${formData.slug}.arumaja.id` })
            .eq('id', invitation.id);

        if (error) {
            setMessage(`Gagal menyimpan: ${error.message}`);
        } else {
            setMessage('Perubahan berhasil disimpan!');
            onUpdate();
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const isUrlLocked = invitation.status === 'paid';

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-serif text-xl font-bold text-brand-green mb-4">Informasi Dasar</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Mempelai Pria</label>
                            <input type="text" name="groom_name" value={formData.groom_name} onChange={handleChange} className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Mempelai Wanita</label>
                            <input type="text" name="bride_name" value={formData.bride_name} onChange={handleChange} className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Undangan</label>
                            <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-brand-charcoal mb-1">Tanggal Acara</label>
                            <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full p-3 bg-brand-champagne border border-brand-gold/50 rounded-lg" required />
                        </div>
                    </div>
                     <div>
                       <label className="font-semibold text-brand-charcoal">URL Undangan</label>
                       <div className={`flex items-center mt-1 border-b-2 transition-colors ${isUrlLocked ? 'bg-gray-100' : 'border-brand-champagne focus-within:border-brand-gold'}`}>
                           <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full p-3 outline-none bg-transparent disabled:cursor-not-allowed" required disabled={isUrlLocked} />
                           <span className={`pr-3 ${isUrlLocked ? 'text-gray-400' : 'text-gray-500'}`}>.arumaja.id</span>
                       </div>
                       <div className="h-5 mt-1 text-sm">
                           {isUrlLocked ? <p className="text-gray-500">URL tidak dapat diubah setelah undangan dibayar.</p> : <> {slugStatus === 'checking' && <p className="text-gray-500">Mengecek...</p>} {slugStatus === 'unavailable' && <p className="text-red-500">{slugError}</p>} {slugStatus === 'available' && formData.slug.length > 2 && <p className="text-green-600">URL tersedia!</p>} </>}
                       </div>
                    </div>
                </div>
            </div>
            <div className="border-t pt-8">
                 <h3 className="font-serif text-xl font-bold text-brand-green mb-4">Lokasi Acara</h3>
                 <LocationPicker onLocationChange={handleLocationChange} />
                 {formData.location && <div className="mt-4 p-4 bg-brand-champagne/50 rounded-lg"><p className="text-sm font-semibold text-brand-green">Lokasi Terpilih:</p><p className="text-brand-charcoal">{formData.location}</p></div>}
            </div>
            <div className="flex justify-end items-center gap-4 pt-4">
                 {message && <p className={`text-sm ${message.includes('Gagal') ? 'text-red-600' : 'text-brand-green'}`}>{message}</p>}
                <button
                    onClick={handleSaveChanges}
                    disabled={saving || slugStatus === 'unavailable'}
                    className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
}