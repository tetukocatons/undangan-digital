import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Arumaja<span className="text-pink-500">.</span>
        </Link>

        {/* Menu Navigasi Tengah */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#" className="text-gray-600 hover:text-pink-500">Produk+</Link>
          <Link href="#" className="text-gray-600 hover:text-pink-500">Portfolio</Link>
          <Link href="#" className="text-gray-600 hover:text-pink-500">Template</Link>
          <Link href="#" className="text-gray-600 hover:text-pink-500">Blog</Link>
          <Link href="#" className="text-gray-600 hover:text-pink-500">Find a Couple</Link>
        </nav>

        {/* Tombol Kanan */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login" className="text-gray-800 font-semibold hover:text-pink-500">
            Masuk
          </Link>
          <Link href="/register" className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600">
            Daftar
          </Link>
        </div>

      </div>
    </header>
  );
}