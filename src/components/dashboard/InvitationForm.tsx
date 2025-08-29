// src/components/dashboard/InvitationsView.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Link from 'next/link';

// ... (definisi tipe Invitation, Icon, dan icons tetap sama) ...
type Invitation = {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
  slug: string;
};
const Icon = ({ path, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
const icons = {
    add: <Icon path="M12 4v16m8-8H4" />,
    edit: <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />,
    delete: <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    view: <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
};

export default function InvitationsView({ setActiveView }: { setActiveView: (view: string) => void }) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    
    // ... (state modal dan fungsi-fungsi lainnya tetap sama) ...
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Invitation | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    const fetchInvitations = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invitations:', error);
        } else {
            setInvitations(data as Invitation[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleEditClick = (invitationId: string) => {
        router.push(`/dashboard/invitation/${invitationId}/edit`);
    };
    const handleDeleteClick = (invitation: Invitation) => {
        setEventToDelete(invitation);
        setIsDeleteModalOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;
        setDeleteLoading(true);
        const { error } = await supabase.from('events').delete().eq('id', eventToDelete.id);
        if (error) {
            console.error('Error deleting event:', error);
            alert('Gagal menghapus acara.');
        } else {
            fetchInvitations();
        }
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
        setDeleteLoading(false);
    };

    return (
        <div className="space-y-6">
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} eventName={eventToDelete?.event_name || ''} loading={deleteLoading} />

            <div className="flex justify-between items-center">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Undangan Anda</h1>
                {/* PERBAIKAN LOGIKA 1: Tombol ini hanya muncul jika belum ada undangan */}
                {invitations.length === 0 && !isLoading && (
                    <button 
                        onClick={() => setActiveView('create-invitation')}
                        className="bg-brand-green text-brand-off-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        {icons.add}
                        <span>Buat Undangan Baru</span>
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-brand-champagne">
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Acara</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Tanggal</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Status</th>
                                <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-6">Memuat data...</td>
                                </tr>
                            ) : invitations.length > 0 ? (
                                // ... (kode untuk menampilkan data undangan tetap sama)
                                invitations.map(inv => (
                                    <tr key={inv.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                        <td className="p-3 font-semibold">{inv.event_name}</td>
                                        <td className="p-3">{new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-3">
                                                <Link href={`/undangan/${inv.slug}`} target="_blank" className="text-brand-gold hover:opacity-80" title="Lihat Undangan">{icons.view}</Link>
                                                <button onClick={() => handleEditClick(inv.id)} className="text-brand-green hover:opacity-80" title="Kelola">{icons.edit}</button>
                                                <button onClick={() => handleDeleteClick(inv)} className="text-red-600 hover:opacity-80" title="Hapus">{icons.delete}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-12">
                                        <p className="text-brand-charcoal/70">Belum ada undangan yang dibuat.</p>
                                        {/* PERBAIKAN TAMPILAN 2: Mengubah teks menjadi tombol yang jelas */}
                                        <button 
                                            onClick={() => setActiveView('create-invitation')} 
                                            className="mt-4 bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90"
                                        >
                                            Buat Undangan Pertama Anda!
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};