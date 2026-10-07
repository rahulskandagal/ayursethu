/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f1f7f3",
          100: "#dcebe0",
          200: "#b9d7c2",
          300: "#8fbd9d",
          400: "#5f9c75",
          500: "#3f7f57",
          600: "#2f6644",
          700: "#275238",
          800: "#21422e",
          900: "#1c3627",
        },
        cream: {
          50: "#fffdf7",
          100: "#fdf8ea",
          200: "#faf0d2",
        },
        gold: {
          400: "#d9b45b",
          500: "#c69a3a",
          600: "#a87f2c",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(33, 66, 46, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
