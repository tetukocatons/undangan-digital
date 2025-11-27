// src/app/(app)/dashboard/invitation/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import InvitationForm from '@/components/dashboard/InvitationForm';

// Hapus type EditPageProps karena kita akan menggunakan hook

export default function EditInvitationPage() {
    // Gunakan useParams untuk mendapatkan parameter dari URL secara aman
    const params = useParams();
    const invitationId = Array.isArray(params.id) ? params.id[0] : params.id;

    // Tampilkan loading atau null jika id belum tersedia
    if (!invitationId) {
        return <div>Loading...</div>;
    }

    // Kirim invitationId sebagai prop ke InvitationForm
    return <InvitationForm invitationId={invitationId} />;
}