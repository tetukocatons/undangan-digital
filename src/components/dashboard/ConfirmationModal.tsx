// src/components/dashboard/ConfirmationModal.tsx
'use client';

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: {
        event_name: string;
        bride_name: string;
        groom_name: string;
        event_date: string;
        location: string;
    };
};

export default function ConfirmationModal({ isOpen, onClose, onConfirm, data }: ConfirmationModalProps) {
    if (!isOpen) return null;

    const formattedDate = data.event_date ? new Date(data.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum diatur';

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Konfirmasi Data Undangan</h2>
                <p className="mt-2 text-brand-charcoal/80">
                    Mohon periksa kembali detail undangan Anda. Data ini akan digunakan untuk publikasi.
                </p>
                <div className="mt-6 space-y-3 text-brand-charcoal bg-brand-champagne/50 p-4 rounded-md">
                    <div className="flex justify-between"><span className="font-semibold">Judul Acara:</span> <span>{data.event_name}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Mempelai:</span> <span>{data.groom_name} & {data.bride_name}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Tanggal Acara:</span> <span>{formattedDate}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Lokasi:</span> <span className="text-right ml-4">{data.location}</span></div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-gray-100">
                        Batal, Saya ingin cek lagi
                    </button>
                    <button type="button" onClick={onConfirm} className="px-6 py-2 font-bold text-white bg-brand-green rounded-md hover:opacity-90">
                        Data Sudah Benar, Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    );
};