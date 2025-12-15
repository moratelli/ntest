/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ff00',
          dark: '#00cc00',
        },
        bg: {
          primary: '#1a1a1a',
          secondary: '#2a2a2a',
          tertiary: '#333',
        },
        border: {
          DEFAULT: '#444',
          light: '#555',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
