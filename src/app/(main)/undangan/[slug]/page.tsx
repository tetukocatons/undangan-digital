// src/app/(main)/undangan/[slug]/page.tsx

// PERBAIKAN: Tambahkan baris ini untuk memastikan halaman selalu dirender secara dinamis.
export const dynamic = 'force-dynamic';

type InvitationPageProps = {
  params: {
    slug: string;
  };
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = params;

  // Di sini Anda bisa menambahkan logika untuk mengambil data undangan dari Supabase berdasarkan slug
  // const { data: event } = await supabase.from('events').select('*').eq('slug', slug).single();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-champagne p-4">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-brand-green">
          Halaman Undangan
        </h1>
        <p className="mt-4 text-lg text-brand-charcoal">
          Ini adalah halaman untuk undangan dengan URL:
        </p>
        <p className="mt-2 text-xl font-semibold text-brand-gold bg-brand-green/10 p-2 rounded-md">
          {decodeURIComponent(slug)}
        </p>
      </div>
    </div>
  );
}