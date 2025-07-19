import Image from 'next/image'; // Kita akan menggunakan komponen Image dari Next.js

export default function HomePage() {
  return (
    // Kontainer utama dengan padding
    <div className="container mx-auto px-4 py-16">
      {/* Flex container untuk tata letak 2 kolom */}
      <div className="flex flex-col md:flex-row items-center gap-12">

        {/* Kolom Kiri: Teks & Tombol */}
        <div className="md:w-1/2 text-center md:text-left">
          <span className="inline-block bg-pink-100 text-pink-600 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            #1 Platform Undangan Digital
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
            Solusi Digital
            <br />
            Pernikahan
            <br />
            <span className="text-pink-500">Impian</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Jadikan pernikahanmu lebih efektif, efisien dan modern dengan Arumaja. Solusi digital pernikahan terlengkap!
          </p>
          <div className="mt-8 flex justify-center md:justify-start gap-4">
            <button className="bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors">
              Pesan Sekarang
            </button>
            <button className="bg-white text-gray-800 font-bold py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors">
              Coba Gratis
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Gambar Dummy */}
        <div className="md:w-1/2 mt-8 md:mt-0">
          <div className="bg-white rounded-xl shadow-lg p-3">
             {/* Ganti '600x700' jika ingin ukuran berbeda */}
            <Image 
              src="https://placehold.co/600x700/e9d5ff/a855f7?text=Gambar\nDummy" 
              alt="Dummy Image Undangan Digital"
              width={320}
              height={320}
              className="rounded-lg"
            />
          </div>
        </div>

      </div>
    </div>
  );
}