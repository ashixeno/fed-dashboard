/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:   '#1b2a4a',
        navy2:  '#243860',
        gold:   '#8b6914',
        'gold-light': '#d4a843',
        red:    '#9b2020',
        green:  '#1a6b3a',
        muted:  '#6b7280',
        border: '#d5cfc0',
        bg2:    '#f8f7f4',
      },
      fontFamily: {
        mono: ["'Source Code Pro'", 'monospace'],
        serif: ["'EB Garamond'", 'serif'],
      },
    },
  },
  plugins: [],
}
