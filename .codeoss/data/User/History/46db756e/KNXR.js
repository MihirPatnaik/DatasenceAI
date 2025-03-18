/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#0033A0',
        'silver': '#B0BEC5',
        'light-blue': '#42A5F5',
        'light-gray': '#ECEFF1',
        'dark-gray': '#1A202C',
      },
      fontSize: {
        'xs': '0.75rem',   // 12px
        'sm': '0.875rem',  // 14px
        'base': '1rem',    // 16px
        'lg': '1.125rem',  // 18px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
      },
      fontWeight: {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
      },
    },
  },
  plugins: [],
};