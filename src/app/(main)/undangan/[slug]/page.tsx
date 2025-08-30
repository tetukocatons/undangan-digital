// src/app/(main)/undangan/[slug]/page.tsx
export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import TemplateSatu from '@/components/invitation/TemplateSatu';
import { notFound } from 'next/navigation';

type InvitationPageProps = {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Data dummy untuk cerita dan galeri (bisa Anda pindahkan ke database nanti)
const dummyStory = [
    { year: '2020', title: 'Awal Bertemu', description: 'Kami pertama kali bertemu di sebuah acara komunitas.' },
    { year: '2021', title: 'Masa Pendekatan', description: 'Kami merasa cocok dan memutuskan untuk menjalin hubungan.' },
    { year: '2024', title: 'Lamaran', description: 'Momen bahagia saat kedua keluarga bertemu.' },
];
const dummyGallery = [
    'https://placehold.co/600x600/2A4032/F4EFE6?text=Foto+1', 'https://placehold.co/600x600/C4A464/333333?text=Foto+2',
    'https://placehold.co/600x600/F4EFE6/333333?text=Foto+3', 'https://placehold.co/600x600/2A4032/FFFFFF?text=Foto+4',
];

// Komponen untuk Halaman Default atau jika template tidak ditemukan
const DefaultInvitationPage = ({ slug }: { slug: string }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-champagne p-4">
        <div className="text-center">
            <h1 className="font-serif text-4xl font-bold text-brand-green">Template Tidak Ditemukan</h1>
            <p className="mt-4 text-lg text-brand-charcoal">
                Template untuk undangan <span className="font-semibold text-brand-gold">{decodeURIComponent(slug)}</span> tidak dapat dimuat.
            </p>
        </div>
    </div>
);

export default async function InvitationPage({ params, searchParams }: InvitationPageProps) {
  const supabase = createClient();
  const { slug } = params;
  const guestName = typeof searchParams.to === 'string' ? decodeURIComponent(searchParams.to) : 'Tamu Undangan';

  // Ambil data undangan DAN data tema yang berelasi
  const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        themes (
          name
        )
      `)
      .eq('slug', slug)
      .single();

  if (error || !event) {
    notFound();
  }
  
  const invitationData = {
    bride_name: event.bride_name || 'Mempelai Wanita',
    groom_name: event.groom_name || 'Mempelai Pria',
    event_date: event.event_date || new Date().toISOString(),
    akad_time: '09:00 - 10:00 WIB',
    akad_location: event.location || 'Lokasi Akad',
    resepsi_time: '11:00 - 13:00 WIB',
    resepsi_location: event.location || 'Lokasi Resepsi',
    story: dummyStory,
    gallery_images: dummyGallery,
  };

  // Render template berdasarkan 'name' dari tabel 'themes'
  // @ts-ignore - 'themes' bisa jadi objek atau array, single() memastikan ini objek
  const themeName = event.themes?.name;

  switch (themeName) {
    case 'TemplateSatu':
      return <TemplateSatu data={invitationData} guestName={guestName} />;
    // case 'TemplateDua':
    //   return <TemplateDua data={invitationData} guestName={guestName} />;
    default:
      // Tampilkan halaman default jika nama tema tidak cocok
      return <DefaultInvitationPage slug={slug} />;
  }
}