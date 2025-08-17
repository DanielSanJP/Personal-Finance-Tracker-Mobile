import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { cn } from "../lib/utils";
import { signUpWithEmail } from "../lib/auth";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface RegisterFormProps {
  className?: string;
}

export function RegisterForm({ className }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (result.session) {
        // User is signed in immediately
        router.push("/dashboard");
      } else {
        // Email confirmation is required
        Alert.alert(
          "Registration Successful",
          "Please check your email for verification before signing in.",
          [
            {
              text: "OK",
              onPress: () => router.push("/login"),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Registration Error",
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <View className={cn("flex gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex gap-6">
            <View className="flex-row gap-3">
              <View className="flex-1 gap-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
              </View>
              <View className="flex-1 gap-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
              </View>
            </View>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
                autoComplete="new-password"
              />
            </View>
            <View className="gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </View>
            <View className="flex gap-3">
              <Button
                variant="default"
                onPress={handleRegister}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </View>
          </View>
          <View className="mt-4 text-center">
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text className="text-center text-sm underline">
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
