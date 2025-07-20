import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
// Hapus: import Navbar from "@/components/Navbar";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
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
      <body className={`${montserrat.variable} ${playfair.variable} font-sans bg-brand-champagne text-brand-charcoal`}>
        {/* Hapus <Navbar /> dari sini */}
        <main>{children}</main>
      </body>
    </html>
  );
}