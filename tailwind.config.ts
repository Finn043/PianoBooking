

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
        piano: {
          black: '#121212',
          white: '#FDFDF9',
          accent: '#B45309',
          highlight: '#D97706',
        },
        stone: {
          50: '#F5F5F0',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#A0A0A0',
          500: '#737373',
          600: '#525252',
          700: '#44403C',
          800: '#1C1917',
          900: '#0C0A09',
          950: '#080706',
        },
        ivory: {
          100: '#FDFDF9',
          200: '#F8F8F7',
        },
        ink: {
          900: '#2a2a2a',
          700: '#4a4a4a',
          500: '#6a6a6a',
          300: '#9a9a9a',
        },
        surface: {
          100: '#f5f3f0',
          200: '#ebe8e3',
          300: '#ddd9d2',
        },
        muted: '#c5c0b5',
        success: '#4a8c6f',
        warning: '#c9a66b',
        error: '#c45c5c',
        info: '#6b8cc9',
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        button: ['Cabin', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};

export default config;
