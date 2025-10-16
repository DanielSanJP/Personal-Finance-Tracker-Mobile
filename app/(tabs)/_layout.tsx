import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useAuth } from "../../hooks/queries/useAuth";

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide the default tab bar since we have custom nav
        animation: "none",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: "Budgets",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
        }}
      />
    </Tabs>
  );
}
