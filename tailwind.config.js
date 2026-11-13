/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Insigrow Brand System
        insigrow: {
          bg: '#F4F8F8',        // Main soft off-white canvas
          card: '#FFFFFF',      // Pure white card background
          border: '#E5ECEE',    // Subtle grey-blue border
          borderLight: '#EEF3F4',
          navy: '#173B49',      // Deep navy primary typography
          navyDark: '#0F2833',  // Dark navy headings & emphasis
          navyLight: '#2A5567',
          slate: '#5A7184',     // Muted supporting text
          slateLight: '#8A9BA8',
          teal: '#087F8C',      // Insigrow primary accent
          tealHover: '#066B76',
          tealLight: '#EBF6F7',
          tealTint: '#F0F9FA',
          green: '#57945A',     // Insigrow secondary accent
          greenHover: '#497F4C',
          greenLight: '#EDF6EE',
          cyan: '#00A9DE',
          magenta: '#D06EBF',
        },
        workspace: {
          950: '#070B12',
          900: '#173B49',
          850: '#1F4757',
          800: '#2A5567',
          700: '#5A7184',
          200: '#E5ECEE',
          100: '#EEF3F4',
          50: '#F4F8F8',
        },
        brand: {
          500: '#087F8C',
          600: '#066B76',
          50: '#EBF6F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'insigrow-card': '0 1px 3px 0 rgba(23, 59, 73, 0.04), 0 1px 2px -1px rgba(23, 59, 73, 0.04)',
        'insigrow-hover': '0 10px 25px -5px rgba(23, 59, 73, 0.08), 0 8px 10px -6px rgba(23, 59, 73, 0.04)',
        'insigrow-teal': '0 4px 14px 0 rgba(8, 127, 140, 0.22)',
        'insigrow-green': '0 4px 14px 0 rgba(87, 148, 90, 0.22)',
      }
    },
  },
  plugins: [],
}
