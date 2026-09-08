/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './emails/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        meet: {
          bg: '#0a0808',
          panel: '#141010',
          gold: '#c3a35e',
          border: '#3d2a1a',
        },
      },
    },
  },
  plugins: [],
}
