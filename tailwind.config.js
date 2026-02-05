/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clock: {
          green: '#10b981',
          yellow: '#fbbf24',
          orange: '#f97316',
          red: '#ef4444',
          darkred: '#991b1b',
        },
      },
    },
  },
  plugins: [],
}
