// src/components/Navbar.tsx
'use client'; 

import Link from 'next/link';
import { useState } from 'react';

const MenuIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- PENAMBAHAN FUNGSI INI ---
  // Fungsi ini akan dipanggil setiap kali link di menu mobile di-klik
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-brand-green sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-brand-off-white">
          Arumaja<span className="text-brand-gold">.</span>
        </Link>
        
        {/* Navigasi untuk Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold transition-colors">Produk+</Link>
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold transition-colors">Portfolio</Link>
          <Link href="/" className="text-brand-off-white/80 hover:text-brand-gold transition-colors">Template</Link>
          <Link href="#" className="text-brand-off-white/80 hover:text-brand-gold transition-colors">Blog</Link>
        </nav>
        
        {/* Tombol untuk Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login" className="text-brand-off-white font-semibold hover:text-brand-gold transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Daftar
          </Link>
        </div>

        {/* Tombol Hamburger untuk Mobile */}
        <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-off-white">
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
        </div>
      </div>
      
      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-green border-t border-brand-gold/20">
            <nav className="flex flex-col items-center space-y-4 px-4 pt-4 pb-6">
              {/* --- TAMBAHKAN onClick={handleLinkClick} DI SETIAP LINK --- */}
              <Link href="#" onClick={handleLinkClick} className="text-brand-off-white/80 hover:text-brand-gold w-full text-center py-2">Produk+</Link>
              <Link href="#" onClick={handleLinkClick} className="text-brand-off-white/80 hover:text-brand-gold w-full text-center py-2">Portfolio</Link>
              <Link href="/" onClick={handleLinkClick} className="text-brand-off-white/80 hover:text-brand-gold w-full text-center py-2">Template</Link>
              <Link href="#" onClick={handleLinkClick} className="text-brand-off-white/80 hover:text-brand-gold w-full text-center py-2">Blog</Link>
              
              <div className="w-full border-t border-brand-off-white/10 my-4"></div>

              <div className="flex flex-col items-center space-y-4 w-full">
                <Link href="/login" onClick={handleLinkClick} className="text-brand-off-white font-semibold hover:text-brand-gold w-full text-center py-2">
                  Masuk
                </Link>
                <Link href="/register" onClick={handleLinkClick} className="bg-brand-gold text-brand-green font-semibold py-2 px-4 rounded-lg hover:opacity-90 w-full text-center">
                  Daftar
                </Link>
              </div>
            </nav>
        </div>
      )}
    </header>
  );
}