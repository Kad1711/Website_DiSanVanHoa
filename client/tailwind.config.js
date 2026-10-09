/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B0F00',
          50:  '#FAF2EE',
          100: '#F4E0DA',
          200: '#E9C2B5',
          300: '#D89B88',
          400: '#B4573D',
          500: '#82250B',
          600: '#5E1A05',
          700: '#4A1402',
          800: '#3B0F00',
          900: '#280A00',
          950: '#170500',
        },
        secondary: {
          DEFAULT: '#C8973A',
          50:  '#FDF8EE',
          100: '#F9EDCF',
          200: '#F1D79F',
          300: '#E8C06F',
          400: '#DFAA3F',
          500: '#C8973A',
          600: '#A67D30',
          700: '#856426',
          800: '#644B1C',
          900: '#433212',
        },
        earth: '#6B4226',
        forest: '#2D5016',
        cream: '#FAF7F2',
        ivory: '#F5F0E8',
        surface: '#FFFFFF',
        muted: '#9CA3AF',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/hero-pattern.svg')",
      },
    },
  },
  plugins: [],
}
