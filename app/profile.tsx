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
import { useAuth } from "../hooks/queries/useAuth";
import { useToast } from "../components/ui/sonner";
import {
  useUpdateUserProfile,
  validateProfileData,
} from "../hooks/queries/useProfile";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const { success, error } = useToast();
  const updateProfileMutation = useUpdateUserProfile();

  const [updateLoading, setUpdateLoading] = useState(false);

  // Profile form state - initialize from user data
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Initialize form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        display_name: user.user_metadata?.display_name || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    // Validate form data
    const validation = validateProfileData(profileForm);
    if (!validation.isValid) {
      error(validation.errors[0]);
      return;
    }

    setUpdateLoading(true);

    try {
      const result = await updateProfileMutation.mutateAsync(profileForm);

      if (result.success) {
        success("Profile updated successfully!");
      } else {
        error(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      error("An unexpected error occurred");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setProfileForm({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        display_name: user.user_metadata?.display_name || "",
      });
    }
  };

  const hasChanges =
    user &&
    (profileForm.first_name !== (user.user_metadata?.first_name || "") ||
      profileForm.last_name !== (user.user_metadata?.last_name || "") ||
      profileForm.display_name !== (user.user_metadata?.display_name || ""));

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
              <View className="flex-row items-center gap-4">
                <Feather name="user" size={24} color="#374151" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Profile
                </CardTitle>
              </View>
              <Text className="text-gray-600 mt-2">
                Manage your personal information and display preferences.
              </Text>
            </CardHeader>

            <CardContent className="gap-8">
              {/* Profile Information */}
              <View className="gap-4">
                <Text className="text-lg font-medium">
                  Personal Information
                </Text>
                <Text className="text-gray-600">
                  Update your personal details below.
                </Text>

                <View className="gap-4">
                  <View className="gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.first_name}
                      onChangeText={(text) =>
                        setProfileForm({ ...profileForm, first_name: text })
                      }
                      placeholder="Enter your first name"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>

                  <View className="gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.last_name}
                      onChangeText={(text) =>
                        setProfileForm({ ...profileForm, last_name: text })
                      }
                      placeholder="Enter your last name"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>

                  <View className="gap-2">
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <Input
                      id="displayName"
                      value={profileForm.display_name}
                      onChangeText={(text) =>
                        setProfileForm({ ...profileForm, display_name: text })
                      }
                      placeholder="How you'd like to be displayed"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    <Text className="text-xs text-gray-600">
                      If left empty, your display name will be your first and
                      last name.
                    </Text>
                  </View>
                </View>
              </View>

              <Separator />

              {/* Action Buttons */}
              <View className="flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onPress={handleReset}
                  disabled={updateLoading || !hasChanges}
                >
                  Reset
                </Button>
                <Button
                  onPress={handleUpdateProfile}
                  disabled={updateLoading || !hasChanges}
                  className="min-w-32"
                >
                  {updateLoading ? "Updating..." : "Save Changes"}
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
