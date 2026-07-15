/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
        },
        ember: {
          400: "#FF8A5C",
          500: "#F2673D",
          600: "#D9502A",
        },
        sage: {
          400: "#8FBFA0",
          500: "#6BA382",
        },
        gold: {
          400: "#E8C468",
          500: "#D4AF37",
        },
        parchment: "rgb(var(--parchment) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(242, 103, 61, 0.45)",
      },
    },
  },
  plugins: [],
};
