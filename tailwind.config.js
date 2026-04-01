/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Supreme Brand Palette - Now references CSS variables
        'harvics-maroon': 'var(--harvics-maroon)',
        'harvics-maroon-dark': 'var(--harvics-maroon-dark)',
        'harvics-gold': 'var(--harvics-gold)',
        'harvics-gold-light': 'var(--harvics-gold-light)',
        'ivory': 'var(--harvics-white)',
        'ivory-primary': 'var(--harvics-white)',
        'ivory-secondary': 'var(--harvics-white)',
        // Status colors
        'status-success': 'var(--status-success)',
        'status-warning': 'var(--status-warning)',
        'status-error': 'var(--status-error)',
        'status-info': 'var(--status-info)',
        // Aliases matching CSS vars
        'burgundy': 'var(--burgundy)',
        'burgundy-deep': 'var(--harvics-maroon-deep)',
        'gold': 'var(--gold)',
        'gold-bright': 'var(--harvics-gold-light)',
        'maroon': 'var(--harvics-maroon)',
        'maroon-deep': 'var(--harvics-maroon-deep)',
        // Legacy support - maps to CSS vars
        'harvics-red': 'var(--harvics-maroon)',
        'harvics-dark': 'var(--harvics-maroon-dark)',
        'harvics-gray': 'var(--harvics-maroon)',
        'dark-red': 'var(--harvics-maroon-deep)',
        'golden': 'var(--harvics-gold)',
        'metallic-gold': 'var(--harvics-gold)',
        'light-gray': '#f5f5f5',
        // Functional
        'white-soft': 'var(--harvics-white)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'divider': 'var(--divider)',
      },
      fontFamily: {
        'sans': ['-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'serif': ['var(--font-playfair-display)', 'serif'],
        'mono': ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['-apple-system', 'system-ui', 'sans-serif'],
        'body': ['-apple-system', 'system-ui', 'sans-serif'],
        'accent': ['-apple-system', 'system-ui', 'sans-serif'],
        'harvics-logo': ['var(--font-playfair-display)', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
