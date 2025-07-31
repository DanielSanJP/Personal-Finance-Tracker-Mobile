import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { LoginForm } from "../components/login-form";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Nav />

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-sm">
            <LoginForm />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
