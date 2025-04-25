import type { Config } from "tailwindcss";

export default {
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
      },
    },
  },
  plugins: [
    require('daisyui'),

  ],
  daisyui: {
    themes: [{
      mytheme: {
        primary: "#000000",
        "new-color": "#eff1ae", 
        "primary-focus": "#570df8",
      },
    }, "light", "dark", "cupcake"],
  },
} satisfies Config;
