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
import { Button } from "../components/ui/button";
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
              <CardHeader>
                <CardTitle className="text-center">
                  Login to your account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <View className="flex gap-6">
                  <View className="gap-3">
                    <Text className="text-sm font-medium text-gray-900 mb-1">
                      Email
                    </Text>
                    <TextInput
                      placeholder="m@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500"
                      placeholderTextColor="#6b7280"
                    />
                  </View>

                  <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-gray-900 mb-1">
                        Password
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-sm text-blue-600 underline">
                          Forgot your password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-500"
                      placeholderTextColor="#6b7280"
                    />
                  </View>

                  <View className="gap-3">
                    <Button onPress={handleLogin} className="w-full">
                      <Text className="text-white font-semibold">Login</Text>
                    </Button>

                    <Text className="text-center text-sm text-gray-600 mt-4">
                      Don&apos;t have an account?
                    </Text>

                    <Button
                      variant="outline"
                      onPress={handleContinueAsGuest}
                      className="w-full"
                    >
                      <Text className="text-gray-700 font-semibold">
                        Continue as Guest
                      </Text>
                    </Button>
                  </View>
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
