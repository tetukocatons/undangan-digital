'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Event } from './CustomerEventManager'; // Impor tipe Event

type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    eventToEdit: Event | null;
};

export default function EventModal({ isOpen, onClose, onSave, eventToEdit }: EventModalProps) {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = eventToEdit !== null;

    useEffect(() => {
        if (isEditing && eventToEdit) {
            setEventName(eventToEdit.event_name);
            setEventDate(eventToEdit.event_date);
        } else {
            setEventName('');
            setEventDate('');
        }
    }, [eventToEdit, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isEditing) {
            const { error: updateError } = await supabase.from('events').update({ event_name: eventName, event_date: eventDate }).eq('id', eventToEdit.id);
            if (updateError) setError(updateError.message); else onSave();
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setError("Anda harus login untuk membuat acara."); setLoading(false); return; }
            const { error: insertError } = await supabase.from('events').insert({ event_name: eventName, event_date: eventDate, user_id: user.id });
            if (insertError) setError(insertError.message); else onSave();
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-brand-gold/20 w-full max-w-lg">
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal mb-6">{isEditing ? 'Edit Acara' : 'Buat Acara Baru'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="eventName" className="block text-sm font-medium text-brand-charcoal">Nama Acara</label>
                        <input id="eventName" type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required placeholder="Contoh: Pernikahan Sarah & David" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold" />
                    </div>
                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-brand-charcoal">Tanggal Acara</label>
                        <input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-gold focus:border-brand-gold" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-gray-100">Batal</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 font-bold text-brand-off-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Simpan Acara'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};