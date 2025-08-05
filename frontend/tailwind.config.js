/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New vibrant blue primary
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#00d4ff',
          600: '#0ea5e9',
          700: '#0284c7',
          800: '#0369a1',
          900: '#0c4a6e',
        },
        // Dark background colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#1a1a1a',
          800: '#141414',
          900: '#0a0a0a',
        },
        // Gradient colors
        gradient: {
          blue: '#00d4ff',
          purple: '#7c3aed',
          pink: '#ec4899',
          cyan: '#06b6d4',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #00d4ff 100%)',
      }
    },
  },
  plugins: [],
}
