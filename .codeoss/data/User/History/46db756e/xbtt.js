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
    },
  },
  plugins: [],
};