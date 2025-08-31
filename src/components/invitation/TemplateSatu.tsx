// src/components/invitation/TemplateSatu.tsx
'use client';

import React from 'react';

// Definisikan tipe data untuk props, agar sesuai dengan data dari database nantinya
type InvitationData = {
  bride_name: string;
  groom_name: string;
  event_date: string;
  akad_time: string;
  akad_location: string;
  resepsi_time: string;
  resepsi_location: string;
  latitude: number | null;
  longitude: number | null;
  story: { year: string; title: string; description: string }[];
  gallery_images: string[];
};

type TemplateSatuProps = {
  data: InvitationData;
  guestName: string;
};

// --- KOMPONEN IKON ---
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

// --- KOMPONEN SECTION ---

const HeroSection = ({ bride_name, groom_name, event_date, guestName }: { bride_name: string; groom_name: string; event_date: string; guestName: string }) => {
    const formattedDate = new Date(event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <section id="hero" className="h-screen bg-cover bg-center flex flex-col justify-center items-center text-white text-center p-4" style={{ backgroundImage: "url('https://placehold.co/1080x1920/2A4032/F4EFE6?text=Foto+Pre-wedding')" }}>
            <div className="bg-black bg-opacity-40 p-8 rounded-lg">
                <p className="font-sans text-lg">Pernikahan</p>
                <h1 className="font-serif text-6xl md:text-8xl my-4">{groom_name} & {bride_name}</h1>
                <p className="font-sans font-bold text-xl">{formattedDate}</p>
                <div className="mt-12">
                    <p className="text-md">Kepada Yth.</p>
                    <p className="font-bold text-2xl">{guestName}</p>
                </div>
            </div>
        </section>
    );
};

const CoupleSection = ({ bride_name, groom_name }: { bride_name: string; groom_name: string }) => (
    <section id="couple" className="py-20 px-4 bg-brand-champagne text-brand-charcoal text-center">
        <h2 className="font-serif text-4xl text-brand-green mb-12">Mempelai</h2>
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center">
                <img src="https://placehold.co/400x400/C4A464/333333?text=Mempelai+Pria" alt={groom_name} className="w-48 h-48 rounded-full object-cover shadow-lg" />
                <h3 className="font-serif text-3xl text-brand-gold mt-6">{groom_name}</h3>
                <p className="mt-2">Putra dari Bapak Lorem & Ibu Ipsum</p>
            </div>
            <div className="flex flex-col items-center">
                <img src="https://placehold.co/400x400/C4A464/333333?text=Mempelai+Wanita" alt={bride_name} className="w-48 h-48 rounded-full object-cover shadow-lg" />
                <h3 className="font-serif text-3xl text-brand-gold mt-6">{bride_name}</h3>
                <p className="mt-2">Putri dari Bapak Dolor & Ibu Sit Amet</p>
            </div>
        </div>
    </section>
);

const EventSection = ({ 
    event_date, 
    akad_time, 
    akad_location, 
    resepsi_time, 
    resepsi_location,
    latitude,
    longitude 
}: { 
    event_date: string; 
    akad_time: string; 
    akad_location: string; 
    resepsi_time: string; 
    resepsi_location: string;
    latitude: number | null;
    longitude: number | null;
}) => {
    const formattedDate = new Date(event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    // PERBAIKAN: Membuat URL Peta Dinamis
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=MASUKKAN_API_KEY_ANDA&q=$${latitude},${longitude}`;

    return (
        <section id="event" className="py-20 px-4 bg-brand-off-white text-center">
            <h2 className="font-serif text-4xl text-brand-green mb-12">Detail Acara</h2>
            <div className="container mx-auto grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md border border-brand-gold/30">
                    <h3 className="font-serif text-3xl text-brand-gold">Akad Nikah</h3>
                    <div className="mt-6 space-y-4 text-left mx-auto max-w-xs">
                        <div className="flex items-center gap-4"><CalendarIcon /> <span>{formattedDate}</span></div>
                        <div className="flex items-center gap-4"><ClockIcon /> <span>{akad_time}</span></div>
                        <div className="flex items-center gap-4"><LocationIcon /> <span>{akad_location}</span></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md border border-brand-gold/30">
                    <h3 className="font-serif text-3xl text-brand-gold">Resepsi</h3>
                    <div className="mt-6 space-y-4 text-left mx-auto max-w-xs">
                        <div className="flex items-center gap-4"><CalendarIcon /> <span>{formattedDate}</span></div>
                        <div className="flex items-center gap-4"><ClockIcon /> <span>{resepsi_time}</span></div>
                        <div className="flex items-center gap-4"><LocationIcon /> <span>{resepsi_location}</span></div>
                    </div>
                </div>
            </div>
            <div className="mt-12">
                 {latitude && longitude && (
                    <iframe 
                        src={mapSrc}
                        width="100%" 
                        height="450" 
                        style={{ border:0 }} 
                        allowFullScreen={true}
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="max-w-4xl mx-auto rounded-lg shadow-md">
                    </iframe>
                 )}
            </div>
        </section>
    );
};

const StorySection = ({ story }: { story: { year: string; title: string; description: string }[] }) => (
    <section id="story" className="py-20 px-4 bg-brand-champagne">
        <h2 className="font-serif text-4xl text-brand-green text-center mb-12">Cerita Kami</h2>
        <div className="container mx-auto max-w-3xl relative">
            <div className="border-l-2 border-brand-gold absolute h-full top-0 left-1/2 -ml-[1px]"></div>
            {story.map((item, index) => (
                <div key={index} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-5/12"></div>
                    <div className="z-20 flex items-center bg-brand-gold shadow-xl w-8 h-8 rounded-full">
                        <h3 className="mx-auto text-white font-semibold text-lg">{item.year}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-brand-gold/20 w-5/12">
                        <h4 className="font-serif font-bold text-brand-green text-xl">{item.title}</h4>
                        <p className="mt-2 text-brand-charcoal/80">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);

const GallerySection = ({ images }: { images: string[] }) => (
    <section id="gallery" className="py-20 px-4 bg-brand-off-white">
        <h2 className="font-serif text-4xl text-brand-green text-center mb-12">Galeri Foto</h2>
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((src, index) => (
                 <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                    <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-300"/>
                </div>
            ))}
        </div>
    </section>
);

const GiftSection = () => (
    <section id="gift" className="py-20 px-4 bg-brand-champagne text-center">
        <h2 className="font-serif text-4xl text-brand-green mb-4">Kirim Hadiah</h2>
        <p className="text-brand-charcoal/80 max-w-2xl mx-auto mb-12">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.</p>
        <div className="bg-white inline-block p-8 rounded-lg shadow-md border border-brand-gold/30">
            <img src="https://placehold.co/250x250/333333/ffffff?text=QR+Code" alt="QR Code" className="mx-auto" />
            <p className="mt-4 font-sans font-semibold text-brand-green">Bank Central Asia (BCA)</p>
            <p className="font-sans text-brand-charcoal">1234567890</p>
            <p className="font-sans text-brand-charcoal">a.n. Mempelai Pria</p>
        </div>
    </section>
);

export default function TemplateSatu({ data, guestName }: TemplateSatuProps) {
    return (
        <div className="font-sans">
            <HeroSection bride_name={data.bride_name} groom_name={data.groom_name} event_date={data.event_date} guestName={guestName} />
            <main>
                <CoupleSection bride_name={data.bride_name} groom_name={data.groom_name} />
                <EventSection 
                    event_date={data.event_date}
                    akad_time={data.akad_time}
                    akad_location={data.akad_location}
                    resepsi_time={data.resepsi_time}
                    resepsi_location={data.resepsi_location}
                    latitude={data.latitude}
                    longitude={data.longitude}
                />
                <StorySection story={data.story} />
                <GallerySection images={data.gallery_images} />
                <GiftSection />
            </main>
            <footer className="py-12 bg-brand-green text-center text-brand-off-white/70">
                <p>Terima kasih atas doa restunya.</p>
                <p className="font-serif text-2xl text-white mt-2">{data.groom_name} & {data.bride_name}</p>
            </footer>
        </div>
    );
}