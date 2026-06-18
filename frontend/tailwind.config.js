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
        // Incoestructura — forest/sage scale
        brand: {
          50:  '#f0f3ee',
          100: '#dde6d9',
          200: '#c2d2bd',
          300: '#a9c3a6',
          400: '#8fa88e',
          500: '#6b8068',
          600: '#2e5b3c',
          700: '#244a30',
          800: '#1b2a1f',
          900: '#141b16',
        },
      },
      fontFamily: {
        sans:    ['var(--font-body)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        code:    ['var(--font-code)', 'ui-monospace', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
