/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Exact colors from web app globals.css (:root)
        border: "oklch(0.922 0 0)",
        input: "oklch(0.922 0 0)",
        ring: "oklch(0.708 0 0)",
        background: "oklch(1 0 0)",
        foreground: "oklch(0.145 0 0)",
        primary: {
          DEFAULT: "oklch(0.205 0 0)",
          foreground: "oklch(0.985 0 0)",
        },
        secondary: {
          DEFAULT: "oklch(0.97 0 0)",
          foreground: "oklch(0.205 0 0)",
        },
        destructive: {
          DEFAULT: "oklch(0.577 0.245 27.325)",
          foreground: "oklch(0.985 0 0)",
        },
        muted: {
          DEFAULT: "oklch(0.97 0 0)",
          foreground: "oklch(0.556 0 0)",
        },
        accent: {
          DEFAULT: "oklch(0.97 0 0)",
          foreground: "oklch(0.205 0 0)",
        },
        popover: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.145 0 0)",
        },
        card: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.145 0 0)",
        },
        // Chart colors from web app
        chart: {
          1: "oklch(0.646 0.222 41.116)",
          2: "oklch(0.6 0.118 184.704)",
          3: "oklch(0.398 0.07 227.392)",
          4: "oklch(0.828 0.189 84.429)",
          5: "oklch(0.769 0.188 70.08)",
        },
        // Sidebar colors from web app
        sidebar: {
          DEFAULT: "oklch(0.985 0 0)",
          foreground: "oklch(0.145 0 0)",
          primary: "oklch(0.205 0 0)",
          "primary-foreground": "oklch(0.985 0 0)",
          accent: "oklch(0.97 0 0)",
          "accent-foreground": "oklch(0.205 0 0)",
          border: "oklch(0.922 0 0)",
          ring: "oklch(0.708 0 0)",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "calc(0.625rem - 2px)",
        sm: "calc(0.625rem - 4px)",
      },
    },
  },
  plugins: [],
};
