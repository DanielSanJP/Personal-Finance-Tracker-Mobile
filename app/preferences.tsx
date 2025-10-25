import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select-mobile";
import { Separator } from "../components/ui/separator";
import { useToast } from "../components/ui/sonner";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../hooks/queries/useAuth";
import {
  DEFAULT_PREFERENCES,
  usePreferences,
  useUpdatePreferences,
} from "../hooks/queries/usePreferences";
import type { UpdateUserPreferences } from "../lib/types";

export default function PreferencesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isGuest } = useAuth();
  const { data: userPreferences, isLoading: prefsLoading } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();
  const { success, error: toastError } = useToast();

  const loading = authLoading || prefsLoading;

  // Use database preferences or defaults
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  // Update local state when database preferences load
  useEffect(() => {
    if (userPreferences) {
      setPreferences({
        currency: userPreferences.currency,
        language: userPreferences.language,
        email_notifications: userPreferences.email_notifications,
        budget_alerts: userPreferences.budget_alerts,
        goal_reminders: userPreferences.goal_reminders,
        weekly_reports: userPreferences.weekly_reports,
        show_account_numbers: userPreferences.show_account_numbers,
        compact_view: userPreferences.compact_view,
        show_cents: userPreferences.show_cents,
      });
    }
  }, [userPreferences]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (isGuest) {
      toastError("Guest users cannot save preferences");
      return;
    }

    try {
      await updatePreferencesMutation.mutateAsync(
        preferences as UpdateUserPreferences
      );
      success("Preferences saved successfully!");
    } catch (err) {
      console.error("Error saving preferences:", err);
      toastError(
        err instanceof Error ? err.message : "Failed to save preferences"
      );
    }
  };

  const updatePreference = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <Nav />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <Nav />

      <ScrollView className="flex-1">
        <View className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Feather name="settings" size={24} color="#374151" />
                <CardTitle className="text-2xl font-bold">
                  Preferences
                </CardTitle>
              </View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark mt-2">
                Customize your Personal Finance Tracker experience.
              </Text>
            </CardHeader>

            <CardContent className="gap-8">
              {/* Appearance Settings */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="palette" size={20} color="#374151" />
                  <Text className="text-lg font-medium text-foreground-light dark:text-foreground-dark">
                    Appearance
                  </Text>
                </View>

                <View className="flex-row gap-6 flex-wrap">
                  <View className="flex-1 min-w-[200px] gap-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(value) =>
                        updatePreference("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </View>
                </View>

                <View className="gap-2 max-w-sm">
                  <Label>Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      updatePreference("language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Español">Español</SelectItem>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Deutsch">Deutsch</SelectItem>
                      <SelectItem value="Italiano">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </View>
              </View>

              <Separator />

              {/* Notification Settings */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="bell" size={20} color="#374151" />
                  <Text className="text-lg font-medium text-foreground-light dark:text-foreground-dark">
                    Notifications
                  </Text>
                </View>

                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Email Notifications</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Receive important updates via email
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) =>
                        updatePreference("email_notifications", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Budget Alerts</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Get notified when you approach budget limits
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.budget_alerts}
                      onCheckedChange={(checked) =>
                        updatePreference("budget_alerts", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Goal Reminders</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Receive reminders about your financial goals
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.goal_reminders}
                      onCheckedChange={(checked) =>
                        updatePreference("goal_reminders", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Weekly Reports</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Get weekly summaries of your financial activity
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.weekly_reports}
                      onCheckedChange={(checked) =>
                        updatePreference("weekly_reports", checked)
                      }
                    />
                  </View>
                </View>
              </View>

              <Separator />

              {/* Display Settings */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <Feather name="globe" size={20} color="#374151" />
                  <Text className="text-lg font-medium text-foreground-light dark:text-foreground-dark">
                    Display Options
                  </Text>
                </View>

                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Show Account Numbers</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Display account numbers in account lists
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.show_account_numbers}
                      onCheckedChange={(checked) =>
                        updatePreference("show_account_numbers", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Compact View</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Use a more compact layout for tables and lists
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.compact_view}
                      onCheckedChange={(checked) =>
                        updatePreference("compact_view", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Show Cents</Label>
                      <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                        Display currency amounts with decimal places
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.show_cents}
                      onCheckedChange={(checked) =>
                        updatePreference("show_cents", checked)
                      }
                    />
                  </View>
                </View>
              </View>

              <Separator />

              {/* Save Button */}
              <View className="flex-row justify-end">
                <Button
                  onPress={handleSave}
                  disabled={updatePreferencesMutation.isPending}
                  className="min-w-32"
                >
                  {updatePreferencesMutation.isPending
                    ? "Saving..."
                    : "Save Preferences"}
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
