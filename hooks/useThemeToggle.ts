import { colorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { storage } from "../lib/storage";

const THEME_KEY = "theme_preference";

/**
 * Hook for toggling theme between light and dark mode
 * Uses local storage for all users (no database persistence)
 */
export function useThemeToggle() {
  const systemColorScheme = useSystemColorScheme();
  
  // Get current theme from colorScheme
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
    colorScheme.get() || "light"
  );

  // Sync state with colorScheme changes
  useEffect(() => {
    const theme = colorScheme.get();
    if (theme) {
      setCurrentTheme(theme);
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    // Apply theme immediately
    colorScheme.set(newTheme);
    setCurrentTheme(newTheme);

    // Save to local storage for all users
    await storage.setItem(THEME_KEY, newTheme);
  };

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        colorScheme.set(savedTheme);
        setCurrentTheme(savedTheme);
      } else {
        // Default to system theme
        const systemTheme = systemColorScheme === "dark" ? "dark" : "light";
        colorScheme.set(systemTheme);
        setCurrentTheme(systemTheme);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  return {
    currentTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
  };
}
