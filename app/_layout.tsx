import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { AuthProvider } from "../lib/auth-context";
import "../global.css";

// Disable Reanimated strict mode warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
