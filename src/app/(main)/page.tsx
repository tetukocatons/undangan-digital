export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-brand-green leading-tight">
            Solusi Digital
            <br />
            Pernikahan
            <br />
            <span className="text-brand-gold">Impian</span>
          </h1>
          <p className="mt-6 text-lg font-sans text-brand-charcoal/80">
            Jadikan pernikahanmu lebih efektif, efisien dan modern dengan Arumaja. Solusi digital pernikahan terlengkap!
          </p>
          <div className="mt-8 flex justify-center md:justify-start gap-4">
            <button className="bg-brand-green text-brand-off-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity">
              Pesan Sekarang
            </button>
            <button className="bg-transparent text-brand-green font-bold py-3 px-6 rounded-lg border-2 border-brand-gold hover:bg-brand-gold hover:text-brand-green transition-colors">
              Coba Gratis
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-3 w-full max-w-sm">
            <div className="bg-brand-champagne rounded-lg w-full h-96 flex items-center justify-center">
              <p className="font-serif text-brand-gold text-3xl text-center">Gambar Dummy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}