/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lucidda-black': '#1a1a1a',
        'lucidda-gray': '#f5f5f5',
      },
      fontFamily: {
        'sans': ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
