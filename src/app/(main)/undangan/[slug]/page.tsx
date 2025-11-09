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

  // Ambil data undangan DAN data tema, cerita, dan galeri yang berelasi
  const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        themes ( name ),
        stories ( year, title, description, sort_order ),
        gallery_images ( image_url, caption, sort_order )
      `)
      .eq('slug', slug)
      .single();

  if (error || !event) {
    console.error('Error fetching invitation data:', error);
    notFound();
  }
  
  // Urutkan cerita dan galeri jika ada
  const stories = (event.stories || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const galleryImages = (event.gallery_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(img => img.image_url);

  const invitationData = {
    bride_name: event.bride_name || 'Mempelai Wanita',
    groom_name: event.groom_name || 'Mempelai Pria',
    event_date: event.event_date || new Date().toISOString(),
    
    // Gunakan data dari DB, fallback jika null
    akad_time: event.akad_time || '09:00 WIB',
    akad_location: event.akad_location || event.location || 'Lokasi Akad',
    resepsi_time: event.resepsi_time || '11:00 WIB',
    resepsi_location: event.resepsi_location || event.location || 'Lokasi Resepsi',
    
    latitude: event.latitude,
    longitude: event.longitude,

    // Gunakan data relasional dari DB
    story: stories.length > 0 ? stories : [], // Sediakan array kosong jika tidak ada
    gallery_images: galleryImages.length > 0 ? galleryImages : [], // Sediakan array kosong
  };

  // Render template berdasarkan 'name' dari tabel 'themes'
  // @ts-ignore - 'themes' adalah objek karena .single()
  const themeName = event.themes?.name;

  switch (themeName) {
    case 'TemplateSatu':
      // @ts-ignore
      return <TemplateSatu data={invitationData} guestName={guestName} />;
    // case 'TemplateDua':
    //   return <TemplateDua data={invitationData} guestName={guestName} />;
    default:
      // Tampilkan halaman default jika nama tema tidak cocok
      return <DefaultInvitationPage slug={slug} />;
  }
}