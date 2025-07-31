import { Link, usePathname, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser } from "../lib/data";
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
  const user = getCurrentUser();

  // Determine if we should show dashboard tabs (when user is logged in and on dashboard pages)
  const showDashboardTabs =
    user &&
    (pathname === "/dashboard" ||
      pathname === "/transactions" ||
      pathname === "/budgets" ||
      pathname === "/goals" ||
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
    <>
      {/* Main Navigation */}
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="bg-white">
          <View className="w-full px-6 border-b border-gray-200">
            <View className="flex-row justify-between items-center h-16">
              {/* Logo and Title */}
              <View className="flex-row items-center flex-1">
                <TouchableOpacity
                  onPress={() => router.push("/")}
                  className="flex-row items-center"
                  style={{ alignItems: "center" }}
                >
                  <View style={{ width: 32, height: 32, marginRight: 12 }}>
                    <Logo width={32} height={32} />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">
                    Personal Finance Tracker
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Navigation Actions */}
              {!showDashboardTabs && (
                <View className="flex-row flex-wrap items-center gap-2">
                  <Link href="/login" asChild>
                    <Button variant="default">Login</Button>
                  </Link>
                </View>
              )}

              {showDashboardTabs && (
                <View className="flex-row items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TouchableOpacity className="flex-row items-center gap-3 hover:bg-gray-100 rounded-lg p-2">
                        <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                          <Text className="text-sm font-medium text-gray-600">
                            {user.initials}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-600">
                          {user.displayName}
                        </Text>
                      </TouchableOpacity>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onPress={() => router.push("/dashboard")}
                      >
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onPress={() => router.push("/transactions")}
                      >
                        Transactions
                      </DropdownMenuItem>
                      <DropdownMenuItem onPress={() => router.push("/budgets")}>
                        Budgets
                      </DropdownMenuItem>
                      <DropdownMenuItem onPress={() => router.push("/goals")}>
                        Goals
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onPress={() => router.push("/login")}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Dashboard Navigation Tabs */}
      {showDashboardTabs && (
        <View className="bg-zinc-100 border-b border-gray-200">
          <View className="w-full px-6 py-2">
            <View className="flex-row justify-evenly gap-3">
              {navigationItems.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => router.push(item.href as any)}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
                    isActiveTab(item.href)
                      ? "bg-white text-black border border-gray-200"
                      : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isActiveTab(item.href) ? "text-black" : "text-zinc-500"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </>
  );
}
