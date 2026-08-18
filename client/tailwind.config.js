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
          DEFAULT: '#8B2500',
          50:  '#FDF0EC',
          100: '#F9D5C9',
          200: '#F2A999',
          300: '#E87D69',
          400: '#DD5139',
          500: '#8B2500',
          600: '#7A1F00',
          700: '#651A00',
          800: '#501400',
          900: '#3B0F00',
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
