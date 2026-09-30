/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          bg: '#0C1317',
          surface: '#111B21',
          card: '#202C33',
          border: '#222E35',
          hover: '#182229',
          muted: '#8696A0',
          text: '#E9EDEF',
          teal: '#00A884',
          green: '#25D366',
          darkgreen: '#075E54',
          header: '#202C33',
        }
      }
    },
  },
  plugins: [],
}
