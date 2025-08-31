// src/components/dashboard/InvitationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LocationPicker from './LocationPicker';
import ConfirmationModal from './ConfirmationModal';

// Tambahkan deklarasi window agar TypeScript mengenali "snap"
declare global {
    interface Window {
        snap: any;
    }
}

// Tipe data untuk form
type FormData = {
    bride_name: string; groom_name: string; event_name: string; slug: string; event_date: string;
    location: string; latitude: number | null; longitude: number | null;
    couple_enabled: boolean; quotes_enabled: boolean; gallery_enabled: boolean; acara_enabled: boolean;
    package: string;
    status: string;
};

type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable';

// Komponen Stepper (tidak ada perubahan)
const Stepper = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => {
    return (
        <div className="flex items-center justify-between mb-8 w-full">
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;
                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300 bg-brand-champagne text-brand-charcoal'}`}>
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

// Komponen Form Utama
export default function InvitationForm({ setActiveView, invitationId }: { setActiveView?: (view: string) => void; invitationId?: string; }) {
    const { supabase, user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        bride_name: '', groom_name: '', event_name: '', slug: '', event_date: '', 
        location: '', latitude: null, longitude: null,
        couple_enabled: true, quotes_enabled: true, gallery_enabled: true, acara_enabled: true,
        package: 'silver',
        status: 'draft',
    });
    const [currentInvitationId, setCurrentInvitationId] = useState<string | null>(invitationId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    
    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const [slugError, setSlugError] = useState('');
    const [initialSlug, setInitialSlug] = useState<string | null>(null);
    
    const isEditMode = !!invitationId;
    const formSteps = isEditMode ? ["Detail", "Lokasi"] : ["Mulai", "Lokasi", "Paket", "Bayar"];

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
                const { data, error } = await supabase.from('events').select('id').eq('slug', `${slug}.arumaja.id`).maybeSingle();
                if (error) throw error;
                if (data) {
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
                    setFormData({ ...data, slug: slugPart, event_date: eventDate, package: data.package || 'silver' });
                    setInitialSlug(slugPart);
                    setSlugStatus('available');
                }
                setLoading(false);
            };
            fetchInvitationData();
        }
    }, [invitationId, isEditMode, supabase]);

    const handleBack = () => setStep(prev => prev - 1);
    
    const onCancel = () => {
        if (setActiveView) {
            setActiveView('dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const saveDraftAndProceed = async (targetStep: number) => {
        if (!user) {
            setError("Sesi Anda berakhir, silakan login kembali.");
            return;
        }
        setLoading(true);
        setError('');

        const dataToSave = {
            ...formData,
            slug: `${formData.slug}.arumaja.id`,
            user_id: user.id,
            status: 'draft',
            theme_id: null,
        };

        let success = false;
        if (currentInvitationId) {
            const { error: updateError } = await supabase.from('events').update(dataToSave).eq('id', currentInvitationId);
            if (updateError) setError(`Gagal menyimpan draf: ${updateError.message}`);
            else success = true;
        } else {
            const { data: newEvent, error: insertError } = await supabase.from('events').insert(dataToSave).select('id').single();
            if (insertError) setError(`Gagal membuat draf: ${insertError.message}`);
            else if (newEvent) {
                setCurrentInvitationId(newEvent.id);
                success = true;
            }
        }

        setLoading(false);
        if (success) {
            setStep(targetStep);
        }
    };
    
    const saveEditChanges = async () => {
        if (!user || !currentInvitationId) {
            setError("Terjadi kesalahan, ID undangan tidak ditemukan.");
            return;
        }
        setLoading(true);
        setError('');

        const dataToSave = { 
            ...formData,
            slug: `${formData.slug}.arumaja.id`,
        };

        const { error: updateError } = await supabase.from('events').update(dataToSave).eq('id', currentInvitationId);
        
        setLoading(false);
        if (updateError) setError(`Gagal menyimpan perubahan: ${updateError.message}`);
        else {
            alert('Perubahan berhasil disimpan!');
            if (setActiveView) {
                setActiveView('dashboard');
            } else {
                router.push('/dashboard');
            }
        }
    }

    // FUNGSI BARU UNTUK MEMPROSES PEMBAYARAN
    const handlePayment = async () => {
        if (!currentInvitationId) {
            setError("ID Undangan tidak ditemukan. Silakan coba lagi.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/payment/create-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invitationId: currentInvitationId,
                    selectedPackage: formData.package,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal membuat transaksi.');
            }
            
            // Handle paket gratis (Bronze)
            if (data.free_package) {
                alert('Selamat! Undangan Anda telah berhasil dipublikasikan.');
                 if (setActiveView) {
                    setActiveView('dashboard');
                } else {
                    router.push('/dashboard');
                }
                return;
            }

            // Jika ada token, buka popup pembayaran Midtrans Snap
            if (data.token) {
                window.snap.pay(data.token, {
                    onSuccess: function(result: any){
                        console.log('success', result);
                        alert("Pembayaran berhasil! Undangan Anda akan segera dipublikasikan.");
                        router.push('/dashboard');
                    },
                    onPending: function(result: any){
                        console.log('pending', result);
                        alert("Menunggu pembayaran Anda. Anda akan dinotifikasi jika sudah berhasil.");
                        router.push('/dashboard');
                    },
                    onError: function(result: any){
                        console.log('error', result);
                        setError('Pembayaran gagal. Silakan coba lagi.');
                    },
                    onClose: function(){
                        console.log('Popup pembayaran ditutup tanpa menyelesaikan transaksi.');
                        setError('Anda menutup jendela pembayaran sebelum selesai.');
                    }
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        
        let processedValue: string | boolean = finalValue;
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
        setFormData(prev => ({ ...prev, package: packageName }));
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-lg border border-brand-gold/30 shadow-sm max-w-3xl mx-auto">
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    setConfirmModalOpen(false);
                    // Langsung ke pembayaran, tidak lagi ke step 4
                    handlePayment(); 
                }}
                data={formData}
            />

            <Stepper currentStep={step} steps={formSteps} />
            <div className="mt-8">
                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
                {isEditMode ? (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={() => saveDraftAndProceed(2)} onCancel={onCancel} isEditMode slugStatus={slugStatus} slugError={slugError} loading={loading} />}
                        {step === 2 && <Step2Lokasi formData={formData} onLocationChange={handleLocationChange} onBack={handleBack} onSubmit={saveEditChanges} loading={loading} />}
                    </>
                ) : (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={() => saveDraftAndProceed(2)} onCancel={onCancel} slugStatus={slugStatus} slugError={slugError} loading={loading} />}
                        {step === 2 && <Step2Lokasi formData={formData} onLocationChange={handleLocationChange} onBack={handleBack} onNext={() => saveDraftAndProceed(3)} isCreateMode loading={loading} />}
                        
                        {/* Ganti onNext agar memanggil handlePayment jika paket Bronze, atau buka modal jika berbayar */}
                        {step === 3 && <Step4Paket 
                            selectedPackage={formData.package} 
                            onSelect={handlePackageSelect} 
                            onBack={handleBack} 
                            onNext={() => {
                                if (formData.package === 'bronze') {
                                    handlePayment(); // Langsung proses jika gratis
                                } else {
                                    setConfirmModalOpen(true); // Tampilkan modal jika berbayar
                                }
                            }} 
                        />}

                        {/* Step 4 (Pembayaran) sekarang dikelola oleh handlePayment, jadi tidak perlu dirender */}
                    </>
                )}
            </div>
        </div>
    );
}

// --- Komponen-komponen Step ---
function Step1Mulai({ formData, handleChange, onNext, onCancel, isEditMode = false, slugStatus, slugError, loading }: { formData: Partial<FormData>, handleChange: any, onNext: () => void, onCancel: () => void, isEditMode?: boolean, slugStatus: SlugStatus, slugError: string, loading?: boolean }) {
    const isSlugValid = formData.slug && formData.slug.length > 2;
    const canProceed = formData.bride_name && formData.groom_name && formData.event_name && formData.slug && formData.event_date && (slugStatus === 'available');
    const isSlugDisabled = isEditMode && formData.status === 'published';
    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-green">{isEditMode ? 'Edit Undangan Anda' : "Mulai Buat Undangan"}</h2>
            <p className="text-brand-charcoal/80 mt-2">{isEditMode ? 'Ubah detail undangan Anda.' : 'Isi detail dasar undangan Anda.'}</p>
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
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Batal</button>
                <button type="button" onClick={onNext} disabled={!canProceed || loading} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">
                    {loading ? 'Menyimpan...' : 'Lanjutkan'}
                </button>
            </div>
        </div>
    );
}
function Step2Lokasi({ formData, onLocationChange, onBack, onNext, onSubmit, loading, isCreateMode = false }: { formData: Partial<FormData>, onLocationChange: (location: { address: string; lat: number; lng: number }) => void, onBack: () => void, onNext?: () => void, onSubmit?: () => void, loading?: boolean, isCreateMode?: boolean }) {
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 2: Tentukan Lokasi Acara</h2>
            <p className="mt-2 text-brand-charcoal/80">Pilih lokasi utama acara pernikahan Anda.</p>
            <div className="mt-8 space-y-6">
                <LocationPicker onLocationChange={onLocationChange} />
                {formData.location && <div className="mt-4 p-4 bg-brand-champagne/50 rounded-lg"><p className="text-sm font-semibold text-brand-green">Lokasi Terpilih:</p><p className="text-brand-charcoal">{formData.location}</p></div>}
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                {isCreateMode ? <button type="button" onClick={onNext} disabled={!formData.location || loading} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Lanjutkan'}</button> : <button type="button" onClick={onSubmit} disabled={loading} className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}
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
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 3: Pilih Paket</h2>
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