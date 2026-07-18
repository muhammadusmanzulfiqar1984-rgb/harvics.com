/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        harvics: {
          // Master palette — HARVICS_SYSTEM_RULES.md
          gold: '#C3A35E',
          goldMuted: 'rgba(195,163,94,0.6)',
          goldDivider: 'rgba(195,163,94,0.2)',
          burgundy: '#3D1212',
          maroon: '#3D1212',
          dark: '#3D1212',
          cream: '#F5F0E8',
          muted: '#8A7D6B',
          card: '#EFE8DC',
          cardMuted: '#e5dccb',
        }
      },
      transitionTimingFunction: {
        'vault': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      maxWidth: {
        'harvics-layout': '1440px',
      }
    }
  },
  plugins: [],
}

module.exports = config
