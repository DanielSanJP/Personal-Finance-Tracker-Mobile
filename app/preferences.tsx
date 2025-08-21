import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Nav from "../components/nav";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../components/ui/sonner";
import { useAuth } from "../lib/auth-context";

export default function PreferencesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const { success } = useToast();

  const [preferences, setPreferences] = useState({
    // Appearance
    theme: "Light",
    currency: "USD",
    language: "English",

    // Notifications
    emailNotifications: true,
    budgetAlerts: true,
    goalReminders: false,
    weeklyReports: true,

    // Display
    showAccountNumbers: false,
    compactView: false,
    showCents: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success("Preferences saved successfully!");

    setSaving(false);
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
                <Feather name="settings" size={24} color="#374151" />
                <CardTitle className="text-2xl font-bold">
                  Preferences
                </CardTitle>
              </View>
              <Text className="text-gray-600 mt-2">
                Customize your Personal Finance Tracker experience.
              </Text>
            </CardHeader>

            <CardContent className="gap-8">
              {/* Appearance Settings */}
              <View className="gap-4">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="palette" size={20} color="#374151" />
                  <Text className="text-lg font-medium">Appearance</Text>
                </View>

                <View className="flex-row gap-6 flex-wrap">
                  <View className="flex-1 min-w-[200px] gap-2">
                    <Label>Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) =>
                        updatePreference("theme", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Light">
                          <View className="flex-row items-center gap-2">
                            <Feather name="sun" size={16} color="#374151" />
                            <Text>Light</Text>
                          </View>
                        </SelectItem>
                        <SelectItem value="Dark">
                          <View className="flex-row items-center gap-2">
                            <Feather name="moon" size={16} color="#374151" />
                            <Text>Dark</Text>
                          </View>
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </View>

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
                  <Text className="text-lg font-medium">Notifications</Text>
                </View>

                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Email Notifications</Label>
                      <Text className="text-sm text-gray-600">
                        Receive important updates via email
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        updatePreference("emailNotifications", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Budget Alerts</Label>
                      <Text className="text-sm text-gray-600">
                        Get notified when you approach budget limits
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.budgetAlerts}
                      onCheckedChange={(checked) =>
                        updatePreference("budgetAlerts", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Goal Reminders</Label>
                      <Text className="text-sm text-gray-600">
                        Receive reminders about your financial goals
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.goalReminders}
                      onCheckedChange={(checked) =>
                        updatePreference("goalReminders", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Weekly Reports</Label>
                      <Text className="text-sm text-gray-600">
                        Get weekly summaries of your financial activity
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) =>
                        updatePreference("weeklyReports", checked)
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
                  <Text className="text-lg font-medium">Display Options</Text>
                </View>

                <View className="gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Show Account Numbers</Label>
                      <Text className="text-sm text-gray-600">
                        Display account numbers in account lists
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.showAccountNumbers}
                      onCheckedChange={(checked) =>
                        updatePreference("showAccountNumbers", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Compact View</Label>
                      <Text className="text-sm text-gray-600">
                        Use a more compact layout for tables and lists
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.compactView}
                      onCheckedChange={(checked) =>
                        updatePreference("compactView", checked)
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1">
                      <Label>Show Cents</Label>
                      <Text className="text-sm text-gray-600">
                        Display currency amounts with decimal places
                      </Text>
                    </View>
                    <Switch
                      checked={preferences.showCents}
                      onCheckedChange={(checked) =>
                        updatePreference("showCents", checked)
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
                  disabled={saving}
                  className="min-w-32"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
