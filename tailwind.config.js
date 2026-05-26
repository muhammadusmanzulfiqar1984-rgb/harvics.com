/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        harvics: {
          burgundy: '#1A0505',
          cream: '#F5F0E8',
          gold: '#C9A84C',
          muted: '#8A7D6B',
          dark: '#0D0D0D',
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
