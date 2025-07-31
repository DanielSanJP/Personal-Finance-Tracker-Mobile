import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { router } from "expo-router";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Only proceed if both email and password are filled
    if (!email.trim() || !password.trim()) {
      console.log("Please fill in both email and password");
      return;
    }

    // Add your authentication logic here
    console.log("Login attempt with:", { email, password });
    // For now, just navigate to dashboard
    router.push("/dashboard");
  };

  const handleForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password pressed");
  };

  const handleSignUp = () => {
    // Add sign up navigation logic here
    console.log("Sign up pressed");
  };

  const handleContinueAsGuest = () => {
    router.push("/dashboard");
  };

  return (
    <View className={cn("flex gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex gap-6">
            <View className="gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChangeText={setEmail}
                placeholder="m@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="ml-auto text-sm underline">
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>
              <Input
                id="password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
                autoComplete="password"
              />
            </View>
            <View className="flex gap-3">
              <Button onPress={handleLogin} className="w-full">
                Login
              </Button>
              <View className="mt-4 text-center">
                <Text className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?
                </Text>
              </View>
              <Button
                variant="outline"
                onPress={handleContinueAsGuest}
                className="w-full"
              >
                Continue as Guest
              </Button>
            </View>
          </View>
          <View className="mt-4 text-center">
            <TouchableOpacity onPress={handleSignUp}>
              <Text className="text-center text-sm underline">Sign up</Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
