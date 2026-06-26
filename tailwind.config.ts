import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // BANDITA brand palette — exact values from the brand guide
        creme: "#FCF6EC",
        pink: "#FB003F",
        ink: "#1A1216",
        coral: "#FF8A5B",
        gelb: "#FFC23D",
        teal: "#5FC9BC",
        rose: "#FF5C9E",
      },
      fontFamily: {
        display: ["var(--font-bodoni)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.35em",
      },
      transitionTimingFunction: {
        bandita: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "grain-shift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-2%, 1%)" },
          "50%": { transform: "translate(1%, -2%)" },
          "75%": { transform: "translate(2%, 2%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        "grain-shift": "grain-shift 8s steps(4) infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
