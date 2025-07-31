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
            <Text className="text-lg text-center text-gray-600">
              Welcome to your personal finance tracker
            </Text>
          </View>

          <View className="w-full max-w-sm gap-4"></View>
        </View>
      </View>
    </SafeAreaView>
  );
}
