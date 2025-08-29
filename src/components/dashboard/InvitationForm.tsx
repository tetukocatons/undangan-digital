// src/components/dashboard/InvitationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type InvitationFormProps = {
    setActiveView?: (view: string) => void;
    invitationId?: string;
};

type FormData = {
    bride_name: string;
    groom_name: string;
    event_name: string;
    slug: string;
    event_date: string;
    location: string;
    couple_enabled: boolean;
    quotes_enabled: boolean;
    gallery_enabled: boolean;
    acara_enabled: boolean;
    selected_package: string;
    status: string;
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


export default function InvitationForm({ setActiveView, invitationId }: InvitationFormProps) {
    const { supabase } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        bride_name: '', groom_name: '', event_name: '', slug: '', event_date: '', location: '',
        couple_enabled: true, quotes_enabled: true, gallery_enabled: false, acara_enabled: true,
        selected_package: 'silver',
        status: 'draft',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const [slugError, setSlugError] = useState('');
    const [initialSlug, setInitialSlug] = useState<string | null>(null);
    
    const isEditMode = !!invitationId;
    const formSteps = isEditMode ? ["Detail", "Fitur"] : ["Mulai", "Detail", "Paket", "Bayar"];

    useEffect(() => {
        if (step !== 1) return;

        const handler = setTimeout(async () => {
            const slug = formData.slug;

            if (isEditMode && slug === initialSlug) {
                setSlugStatus('available');
                return;
            }
            if (!slug || slug.length < 3) {
                setSlugStatus('idle');
                return;
            }

            setSlugStatus('checking');
            setSlugError('');
            
            try {
                const finalSlug = `${slug}.arumaja.id`;
                const { data: exists, error: rpcError } = await supabase.rpc('slug_exists', {
                    slug_to_check: finalSlug
                });
                if (rpcError) throw rpcError;
                if (exists) {
                    setSlugStatus('unavailable');
                    setSlugError('URL ini sudah digunakan. Silakan pilih yang lain.');
                } else {
                    setSlugStatus('available');
                }
            } catch (err) {
                console.error("Slug check error:", err);
                setSlugStatus('idle');
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
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
                    setFormData({
                        bride_name: data.bride_name || '',
                        groom_name: data.groom_name || '',
                        event_name: data.event_name || '',
                        slug: slugPart,
                        event_date: eventDate,
                        location: data.location || '',
                        couple_enabled: data.couple_enabled ?? true,
                        quotes_enabled: data.quotes_enabled ?? true,
                        gallery_enabled: data.gallery_enabled ?? false,
                        acara_enabled: data.acara_enabled ?? true,
                        selected_package: data.package || 'silver',
                        status: data.status || 'draft',
                    });
                    setInitialSlug(slugPart);
                    setSlugStatus('available');
                }
                setLoading(false);
            };
            fetchInvitationData();
        }
    }, [invitationId, isEditMode, supabase]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

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
    
    const handlePackageSelect = (packageName: string) => {
        setFormData(prev => ({ ...prev, selected_package: packageName }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        const eventData = {
            bride_name: formData.bride_name,
            groom_name: formData.groom_name,
            event_name: formData.event_name,
            slug: `${formData.slug}.arumaja.id`,
            event_date: formData.event_date,
            location: formData.location,
            couple_enabled: formData.couple_enabled,
            quotes_enabled: formData.quotes_enabled,
            gallery_enabled: formData.gallery_enabled,
            acara_enabled: formData.acara_enabled,
            package: formData.selected_package,
        };

        if (isEditMode) {
            const { package: _, ...updateData } = eventData;
            const { error: updateError } = await supabase.from('events').update(updateData).eq('id', invitationId);
            if (updateError) {
                setError(`Gagal memperbarui: ${updateError.message}`);
            } else {
                alert('Undangan berhasil diperbarui!');
                router.push('/dashboard');
            }
        } else {
            const { data, error: rpcError } = await supabase.rpc('create_new_event', {
                bride_name_in: eventData.bride_name,
                groom_name_in: eventData.groom_name,
                event_name_in: eventData.event_name,
                slug_in: eventData.slug,
                event_date_in: eventData.event_date,
                location_in: eventData.location,
                couple_enabled_in: eventData.couple_enabled,
                quotes_enabled_in: eventData.quotes_enabled,
                gallery_enabled_in: eventData.gallery_enabled,
                acara_enabled_in: eventData.acara_enabled,
                package_in: eventData.package,
            });
            if (rpcError) {
                setError(`Server Error: ${rpcError.message}`);
            } else if (data?.[0]?.status_code === 200) {
                alert('Undangan berhasil dibuat!');
                setActiveView?.('invitations');
            } else {
                setError(`Gagal: ${data?.[0]?.message || 'Terjadi kesalahan tidak diketahui.'}`);
            }
        }
        setLoading(false);
    };

    const onCancel = () => setActiveView?.('invitations');

    if (loading && isEditMode) return <div className="text-center p-8">Memuat data undangan...</div>;

    return (
        <div className="bg-white p-4 sm:p-8 rounded-lg border border-brand-gold/30 shadow-sm max-w-3xl mx-auto">
            <Stepper currentStep={step} steps={formSteps} />
            <div className="mt-8">
                {isEditMode ? (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={handleNext} onCancel={onCancel} isEditMode slugStatus={slugStatus} slugError={slugError} />}
                        {step === 2 && <Step2EditDetail formData={formData} handleChange={handleChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} error={error} />}
                    </>
                ) : (
                    <>
                        {step === 1 && <Step1Mulai formData={formData} handleChange={handleChange} onNext={handleNext} onCancel={onCancel} slugStatus={slugStatus} slugError={slugError} />}
                        {step === 2 && <Step2EditDetail formData={formData} handleChange={handleChange} onBack={handleBack} onNext={handleNext} isCreateMode />}
                        {step === 3 && <Step3Paket selectedPackage={formData.selected_package} onSelect={handlePackageSelect} onBack={handleBack} onNext={handleNext} />}
                        {step === 4 && <Step4Pembayaran selectedPackage={formData.selected_package} onBack={handleBack} onSubmit={handleSubmit} loading={loading} error={error} />}
                    </>
                )}
            </div>
        </div>
    );
}

// ... Sisa Komponen ...

function Step1Mulai({ formData, handleChange, onNext, onCancel, isEditMode = false, slugStatus, slugError }: { formData: Partial<FormData>, handleChange: any, onNext: () => void, onCancel: () => void, isEditMode?: boolean, slugStatus: SlugStatus, slugError: string }) {
    const isSlugValid = formData.slug && formData.slug.length > 2;
    const canProceed = formData.bride_name && formData.groom_name && formData.event_name && formData.slug && formData.event_date && (slugStatus === 'available');
    
    const isSlugDisabled = isEditMode && formData.status === 'published';

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-green">{isEditMode ? 'Edit Undangan Anda' : "Let's get started"}</h2>
            <p className="text-brand-charcoal/80 mt-2">{isEditMode ? 'Ubah detail undangan Anda di bawah ini.' : 'Harap isi formulir untuk melanjutkan pemesanan.'}</p>
            <div className="mt-8 space-y-6">
                <fieldset>
                    <legend className="font-semibold text-lg mb-4 text-brand-charcoal">Informasi Mempelai</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" name="bride_name" value={formData.bride_name} onChange={handleChange} placeholder="Nama Mempelai Wanita" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none transition-colors" required />
                        <input type="text" name="groom_name" value={formData.groom_name} onChange={handleChange} placeholder="Nama Mempelai Pria" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none transition-colors" required />
                    </div>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="font-semibold text-brand-charcoal">Judul Undangan</label>
                       <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} className="w-full mt-1 p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none transition-colors" required />
                    </div>
                     <div>
                       <label className="font-semibold text-brand-charcoal">URL Undangan Website</label>
                       <div className="flex items-center mt-1 border-b-2 border-brand-champagne focus-within:border-brand-gold transition-colors">
                           <input 
                                type="text" 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleChange} 
                                className="w-full p-3 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                required 
                                disabled={isSlugDisabled}
                           />
                           <span className="text-gray-500 pr-3 text-sm sm:text-base">.arumaja.id</span>
                       </div>
                       <div className="h-5 mt-1 text-sm">
                           {isSlugDisabled ? (
                               <p className="text-gray-500">URL tidak dapat diubah setelah dipublikasikan.</p>
                           ) : (
                               <>
                                   {slugStatus === 'checking' && <p className="text-gray-500">Mengecek ketersediaan...</p>}
                                   {slugStatus === 'unavailable' && <p className="text-red-500">{slugError}</p>}
                                   {slugStatus === 'available' && isSlugValid && <p className="text-green-600">URL tersedia!</p>}
                               </>
                           )}
                       </div>
                    </div>
                </div>
                <div>
                   <label className="font-semibold text-brand-charcoal">Kapan acara pernikahan kamu diselenggarakan?</label>
                   <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full p-3 mt-2 bg-brand-champagne border border-brand-gold/50 rounded-lg" required />
                </div>
            </div>
             <div className="flex justify-end gap-4 mt-8">
                {isEditMode ? (
                    <Link href="/dashboard" className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Batal</Link>
                ) : (
                    <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Batal</button>
                )}
                <button type="button" onClick={onNext} disabled={!canProceed} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">Lanjutkan</button>
            </div>
        </div>
    );
}

function Step2EditDetail({ formData, handleChange, onBack, onNext, onSubmit, loading, error, isCreateMode = false }: { formData: Partial<FormData>, handleChange: any, onBack: () => void, onNext?: () => void, onSubmit?: () => void, loading?: boolean, error?: string, isCreateMode?: boolean }) {
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">{isCreateMode ? "Langkah 2: Detail Pernikahan" : "Langkah 2: Lokasi & Fitur"}</h2>
            <p className="mt-2 text-brand-charcoal/80">{isCreateMode ? "Lengkapi detail acara dan fitur yang ingin ditampilkan." : "Ubah lokasi dan fitur yang aktif pada undangan Anda."}</p>
            <div className="mt-8 space-y-6">
                <div>
                    <label htmlFor="location" className="block font-semibold text-brand-charcoal">Lokasi Acara</label>
                    <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className="w-full p-3 mt-2 bg-brand-champagne border border-brand-gold/50 rounded-lg" placeholder="Contoh: Gedung Serbaguna, Jl. Merdeka No. 10" />
                </div>
                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold text-lg text-brand-charcoal">Fitur Undangan</h3>
                    <ToggleSwitch name="couple_enabled" checked={!!formData.couple_enabled} onChange={handleChange} label="Informasi Pasangan" description="Tampilkan nama dan detail kedua mempelai." />
                    <ToggleSwitch name="acara_enabled" checked={!!formData.acara_enabled} onChange={handleChange} label="Detail Acara" description="Tampilkan rundown, waktu, dan lokasi acara." />
                    <ToggleSwitch name="quotes_enabled" checked={!!formData.quotes_enabled} onChange={handleChange} label="Kutipan / Ayat" description="Tampilkan kutipan cinta atau ayat suci." />
                    <ToggleSwitch name="gallery_enabled" checked={!!formData.gallery_enabled} onChange={handleChange} label="Galeri Foto" description="Tampilkan galeri foto pre-wedding Anda." />
                </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                {isCreateMode ? (
                     <button type="button" onClick={onNext} className="px-8 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90">Lanjutkan</button>
                ) : (
                    <button type="button" onClick={onSubmit} disabled={loading} className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400">
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                )}
            </div>
        </div>
    );
}

function Step3Paket({ selectedPackage, onSelect, onBack, onNext }: { selectedPackage: string, onSelect: (pkg: string) => void, onBack: () => void, onNext: () => void }) {
    const packages = [
        { name: 'bronze', title: 'Bronze', price: 'Gratis', features: ['Desain Standar', 'Hitung Mundur Acara', '1 Admin'] },
        { name: 'silver', title: 'Silver', price: 'Rp 99.000', features: ['Semua di Bronze', '+ Desain Premium', '+ Galeri Foto', '+ Musik Latar'] },
        { name: 'gold', title: 'Gold', price: 'Rp 149.000', features: ['Semua di Silver', '+ Custom Domain', '+ Amplop Digital', '+ 5 Admin'] },
    ];
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 3: Pilih Paket</h2>
            <p className="mt-2 text-brand-charcoal/80">Pilih paket yang paling sesuai dengan kebutuhan Anda.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {packages.map(pkg => (
                    <div key={pkg.name} onClick={() => onSelect(pkg.name)}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition ${selectedPackage === pkg.name ? 'border-brand-gold bg-brand-champagne' : 'border-gray-200 hover:border-brand-gold/50'}`}>
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

function Step4Pembayaran({ selectedPackage, onBack, onSubmit, loading, error }: { selectedPackage: string, onBack: () => void, onSubmit: () => void, loading: boolean, error: string }) {
    const packageDetails: { [key: string]: { title: string, price: string } } = {
        bronze: { title: 'Bronze', price: 'Rp 0' },
        silver: { title: 'Silver', price: 'Rp 99.000' },
        gold: { title: 'Gold', price: 'Rp 149.000' },
    };
    const currentPackage = packageDetails[selectedPackage];
    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-brand-green">Langkah 4: Ringkasan & Pembayaran</h2>
            <div className="mt-6 border rounded-lg p-6 bg-brand-champagne/50">
                <h3 className="font-semibold text-lg text-brand-charcoal">Ringkasan Pesanan</h3>
                <div className="flex justify-between items-center mt-4">
                    <p>Paket {currentPackage.title}</p>
                    <p className="font-bold">{currentPackage.price}</p>
                </div>
                <div className="border-t my-4"></div>
                <div className="flex justify-between items-center font-bold text-lg text-brand-charcoal">
                    <p>Total</p>
                    <p>{currentPackage.price}</p>
                </div>
            </div>
            <div className="mt-6">
                <h3 className="font-semibold text-lg text-brand-charcoal">Metode Pembayaran</h3>
                <p className="text-sm text-brand-charcoal/80 mt-2">Fungsionalitas pembayaran akan diimplementasikan di sini (contoh: Midtrans, dll).</p>
            </div>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onBack} className="px-6 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-brand-champagne">Kembali</button>
                <button type="button" onClick={onSubmit} disabled={loading} className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400">
                    {loading ? 'Memproses...' : 'Selesaikan & Buat Undangan'}
                </button>
            </div>
        </div>
    );
}

const ToggleSwitch = ({ name, checked, onChange, label, description }: { name: string, checked: boolean, onChange: any, label: string, description: string }) => (
    <label htmlFor={name} className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-brand-champagne/50">
        <div>
            <p className="font-semibold text-brand-charcoal">{label}</p>
            <p className="text-sm text-brand-charcoal/70">{description}</p>
        </div>
        <div className="relative">
            <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="sr-only" />
            <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-brand-green' : 'bg-gray-200'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);