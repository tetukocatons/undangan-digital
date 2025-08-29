// src/components/dashboard/InvitationsView.tsx
'use client';

import React, { useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Invitation = {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
  slug: string;
  package: string; 
};

type InvitationsViewProps = {
  invitations: Invitation[];
  isLoading: boolean;
  refreshInvitations: () => void;
  setActiveView: (view: string) => void;
};

const Icon = ({ path, className = "h-5 w-5" }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const icons = {
    edit: <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />,
    delete: <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    view: <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    guests: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 01-2.702 0M12 15a4 4 0 110-8 4 4 0 010 8z" />
};

export default function InvitationsView({ invitations, isLoading, refreshInvitations, setActiveView }: InvitationsViewProps) {
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
                    <div className="space-y-4 md:hidden"> 
                        {invitations.map(inv => (
                            <div key={inv.id} className="border border-brand-champagne rounded-lg p-4 space-y-3">
                                <div className="font-semibold text-lg text-brand-green">{inv.event_name}</div>
                                <div className="text-sm text-brand-charcoal/80">
                                    <span className="font-semibold">Tanggal:</span> {new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {inv.status}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold">Paket:</span>
                                    <span className="ml-2 capitalize font-medium text-brand-green bg-brand-gold/20 py-1 px-2 rounded-md text-xs">
                                        {inv.package || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center gap-4 border-t pt-3 mt-3">
                                    <Link href={`/dashboard/invitation/${inv.id}/guests`} className="text-brand-charcoal/70 hover:text-brand-green" title="Daftar Tamu">{icons.guests}</Link>
                                    <Link href={`/undangan/${inv.slug}`} target="_blank" className="text-brand-gold hover:opacity-80" title="Lihat Undangan">{icons.view}</Link>
                                    <Link href={`/dashboard/invitation/${inv.id}/edit`} className="text-brand-green hover:opacity-80" title="Edit">{icons.edit}</Link>
                                    <button onClick={() => handleDeleteClick(inv)} className="text-red-600 hover:opacity-80" title="Hapus">{icons.delete}</button>
                                </div>
                            </div>
                        ))}
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
                
                <div className="overflow-x-auto hidden md:block">
                    {invitations.length > 0 && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-brand-champagne">
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Nama Acara</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Tanggal</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Paket</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60">Status</th>
                                    <th className="p-3 text-sm font-semibold uppercase text-brand-charcoal/60 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map(inv => (
                                    <tr key={inv.id} className="border-b border-brand-champagne hover:bg-brand-champagne/50">
                                        <td className="p-3 font-semibold">{inv.event_name}</td>
                                        <td className="p-3">{new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td className="p-3">
                                            <span className="capitalize font-medium text-brand-green bg-brand-gold/20 py-1 px-2 rounded-md text-xs">
                                                {inv.package || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center items-center gap-3">
                                                <Link href={`/dashboard/invitation/${inv.id}/guests`} className="text-brand-charcoal/70 hover:text-brand-green" title="Daftar Tamu">{icons.guests}</Link>
                                                <Link href={`/undangan/${inv.slug}`} target="_blank" className="text-brand-gold hover:opacity-80" title="Lihat Undangan">{icons.view}</Link>
                                                <Link href={`/dashboard/invitation/${inv.id}/edit`} className="text-brand-green hover:opacity-80" title="Edit">{icons.edit}</Link>
                                                <button onClick={() => handleDeleteClick(inv)} className="text-red-600 hover:opacity-80" title="Hapus">{icons.delete}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};