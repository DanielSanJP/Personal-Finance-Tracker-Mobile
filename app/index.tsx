import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { useAuth } from "../hooks/queries/useAuth";

export default function Home() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-muted-foreground-light dark:text-muted-foreground-dark">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show welcome page for non-authenticated users
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="flex items-center">
          <View className="items-center gap-4">
            <Text className="text-2xl font-bold text-center text-foreground-light dark:text-foreground-dark mb-4">
              Welcome to your personal finance tracker
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
