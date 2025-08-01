import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";

export default function Home() {
  // Show welcome page - let users choose their path
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Nav />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="flex items-center gap-8">
          <View className="items-center gap-4">
            <Text className="text-lg text-center text-gray-700">
              Welcome to your personal finance tracker
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
