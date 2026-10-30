/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#25D366',
          dark:  '#128C7E',
          light: '#DCF8C6',
        },
      },
    },
  },
  plugins: [],
};
