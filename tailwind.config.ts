import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primaryTheme: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondaryTheme: "rgb(var(--primary-rgb) / <alpha-value>)",
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primaryTheme: "var(--primary-color)",
          // primary: "var(--primary-color)",
          // "primary-focus": "var(--primary-color)",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primaryTheme: "var(--primary-color)",
          // primary: "var(--primary-color)",
          // "primary-focus": "var(--primary-color)",
        },
      },
      "cupcake"
    ],
  },
} satisfies Config;
