'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import EventModal from './EventModal'; // Kita akan buat file ini selanjutnya
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Dan ini juga

// Definisikan tipe untuk Event
export type Event = {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
};

export default function CustomerEventManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching events:', error);
        else setEvents(data as Event[]);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleCreateClick = () => {
        setEventToEdit(null);
        setIsEventModalOpen(true);
    };

    const handleEditClick = (event: Event) => {
        setEventToEdit(event);
        setIsEventModalOpen(true);
    };
    
    const handleDeleteClick = (event: Event) => {
        setEventToDelete(event);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;
        setDeleteLoading(true);
        const { error } = await supabase.from('events').delete().eq('id', eventToDelete.id);
        if (error) {
            console.error('Error deleting event:', error);
        } else {
            fetchEvents();
        }
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
        setDeleteLoading(false);
    };

    const handleSave = () => {
        setIsEventModalOpen(false);
        fetchEvents();
    };

    return (
        <div className="space-y-8">
            <EventModal 
                isOpen={isEventModalOpen} 
                onClose={() => setIsEventModalOpen(false)} 
                onSave={handleSave}
                eventToEdit={eventToEdit}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                eventName={eventToDelete?.event_name || ''}
                loading={deleteLoading}
            />
            <button onClick={handleCreateClick} className="bg-brand-green text-brand-off-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Buat Acara Baru
            </button>
            
            {isLoading ? <p>Memuat data acara...</p> : events.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-xl font-semibold text-brand-charcoal">Belum Ada Acara</h3>
                    <p className="text-gray-500 mt-2">Klik tombol "Buat Acara Baru" untuk memulai.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white p-6 rounded-lg border border-brand-gold/30 shadow-sm space-y-4 flex flex-col">
                            <div className="flex-grow">
                                <h3 className="font-serif text-xl font-bold text-brand-green">{event.event_name}</h3>
                                <p className="text-sm text-brand-charcoal/70 mt-1">Tanggal Acara: {new Date(event.event_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {event.status}
                                </span>
                                <div className="space-x-3">
                                    <button onClick={() => handleEditClick(event)} className="text-sm font-semibold text-brand-green hover:underline">Kelola</button>
                                    <button onClick={() => handleDeleteClick(event)} className="text-sm font-semibold text-red-600 hover:underline">Hapus</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}