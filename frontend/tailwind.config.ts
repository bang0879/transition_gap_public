import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        ink: "var(--ink)",
        surface: {
          DEFAULT: "var(--surface)",
          warm: "var(--surface-warm)",
        },
        teal: {
          DEFAULT: "var(--teal)",
          deep: "var(--teal-deep)",
          soft: "var(--teal-soft)",
          line: "var(--teal-line)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
        },
        coral: {
          DEFAULT: "var(--coral)",
          soft: "var(--coral-soft)",
        },
        green: {
          DEFAULT: "var(--green)",
          soft: "var(--green-soft)",
        },
        red: {
          DEFAULT: "var(--red)",
          soft: "var(--red-soft)",
        },
        "blue-soft": "var(--blue-soft)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Pretendard",
          "Noto Sans KR",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.08)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
