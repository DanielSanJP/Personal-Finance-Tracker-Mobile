import React from "react";
import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
