import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../lib/utils";
import { signInWithEmail } from "../lib/auth";
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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Only proceed if both email and password are filled
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail({ email: email.trim(), password });
      router.push("/dashboard");
    } catch (error) {
      Alert.alert(
        "Login Error",
        error instanceof Error ? error.message : "Failed to sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Add forgot password logic here
    console.log("Forgot password pressed");
  };

  const handleSignUp = () => {
    router.push("/register");
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
              <Button
                variant="default"
                onPress={handleLogin}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
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
                size="lg"
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
