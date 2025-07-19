import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-brand-green">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-brand-off-white">
          Arumaja<span className="text-brand-gold">.</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold">Produk+</Link>
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold">Portfolio</Link>
          <Link href="/templates" className="text-brand-off-white/80 hover:text-brand-gold">Template</Link>
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold">Blog</Link>
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login" className="text-brand-off-white font-semibold hover:text-brand-gold">
            Masuk
          </Link>
          <Link href="/register" className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90">
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}