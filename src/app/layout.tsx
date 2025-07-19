import type { Metadata } from "next";
// Impor font dari next/font/google
import { Montserrat, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Konfigurasi font Montserrat untuk body/paragraf
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat", // Nama variabel untuk CSS
});

// Konfigurasi font Playfair Display untuk judul
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair", // Nama variabel untuk CSS
});

export const metadata: Metadata = {
  title: "Arumaja - Undangan Digital Elegan",
  description: "Solusi undangan pernikahan digital dengan sentuhan kemewahan klasik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Terapkan variabel font dan warna latar utama */}
      <body className={`${montserrat.variable} ${playfair.variable} font-sans bg-brand-champagne text-brand-charcoal`}>
        <Navbar />
        <main>{children}</main> {/* Padding kita hapus dari sini untuk kontrol per halaman */}
      </body>
    </html>
  );
}