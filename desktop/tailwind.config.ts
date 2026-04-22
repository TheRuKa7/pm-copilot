import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(220 14% 10%)",
        surface: "hsl(220 14% 14%)",
        border: "hsl(220 14% 22%)",
        foreground: "hsl(210 20% 92%)",
        muted: "hsl(215 14% 62%)",
        primary: "hsl(280 80% 68%)",
        success: "hsl(142 71% 45%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 84% 60%)",
      },
    },
  },
} satisfies Config;
