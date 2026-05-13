const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false,
  mode: "jit",
  theme: {
    colors: {
      rose: colors.rose,
      fuchsia: colors.fuchsia,
      indigo: colors.indigo,
      slate: colors.slate,
      white: colors.white,
      black: colors.black,
      blue: colors.blue,
      green: colors.green,
      red: colors.red,
      pink: colors.pink,
      transparent: "transparent",
      current: "currentColor",
    },
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        lato: ["lato", "sans-serif"],
        sans: [
          "lato",
          "BlinkMacSystemFont",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["Source Code Pro", "Menlo", "monospace"],
      },

      colors: {
        // ── TYHO Brand Palette ──────────────────────────────────────────────
        brand: {
          // Primary purple
          primary:        "#888CC4",  // main lilac — buttons, accents
          "primary-hover":"#7A7EB5",  // hover / pressed state
          "primary-light":"#C5C8E3",  // tinted highlight, focus rings
          "primary-muted":"#9FA0B7",  // disabled / subdued purple

          // Secondary purple (lighter lavender)
          secondary:      "#B5B9E8",  // badges, secondary actions
          "secondary-dark":"#6B6FA8", // secondary text on light bg

          // Dark surfaces — meeting room
          dark:           "#1B1C27",  // base / page bg (dark mode)
          panel:          "#252636",  // tiles, cards (dark mode)
          item:           "#2D2E40",  // list rows, chat bubbles
          separator:      "#3D3E50",  // dividers, strokes (dark mode)
          void:           "#050A0E",  // deepest black

          // Light surfaces — joining / leave screen
          bg:             "#F5F6FF",  // app background (light mode)
          "bg-alt":       "#F5F7F9",  // alternate light surface
          "bg-input":     "#F5F5F5",  // input / unselected chip bg
          "bg-purple":    "#EEF2FF",  // purple-tinted light surface
          "border-light": "#EEEEEE",  // hairline borders (light mode)
          divider:        "#D9D9D9",  // separator / progress track

          // Typography
          text:           "#1B1C27",  // primary body text
          "text-muted":   "#888888",  // secondary / helper text
          "text-faint":   "#9E9EA7",  // placeholder / tertiary
          "text-disabled":"#B4B4B4",  // disabled state

          // Status
          danger:         "#FF5D5D",  // destructive actions
          warning:        "#FAA713",  // warnings / alerts
          success:        "#3BA55D",  // success states
        },

        // ── Legacy gray scale (kept for backward-compat) ────────────────────
        gray: {
          50:  "#555555",
          100: "#FFFFFF",
          150: "#3f4046",
          200: "#EFEFEF",
          250: "#3F4346",
          300: "#DADADA",
          350: "#344154",
          400: "#818181",
          450: "#455A64",
          500: "#6F767E",
          600: "#404B53",
          650: "#202427",
          700: "#232830",
          750: "#1A1C22",
          800: "#050A0E",
          850: "#26282C",
          900: "#95959E",
        },
        orange:     { 250: "#FF5810", 350: "#FF5D5D" },
        yellow:     { 150: "#FF900C" },
        purple: {
          300: "#4658BB",
          350: "#5568FE",
          550: "#596BFF",
          600: "#586FEA",
          650: "#2B3480",
          700: "#4F63D2",
          750: "#6246FB",
        },
        red:        { 150: "#D32F2F", 250: "#FF6262", 650: "#FF5D5D" },
        pink:       { 150: "#EC4899", 250: "#FFB5B5", 750: "#2c1a22" },
        green: {
          150: "#3BA55D",
          250: "#40A954",
          350: "#34A85333",
          450: "#34A85380",
          550: "#87E5A2",
          650: "#96F3D24D",
          750: "#A3FEE3",
        },
        blue:       { 350: "#76d9e6" },
        customGray: {
          100: "#252A34",
          150: "#31353B",
          200: "#1E1E1E",
          250: "#B4B4B4",
          300: "#454545",
          350: "#2B303499",
          400: "#282828",
          500: "#848484",
          600: "#C4C4C4",
          700: "#272727",
          800: "#343434",
          850: "#9E9DA6",
          900: "#373C43",
        },
      },
    },
  },
  variants: { extend: {} },
  plugins: [],
};
