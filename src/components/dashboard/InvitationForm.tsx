// src/components/dashboard/InvitationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from './LocationPicker';
import ConfirmationModal from './ConfirmationModal';

type Theme = {
    id: string;
    name: string;
    preview_url?: string;
};

type FormData = {
    bride_name: string; groom_name: string; event_name: string; slug: string; event_date: string;
    location: string; latitude: number | null; longitude: number | null;
    couple_enabled: boolean; quotes_enabled: boolean; gallery_enabled: boolean; acara_enabled: boolean;
    selected_package: string; status: string; theme_id: string;
};

type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';

const Stepper = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => {
    return (
        <div className="flex items-center justify-between mb-8 w-full">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;
                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                    isActive ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300 bg-brand-champagne text-brand-charcoal'
                                }`}
                            >
                                {stepNumber}
                            </div>
                            <p className={`mt-2 text-xs sm:text-sm transition-colors duration-300 ${isActive ? 'text-brand-green font-semibold' : 'text-gray-500'}`}>{label}</p>
                        </div>
                        {stepNumber < steps.length && <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${isActive ? 'bg-brand-green' : 'bg-brand-champagne'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default function InvitationForm({ setActiveView, invitationId }: { setActiveView?: (view: string) => void; invitationId?: string; }) {
    const { supabase } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        bride_name: '', groom_name: '', event_name: '', slug: '', event_date: '', 
        location: '', latitude: null, longitude: null,
        couple_enabled: true, quotes_enabled: true, gallery_enabled: true, acara_enabled: true,
        selected_package: 'silver',
        status: 'draft',
        theme_id: '',
    });
    const [currentInvitationId, setCurrentInvitationId] = useState<string | null>(invitationId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const router = useRouter();

    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const [slugError, setSlugError] = useState('');
    const [initialSlug, setInitialSlug] = useState<string | null>(null);
    
    const isEditMode = !!invitationId;
    const formSteps = isEditMode ? ["Detail", "Lokasi"] : ["Mulai", "Lokasi", "Tema", "Paket", "Bayar"];

    useEffect(() => {
        if (step !== 1) return;
        const handler = setTimeout(async () => {
            const slug = formData.slug;
            if (isEditMode && slug === initialSlug) {
                setSlugStatus('available'); return;
            }
            if (!slug || slug.length < 3) {
                setSlugStatus('idle'); return;
            }
            setSlugStatus('checking'); setSlugError('');
            try {
                const finalSlug = `${slug}.arumaja.id`;
                const { data: exists } = await supabase.rpc('slug_exists', { slug_to_check: finalSlug });
                if (exists) {
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
    }, [formData.slug, step, initialSlug, isEditMode, supabase]);

    useEffect(() => {
        if (isEditMode && invitationId) {
            const fetchInvitationData = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('events').select('*').eq('id', invitationId).single();
                if (error) {
                    setError('Gagal memuat data undangan.');
                } else if (data) {
                    const slugPart = data.slug ? data.slug.replace('.arumaja.id', '') : '';
                    const eventDate = data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : '';
                    setFormData({ ...data, slug: slugPart, event_date: eventDate, selected_package: data.package || 'silver' });
                    setInitialSlug(slugPart);
                    setSlugStatus('available');
                }
                setLoading(false);
            };
            fetchInvitationData();
        }
    }, [invitationId, isEditMode, supabase]);

    const handleBack = () => setStep(prev => prev - 1);
    const onCancel = () => setActiveView?.('invitations');

    // --- FUNGSI YANG DIPERBAIKI ---
    const saveChanges = async (newData: Partial<FormData>) => {
        setLoading(true); setError('');
        
        // Selalu update state formData agar konsisten
        setFormData(prev => ({ ...prev, ...newData }));

        if (currentInvitationId) {
            const { error: updateError } = await supabase.from('events').update(newData).eq('id', currentInvitationId);
            if (updateError) {
                setError(`Gagal menyimpan perubahan: ${updateError.message}`);
                setLoading(false);
                return false;
            }
        } else {
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_new_event', {
                bride_name_in: newData.bride_name,
                groom_name_in: newData.groom_name,
                event_name_in: newData.event_name,
                slug_in: `${newData.slug}.arumaja.id`,
                event_date_in: newData.event_date,
                location_in: newData.location,
                latitude_in: newData.latitude,
                longitude_in: newData.longitude,
                couple_enabled_in: newData.couple_enabled,
                quotes_enabled_in: newData.quotes_enabled,
                gallery_enabled_in: newData.gallery_enabled,
                acara_enabled_in: newData.acara_enabled,
                package_in: newData.selected_package,
                theme_id_in: newData.theme_id || null,
                status_in: 'draft'
            });

            if (rpcError || rpcData?.[0]?.status_code !== 200) {
                setError(`Gagal membuat draft: ${rpcError?.message || rpcData?.[0]?.message}`);
                setLoading(false);
                return false;
            }
            setCurrentInvitationId(rpcData[0].event_id);
        }
        setLoading(false);
        return true;
    };
    
    const handleStepChange = async (targetStep: number) => {
        const success = await saveChanges({ ...formData, status: 'draft' });
        if (success) {
            setStep(targetStep);
        }
    };
    
    const finalSubmit = async () => {
        const success = await saveChanges({ ...formData, status: 'published' });
        if (success) {
            alert('Selamat! Undangan Anda telah berhasil dipublikasikan.');
            setActiveView?.('invitations');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        
        let processedValue = finalValue;
        if (name === 'slug') {
            processedValue = String(finalValue).toLowerCase().replace(/[^a-z0-9-]/g, '');
            setSlugStatus('idle');
        }
        setFormData(prev => ({ ...prev, [name]: processedValue as any }));
    };

    const handleLocationChange = (location: { address: string; lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, location: location.address, latitude: location.lat, longitude: location.lng }));
    };

    const handlePackageSelect = (packageName: string) => {
        setFormData(prev => ({ ...prev, selected_package: packageName }));
    };

    const handleThemeSelect = (themeId: string) => {
        setFormData(prev => ({...prev, theme_id: themeId }));
    }

    return (
        <div className="bg-white p-4 sm:p-8 rounded-lg border border-brand-gold/30 shadow-sm max-w-3xl mx-auto">
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    setConfirmModalOpen(false);
                    handleStepChange(5);
                }}
                data={formData}
            />

            <Stepper currentStep={step} steps={formSteps} />
            <div className="mt-8">
                {isEditMode ? (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={() => handleStepChange(2)} onCancel={onCancel} isEditMode slugStatus={slugStatus} slugError={slugError} />}
                        {step === 2 && <Step2Lokasi formData={formData} onLocationChange={handleLocationChange} onBack={handleBack} onSubmit={() => saveChanges(formData)} loading={loading} error={error} />}
                    </>
                ) : (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={() => handleStepChange(2)} onCancel={onCancel} slugStatus={slugStatus} slugError={slugError} />}
                        {step === 2 && <Step2Lokasi formData={formData} onLocationChange={handleLocationChange} onBack={handleBack} onNext={() => handleStepChange(3)} isCreateMode />}
                        {step === 3 && <Step3Tema selectedTheme={formData.theme_id} onSelect={handleThemeSelect} onBack={handleBack} onNext={() => handleStepChange(4)} />}
                        {step === 4 && <Step4Paket selectedPackage={formData.selected_package} onSelect={handlePackageSelect} onBack={handleBack} onNext={() => setConfirmModalOpen(true)} />}
                        {step === 5 && <Step5Pembayaran selectedPackage={formData.selected_package} onBack={handleBack} onSubmit={finalSubmit} loading={loading} error={error} />}
                    </>
                )}
            </div>
        </div>
    );
}

// --- Komponen-komponen Step di bawah ini tidak ada perubahan ---
function Step1Mulai({ formData, handleChange, onNext, onCancel, isEditMode = false, slugStatus, slugError }: { formData: Partial<FormData>, handleChange: any, onNext: () => void, onCancel: () => void, isEditMode?: boolean, slugStatus: SlugStatus, slugError: string }) {
    const isSlugValid = formData.slug && formData.slug.length > 2;
    const canProceed = formData.bride_name && formData.groom_name && formData.event_name && formData.slug && formData.event_date && (slugStatus === 'available');
    const isSlugDisabled = isEditMode && formData.status === 'published';
    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-green">{isEditMode ? 'Edit Undangan Anda' : "Let's get started"}</h2>
            <p className="text-brand-charcoal/80 mt-2">{isEditMode ? 'Ubah detail undangan Anda.' : 'Isi formulir untuk melanjutkan.'}</p>
            <div className="mt-8 space-y-6">
                <fieldset>
                    <legend className="font-semibold text-lg mb-4 text-brand-charcoal">Informasi Mempelai</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" name="bride_name" value={formData.bride_name} onChange={handleChange} placeholder="Nama Mempelai Wanita" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                        <input type="text" name="groom_name" value={formData.groom_name} onChange={handleChange} placeholder="Nama Mempelai Pria" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                    </div>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="font-semibold text-brand-charcoal">Judul Undangan</label>
                       <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full mt-1 p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" required />
                    </div>
                     <div>
                       <label className="font-semibold text-brand-charcoal">URL Undangan</label>
                       <div className="flex items-center mt-1 border-b-2 border-brand-champagne focus-within:border-brand-gold">
                           <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full p-3 outline-none disabled:bg-gray-100" required disabled={isSlugDisabled} />
                           <span className="text-gray-500 pr-3">.arumaja.id</span>
                       </div>
                       <div className="h-5 mt-1 text-sm">
                           {isSlugDisabled ? <p className="text-gray-500">URL tidak dapat diubah.</p> : <> {slugStatus === 'checking' && <p className="text-gray-500">Mengecek...</p>} {slugStatus === 'unavailable' && <p className="text-red-500">{slugError}</p>} {slugStatus === 'available' && isSlugValid && <p className="text-green-600">URL tersedia!</p>} </>}
                       </div>
                    </div>
                </div>
                <div>
                   <label className="font-semibold text-brand-charcoal">Tanggal Acara</label>
                   <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full p-3 mt-2 bg-brand-champagne border border-brand-gold/50 rounded-lg" required />
                </div>
            </div>
             <div className="flex justify-end gap-4 mt-8">
                {isEditMode ? <Link href="/dashboard" className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Batal</Link> : <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Batal</button>}
                <button type="button" onClick={onNext} disabled={!canProceed} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">Lanjutkan</button>
            </div>
        </div>
    );
}
function Step2Lokasi({ formData, onLocationChange, onBack, onNext, onSubmit, loading, error, isCreateMode = false }: { formData: Partial<FormData>, onLocationChange: (location: { address: string; lat: number; lng: number }) => void, onBack: () => void, onNext?: () => void, onSubmit?: () => void, loading?: boolean, error?: string, isCreateMode?: boolean }) {
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 2: Tentukan Lokasi Acara</h2>
            <p className="mt-2 text-brand-charcoal/80">Pilih lokasi utama acara pernikahan Anda.</p>
            <div className="mt-8 space-y-6">
                <LocationPicker onLocationChange={onLocationChange} />
                {formData.location && <div className="mt-4 p-4 bg-brand-champagne/50 rounded-lg"><p className="text-sm font-semibold text-brand-green">Lokasi Terpilih:</p><p className="text-brand-charcoal">{formData.location}</p></div>}
            </div>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                {isCreateMode ? <button type="button" onClick={onNext} disabled={!formData.location || loading} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Lanjutkan'}</button> : <button type="button" onClick={onSubmit} disabled={loading} className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}
            </div>
        </div>
    );
}
function Step3Tema({ selectedTheme, onSelect, onBack, onNext }: { selectedTheme: string, onSelect: (id: string) => void, onBack: () => void, onNext: () => void }) {
    const { supabase } = useAuth();
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchThemes = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('themes').select('*').eq('is_public', true);
            if (error) console.error("Gagal memuat tema:", error);
            else setThemes(data as Theme[]);
            setLoading(false);
        };
        fetchThemes();
    }, [supabase]);
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 3: Pilih Tema</h2>
            <p className="mt-2 text-brand-charcoal/80">Pilih desain yang paling Anda sukai.</p>
            {loading ? <div className="text-center p-8">Memuat tema...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {themes.map(theme => (
                        <div key={theme.id} onClick={() => onSelect(theme.id)} className={`p-4 border-2 rounded-lg cursor-pointer transition ${selectedTheme === theme.id ? 'border-brand-gold bg-brand-champagne' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                            <div className="w-full h-48 bg-gray-200 rounded-md"><img src={theme.preview_url || 'https://placehold.co/400x300/F4EFE6/2A4032?text=Preview'} alt={theme.name} className="w-full h-full object-cover rounded-md"/></div>
                            <h3 className="font-serif text-lg font-bold text-brand-green mt-4 text-center">{theme.name}</h3>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                <button type="button" onClick={onNext} disabled={!selectedTheme} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">Lanjutkan</button>
            </div>
        </div>
    );
}
function Step4Paket({ selectedPackage, onSelect, onBack, onNext }: { selectedPackage: string, onSelect: (pkg: string) => void, onBack: () => void, onNext: () => void }) {
    const packages = [
        { name: 'bronze', title: 'Bronze', price: 'Gratis', features: ['Desain Standar', 'Hitung Mundur Acara', '1 Admin'] },
        { name: 'silver', title: 'Silver', price: 'Rp 99.000', features: ['Semua di Bronze', '+ Desain Premium', '+ Galeri Foto', '+ Musik Latar'] },
        { name: 'gold', title: 'Gold', price: 'Rp 149.000', features: ['Semua di Silver', '+ Custom Domain', '+ Amplop Digital', '+ 5 Admin'] },
    ];
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 4: Pilih Paket</h2>
            <p className="mt-2 text-brand-charcoal/80">Pilih paket yang paling sesuai.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {packages.map(pkg => (
                    <div key={pkg.name} onClick={() => onSelect(pkg.name)} className={`p-6 border-2 rounded-lg cursor-pointer transition ${selectedPackage === pkg.name ? 'border-brand-gold bg-brand-champagne' : 'border-gray-200 hover:border-brand-gold/50'}`}>
                        <h3 className="font-serif text-xl font-bold text-brand-green">{pkg.title}</h3>
                        <p className="text-2xl font-bold my-2 text-brand-charcoal">{pkg.price}</p>
                        <ul className="space-y-2 text-sm text-brand-charcoal/80">
                            {pkg.features.map(f => <li key={f}>✓ {f}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                <button type="button" onClick={onNext} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90">Lanjutkan</button>
            </div>
        </div>
    );
}
function Step5Pembayaran({ selectedPackage, onBack, onSubmit, loading, error }: { selectedPackage: string, onBack: () => void, onSubmit: () => void, loading: boolean, error: string }) {
    const packageDetails: { [key: string]: { title: string, price: string } } = {
        bronze: { title: 'Bronze', price: 'Rp 0' },
        silver: { title: 'Silver', price: 'Rp 99.000' },
        gold: { title: 'Gold', price: 'Rp 149.000' },
    };
    const currentPackage = packageDetails[selectedPackage];
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 5: Ringkasan & Pembayaran</h2>
            <div className="mt-6 border rounded-lg p-6 bg-brand-champagne/50">
                <h3 className="font-semibold text-lg text-brand-charcoal">Ringkasan Pesanan</h3>
                <div className="flex justify-between items-center mt-4"><p>Paket {currentPackage.title}</p><p className="font-bold">{currentPackage.price}</p></div>
                <div className="border-t my-4"></div>
                <div className="flex justify-between items-center font-bold text-lg text-brand-charcoal"><p>Total</p><p>{currentPackage.price}</p></div>
            </div>
            <div className="mt-6">
                <h3 className="font-semibold text-lg text-brand-charcoal">Metode Pembayaran</h3>
                <p className="text-sm text-brand-charcoal/80 mt-2">Fungsionalitas pembayaran akan diimplementasikan di sini.</p>
            </div>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                <button type="button" onClick={onSubmit} disabled={loading} className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Memproses...' : 'Selesaikan & Buat Undangan'}</button>
            </div>
        </div>
    );
}