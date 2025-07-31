import { Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="goals" />
    </Stack>
  );
}
