'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// --- Komponen untuk Stepper di bagian atas ---
const Stepper = ({ currentStep }) => {
    const steps = ["Mulai", "Detail Pernikahan", "Paket", "Pembayaran"];
    return (
        <div className="flex items-center w-full mb-12">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                            index + 1 === currentStep 
                                ? 'bg-brand-green text-brand-off-white' 
                                : 'border-2 border-brand-gold text-brand-gold'
                        }`}>
                            {index + 1}
                        </div>
                        <p className={`mt-2 text-xs sm:text-sm font-sans font-semibold ${
                            index + 1 === currentStep ? 'text-brand-green' : 'text-brand-charcoal/70'
                        }`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-brand-gold/50 -mx-2"></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default function CreateInvitationPage() {
    // --- State untuk setiap input form ---
    const [brideName, setBrideName] = useState('');
    const [groomName, setGroomName] = useState('');
    const [eventName, setEventName] = useState('');
    const [slug, setSlug] = useState('');
    const [eventDate, setEventDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Sesi tidak valid. Silakan login kembali.");
            setLoading(false);
            return;
        }

        const eventData = {
            user_id: user.id,
            bride_name: brideName,
            groom_name: groomName,
            event_name: eventName,
            slug: slug,
            event_date: eventDate,
            status: 'draft',
        };

        const { data: newEvent, error: insertError } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (insertError) {
            if (insertError.code === '23505') { 
                 setError('URL Undangan ini sudah digunakan. Silakan pilih yang lain.');
            } else {
                 setError('Terjadi kesalahan: ' + insertError.message);
            }
            setLoading(false);
        } else if (newEvent) {
            router.push(`/dashboard/invitation/${newEvent.id}/edit`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white p-6 sm:p-12 rounded-xl border border-brand-gold/30 shadow-sm">
                <Stepper currentStep={1} />

                <div className="mb-8">
                    <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-green">
                        Let's get started
                    </h1>
                    <p className="font-sans text-brand-charcoal/80 mt-2">
                        Harap isi formulir untuk melanjutkan pemesanan.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informasi Mempelai */}
                    <fieldset>
                        <legend className="font-serif text-xl font-bold text-brand-charcoal mb-4">Informasi Mempelai</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="Mempelai Wanita" value={brideName} onChange={(e) => setBrideName(e.target.value)} required className="w-full p-3 bg-white border border-brand-gold rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green placeholder:text-gray-400" />
                            <input type="text" placeholder="Mempelai Pria" value={groomName} onChange={(e) => setGroomName(e.target.value)} required className="w-full p-3 bg-white border border-brand-gold rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green placeholder:text-gray-400" />
                        </div>
                    </fieldset>

                    {/* Judul & URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="eventName" className="block text-sm font-medium text-brand-charcoal mb-1">Judul Undangan</label>
                            <input id="eventName" type="text" placeholder="BellaTuko" value={eventName} onChange={(e) => setEventName(e.target.value)} required className="w-full p-3 bg-white border border-brand-gold rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green placeholder:text-gray-400" />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-brand-charcoal mb-1">URL Undangan Website</label>
                            <div className="flex items-center">
                                <input type="text" id="slug" placeholder="bellatuko" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required className="w-full p-3 bg-white border border-brand-gold rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green placeholder:text-gray-400 text-right" />
                                <span className="text-brand-charcoal/70 pl-2 font-semibold">.arumaja.id</span>
                            </div>
                        </div>
                    </div>

                    {/* Tanggal Acara */}
                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-brand-charcoal mb-1">Kapan acara pernikahan kamu diselenggarakan?</label>
                        <input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="w-full p-3 bg-white border border-brand-gold rounded-lg focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green" />
                        <p className="text-xs text-gray-500 mt-1">Jangan khawatir, kamu masih bisa mengubah data di Smart Dashboard!</p>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    {/* Tombol Aksi */}
                    <div className="flex justify-between items-center pt-6">
                        <Link href="/dashboard" className="font-bold text-brand-green hover:opacity-80 transition-opacity">
                            Kembali
                        </Link>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="py-3 px-8 font-bold bg-brand-green text-brand-off-white rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-400"
                        >
                            {loading ? 'Menyimpan...' : 'Lanjut'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}