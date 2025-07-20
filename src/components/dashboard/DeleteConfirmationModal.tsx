'use client';

type DeleteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    eventName: string;
    loading: boolean;
};

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, eventName, loading }: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-red-500/20 w-full max-w-md">
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Konfirmasi Hapus</h2>
                <p className="mt-4 text-brand-charcoal/80">
                    Apakah Anda yakin ingin menghapus acara <strong className="font-semibold">{eventName}</strong>? Tindakan ini tidak dapat diurungkan.
                </p>
                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brand-charcoal rounded-md hover:bg-gray-100">Batal</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="px-6 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                        {loading ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
};