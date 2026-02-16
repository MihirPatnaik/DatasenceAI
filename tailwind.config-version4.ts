// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "light-blue": "#3b96ff",
        "deep-blue": "#1A2538",
        white: "#FFFFFF",
        silver: "#666",
        "light-gray": "#F5F7FA",
        "accent-pink": "#E24A90",
        "growth-green": "#00FF00",
        "medium-blue": "#4A7DBF",
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
  plugins: [
    // Remove @tailwindcss/typography for now to test
    // require("@tailwindcss/typography"),
  ],
} satisfies Config