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
        // Supreme Brand Palette
        'harvics-maroon': '#6B1F2B',
        'harvics-gold': '#C3A35E',
        'harvics-gold-light': '#C3A35E',
        'ivory': '#F5F1E8',
        'ivory-primary': '#F5F1E8',
        'ivory-secondary': '#F5F1E8',
        // Aliases matching Supreme's CSS vars
        'burgundy': '#6B1F2B',
        'burgundy-deep': '#6B1F2B',
        'gold': '#C3A35E',
        'gold-bright': '#C3A35E',
        'maroon': '#6B1F2B',
        'maroon-deep': '#6B1F2B',
        // Legacy support
        'harvics-red': '#6B1F2B',
        'harvics-dark': '#6B1F2B',
        'harvics-gray': '#6B1F2B',
        'dark-red': '#6B1F2B',
        'golden': '#C3A35E',
        'metallic-gold': '#C3A35E',
        'light-gray': '#F5F1E8',
        // Functional
        'white-soft': '#F5F1E8',
        'text-primary': '#6B1F2B',
        'text-secondary': '#6B1F2B',
        'divider': '#C3A35E',
      },
      fontFamily: {
        'sans': ['-apple-system', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'serif': ['var(--font-playfair-display)', 'serif'],
        'display': ['-apple-system', 'system-ui', 'sans-serif'],
        'body': ['-apple-system', 'system-ui', 'sans-serif'],
        'accent': ['-apple-system', 'system-ui', 'sans-serif'],
        'harvics-logo': ['var(--font-playfair-display)', 'serif'],
      },
      borderRadius: {
        'none': '0',
        'DEFAULT': '0',
        'sm': '0',
        'md': '2px',
        'lg': '2px',
        'xl': '2px',
        'full': '0',
      },
      boxShadow: {
        'none': 'none',
        'DEFAULT': 'none',
        'sm': 'none',
        'md': 'none',
        'lg': 'none',
        'xl': 'none',
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
