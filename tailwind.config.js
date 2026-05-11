/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        phase: {
          1: '#22c55e',
          2: '#3b82f6',
          3: '#a855f7',
          4: '#f59e0b',
          5: '#10b981',
          6: '#f97316',
          7: '#ec4899',
          8: '#6b7280',
          9: '#14b8a6',
        },
      },
    },
  },
  plugins: [],
}
