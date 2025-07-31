import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import { getCurrentUser } from "../lib/data";

export default function Home() {
  const user = getCurrentUser();

  // Show welcome page - let users choose their path
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Nav />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="flex items-center gap-8">
          <View className="items-center gap-4">
            <Text className="text-3xl font-bold text-center text-gray-900">
              Personal Finance Tracker
            </Text>
            <Text className="text-lg text-center text-gray-600">
              Take control of your finances with smart budgeting and tracking
            </Text>
          </View>

          <View className="w-full max-w-sm gap-4">
            {user ? (
              <Button
                onPress={() => router.push("/dashboard")}
                className="w-full"
              >
                <Text className="text-white font-semibold">
                  Go to Dashboard
                </Text>
              </Button>
            ) : (
              <>
                <Button
                  onPress={() => router.push("/login")}
                  className="w-full"
                >
                  <Text className="text-white font-semibold">Get Started</Text>
                </Button>

                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-center text-blue-600 font-medium">
                    Already have an account? Sign in
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
