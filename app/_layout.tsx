import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";
import React from "react";
// NOTE: Reanimated commented out due to native/JS version mismatch with Expo Go
// To use animations, build a development client with: npx expo run:ios or npx expo run:android
// import {
//   configureReanimatedLogger,
//   ReanimatedLogLevel,
// } from "react-native-reanimated";
import { PortalHost } from "@rn-primitives/portal";
import { ToastProvider } from "../components/ui/sonner";
import "../global.css";
import { QueryProvider } from "../lib/query-provider";

// Disable Reanimated strict mode warnings
// configureReanimatedLogger({
//   level: ReanimatedLogLevel.warn,
//   strict: false,
// });

function RootContent() {
  // Theme is now managed locally via useThemeToggle hook
  // No need to sync with user preferences or system

  return (
    <ToastProvider>
      <StatusBar style={colorScheme.get() === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          animationDuration: 0,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <PortalHost />
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootContent />
    </QueryProvider>
  );
}
