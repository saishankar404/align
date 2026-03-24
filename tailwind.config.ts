import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        parchment: "#F2EDE4",
        sand: "#E8E2D9",
        dusk: "#9E9485",
        border: "#DDD7CC",
        bs: "#C4BDB3",
        forest: "#5DBF8A",
        terra: "#E8694A",
        slate: "#B8AEE0",
      },
      fontFamily: {
        gtw: ["GTW", "sans-serif"],
        gtwc: ["GTWC", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
      },
      boxShadow: {
        phone: "0 60px 160px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
