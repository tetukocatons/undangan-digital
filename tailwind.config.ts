import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#2A4032',
        'brand-champagne': '#F4EFE6',
        'brand-gold': '#C4A464',
        'brand-off-white': '#F5F5F5',
        'brand-charcoal': '#333333',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)'], // Font untuk body
        serif: ['var(--font-playfair)'],  // Font untuk judul
      },
    },
  },
  plugins: [],
};
export default config;