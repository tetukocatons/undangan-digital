// src/app/(app)/dashboard/invitation/[id]/guests/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import GuestManager from '@/components/dashboard/GuestManager';
import { useAuth } from '@/contexts/AuthContext'; // 1. Import useAuth

export default function ManageGuestsPage() {
    const params = useParams();
    const { supabase } = useAuth(); // 2. Dapatkan supabase dari context
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [eventName, setEventName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Pastikan eventId dan supabase sudah tersedia sebelum fetch
        if (!eventId || !supabase) return;

        const fetchEventName = async () => {
            setLoading(true);
            const { data, error } = await supabase // 3. Sekarang supabase sudah terdefinisi
                .from('events')
                .select('event_name')
                .eq('id', eventId)
                .single();

            if (error) {
                console.error('Error fetching event name:', error);
                setError('Tidak dapat menemukan data undangan.');
            } else {
                setEventName(data.event_name);
            }
            setLoading(false);
        };

        fetchEventName();
    }, [eventId, supabase]); // 4. Tambahkan supabase sebagai dependency

    if (loading) {
        return <div className="p-6">Memuat data undangan...</div>;
    }
    
    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    if (!eventId) {
        return <div className="p-6">ID Undangan tidak valid.</div>;
    }

    return <GuestManager eventId={eventId} eventName={eventName} />;
}