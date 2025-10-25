import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { RegisterForm } from "../components/register-form";
import { useAuth } from "../hooks/queries/useAuth";

export default function Register() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading]);

  // Scroll to top when the page is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-full max-w-sm">
            <RegisterForm />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
