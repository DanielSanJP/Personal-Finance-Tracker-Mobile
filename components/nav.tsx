import { Link, usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth-context";
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
  const { user, signOut } = useAuth();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Handle sign out with navigation
  const handleSignOut = async () => {
    try {
      await signOut();
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
    <View className="bg-white">
      {/* Main Navigation */}
      <SafeAreaView edges={[]} className="bg-white">
        <View className="w-full px-4 sm:px-6 border-b border-gray-200">
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
                <Link href="/login" asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="sm:size-default"
                  >
                    Login
                  </Button>
                </Link>
              </View>
            )}

            {showDashboardTabs && (
              <View className="flex-row items-center gap-2 sm:gap-3">
                <NavDropdown>
                  <NavDropdownTrigger asChild>
                    <TouchableOpacity className="flex-row items-center gap-2 hover:bg-gray-100 rounded-lg p-2">
                      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-sm font-medium text-gray-600">
                          {user.initials}
                        </Text>
                      </View>
                      <Text className="text-xs sm:text-sm text-gray-600">
                        {user.display_name}
                      </Text>
                    </TouchableOpacity>
                  </NavDropdownTrigger>
                  <NavDropdownContent align="end" className="w-56">
                    <NavDropdownLabel>My Account</NavDropdownLabel>
                    <NavDropdownSeparator />
                    <NavDropdownItem onPress={() => router.push("/profile")}>
                      <Text>Profile</Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/accounts")}>
                      <Text>Bank Accounts</Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/reports")}>
                      <Text>View Reports</Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={() => router.push("/settings")}>
                      <Text>Settings</Text>
                    </NavDropdownItem>
                    <NavDropdownItem
                      onPress={() => router.push("/preferences")}
                    >
                      <Text>Preferences</Text>
                    </NavDropdownItem>
                    <NavDropdownSeparator />
                    <NavDropdownItem onPress={() => router.push("/help")}>
                      <Text>Help & Support</Text>
                    </NavDropdownItem>
                    <NavDropdownItem onPress={handleSignOut}>
                      <Text className="text-red-600">Sign Out</Text>
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
        <View className="bg-zinc-100 border-b border-gray-200">
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
                      ? "bg-white text-black border border-gray-200"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-[11px] sm:text-sm font-medium ${
                      isActiveTab(item.href) ? "text-black" : "text-zinc-500"
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
        <View className="bg-gray-50 border-b border-gray-200">
          <View className="w-full px-4 sm:px-6 py-3">
            <Breadcrumbs />
          </View>
        </View>
      )}
    </View>
  );
}
