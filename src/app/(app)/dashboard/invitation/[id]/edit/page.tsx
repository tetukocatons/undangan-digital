'use client';

import InvitationForm from '@/components/dashboard/InvitationForm';

type EditPageProps = {
    params: {
        id: string;
    };
};

export default function EditInvitationPage({ params }: EditPageProps) {
    return <InvitationForm invitationId={params.id} />;
}