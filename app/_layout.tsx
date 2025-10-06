import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
// NOTE: Reanimated commented out due to native/JS version mismatch with Expo Go
// To use animations, build a development client with: npx expo run:ios or npx expo run:android
// import {
//   configureReanimatedLogger,
//   ReanimatedLogLevel,
// } from "react-native-reanimated";
import { AuthProvider } from "../lib/auth-context";
import { QueryProvider } from "../lib/query-provider";
import { ToastProvider } from "../components/ui/sonner";
import "../global.css";

// Disable Reanimated strict mode warnings
// configureReanimatedLogger({
//   level: ReanimatedLogLevel.warn,
//   strict: false,
// });

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
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
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
