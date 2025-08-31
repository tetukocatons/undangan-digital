// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Montserrat, Playfair_Display } from 'next/font/google'
import Script from 'next/script' // <-- Import Script

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Arumaja',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Tambahkan Script Midtrans di sini */}
      <Script
        type="text/javascript"
        src="https://app.sandbox.midtrans.com/snap/snap.js" // Ganti ke URL produksi jika sudah live
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <body
        className={`${montserrat.variable} ${playfair.variable} font-sans bg-brand-champagne text-brand-charcoal`}
      >
        <main>{children}</main>
      </body>
    </html>
  )
}