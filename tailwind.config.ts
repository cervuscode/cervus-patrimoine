import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cervus-gold": "#795D48",
        "cervus-gold-dark": "#5D4738",
        "cervus-gold-light": "#a07d62",
        "cervus-dark": "#0f0f0f",
        "cervus-cream": "#f8f5f1",
        "cervus-bronze": "#F2EDE8",
        "cervus-bronze-card": "#EDE8E3",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        slideInUp:   { "0%": { opacity: "0", transform: "translateY(28px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInDown: { "0%": { opacity: "0", transform: "translateY(-28px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "slide-in-up":   "slideInUp 0.35s ease-out",
        "slide-in-down": "slideInDown 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
