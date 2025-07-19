import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    dangerouslyAllowSVG: true, // <-- TAMBAHKAN BARIS INI
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default config