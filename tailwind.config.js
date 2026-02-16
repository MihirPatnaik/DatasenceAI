/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // ✅ ADD THIS LINE - Enables class-based dark mode
  theme: {
    extend: {
      colors: {
        "light-blue": "#3b96ff",
        "deep-blue": "#1A2538",
        "accent-pink": "#E2A490",
        "medium-blue": "#4A70BF",
        // Remove any complex color definitions for now
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};