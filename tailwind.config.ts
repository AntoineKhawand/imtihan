import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Editorial palette — ink, cream, emerald (kept for compatibility)
        ink: {
          DEFAULT: "#0a0a0a",
          900: "#111111",
          800: "#1a1a1a",
          700: "#2a2a2a",
          600: "#3d3d3d",
          500: "#5c5c5c",
          400: "#7a7a7a",
          300: "#a3a3a3",
          200: "#c7c7c7",
          100: "#e5e5e5",
        },
        cream: {
          DEFAULT: "#faf8f3",
          50: "#fdfcf8",
          100: "#faf8f3",
          200: "#f3f0e8",
          300: "#e8e3d6",
        },
        emerald: {
          DEFAULT: "#1a5e3f",
          50: "#effaf4",
          100: "#d8f2e1",
          200: "#b4e4c6",
          300: "#82cfa3",
          400: "#4fb17c",
          500: "#2f9560",
          600: "#1a5e3f",
          700: "#185c3f",
          800: "#164935",
          900: "#123c2c",
        },
        terracotta: {
          DEFAULT: "#b84a2a",
          400: "#d46b47",
          500: "#b84a2a",
          600: "#943820",
        },
        // ── Claymorphism design system ──────────────────────────────────────
        // Primary: Indigo #4F46E5
        primary: {
          DEFAULT: "#4F46E5",
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
        // Accent: Orange #EA580C
        "orange-accent": {
          DEFAULT: "#EA580C",
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
      },
      fontFamily: {
        // Original fonts (kept for compatibility)
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans:  ["var(--font-geist)", "system-ui", "sans-serif"],
        mono:  ["var(--font-geist-mono)", "monospace"],
        // New design-system fonts
        heading: ["var(--font-nunito)", "Nunito", "sans-serif"],
        body:    ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3.5rem, 8vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
