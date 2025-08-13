// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Montserrat, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'

// ⬇️ DEFINISIKAN VARIABEL FONT YANG DIPAKAI DI className
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
      <body
        className={`${montserrat.variable} ${playfair.variable} font-sans bg-brand-champagne text-brand-charcoal`}
      >
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}