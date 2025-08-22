import { Link, usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth-context";
import Breadcrumbs from "./breadcrumbs";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Logo from "./ui/logo";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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
            {/* Logo and Title */}
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => router.push("/")}
                className="flex-row items-center"
                style={{ alignItems: "center" }}
              >
                <View
                  style={{ width: 24, height: 24, marginRight: 8 }}
                  className="sm:w-8 sm:h-8 sm:mr-3"
                >
                  <Logo width={24} height={24} />
                </View>
                <Text
                  className="text-sm sm:text-lg font-bold text-gray-900 flex-shrink"
                  numberOfLines={1}
                >
                  Personal Finance Tracker
                </Text>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TouchableOpacity className="flex-row items-center gap-2 hover:bg-gray-100 rounded-lg p-2">
                      <View className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-xs sm:text-sm font-medium text-gray-600">
                          {user.initials}
                        </Text>
                      </View>
                      <Text className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                        {user.display_name}
                      </Text>
                    </TouchableOpacity>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onPress={() => router.push("/profile")}>
                      <Text>Profile</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => router.push("/accounts")}>
                      <Text>Bank Accounts</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => router.push("/reports")}>
                      <Text>View Reports</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={() => router.push("/settings")}>
                      <Text>Settings</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onPress={() => router.push("/preferences")}
                    >
                      <Text>Preferences</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onPress={() => router.push("/help")}>
                      <Text>Help & Support</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onPress={handleSignOut}>
                      <Text className="text-red-600">Sign Out</Text>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  onPress={() => router.push(item.href as any)}
                  className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg flex items-center justify-center ${
                    isActiveTab(item.href)
                      ? "bg-white text-black border border-gray-200"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-xs sm:text-sm font-medium ${
                      isActiveTab(item.href) ? "text-black" : "text-zinc-500"
                    }`}
                    numberOfLines={1}
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
