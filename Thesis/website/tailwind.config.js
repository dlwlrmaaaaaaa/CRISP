/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        "main": "#0C3B2D",
        "second": "#F0F4C3",
        "accent": "#8BC34A",
        "square": "#8bc34a1a",
        "textSecond": "#0c3b2daf",
      },
    },
  },
  plugins: [],
}

