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
        // Neo-brutalist palette (light)
        brutal: {
          black: "#000000",
          white: "#FFFFFF",
          gray: {
            100: "#F5F5F5",
            200: "#E5E5E5",
            300: "#D4D4D4",
            400: "#A3A3A3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
          },
          accent: {
            yellow: "#FFE100", // Primary highlight
            blue: "#0066FF",   // Secondary highlight
            red: "#FF3300",    // Error/warning
            green: "#00CC66",  // Success
          }
        }
      },
      boxShadow: {
        // Hard shadows for neo-brutalist look
        brutal: "4px 4px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-hover": "6px 6px 0px 0px #000000",
      },
      borderWidth: {
        brutal: "2px",
      },
      borderRadius: {
        none: "0",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
