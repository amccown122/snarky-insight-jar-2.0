/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        md: '840px',
      },
      colors: {
        brand: {
          50: '#fff7ec',
          100: '#feefd8',
          200: '#fdd9a8',
          300: '#fbc478',
          400: '#f7a341',
          500: '#f38b1d',
          600: '#d87310',
          700: '#b0590e',
          800: '#8a4611',
          900: '#6f3a11',
        },
      },
      boxShadow: {
        coin: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.25), 0 3px 8px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}

