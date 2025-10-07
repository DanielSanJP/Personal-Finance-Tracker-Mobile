import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../hooks/queries/useAuth";
import { useToast } from "../components/ui/sonner";
import { supabase } from "../lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const { success, error } = useToast();

  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    currentEmail: "",
    newEmail: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Set current email when user loads
  useEffect(() => {
    if (user?.email) {
      setEmailForm({
        currentEmail: user.email,
        newEmail: "",
      });
    }
  }, [user]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleEmailUpdate = async () => {
    if (!emailForm.newEmail.trim()) {
      error("Please enter a new email address");
      return;
    }

    if (!validateEmail(emailForm.newEmail)) {
      error("Please enter a valid email address");
      return;
    }

    if (emailForm.newEmail === emailForm.currentEmail) {
      error("New email must be different from current email");
      return;
    }

    setEmailLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailForm.newEmail,
      });

      if (updateError) {
        console.error("Error updating email:", updateError);
        error(`Error updating email: ${updateError.message}`);
      } else {
        success(
          "Email update initiated! Check your new email address for a confirmation link."
        );
        setEmailForm({ ...emailForm, newEmail: "" });
      }
    } catch (err) {
      console.error("Error updating email:", err);
      error(
        "Error updating email. An unexpected error occurred. Please try again."
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      error("Please fill in all password fields");
      return;
    }

    if (!validatePassword(passwordForm.newPassword)) {
      error("Password must be at least 8 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New password and confirmation do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (updateError) {
        console.error("Error updating password:", updateError);
        error(`Error updating password: ${updateError.message}`);
      } else {
        success(
          "Password updated successfully! Your password has been changed."
        );
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Error updating password:", err);
      error(
        "Error updating password. An unexpected error occurred. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Nav />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Feather name="shield" size={24} color="#374151" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Account Settings
                </CardTitle>
              </View>
              <Text className="text-gray-600">
                Manage your email address and password security settings.
              </Text>
            </CardHeader>

            <CardContent className="space-y-8 gap-8">
              {/* Email Settings */}
              <View className="space-y-4 gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="mail" size={24} color="#374151" />
                  <Text className="text-lg font-medium text-gray-900">
                    Email Address
                  </Text>
                </View>

                <Alert>
                  <AlertDescription>
                    Changing your email address will require confirmation from
                    your new email. You&apos;ll remain logged in with your
                    current email until confirmed.
                  </AlertDescription>
                </Alert>

                <View className="space-y-4 gap-4">
                  <View className="space-y-2 gap-2">
                    <Label htmlFor="currentEmail">Current Email</Label>
                    <Input
                      id="currentEmail"
                      value={emailForm.currentEmail}
                      editable={false}
                      className="bg-gray-50 text-gray-500"
                      placeholder="No email set"
                    />
                  </View>

                  <View className="space-y-2 gap-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input
                      id="newEmail"
                      value={emailForm.newEmail}
                      onChangeText={(text) =>
                        setEmailForm({ ...emailForm, newEmail: text })
                      }
                      placeholder="Enter your new email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <Button
                    onPress={handleEmailUpdate}
                    disabled={emailLoading || !emailForm.newEmail.trim()}
                    className="min-w-32"
                  >
                    {emailLoading ? "Updating..." : "Update Email"}
                  </Button>
                </View>
              </View>

              <Separator />

              {/* Password Settings */}
              <View className="space-y-4 gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="lock" size={24} color="#374151" />
                  <Text className="text-lg font-medium text-gray-900">
                    Password
                  </Text>
                </View>

                <Alert>
                  <AlertDescription>
                    Your password must be at least 8 characters long. Choose a
                    strong password that you haven&apos;t used elsewhere.
                  </AlertDescription>
                </Alert>

                <View className="space-y-4 gap-4">
                  <View className="space-y-2 gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <View className="relative">
                      <Input
                        id="newPassword"
                        secureTextEntry={!showPasswords.new}
                        value={passwordForm.newPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: text,
                          })
                        }
                        placeholder="Enter your new password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="pr-12"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => togglePasswordVisibility("new")}
                        className="absolute right-0 top-0 h-full px-3 py-2"
                      >
                        <Feather
                          name={showPasswords.new ? "eye-off" : "eye"}
                          size={16}
                          color="#6b7280"
                        />
                      </Button>
                    </View>
                  </View>

                  <View className="space-y-2 gap-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <View className="relative">
                      <Input
                        id="confirmPassword"
                        secureTextEntry={!showPasswords.confirm}
                        value={passwordForm.confirmPassword}
                        onChangeText={(text) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: text,
                          })
                        }
                        placeholder="Confirm your new password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="pr-12"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => togglePasswordVisibility("confirm")}
                        className="absolute right-0 top-0 h-full px-3 py-2"
                      >
                        <Feather
                          name={showPasswords.confirm ? "eye-off" : "eye"}
                          size={16}
                          color="#6b7280"
                        />
                      </Button>
                    </View>
                  </View>

                  <Button
                    onPress={handlePasswordUpdate}
                    disabled={
                      passwordLoading ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                    className="min-w-32"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
