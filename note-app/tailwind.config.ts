import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ダークモード基調のカラーパレット
        dark: {
          bg: "#0f0f0f",
          surface: "#1a1a1a",
          elevated: "#242424",
          border: "#2e2e2e",
          hover: "#2a2a2a",
        },
        accent: {
          DEFAULT: "#7c6af7",
          hover: "#9585f8",
          muted: "#3d3660",
        },
        text: {
          primary: "#e8e8e8",
          secondary: "#a0a0a0",
          muted: "#6b6b6b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-in-out",
        "slide-in": "slideIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
