module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/templates/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Space Grotesk"', "sans-serif"],
      mono: ['"Raleway"'],
    },
    colors: {
      dark: {
        50: "#737373",
        100: "#666666",
        200: "#595959",
        300: "#4D4D4D",
        400: "#404040",
        500: "#333333",
        600: "#262626",
        700: "#1A1A1A",
        800: "#0D0D0D",
        900: "#000000",
      },
      light: {
        50: "#FFFFFF",
        100: "#F2F2F2",
        200: "#E6E6E6",
        300: "#D9D9D9",
        400: "#CCCCCC",
        500: "#BFBFBF",
        600: "#B3B3B3",
        700: "#A6A6A6",
        800: "#999999",
        900: "#8C8C8C",
      },
      primary: {
        50: "#E8DEFF",
        100: "#D9C7FF",
        200: "#B999FF",
        250: "#AD87FF",
        300: "#9A6BFF",
        400: "#7A3DFF",
        500: "#5B10FF",
        600: "#4A00EB",
        700: "#3E00C7",
        800: "#3400A3",
        900: "#28007F",
      },
      gray: {
        50: "#FAFAFA",
        75: "#F9F9F9",
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
    },
    extend: {
      screens: {
        xs: "390px", // Mobile - Large
        sm: "600px", // Tablet
        "3xl": "1920px", // Web - Extra large
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
