// src/components/dashboard/GuestManager.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostgrestError } from '@supabase/supabase-js'; // Import tipe Error
import { Guest, GuestRsvpStatus } from '@/lib/types';

type GuestManagerProps = {
  eventId: string;
  eventName: string | null;
};
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const QrCodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /><path d="M3 10h18M3 14h18" /></svg>;
// ---

export default function GuestManager({ eventId, eventName }: GuestManagerProps) {
    const { supabase } = useAuth();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [newGuest, setNewGuest] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const fetchGuests = useCallback(async () => {
        // ... (fungsi ini sudah benar)
        if (!eventId || !supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching guests:', error);
            alert('Gagal memuat daftar tamu.');
        } else {
            setGuests(data as Guest[]);
        }
        setLoading(false);
    }, [eventId, supabase]);

    useEffect(() => {
        fetchGuests();
    }, [fetchGuests]);

    // --- PERBAIKAN: Logika Pengecekan Duplikasi ---
    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuest.name || !newGuest.phone) {
            alert('Nama Tamu dan No. WhatsApp wajib diisi.');
            return;
        }
        if (!supabase) return; // Pastikan supabase ada

        setFormLoading(true);

        try {
            const trimmedPhone = newGuest.phone.trim();
            
            // Hapus pengecekan 'select' manual. Langsung insert.
            const { error: insertError } = await supabase.from('guests').insert([{
                name: newGuest.name.trim(),
                phone: trimmedPhone,
                event_id: eventId,
            }]);

            if (insertError) {
                // Tangkap error spesifik dari unique constraint
                if (insertError.code === '23505') { // Kode Postgres untuk "unique_violation"
                    throw new Error('Tamu dengan No. WhatsApp tersebut sudah ada di dalam daftar.');
                } else {
                    throw new Error(`Gagal menambahkan tamu: ${insertError.message}`);
                }
            }

            setNewGuest({ name: '', phone: '' });
            await fetchGuests(); // Refresh daftar tamu

        } catch (error: any) {
            alert(error.message);
        } finally {
            setFormLoading(false);
        }
    };
    
    // ... (sisa fungsi: handleDeleteGuest, handleRsvpChange, handleInputChange, showBarcode, dan JSX return) ...
    // ... (Tidak perlu diubah) ...
    const handleDeleteGuest = async (guestId: string) => {
        if (!supabase) return;
        if (confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
            const { error } = await supabase.from('guests').delete().eq('id', guestId);
            if (error) alert(`Gagal menghapus tamu: ${error.message}`);
            else await fetchGuests();
        }
    };
    
    const handleRsvpChange = async (guestId: string, newStatus: Guest['rsvp_status']) => {
        if (!supabase) return;
        const { error } = await supabase
            .from('guests')
            .update({ rsvp_status: newStatus })
            .eq('id', guestId);
        if (error) alert(`Gagal update status: ${error.message}`);
        else await fetchGuests();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setNewGuest(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setNewGuest(prev => ({ ...prev, [name]: value }));
        }
    };

    const showBarcode = (guest: Guest) => {
        alert(`Tampilkan Barcode untuk: ${guest.name}\nID: ${guest.qr_code_id}\n\nIntegrasi dengan layanan generator QR Code dapat dilakukan di sini.`);
    };

    return (
        <div className="space-y-6">
            <p className="text-brand-charcoal/80 -mt-4">
                Menampilkan tamu untuk undangan: <span className="font-semibold">{eventName || 'Memuat...'}</span>
            </p>
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-brand-green mb-4">Tambah Tamu Baru</h2>
                <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="name" className="block text-sm font-medium text-brand-charcoal">Nama Tamu *</label>
                        <input type="text" name="name" id="name" value={newGuest.name} onChange={handleInputChange} className="mt-1 w-full p-2 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-charcoal">No. WhatsApp *</label>
                        <input type="tel" name="phone" id="phone" value={newGuest.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" placeholder="Contoh: 08123456789" required />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" disabled={formLoading} className="w-full bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                            {formLoading ? 'Menambahkan...' : 'Tambah Tamu'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b-2 border-brand-champagne">
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Tamu</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">No. WA</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Status RSVP</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Jml. Hadir</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-brand-charcoal/70">Memuat tamu...</td></tr>
                            ) : guests.length > 0 ? guests.map(guest => (
                                <tr key={guest.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                    <td className="p-3 font-semibold">{guest.name}</td>
                                    <td className="p-3">{guest.phone || '-'}</td>
                                    <td className="p-3">
                                        <select 
                                            value={guest.rsvp_status} 
                                            onChange={(e) => handleRsvpChange(guest.id, e.target.value as GuestRsvpStatus)}
                                            className="p-1 rounded-md bg-white border border-gray-300"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Declined">Declined</option>
                                        </select>
                                    </td>
                                    <td className="p-3 text-center">{guest.attendance_count}</td>
                                    <td className="p-3">
                                        <div className="flex justify-center items-center gap-4">
                                            <button onClick={() => showBarcode(guest)} className="text-brand-green hover:opacity-80" title="Tampilkan Barcode"><QrCodeIcon /></button>
                                            <button className="text-blue-500 hover:opacity-80" title="Kirim Undangan WA"><SendIcon /></button>
                                            <button onClick={() => handleDeleteGuest(guest.id)} className="text-red-500 hover:opacity-80" title="Hapus Tamu"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="text-center p-8 text-brand-charcoal/70">Belum ada tamu yang ditambahkan untuk undangan ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}