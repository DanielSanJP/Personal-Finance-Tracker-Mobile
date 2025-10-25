import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/queries/useAuth";
import { useThemeToggle } from "../hooks/useThemeToggle";
import { supabase } from "../lib/supabase";
import Breadcrumbs from "./breadcrumbs";
import { Button } from "./ui/button";
import Logo from "./ui/logo";
import {
  NavDropdown,
  NavDropdownContent,
  NavDropdownItem,
  NavDropdownLabel,
  NavDropdownSeparator,
  NavDropdownTrigger,
} from "./ui/nav-dropdown";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useThemeToggle();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Get user metadata for display
  const userMetadata = user?.user_metadata || {};
  const displayName = userMetadata.display_name || user?.email || "User";

  // Generate initials from display_name or email
  const getInitials = () => {
    if (userMetadata.display_name) {
      const nameParts = userMetadata.display_name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${
          nameParts[nameParts.length - 1][0]
        }`.toUpperCase();
      }
      return userMetadata.display_name.substring(0, 2).toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };
  const initials = getInitials();

  // Handle sign out with navigation
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate to login page after signing out
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Determine if we should show dashboard tabs (when user is logged in and on dashboard pages)
  const showDashboardTabs =
    user &&
    (pathname === "/dashboard" ||
      pathname === "/transactions" ||
      pathname === "/accounts" ||
      pathname === "/budgets" ||
      pathname === "/goals" ||
      pathname === "/addtransaction" ||
      pathname === "/addincome" ||
      pathname === "/addaccount" ||
      pathname === "/settings" ||
      pathname === "/help" ||
      pathname === "/preferences" ||
      pathname === "/profile" ||
      pathname === "/reports" ||
      pathname?.startsWith("/(tabs)"));

  const navigationItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions", href: "/transactions" },
    { label: "Budgets", href: "/budgets" },
    { label: "Goals", href: "/goals" },
  ];

  // Function to determine if a tab is active
  const isActiveTab = (path: string) => pathname === path;

  return (
    <View className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
      {/* Main Navigation */}
      <SafeAreaView
        edges={[]}
        className="bg-background-light dark:bg-background-dark"
      >
        <View className="w-full px-4 sm:px-6 border-b border-border-light dark:border-border-dark">
          <View className="flex-row justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.push("/")}
                className="flex-row items-center"
                style={{ alignItems: "center" }}
              >
                <View style={{ width: 40, height: 40 }}>
                  <Logo width={40} height={40} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Navigation Actions */}
            {!showDashboardTabs && (
              <View className="flex-row flex-wrap items-center gap-2">
                <TouchableOpacity
                  onPress={toggleTheme}
                  className="p-2 rounded-lg bg-secondary-light dark:bg-secondary-dark"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg">{isDark ? "☀️" : "🌙"}</Text>
                </TouchableOpacity>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:size-default"
                  onPress={() =>
                    Linking.openURL(
                      "https://personal-finance-tracker-ashy-tau.vercel.app/guides"
                    )
                  }
                >
                  User Guide
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="sm:size-default"
                  onPress={() => router.push("/login")}
                >
                  Login
                </Button>
              </View>
            )}

            {showDashboardTabs && (
              <View className="flex-row items-center gap-2 sm:gap-3">
                <TouchableOpacity
                  onPress={toggleTheme}
                  className="p-2 rounded-lg bg-secondary-light dark:bg-secondary-dark"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg">{isDark ? "☀️" : "🌙"}</Text>
                </TouchableOpacity>
                <NavDropdown>
                  <NavDropdownTrigger asChild>
                    <TouchableOpacity
                      className="flex-row items-center gap-2 rounded-lg p-2"
                      activeOpacity={1}
                    >
                      <View className="w-8 h-8 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center">
                        <Text className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
                          {initials}
                        </Text>
                      </View>
                      <Text className="text-xs sm:text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        {displayName}
                      </Text>
                    </TouchableOpacity>
                  </NavDropdownTrigger>
                  <NavDropdownContent align="end" className="w-56">
                    <NavDropdownLabel>My Account</NavDropdownLabel>
                    <NavDropdownSeparator />
                    <NavDropdownItem onPress={() => router.push("/profile")}>
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        Profile
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/accounts")}>
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        Bank Accounts
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/reports")}>
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        View Reports
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/settings")}>
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        Settings
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem
                      onPress={() => router.push("/preferences")}
                    >
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        Preferences
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownSeparator />
                    <NavDropdownItem
                      onPress={() =>
                        Linking.openURL(
                          "https://personal-finance-tracker-ashy-tau.vercel.app/guides"
                        )
                      }
                    >
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        User Guides
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/help")}>
                      <Text className="text-foreground-light dark:text-foreground-dark">
                        Help & Support
                      </Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={handleSignOut}>
                      <Text className="text-destructive-light dark:text-destructive-dark">
                        Sign Out
                      </Text>
                    </NavDropdownItem>
                  </NavDropdownContent>
                </NavDropdown>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Dashboard Navigation Tabs */}
      {showDashboardTabs && (
        <View className="bg-secondary-light dark:bg-secondary-dark border-b border-border-light dark:border-border-dark">
          <View className="w-full px-4 sm:px-6 py-2">
            <View className="flex-row justify-evenly gap-1 sm:gap-3">
              {navigationItems.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => {
                    if (!isNavigating && !isActiveTab(item.href)) {
                      setIsNavigating(true);
                      router.push(item.href as any);
                      // Reset navigation state after a short delay
                      setTimeout(() => setIsNavigating(false), 500);
                    }
                  }}
                  disabled={isNavigating || isActiveTab(item.href)}
                  className={`flex-1 py-2 sm:py-3 px-1 sm:px-4 rounded-lg flex items-center justify-center ${
                    isActiveTab(item.href)
                      ? "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[11px] sm:text-sm font-medium ${
                      isActiveTab(item.href)
                        ? "text-foreground-light dark:text-foreground-dark"
                        : "text-muted-foreground-light dark:text-muted-foreground-dark"
                    }`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Breadcrumbs */}
      {showDashboardTabs && (
        <View className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
          <View className="w-full px-4 sm:px-6 py-3">
            <Breadcrumbs />
          </View>
        </View>
      )}
    </View>
  );
}
