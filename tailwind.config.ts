import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['"STIX Two Text"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        brand: { DEFAULT: '#0b0b0c', soft: '#fff8d6' },
        highlight: '#fff0a6',
      },
    },
  },
  plugins: [],
} satisfies Config;
