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
    container: {
      screens: {
        sm: "600px",
        md: "768px",
        lg: "984px",
        xl: "1240px",
      },
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
        "2xl": "1280px",
        "3xl": "1440px",
      },
      fontSize: {
        "4xl": ["2.5rem", "3rem"],
        "5xl": ["3rem", "3.5rem"],
        "5.5xl": ["3.5rem", "4.5rem"],
        "7.5xl": ["5.25rem", "6rem"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "h5, h6": {
              color: theme("colors.emerald.700"),
              fontWeight: "bold",
              fontFamily: theme("fontFamily.serif"),
            },
            "h1 strong": {
              color: `${theme("colors.emerald.700")} !important`,
            },
          },
        },
      }),
      keyframes: {
        "slide-right": {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        "slide-left": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
