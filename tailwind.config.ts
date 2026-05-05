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
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: "#191816",
        cream: "#fff3c7",
        mint: "#9ee8cf",
        sky: "#cbeeff",
        sun: "#ffd84d",
        coral: "#ff9b82",
      },
    },
  },
  plugins: [],
};
export default config;
