import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        background: "#0a0a0f",
        glass: "rgba(255, 255, 255, 0.05)",
        "glass-border": "rgba(255, 255, 255, 0.08)",
      },
      boxShadow: {
        glow: "0 0 20px 4px rgba(99, 102, 241, 0.15)",
        "glow-lg": "0 0 40px 8px rgba(99, 102, 241, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
