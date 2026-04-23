/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d', // Dark green passing security vibe
        },
        'dark': {
          DEFAULT: '#0f172a',
          lighter: '#1e293b'
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        ':root': {
          // Brand palette CSS variables
          '--color-brand-50': '#f0fdf4',
          '--color-brand-100': '#dcfce7',
          '--color-brand-500': '#22c55e',
          '--color-brand-600': '#16a34a',
          '--color-brand-700': '#15803d',
          '--color-brand-800': '#166534',
          '--color-brand-900': '#14532d',
          // Neutral palette
          '--color-slate-50': '#f8fafc',
          '--color-slate-100': '#f1f5f9',
          '--color-slate-200': '#e2e8f0',
          '--color-slate-600': '#475569',
          '--color-slate-700': '#334155',
          '--color-slate-900': '#0f172a',
        }
      })
    }
  ],
}