/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'light-blue': '#3b96ff', // Updated from #4A90E2 for a brighter, modern blue
        'deep-blue': '#1A2538', // deep blue
        'white': '#FFFFFF',
        'silver': '#666',
        'light-gray': '#F5F7FA',
        'accent-pink': '#E24A90', // Optional accent for CTAs, highlights
        'growth-green': '#00FF00', // Optional for growth, success indicators
        'medium-blue': '#4A7DBF', // Medium blue for navbar, buttons, etc.
      },
      spacing: {
        '48': '12rem', // 192px
        '64': '16rem', // 256px
        '80': '20rem', // 320px
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025rem' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.025rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '0.025rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '0.025rem' }],
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
        'black': 900,
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-font-inter'),
  ],
};