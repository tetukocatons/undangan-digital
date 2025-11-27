// src/components/dashboard/InvitationsView.tsx
'use client';

import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Invitation } from '@/lib/types';

const Icon = ({ path, className = "h-5 w-5" }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const icons = {
    edit: <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />,
    delete: <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    view: <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    continue: <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" />
};

export default function InvitationsView({ invitations, isLoading, refreshInvitations, setActiveView, onManageInvitation }: InvitationsViewProps) {
    const { supabase } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Invitation | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteClick = (invitation: Invitation) => {
        setEventToDelete(invitation);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;
        setDeleteLoading(true);
        const { error } = await supabase.from('events').delete().eq('id', eventToDelete.id);
        
        if (error) {
            alert('Gagal menghapus acara.');
        } else {
            refreshInvitations();
        }

        setIsDeleteModalOpen(false);
        setEventToDelete(null);
        setDeleteLoading(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
                eventName={eventToDelete?.event_name || ''} 
                loading={deleteLoading} 
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="font-serif text-3xl font-bold text-brand-green">Undangan Anda</h1>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-brand-gold/30 shadow-sm">
                {isLoading ? (
                    <div className="text-center p-6 text-brand-charcoal/80">Memuat data...</div>
                ) : invitations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[768px]">
                            <thead>
                                <tr className="border-b-2 border-brand-champagne">
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Acara</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Tanggal Acara</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Masa Berlaku</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Status</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map(inv => (
                                    <tr key={inv.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                        <td className="p-3 font-semibold text-brand-green">{inv.event_name}</td>
                                        <td className="p-3">{formatDate(inv.event_date)}</td>
                                        <td className="p-3 font-medium text-gray-700">{formatDate(inv.valid_to)}</td>
                                        <td className="p-3">
                                            <span className={`capitalize px-2.5 py-1 text-xs font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                {inv.status === 'draft' ? (
                                                    <button 
                                                        onClick={() => setActiveView('create-invitation', inv.id)} 
                                                        className="p-2 text-brand-green hover:opacity-80 flex items-center gap-1 font-semibold" 
                                                        title="Lanjutkan Membuat Undangan"
                                                    >
                                                        {icons.continue} Lanjutkan
                                                    </button>
                                                ) : (
                                                    <>
                                                        <Link href={`/undangan/${inv.slug}`} target="_blank" className="p-2 text-brand-gold hover:opacity-80" title="Lihat Undangan">{icons.view}</Link>
                                                        <button onClick={() => onManageInvitation(inv.id)} className="p-2 text-brand-green hover:opacity-80" title="Kelola Undangan">{icons.edit}</button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDeleteClick(inv)} className="p-2 text-red-600 hover:opacity-80" title="Hapus">{icons.delete}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-12">
                        <p className="text-brand-charcoal/70">Belum ada undangan yang dibuat.</p>
                        <button 
                            onClick={() => setActiveView('create-invitation')} 
                            className="mt-4 bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90"
                        >
                            Buat Undangan Pertama Anda!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};