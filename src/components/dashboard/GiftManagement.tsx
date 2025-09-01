// src/components/dashboard/GiftManagement.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Invitation } from '@/app/(app)/dashboard/page';

type GiftData = {
  id?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  qr_code_url: string | null;
};

type GiftManagementProps = {
    invitation: Invitation;
    onUpdate: () => void;
};

export default function GiftManagement({ invitation, onUpdate }: GiftManagementProps) {
    const { supabase, user } = useAuth();
    const [giftData, setGiftData] = useState<GiftData>({
        bank_name: '',
        account_number: '',
        account_name: '',
        qr_code_url: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchGiftData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('digital_gifts')
            .select('*')
            .eq('event_id', invitation.id)
            .maybeSingle();

        if (error) {
            console.error('Gagal mengambil data hadiah:', error);
        } else if (data) {
            setGiftData(data);
        }
        setLoading(false);
    }, [supabase, invitation.id]);

    useEffect(() => {
        fetchGiftData();
    }, [fetchGiftData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGiftData(prev => ({ ...prev, [name]: value }));
    };

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${invitation.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        setMessage('');

        const { error: uploadError } = await supabase.storage
            .from('gift_qrcodes')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            setMessage(`Gagal mengunggah QR Code: ${uploadError.message}`);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from('gift_qrcodes')
            .getPublicUrl(filePath);

        setGiftData(prev => ({ ...prev, qr_code_url: data.publicUrl }));
        setUploading(false);
        setMessage('QR Code berhasil diunggah.');
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setMessage('');

        const dataToUpsert = {
            event_id: invitation.id,
            bank_name: giftData.bank_name,
            account_number: giftData.account_number,
            account_name: giftData.account_name,
            qr_code_url: giftData.qr_code_url,
        };

        const { error } = await supabase
            .from('digital_gifts')
            .upsert(dataToUpsert, { onConflict: 'event_id' });

        if (error) {
            setMessage(`Gagal menyimpan: ${error.message}`);
        } else {
            setMessage('Perubahan berhasil disimpan!');
            onUpdate();
        }
        setSaving(false);
    };

    if (loading) {
        return <div>Memuat data hadiah...</div>;
    }

    return (
        <div className="mt-8 border-t pt-6">
            <h2 className="font-serif text-2xl font-bold text-brand-green">Pengaturan Hadiah Digital</h2>
            <p className="mt-1 text-brand-charcoal/80">Masukkan detail rekening atau dompet digital Anda.</p>
            
            <div className="mt-6 space-y-6 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-1">Nama Bank / E-Wallet</label>
                    <input type="text" name="bank_name" value={giftData.bank_name || ''} onChange={handleInputChange} placeholder="Contoh: Bank Central Asia (BCA)" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-1">Nomor Rekening</label>
                    <input type="text" name="account_number" value={giftData.account_number || ''} onChange={handleInputChange} placeholder="Contoh: 1234567890" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-1">Atas Nama</label>
                    <input type="text" name="account_name" value={giftData.account_name || ''} onChange={handleInputChange} placeholder="Contoh: John Doe" className="w-full p-3 border-b-2 border-brand-champagne focus:border-brand-gold outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-1">Gambar QR Code</label>
                    <div className="mt-2 flex items-center gap-4">
                        {giftData.qr_code_url && (
                            <img src={giftData.qr_code_url} alt="QR Code Preview" className="w-24 h-24 object-cover rounded-md border p-1" />
                        )}
                        <input type="file" id="qr-upload" accept="image/png, image/jpeg, image/webp" onChange={handleQrUpload} className="hidden" />
                        <label htmlFor="qr-upload" className="cursor-pointer bg-white text-brand-green font-semibold py-2 px-4 rounded-lg border border-brand-gold/50 hover:bg-brand-champagne">
                            {uploading ? 'Mengunggah...' : 'Pilih Gambar'}
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end items-center gap-4">
                 {message && <p className={`text-sm ${message.includes('Gagal') ? 'text-red-600' : 'text-brand-green'}`}>{message}</p>}
                <button
                    onClick={handleSaveChanges}
                    disabled={saving || uploading}
                    className="px-8 py-2 font-bold text-brand-green bg-brand-gold rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </div>
    );
}