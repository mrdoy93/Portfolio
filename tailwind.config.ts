import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#07090d", panel: "#10151c", sky: "#73d7ff", mist: "#c4efff" },
      fontFamily: { mono: ["var(--font-mono)", "monospace"], sans: ["var(--font-sans)", "sans-serif"] }
    }
  },
  plugins: []
};

export default config;

