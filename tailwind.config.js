/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: '#0f2942',
          deep: '#0a1d30',
          blue: '#1d4ed8',
          teal: '#0d9488',
          cyan: '#06b6d4',
          accent: '#0284c7',
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#64748b',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}

