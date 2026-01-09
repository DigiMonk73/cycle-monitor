/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0f',
        neonGreen: '#00ff88',
        neonYellow: '#ffcc00',
        neonOrange: '#ff8800',
        neonRed: '#ff3344',
      },
      boxShadow: {
        neonGreen: '0 0 10px #00ff88, 0 0 20px #00ff8866',
        neonYellow: '0 0 10px #ffcc00, 0 0 20px #ffcc0066',
        neonOrange: '0 0 10px #ff8800, 0 0 20px #ff880066',
        neonRed: '0 0 10px #ff3344, 0 0 20px #ff334466',
      },
    },
  },
  plugins: [],
}
