/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable dark mode via class strategy

  // Disable reanimated for Expo Go compatibility
  experimental: {
    cssInterop: {
      disableAnimations: true,
    },
  },
  theme: {
    extend: {
      colors: {
        // Custom semantic colors using your exact values from global.css
        // Use with dark: variant, e.g., bg-background-light dark:bg-background-dark
        "background-light": "#ffffff",
        "background-dark": "#0a0a0a",
        "foreground-light": "#0a0a0a",
        "foreground-dark": "#fcfcfc",
        "card-light": "#ffffff",
        "card-dark": "#1a1a1a",
        "card-foreground-light": "#0a0a0a",
        "card-foreground-dark": "#fcfcfc",
        "primary-light": "#1a1a1a",
        "primary-dark": "#ebebeb",
        "primary-foreground-light": "#fcfcfc",
        "primary-foreground-dark": "#1a1a1a",
        "secondary-light": "#f7f7f7",
        "secondary-dark": "#444444",
        "secondary-foreground-light": "#1a1a1a",
        "secondary-foreground-dark": "#fcfcfc",
        "muted-light": "#f7f7f7",
        "muted-dark": "#444444",
        "muted-foreground-light": "#8e8e8e",
        "muted-foreground-dark": "#b5b5b5",
        "destructive-light": "#dc4439",
        "destructive-dark": "#cc5b49",
        "destructive-foreground-light": "#fcfcfc",
        "destructive-foreground-dark": "#fcfcfc",
        "border-light": "#ebebeb",
        "border-dark": "#999999",
        "input-light": "#ebebeb",
        "input-dark": "#2a2a2a",
      },
      borderRadius: {
        lg: "10px", // var(--radius) = 0.625rem = 10px
        md: "8px", // calc(var(--radius) - 2px) = 8px
        sm: "6px", // calc(var(--radius) - 4px) = 6px
      },
      fontSize: {
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
      },
    },
  },
};
