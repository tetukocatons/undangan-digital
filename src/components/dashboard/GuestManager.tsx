// src/components/dashboard/GuestManager.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Guest = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  event_id: string;
};

type GuestManagerProps = {
  eventId: string;
  eventName: string | null;
};

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export default function GuestManager({ eventId, eventName }: GuestManagerProps) {
    const { supabase } = useAuth();
    const [activeTab, setActiveTab] = useState('list');
    const [guests, setGuests] = useState<Guest[]>([]);
    const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const fetchGuests = useCallback(async () => {
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

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newGuest.name || (!newGuest.phone && !newGuest.email)) {
            alert('Nama dan salah satu (No HP atau Email) wajib diisi.');
            return;
        }

        setFormLoading(true);
        const { error } = await supabase.from('guests').insert([{ 
            name: newGuest.name, 
            phone: newGuest.phone || null,
            email: newGuest.email || null,
            event_id: eventId,
        }]);

        if (error) {
            alert(`Gagal menambahkan tamu: ${error.message}`);
        } else {
            setNewGuest({ name: '', phone: '', email: '' });
            await fetchGuests(); // Refresh list
        }
        setFormLoading(false);
    };
    
    const handleDeleteGuest = async (guestId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
            const { error } = await supabase.from('guests').delete().eq('id', guestId);
            if (error) {
                alert(`Gagal menghapus tamu: ${error.message}`);
            } else {
                await fetchGuests(); // Refresh list
            }
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewGuest(prev => ({ ...prev, [name]: value }));
    };

    const handleSendInvitation = (guestId: string) => {
        const guest = guests.find(g => g.id === guestId);
        alert(`Fungsionalitas "Kirim Undangan" untuk ${guest?.name} akan diimplementasikan di sini.`);
    };

    return (
        <div className="space-y-6">
            <Link href="/dashboard" className="text-sm text-brand-green hover:underline">
                &larr; Kembali ke Daftar Undangan
            </Link>
            <h1 className="font-serif text-3xl font-bold text-brand-green">Daftar Tamu</h1>
            <p className="text-brand-charcoal/80 -mt-4">
                Untuk undangan: <span className="font-semibold">{eventName || 'Memuat...'}</span>
            </p>

            <div className="border-b border-brand-gold/30">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'list' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}
                    >
                        Daftar Tamu
                    </button>
                    <button
                        onClick={() => setActiveTab('template')}
                        className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'template' ? 'border-b-2 border-brand-green text-brand-green' : 'text-brand-charcoal/70 hover:text-brand-green'}`}
                    >
                        Template Kalimat
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'list' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                            <h2 className="font-serif text-xl font-bold text-brand-green mb-4">Tambah Tamu Baru</h2>
                            <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-brand-charcoal">Nama Tamu</label>
                                    <input type="text" name="name" id="name" value={newGuest.name} onChange={handleInputChange} className="mt-1 w-full p-2 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="phone" className="block text-sm font-medium text-brand-charcoal">No. HP</label>
                                    <input type="tel" name="phone" id="phone" value={newGuest.phone} onChange={handleInputChange} className="mt-1 w-full p-2 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal">Email</label>
                                    <input type="email" name="email" id="email" value={newGuest.email} onChange={handleInputChange} className="mt-1 w-full p-2 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" />
                                </div>
                                <div className="md:col-span-1">
                                    <button type="submit" disabled={formLoading} className="w-full bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50">
                                        {formLoading ? 'Menambahkan...' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-brand-champagne">
                                            <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Tamu</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">No. HP</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Email</th>
                                            <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4} className="text-center p-8 text-brand-charcoal/70">Memuat tamu...</td></tr>
                                        ) : guests.length > 0 ? guests.map(guest => (
                                            <tr key={guest.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                                <td className="p-3 font-semibold">{guest.name}</td>
                                                <td className="p-3">{guest.phone || '-'}</td>
                                                <td className="p-3">{guest.email || '-'}</td>
                                                <td className="p-3">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <button onClick={() => handleSendInvitation(guest.id)} className="text-brand-green hover:opacity-80 flex items-center gap-1.5" title="Kirim Undangan">
                                                            <SendIcon />
                                                        </button>
                                                         <button onClick={() => handleDeleteGuest(guest.id)} className="text-red-500 hover:opacity-80" title="Hapus Tamu">
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="text-center p-8 text-brand-charcoal/70">
                                                    Belum ada tamu yang ditambahkan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'template' && (
                    <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                        <h2 className="font-serif text-xl font-bold text-brand-green mb-4">Template Kalimat Undangan</h2>
                        <p className="text-brand-charcoal/80">
                            Atur template kalimat yang akan dikirimkan bersama undangan digital Anda di sini. Fitur ini akan segera tersedia.
                        </p>
                        <textarea
                            rows={5}
                            className="w-full mt-4 p-3 bg-brand-champagne border border-brand-gold/50 rounded-lg"
                            placeholder="Contoh: Yth. Bapak/Ibu/Saudara/i [Nama Tamu], kami mengundang Anda untuk hadir di acara pernikahan kami..."
                        ></textarea>
                         <button className="mt-4 bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90">
                            Simpan Template
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}