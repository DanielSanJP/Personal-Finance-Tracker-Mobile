import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Nav from "../components/nav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // For now, just navigate to dashboard
    router.push("/dashboard");
  };

  const handleContinueAsGuest = () => {
    router.push("/dashboard");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Nav />

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-sm">
            <Card className="bg-white shadow-lg border border-gray-100">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome Back
                </CardTitle>
                <Text className="text-gray-600 mt-2">
                  Sign in to your account to continue
                </Text>
              </CardHeader>

              <CardContent className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500"
                    placeholderTextColor="#6b7280"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500"
                    placeholderTextColor="#6b7280"
                  />
                </View>

                <View className="gap-3">
                  <TouchableOpacity
                    onPress={handleLogin}
                    className="w-full bg-black rounded-md py-3 px-4"
                  >
                    <Text className="text-white font-semibold text-center">
                      Login
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-center text-sm text-gray-600 mt-4">
                    Don&apos;t have an account?
                  </Text>

                  <TouchableOpacity
                    onPress={handleContinueAsGuest}
                    className="w-full border border-gray-300 rounded-md py-3 px-4"
                  >
                    <Text className="text-gray-700 font-semibold text-center">
                      Continue as Guest
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity>
                  <Text className="text-center text-sm text-blue-600 underline mt-4">
                    Sign up
                  </Text>
                </TouchableOpacity>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
